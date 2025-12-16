import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PdfsService } from './pdfs.service';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';

@Controller('admin/pdfs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PdfsAdminController {
  constructor(private readonly pdfsService: PdfsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `doc-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept all file types
        cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    }),
  )
  async create(
    @Body() dto: CreatePdfDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    const fileUrl = `/uploads/documents/${file.filename}`;
    
    // Parse JSON strings from form-data
    const parsedDto = { ...dto };
    if (typeof dto.court === 'string') {
      try {
        parsedDto.court = JSON.parse(dto.court as any);
      } catch (e) {
        throw new BadRequestException('Invalid court JSON format');
      }
    }
    if (typeof dto.judges === 'string') {
      try {
        parsedDto.judges = JSON.parse(dto.judges as any);
      } catch (e) {
        throw new BadRequestException('Invalid judges JSON format');
      }
    }
    if (typeof dto.keywords === 'string') {
      try {
        parsedDto.keywords = JSON.parse(dto.keywords as any);
      } catch (e) {
        throw new BadRequestException('Invalid keywords JSON format');
      }
    }
    if (typeof dto.year === 'string') {
      parsedDto.year = parseInt(dto.year as any, 10);
      if (isNaN(parsedDto.year)) {
        throw new BadRequestException('Invalid year format');
      }
    }
    
    return this.pdfsService.create(
      {
        ...parsedDto,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
      } as any,
      uploadedBy,
    );
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('isActive') isActive?: string,
  ) {
    const parsed = typeof isActive === 'string' ? isActive === 'true' : undefined;
    return this.pdfsService.findAll({ page: parseInt(page), limit: parseInt(limit), isActive: parsed });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.pdfsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `doc-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept all file types
        cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePdfDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Parse JSON strings from form-data
    const parsedDto = { ...dto };
    if (typeof dto.court === 'string') {
      try {
        parsedDto.court = JSON.parse(dto.court as any);
      } catch (e) {
        throw new BadRequestException('Invalid court JSON format');
      }
    }
    if (typeof dto.judges === 'string') {
      try {
        parsedDto.judges = JSON.parse(dto.judges as any);
      } catch (e) {
        throw new BadRequestException('Invalid judges JSON format');
      }
    }
    if (typeof dto.keywords === 'string') {
      try {
        parsedDto.keywords = JSON.parse(dto.keywords as any);
      } catch (e) {
        throw new BadRequestException('Invalid keywords JSON format');
      }
    }
    if (typeof dto.year === 'string') {
      parsedDto.year = parseInt(dto.year as any, 10);
      if (isNaN(parsedDto.year)) {
        throw new BadRequestException('Invalid year format');
      }
    }
    
    if (file) {
      const fileUrl = `/uploads/documents/${file.filename}`;
      return this.pdfsService.update(id, {
        ...parsedDto,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
      });
    }
    return this.pdfsService.update(id, parsedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pdfsService.remove(id);
  }
}
