import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import { AudioLessonsService } from './audio-lessons.service';
import { CreateAudioLessonDto } from './dto/create-audio-lesson.dto';
import { UpdateAudioLessonDto } from './dto/update-audio-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';
import { AUDIO_LESSON_CATEGORIES } from '../common/enums/audio-lesson-category.enum';

@Controller('admin/audio-lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AudioLessonsAdminController {
  constructor(private readonly audioLessonsService: AudioLessonsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'transcriptFile', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Audio files go to ./uploads/audio, text files go to ./uploads/transcripts
          const dest = file.fieldname === 'transcriptFile' ? './uploads/transcripts' : './uploads/audio';
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const prefix = file.fieldname === 'transcriptFile' ? 'transcript' : 'audio';
          cb(null, `${prefix}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'file') {
          // Accept common audio formats for 'file' field
          const allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a',
            'audio/aac', 'audio/ogg', 'audio/webm', 'audio/flac',
          ];
          
          if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i)) {
            cb(null, true);
          } else {
            cb(new BadRequestException('Only audio files are allowed for audio field'), false);
          }
        } else if (file.fieldname === 'transcriptFile') {
          // Accept text files (PDF, DOC, DOCX, MD, TXT) for 'transcriptFile' field
          const allowedTextMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/markdown',
          ];
          
          if (allowedTextMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|txt|md)$/i)) {
            cb(null, true);
          } else {
            cb(new BadRequestException('Only text files (PDF, DOC, DOCX, TXT, MD) are allowed for transcript'), false);
          }
        } else {
          cb(new BadRequestException('Invalid field name'), false);
        }
      },
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
    }),
  )
  async create(
    @Body() dto: CreateAudioLessonDto,
    @UploadedFiles() files: { file?: Express.Multer.File[], transcriptFile?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const audioFile = files?.file?.[0];
    const textFile = files?.transcriptFile?.[0];
    
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }
    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    const audioUrl = `/uploads/audio/${audioFile.filename}`;
    
    // Parse JSON arrays from form-data
    const parsedDto = { ...dto };
    if (typeof dto.tags === 'string') {
      try {
        parsedDto.tags = JSON.parse(dto.tags as any);
      } catch (e) {
        throw new BadRequestException('Invalid tags JSON format');
      }
    }
    
    // If text file is provided, extract transcript from it
    let transcript: string | undefined;
    if (textFile) {
      try {
        const textFilePath = textFile.path;
        const fileExtension = extname(textFile.originalname).toLowerCase();
        
        // For plain text files, read directly
        if (['.txt', '.md'].includes(fileExtension)) {
          transcript = await fs.readFile(textFilePath, 'utf-8');
        } 
        // For PDF/DOC files, you might want to use a library like pdf-parse or mammoth
        // For now, we'll just store the file path and indicate manual upload
        else {
          // Store reference to the file for manual processing
          transcript = `[Transcript file uploaded: ${textFile.originalname}. Please process manually or use text extraction library.]`;
        }
        
        // Optionally delete the text file after reading (or keep it)
        // await fs.unlink(textFilePath);
      } catch (error) {
        console.error('Error reading transcript file:', error);
        throw new BadRequestException('Failed to read transcript file');
      }
    }
    
    return this.audioLessonsService.create(
      {
        ...parsedDto,
        audioUrl,
        fileName: audioFile.originalname,
        fileSize: audioFile.size,
        transcript, // Pass transcript if text file was provided
      } as any,
      uploadedBy,
    );
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('isActive') isActive?: string,
    @Query('category') category?: string,
  ) {
    const filters: any = {};
    if (typeof isActive === 'string') filters.isActive = isActive === 'true';
    if (category) filters.category = category;
    
    return this.audioLessonsService.findAll({ 
      page: parseInt(page), 
      limit: parseInt(limit),
      filters,
    });
  }

  @Get('categories')
  async getCategories() {
    return this.audioLessonsService.getCategoriesWithCount();
  }

  @Get('categories/all')
  async getAllCategories() {
    return AUDIO_LESSON_CATEGORIES;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.audioLessonsService.findOne(id);
  }

  @Post(':id/retry-transcription')
  async retryTranscription(@Param('id') id: string) {
    return this.audioLessonsService.retryTranscription(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `audio-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 
          'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a',
          'audio/aac', 'audio/ogg', 'audio/webm', 'audio/flac',
        ];
        
        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only audio files are allowed'), false);
        }
      },
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAudioLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Parse JSON arrays from form-data
    const parsedDto = { ...dto };
    if (typeof dto.tags === 'string') {
      try {
        parsedDto.tags = JSON.parse(dto.tags as any);
      } catch (e) {
        throw new BadRequestException('Invalid tags JSON format');
      }
    }
    
    if (file) {
      const audioUrl = `/uploads/audio/${file.filename}`;
      return this.audioLessonsService.update(id, {
        ...parsedDto,
        audioUrl,
        fileName: file.originalname,
        fileSize: file.size,
      });
    }
    return this.audioLessonsService.update(id, parsedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.audioLessonsService.remove(id);
  }
}
