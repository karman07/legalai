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
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    const fileUrl = `/uploads/documents/${file.filename}`;
    
    console.log('Received DTO:', dto);
    console.log('Court data:', dto.court, typeof dto.court);
    
    // Ensure court is parsed if it's a string
    const finalDto = { ...dto };
    if (typeof dto.court === 'string') {
      try {
        finalDto.court = JSON.parse(dto.court);
        console.log('Parsed court:', finalDto.court);
      } catch (e) {
        console.error('Court parse error:', e);
      }
    }
    
    const createData = {
      ...finalDto,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    };
    
    console.log('Final create data:', createData);
    
    return this.pdfsService.create(createData as any, uploadedBy);
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
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('Update DTO:', dto);
    console.log('Court data:', dto.court, typeof dto.court);
    
    // Ensure court is parsed if it's a string
    const finalDto = { ...dto };
    if (typeof dto.court === 'string') {
      try {
        finalDto.court = JSON.parse(dto.court);
        console.log('Parsed court:', finalDto.court);
      } catch (e) {
        console.error('Court parse error:', e);
      }
    }
    
    if (file) {
      const fileUrl = `/uploads/documents/${file.filename}`;
      const updateData = {
        ...finalDto,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
      };
      console.log('Update with file data:', updateData);
      return this.pdfsService.update(id, updateData);
    }
    
    console.log('Update data:', finalDto);
    return this.pdfsService.update(id, finalDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pdfsService.remove(id);
  }
}
