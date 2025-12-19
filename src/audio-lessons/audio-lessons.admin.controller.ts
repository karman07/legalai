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
      { name: 'englishAudio', maxCount: 1 },
      { name: 'hindiAudio', maxCount: 1 },
      { name: 'file', maxCount: 1 }, // Legacy support
    ], {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          let prefix = 'audio';
          if (file.fieldname === 'englishAudio') prefix = 'english';
          else if (file.fieldname === 'hindiAudio') prefix = 'hindi';
          cb(null, `${prefix}-${uniqueSuffix}${ext}`);
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
  async create(
    @Body() dto: CreateAudioLessonDto,
    @UploadedFiles() files: { englishAudio?: Express.Multer.File[], hindiAudio?: Express.Multer.File[], file?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const englishAudioFile = files?.englishAudio?.[0];
    const hindiAudioFile = files?.hindiAudio?.[0];
    const legacyAudioFile = files?.file?.[0]; // Legacy support
    
    // Validate that at least one audio source is provided
    if (!englishAudioFile && !hindiAudioFile && !legacyAudioFile && !dto.englishAudioUrl && !dto.hindiAudioUrl) {
      throw new BadRequestException('At least one audio file or URL is required');
    }
    
    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    
    // Parse JSON arrays from form-data
    const parsedDto = { ...dto };
    if (typeof dto.tags === 'string') {
      try {
        parsedDto.tags = JSON.parse(dto.tags as any);
      } catch (e) {
        throw new BadRequestException('Invalid tags JSON format');
      }
    }
    if (typeof dto.sections === 'string') {
      try {
        parsedDto.sections = JSON.parse(dto.sections as any);
      } catch (e) {
        throw new BadRequestException('Invalid sections JSON format');
      }
    }
    
    // Legacy support - convert old format to new
    if (legacyAudioFile) {
      parsedDto.audioUrl = `/uploads/audio/${legacyAudioFile.filename}`;
      parsedDto.fileName = legacyAudioFile.originalname;
      parsedDto.fileSize = legacyAudioFile.size;
    }
    
    return this.audioLessonsService.create(
      parsedDto,
      uploadedBy,
      {
        englishAudio: englishAudioFile,
        hindiAudio: hindiAudioFile,
      },
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

  @Put(':id/sections')
  async updateSections(
    @Param('id') id: string,
    @Body() body: { sections: any[] },
  ) {
    return this.audioLessonsService.updateSections(id, body.sections);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'englishAudio', maxCount: 1 },
      { name: 'hindiAudio', maxCount: 1 },
      { name: 'file', maxCount: 1 }, // Legacy support
    ], {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          let prefix = 'audio';
          if (file.fieldname === 'englishAudio') prefix = 'english';
          else if (file.fieldname === 'hindiAudio') prefix = 'hindi';
          cb(null, `${prefix}-${uniqueSuffix}${ext}`);
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
    @UploadedFiles() files: { englishAudio?: Express.Multer.File[], hindiAudio?: Express.Multer.File[], file?: Express.Multer.File[] },
  ) {
    const englishAudioFile = files?.englishAudio?.[0];
    const hindiAudioFile = files?.hindiAudio?.[0];
    const legacyAudioFile = files?.file?.[0];
    
    // Parse JSON arrays from form-data
    const parsedDto = { ...dto };
    if (typeof dto.tags === 'string') {
      try {
        parsedDto.tags = JSON.parse(dto.tags as any);
      } catch (e) {
        throw new BadRequestException('Invalid tags JSON format');
      }
    }
    if (typeof dto.sections === 'string') {
      try {
        parsedDto.sections = JSON.parse(dto.sections as any);
      } catch (e) {
        throw new BadRequestException('Invalid sections JSON format');
      }
    }
    
    // Legacy support
    if (legacyAudioFile) {
      parsedDto.audioUrl = `/uploads/audio/${legacyAudioFile.filename}`;
      parsedDto.fileName = legacyAudioFile.originalname;
      parsedDto.fileSize = legacyAudioFile.size;
    }
    
    return this.audioLessonsService.update(id, parsedDto, {
      englishAudio: englishAudioFile,
      hindiAudio: hindiAudioFile,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.audioLessonsService.remove(id);
  }
}
