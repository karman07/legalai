import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AudioLesson, AudioLessonDocument } from '../schemas/audio-lesson.schema';
import { CreateAudioLessonDto } from './dto/create-audio-lesson.dto';
import { UpdateAudioLessonDto } from './dto/update-audio-lesson.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as FormData from 'form-data';
import { AUDIO_LESSON_CATEGORIES, getCategoryById } from '../common/enums/audio-lesson-category.enum';

@Injectable()
export class AudioLessonsService {
  constructor(
    @InjectModel(AudioLesson.name) private readonly audioLessonModel: Model<AudioLessonDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateAudioLessonDto, uploadedBy?: string) {
    // If transcript is provided, mark as completed; otherwise, pending
    const transcriptionStatus = createDto.transcript ? 'completed' : 'pending';
    
    const doc = new this.audioLessonModel({
      ...createDto,
      uploadedBy: uploadedBy ? new Types.ObjectId(uploadedBy) : undefined,
      transcriptionStatus,
    });
    const saved = await doc.save();
    
    // Only trigger transcription if no transcript was provided
    if (!createDto.transcript) {
      this.transcribeAudio(saved._id.toString(), saved.audioUrl).catch(err => {
        console.error('Transcription failed:', err);
      });
    }
    
    return saved;
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

  async update(id: string, updateDto: UpdateAudioLessonDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    const updated = await this.audioLessonModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!updated) throw new NotFoundException('Audio lesson not found');
    
    // If audio file was replaced, trigger re-transcription
    if (updateDto.audioUrl) {
      this.transcribeAudio(id, updateDto.audioUrl).catch(err => {
        console.error('Re-transcription failed:', err);
      });
    }
    
    return updated;
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audio lesson id');
    }
    const res = await this.audioLessonModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Audio lesson not found');
    
    // Delete the physical audio file from server
    try {
      if (res.audioUrl) {
        // Convert URL path to absolute file path
        // Assuming audioUrl is like '/uploads/audio/filename.wav'
        const filePath = path.join(process.cwd(), res.audioUrl.replace(/^\//, ''));
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to delete file for audio lesson ${id}:`, error.message);
      // Don't throw error - DB record is already deleted
    }
    
    return { message: 'Audio lesson deleted successfully', id };
  }

  async getCategories() {
    // Return all predefined categories with usage count
    const usedCategories = await this.audioLessonModel.distinct('category', { isActive: true });
    
    return AUDIO_LESSON_CATEGORIES.map(category => ({
      ...category,
      count: usedCategories.filter(used => used === category.id).length > 0 ? 1 : 0,
      isUsed: usedCategories.includes(category.id),
    }));
  }

  async getCategoriesWithCount() {
    // Get categories with actual lesson count
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

  async transcribeAudio(lessonId: string, audioPath: string): Promise<void> {
    const transcriptionMethod = this.configService.get<string>('TRANSCRIPTION_METHOD') || 'none';
    const path = require('path');
    
    try {
      // Update status to processing
      await this.audioLessonModel.findByIdAndUpdate(lessonId, {
        transcriptionStatus: 'processing',
      });

      // Construct full file path - audioPath is like '/uploads/audio/file.mp3'
      // Remove leading slash and prepend with './' for relative path
      const filePath = audioPath.startsWith('/') 
        ? `.${audioPath}` 
        : `./${audioPath}`;
      
      // Resolve to absolute path for reliability
      const absolutePath = path.resolve(filePath);
      
      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch (error) {
        throw new Error(`Audio file not found: ${absolutePath}`);
      }

      let transcript: string;

      if (transcriptionMethod === 'openai') {
        transcript = await this.transcribeWithOpenAI(absolutePath);
      } else if (transcriptionMethod === 'whisper-local') {
        transcript = await this.transcribeWithLocalWhisper(absolutePath);
      } else if (transcriptionMethod === 'assemblyai') {
        transcript = await this.transcribeWithAssemblyAI(absolutePath);
      } else {
        console.warn('No transcription method configured, skipping');
        await this.audioLessonModel.findByIdAndUpdate(lessonId, {
          transcriptionStatus: 'failed',
          transcriptionError: 'No transcription method configured',
        });
        return;
      }

      // Update with transcript
      await this.audioLessonModel.findByIdAndUpdate(lessonId, {
        transcript,
        transcriptionStatus: 'completed',
        transcriptionError: null,
      });

      console.log(`Transcription completed for lesson ${lessonId}`);
    } catch (error) {
      console.error(`Transcription error for lesson ${lessonId}:`, error);
      await this.audioLessonModel.findByIdAndUpdate(lessonId, {
        transcriptionStatus: 'failed',
        transcriptionError: error.message,
      });
    }
  }

  private async transcribeWithOpenAI(filePath: string): Promise<string> {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const fileBuffer = await fs.readFile(filePath);
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: filePath.split('/').pop() });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Whisper API error: ${response.status} - ${errorText}`);
    }

    return await response.text();
  }

  private async transcribeWithLocalWhisper(filePath: string): Promise<string> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const path = require('path');
    const execAsync = promisify(exec);

    // Python executable path
    const pythonPath = 'C:\\Users\\Dell\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    
    // Transcription script path (resolve to absolute)
    const scriptPath = path.resolve(__dirname, '..', '..', 'scripts', 'transcribe.py');
    
    // Output directory for transcripts (resolve to absolute)
    const outputDir = path.resolve('./uploads/transcripts');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output file path
    const audioFileName = path.basename(filePath, path.extname(filePath));
    const transcriptPath = path.join(outputDir, `${audioFileName}.txt`);
    
    console.log('Transcribing with local Whisper:');
    console.log('  Audio file:', filePath);
    console.log('  Script:', scriptPath);
    console.log('  Output:', transcriptPath);
    
    // Run Python transcription script
    try {
      const { stdout, stderr } = await execAsync(
        `"${pythonPath}" "${scriptPath}" "${filePath}" "${transcriptPath}"`,
        { 
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large transcripts
          cwd: path.resolve('.'), // Set working directory
        }
      );
      
      if (stderr) {
        console.log('Whisper stderr:', stderr);
      }
      if (stdout) {
        console.log('Whisper stdout:', stdout);
      }
    } catch (error) {
      console.error('Python execution error:', error);
      throw new Error(`Local Whisper transcription failed: ${error.message}\nStderr: ${error.stderr || 'none'}\nStdout: ${error.stdout || 'none'}`);
    }

    // Verify transcript file was created
    try {
      await fs.access(transcriptPath);
    } catch (error) {
      throw new Error(`Transcript file was not created at: ${transcriptPath}`);
    }

    // Read the generated transcript
    const transcript = await fs.readFile(transcriptPath, 'utf-8');
    
    // Clean up transcript file
    await fs.unlink(transcriptPath).catch(() => {});
    
    return transcript.trim();
  }

  private async transcribeWithAssemblyAI(filePath: string): Promise<string> {
    const assemblyApiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (!assemblyApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured');
    }

    // Step 1: Upload file
    const fileBuffer = await fs.readFile(filePath);
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyApiKey,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload failed: ${uploadResponse.status}`);
    }

    const { upload_url } = await uploadResponse.json();

    // Step 2: Request transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
      }),
    });

    if (!transcriptResponse.ok) {
      throw new Error(`AssemblyAI transcription request failed: ${transcriptResponse.status}`);
    }

    const { id } = await transcriptResponse.json();

    // Step 3: Poll for completion
    let transcript = null;
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { 'authorization': assemblyApiKey },
      });

      const result = await statusResponse.json();

      if (result.status === 'completed') {
        transcript = result.text;
        break;
      } else if (result.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${result.error}`);
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!transcript) {
      throw new Error('AssemblyAI transcription timeout');
    }

    return transcript;
  }

  async retryTranscription(id: string) {
    const lesson = await this.findOne(id);
    if (!lesson.audioUrl) {
      throw new NotFoundException('No audio file found for this lesson');
    }
    await this.transcribeAudio(id, lesson.audioUrl);
    return { message: 'Transcription retry initiated' };
  }
}
