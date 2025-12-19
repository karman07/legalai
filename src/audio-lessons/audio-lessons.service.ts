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
    const lessonData: any = {
      title: createDto.title,
      description: createDto.description,
      category: createDto.category,
      tags: createDto.tags,
      sections: createDto.sections,
      englishTranscription: createDto.englishTranscription,
      hindiTranscription: createDto.hindiTranscription,
      easyEnglishTranscription: createDto.easyEnglishTranscription,
      easyHindiTranscription: createDto.easyHindiTranscription,
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

    const updateData: any = { ...updateDto };

    // Handle English Audio update
    if (files?.englishAudio) {
      updateData.englishAudio = {
        url: `/uploads/audio/${files.englishAudio.filename}`,
        fileName: files.englishAudio.originalname,
        fileSize: files.englishAudio.size,
      };
    } else if (updateDto.englishAudioUrl) {
      updateData.englishAudio = await this.downloadAndStoreAudio(updateDto.englishAudioUrl, 'english');
    }

    // Handle Hindi Audio update
    if (files?.hindiAudio) {
      updateData.hindiAudio = {
        url: `/uploads/audio/${files.hindiAudio.filename}`,
        fileName: files.hindiAudio.originalname,
        fileSize: files.hindiAudio.size,
      };
    } else if (updateDto.hindiAudioUrl) {
      updateData.hindiAudio = await this.downloadAndStoreAudio(updateDto.hindiAudioUrl, 'hindi');
    }

    const updated = await this.audioLessonModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) throw new NotFoundException('Audio lesson not found');

    return updated;
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    const res = await this.audioLessonModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Audio lesson not found');
    
    // Delete physical audio files from server
    try {
      if (res.englishAudio?.url) {
        const filePath = path.join(process.cwd(), res.englishAudio.url.replace(/^\//, ''));
        await fs.unlink(filePath);
      }
      if (res.hindiAudio?.url) {
        const filePath = path.join(process.cwd(), res.hindiAudio.url.replace(/^\//, ''));
        await fs.unlink(filePath);
      }
      if (res.audioUrl) {
        const filePath = path.join(process.cwd(), res.audioUrl.replace(/^\//, ''));
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete files for audio lesson ${id}:`, error.message);
    }
    
    return { message: 'Audio lesson deleted successfully', id };
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
}