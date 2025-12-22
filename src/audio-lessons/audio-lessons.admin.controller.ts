import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
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
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: false }))
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          let prefix = 'audio';
          if (file.fieldname === 'englishAudio') prefix = 'english';
          else if (file.fieldname === 'hindiAudio') prefix = 'hindi';
          else if (file.fieldname.includes('section_')) prefix = file.fieldname.replace(/[^a-zA-Z0-9]/g, '-');
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
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    // Find main audio files (legacy support only)
    const englishAudioFile = files?.find(f => f.fieldname === 'englishAudio');
    const hindiAudioFile = files?.find(f => f.fieldname === 'hindiAudio');
    const legacyAudioFile = files?.find(f => f.fieldname === 'file');
    
    // No validation required - audio files are optional at lesson level
    
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
    
    // Process section audio files
    if (parsedDto.sections && Array.isArray(parsedDto.sections)) {
      parsedDto.sections = parsedDto.sections.map((section: any, index: number) => {
        const sectionFiles = {
          englishAudio: files?.find(f => f.fieldname === `section_${index}_englishAudio`),
          hindiAudio: files?.find(f => f.fieldname === `section_${index}_hindiAudio`),
          easyEnglishAudio: files?.find(f => f.fieldname === `section_${index}_easyEnglishAudio`),
          easyHindiAudio: files?.find(f => f.fieldname === `section_${index}_easyHindiAudio`),
        };
        
        // Add audio file metadata to section
        if (sectionFiles.englishAudio) {
          section.englishAudio = {
            url: `/uploads/audio/${sectionFiles.englishAudio.filename}`,
            fileName: sectionFiles.englishAudio.originalname,
            fileSize: sectionFiles.englishAudio.size,
          };
        }
        if (sectionFiles.hindiAudio) {
          section.hindiAudio = {
            url: `/uploads/audio/${sectionFiles.hindiAudio.filename}`,
            fileName: sectionFiles.hindiAudio.originalname,
            fileSize: sectionFiles.hindiAudio.size,
          };
        }
        if (sectionFiles.easyEnglishAudio) {
          section.easyEnglishAudio = {
            url: `/uploads/audio/${sectionFiles.easyEnglishAudio.filename}`,
            fileName: sectionFiles.easyEnglishAudio.originalname,
            fileSize: sectionFiles.easyEnglishAudio.size,
          };
        }
        if (sectionFiles.easyHindiAudio) {
          section.easyHindiAudio = {
            url: `/uploads/audio/${sectionFiles.easyHindiAudio.filename}`,
            fileName: sectionFiles.easyHindiAudio.originalname,
            fileSize: sectionFiles.easyHindiAudio.size,
          };
        }
        
        // Process subsection audio files
        if (section.subsections && Array.isArray(section.subsections)) {
          section.subsections = section.subsections.map((subsection: any, subIndex: number) => {
            const subsectionFiles = {
              englishAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_englishAudio`),
              hindiAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_hindiAudio`),
              easyEnglishAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_easyEnglishAudio`),
              easyHindiAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_easyHindiAudio`),
            };
            
            // Add audio file metadata to subsection
            if (subsectionFiles.englishAudio) {
              subsection.englishAudio = {
                url: `/uploads/audio/${subsectionFiles.englishAudio.filename}`,
                fileName: subsectionFiles.englishAudio.originalname,
                fileSize: subsectionFiles.englishAudio.size,
              };
            }
            if (subsectionFiles.hindiAudio) {
              subsection.hindiAudio = {
                url: `/uploads/audio/${subsectionFiles.hindiAudio.filename}`,
                fileName: subsectionFiles.hindiAudio.originalname,
                fileSize: subsectionFiles.hindiAudio.size,
              };
            }
            if (subsectionFiles.easyEnglishAudio) {
              subsection.easyEnglishAudio = {
                url: `/uploads/audio/${subsectionFiles.easyEnglishAudio.filename}`,
                fileName: subsectionFiles.easyEnglishAudio.originalname,
                fileSize: subsectionFiles.easyEnglishAudio.size,
              };
            }
            if (subsectionFiles.easyHindiAudio) {
              subsection.easyHindiAudio = {
                url: `/uploads/audio/${subsectionFiles.easyHindiAudio.filename}`,
                fileName: subsectionFiles.easyHindiAudio.originalname,
                fileSize: subsectionFiles.easyHindiAudio.size,
              };
            }
            
            return subsection;
          });
        }
        
        return section;
      });
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
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: false }))
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          let prefix = 'audio';
          if (file.fieldname === 'englishAudio') prefix = 'english';
          else if (file.fieldname === 'hindiAudio') prefix = 'hindi';
          else if (file.fieldname.includes('section_')) prefix = file.fieldname.replace(/[^a-zA-Z0-9]/g, '-');
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
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const englishAudioFile = files?.find(f => f.fieldname === 'englishAudio');
    const hindiAudioFile = files?.find(f => f.fieldname === 'hindiAudio');
    const legacyAudioFile = files?.find(f => f.fieldname === 'file');
    
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
    
    // Process section audio files
    if (parsedDto.sections && Array.isArray(parsedDto.sections)) {
      parsedDto.sections = parsedDto.sections.map((section: any, index: number) => {
        const sectionFiles = {
          englishAudio: files?.find(f => f.fieldname === `section_${index}_englishAudio`),
          hindiAudio: files?.find(f => f.fieldname === `section_${index}_hindiAudio`),
          easyEnglishAudio: files?.find(f => f.fieldname === `section_${index}_easyEnglishAudio`),
          easyHindiAudio: files?.find(f => f.fieldname === `section_${index}_easyHindiAudio`),
        };
        
        // Add audio file metadata to section if files are uploaded
        if (sectionFiles.englishAudio) {
          section.englishAudio = {
            url: `/uploads/audio/${sectionFiles.englishAudio.filename}`,
            fileName: sectionFiles.englishAudio.originalname,
            fileSize: sectionFiles.englishAudio.size,
          };
        }
        if (sectionFiles.hindiAudio) {
          section.hindiAudio = {
            url: `/uploads/audio/${sectionFiles.hindiAudio.filename}`,
            fileName: sectionFiles.hindiAudio.originalname,
            fileSize: sectionFiles.hindiAudio.size,
          };
        }
        if (sectionFiles.easyEnglishAudio) {
          section.easyEnglishAudio = {
            url: `/uploads/audio/${sectionFiles.easyEnglishAudio.filename}`,
            fileName: sectionFiles.easyEnglishAudio.originalname,
            fileSize: sectionFiles.easyEnglishAudio.size,
          };
        }
        if (sectionFiles.easyHindiAudio) {
          section.easyHindiAudio = {
            url: `/uploads/audio/${sectionFiles.easyHindiAudio.filename}`,
            fileName: sectionFiles.easyHindiAudio.originalname,
            fileSize: sectionFiles.easyHindiAudio.size,
          };
        }
        
        // Process subsection audio files
        if (section.subsections && Array.isArray(section.subsections)) {
          section.subsections = section.subsections.map((subsection: any, subIndex: number) => {
            const subsectionFiles = {
              englishAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_englishAudio`),
              hindiAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_hindiAudio`),
              easyEnglishAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_easyEnglishAudio`),
              easyHindiAudio: files?.find(f => f.fieldname === `section_${index}_subsection_${subIndex}_easyHindiAudio`),
            };
            
            // Add audio file metadata to subsection if files are uploaded
            if (subsectionFiles.englishAudio) {
              subsection.englishAudio = {
                url: `/uploads/audio/${subsectionFiles.englishAudio.filename}`,
                fileName: subsectionFiles.englishAudio.originalname,
                fileSize: subsectionFiles.englishAudio.size,
              };
            }
            if (subsectionFiles.hindiAudio) {
              subsection.hindiAudio = {
                url: `/uploads/audio/${subsectionFiles.hindiAudio.filename}`,
                fileName: subsectionFiles.hindiAudio.originalname,
                fileSize: subsectionFiles.hindiAudio.size,
              };
            }
            if (subsectionFiles.easyEnglishAudio) {
              subsection.easyEnglishAudio = {
                url: `/uploads/audio/${subsectionFiles.easyEnglishAudio.filename}`,
                fileName: subsectionFiles.easyEnglishAudio.originalname,
                fileSize: subsectionFiles.easyEnglishAudio.size,
              };
            }
            if (subsectionFiles.easyHindiAudio) {
              subsection.easyHindiAudio = {
                url: `/uploads/audio/${subsectionFiles.easyHindiAudio.filename}`,
                fileName: subsectionFiles.easyHindiAudio.originalname,
                fileSize: subsectionFiles.easyHindiAudio.size,
              };
            }
            
            return subsection;
          });
        }
        
        return section;
      });
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
