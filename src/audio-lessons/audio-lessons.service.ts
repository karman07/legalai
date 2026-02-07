import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AudioLesson, AudioLessonDocument, AudioFile } from '../schemas/audio-lesson.schema';
import { CreateAudioLessonDto } from './dto/create-audio-lesson.dto';
import { UpdateAudioLessonDto } from './dto/update-audio-lesson.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AUDIO_LESSON_CATEGORIES } from '../common/enums/audio-lesson-category.enum';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

@Injectable()
export class AudioLessonsService {
  constructor(
    @InjectModel(AudioLesson.name) private readonly audioLessonModel: Model<AudioLessonDocument>,
  ) {}

  async create(createDto: CreateAudioLessonDto, uploadedBy?: string, files?: { englishAudio?: Express.Multer.File; hindiAudio?: Express.Multer.File }) {
    // Process sections and calculate subsection counts
    const processedSections = createDto.sections?.map(section => ({
      ...section,
      totalSubsections: section.subsections ? section.subsections.length : 0
    }));

    // Calculate total subsections across all sections
    const totalSubsections = processedSections?.reduce(
      (sum, section) => sum + (section.totalSubsections || 0), 0
    ) || 0;

    const lessonData: any = {
      title: createDto.title,
      headTitle: createDto.headTitle,
      description: createDto.description,
      category: createDto.category,
      tags: createDto.tags,
      sections: processedSections,
      totalSections: processedSections ? processedSections.length : 0,
      totalSubsections,
      uploadedBy: uploadedBy ? new Types.ObjectId(uploadedBy) : undefined,
    };

    // Handle English Audio
    if (files?.englishAudio) {
      lessonData.englishAudio = {
        url: `/uploads/audio/${files.englishAudio.filename}`,
        fileName: files.englishAudio.originalname,
        fileSize: files.englishAudio.size,
      };
    } else if (createDto.englishAudioUrl) {
      lessonData.englishAudio = await this.downloadAndStoreAudio(createDto.englishAudioUrl, 'english');
    }

    // Handle Hindi Audio
    if (files?.hindiAudio) {
      lessonData.hindiAudio = {
        url: `/uploads/audio/${files.hindiAudio.filename}`,
        fileName: files.hindiAudio.originalname,
        fileSize: files.hindiAudio.size,
      };
    } else if (createDto.hindiAudioUrl) {
      lessonData.hindiAudio = await this.downloadAndStoreAudio(createDto.hindiAudioUrl, 'hindi');
    }

    // Legacy support
    if (createDto.audioUrl || createDto.fileName) {
      lessonData.audioUrl = createDto.audioUrl;
      lessonData.fileName = createDto.fileName;
      lessonData.fileSize = createDto.fileSize;
      lessonData.transcript = createDto.transcript;
      lessonData.language = createDto.language;
    }

    const doc = new this.audioLessonModel(lessonData);
    return await doc.save();
  }

  async findAll(params: { page?: number; limit?: number; filters?: Record<string, any> }) {
    const { page = 1, limit = 10, filters = {} } = params;

    const [items, total] = await Promise.all([
      this.audioLessonModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.audioLessonModel.countDocuments(filters),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    const lesson = await this.audioLessonModel.findById(id).lean();
    if (!lesson) throw new NotFoundException('Audio lesson not found');
    return lesson;
  }

  async update(id: string, updateDto: UpdateAudioLessonDto, files?: { englishAudio?: Express.Multer.File; hindiAudio?: Express.Multer.File }) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }

    // Get existing lesson to check for old files
    const existingLesson = await this.audioLessonModel.findById(id);
    if (!existingLesson) throw new NotFoundException('Audio lesson not found');

    const updateData: any = { ...updateDto };

    // Auto-calculate totalSections and subsection counts if sections are being updated
    if (updateDto.sections) {
      updateData.sections = updateDto.sections.map(section => ({
        ...section,
        totalSubsections: section.subsections ? section.subsections.length : 0
      }));
      updateData.totalSections = updateDto.sections.length;
      updateData.totalSubsections = updateData.sections.reduce(
        (sum, section) => sum + (section.totalSubsections || 0), 0
      );
    }

    // Handle section audio file updates
    if (updateData.sections && Array.isArray(updateData.sections)) {
      // Delete old section audio files that are being replaced
      if (existingLesson.sections) {
        for (let i = 0; i < existingLesson.sections.length; i++) {
          const existingSection = existingLesson.sections[i];
          const newSection = updateData.sections[i];
          
          if (newSection) {
            // Check each audio type and delete if being replaced
            if (newSection.englishAudio && existingSection.englishAudio?.url) {
              await this.deleteFile(existingSection.englishAudio.url);
            }
            if (newSection.hindiAudio && existingSection.hindiAudio?.url) {
              await this.deleteFile(existingSection.hindiAudio.url);
            }
            if (newSection.easyEnglishAudio && existingSection.easyEnglishAudio?.url) {
              await this.deleteFile(existingSection.easyEnglishAudio.url);
            }
            if (newSection.easyHindiAudio && existingSection.easyHindiAudio?.url) {
              await this.deleteFile(existingSection.easyHindiAudio.url);
            }
          }
        }
      }
    }

    const updated = await this.audioLessonModel.findByIdAndUpdate(id, updateData, { new: true });
    return updated;
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    const res = await this.audioLessonModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Audio lesson not found');
    
    // Delete all physical audio files from server
    await this.deleteAllLessonFiles(res);
    
    return { message: 'Audio lesson deleted successfully', id };
  }

  private async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (fileUrl) {
        const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to delete file ${fileUrl}:`, error.message);
    }
  }

  private async deleteAllLessonFiles(lesson: AudioLessonDocument): Promise<void> {
    try {
      // Delete section audio files
      if (lesson.sections) {
        for (const section of lesson.sections) {
          if (section.englishAudio?.url) {
            await this.deleteFile(section.englishAudio.url);
          }
          if (section.hindiAudio?.url) {
            await this.deleteFile(section.hindiAudio.url);
          }
          if (section.easyEnglishAudio?.url) {
            await this.deleteFile(section.easyEnglishAudio.url);
          }
          if (section.easyHindiAudio?.url) {
            await this.deleteFile(section.easyHindiAudio.url);
          }
          
          // Delete subsection audio files
          if (section.subsections) {
            for (const subsection of section.subsections) {
              if (subsection.englishAudio?.url) {
                await this.deleteFile(subsection.englishAudio.url);
              }
              if (subsection.hindiAudio?.url) {
                await this.deleteFile(subsection.hindiAudio.url);
              }
              if (subsection.easyEnglishAudio?.url) {
                await this.deleteFile(subsection.easyEnglishAudio.url);
              }
              if (subsection.easyHindiAudio?.url) {
                await this.deleteFile(subsection.easyHindiAudio.url);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to delete files for audio lesson ${lesson._id}:`, error.message);
    }
  }

  async getCategories() {
    const usedCategories = await this.audioLessonModel.distinct('category', { isActive: true });
    
    return AUDIO_LESSON_CATEGORIES.map(category => ({
      ...category,
      count: usedCategories.filter(used => used === category.id).length > 0 ? 1 : 0,
      isUsed: usedCategories.includes(category.id),
    }));
  }

  async getCategoriesWithCount() {
    const pipeline = [
      { $match: { isActive: true, category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ];
    
    const usageCounts = await this.audioLessonModel.aggregate(pipeline);
    const countMap = new Map(usageCounts.map(item => [item._id, item.count]));
    
    return AUDIO_LESSON_CATEGORIES.map(category => ({
      ...category,
      count: countMap.get(category.id) || 0,
    }));
  }

  private async downloadAndStoreAudio(audioUrl: string, language: 'english' | 'hindi'): Promise<AudioFile> {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generate filename
      const urlPath = new URL(audioUrl).pathname;
      const extension = path.extname(urlPath) || '.mp3';
      const filename = `${language}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      const filePath = path.join(uploadsDir, filename);

      // Download and save file
      const fileStream = createWriteStream(filePath);
      await pipeline(response.body, fileStream);

      // Get file stats
      const stats = await fs.stat(filePath);

      return {
        url: `/uploads/audio/${filename}`,
        fileName: path.basename(urlPath),
        fileSize: stats.size,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to download audio from URL: ${error.message}`);
    }
  }

  async updateSections(lessonId: string, sections: any[]) {
    if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    
    const updated = await this.audioLessonModel.findByIdAndUpdate(
      lessonId,
      { sections },
      { new: true }
    );
    
    if (!updated) {
      throw new NotFoundException('Audio lesson not found');
    }
    
    return updated;
  }

  async appendSections(lessonId: string, newSections: any[]) {
    if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
      throw new NotFoundException('Invalid audio lesson id');
    }

    // Fetch current lesson
    const lesson = await this.audioLessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Audio lesson not found');
    }

    // Process new sections with subsection counts
    const processedNewSections = newSections.map(section => ({
      ...section,
      totalSubsections: section.subsections ? section.subsections.length : 0
    }));

    // Append to existing sections
    const allSections = [...(lesson.sections || []), ...processedNewSections];

    // Calculate totals
    const totalSections = allSections.length;
    const totalSubsections = allSections.reduce(
      (sum, section: any) => sum + (section.totalSubsections || 0), 0
    );

    // Update lesson
    const updated = await this.audioLessonModel.findByIdAndUpdate(
      lessonId,
      { 
        sections: allSections,
        totalSections,
        totalSubsections
      },
      { new: true }
    );

    return {
      ...updated.toObject(),
      addedSections: processedNewSections.length,
      totalSections,
    };
  }
}