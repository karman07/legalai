import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  constructor(private readonly pdfsService: PdfsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10000, { // Support up to 10,000 files at once
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
      limits: {
        fileSize: 7 * 1024 * 1024 * 1024, // 7GB max per file
        files: 10000 // Maximum 10,000 files
      },
    }),
  )
  async create(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;

    console.log(`Received ${files.length} file(s) for upload`);
    console.log('Received DTO:', dto);

    // Process multiple files
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Parse dto for each file
        const finalDto = { ...dto };

        // Handle court data parsing
        if (typeof dto.court === 'string') {
          try {
            finalDto.court = JSON.parse(dto.court);
          } catch (e) {
            console.error('Court parse error:', e);
          }
        }

        // If title contains array or multiple titles, use the index
        let fileTitle = finalDto.title || file.originalname;
        if (finalDto.titles && Array.isArray(finalDto.titles) && finalDto.titles[i]) {
          fileTitle = finalDto.titles[i];
        } else if (files.length > 1 && finalDto.title) {
          fileTitle = `${finalDto.title} (${i + 1})`;
        } else if (files.length > 1) {
          fileTitle = `${file.originalname} (${i + 1})`;
        }

        const createData = {
          ...finalDto,
          title: fileTitle,
          file: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        };

        const result = await this.pdfsService.create(createData as any, uploadedBy);
        results.push({
          success: true,
          filename: file.originalname,
          documentId: result._id,
          data: result
        });

        console.log(`✓ File ${i + 1}/${files.length} uploaded: ${file.originalname}`);
      } catch (error) {
        console.error(`✗ File ${i + 1}/${files.length} failed: ${file.originalname}`, error);
        errors.push({
          success: false,
          filename: file.originalname,
          error: error.message || 'Upload failed'
        });
      }
    }

    return {
      message: `Processed ${files.length} file(s)`,
      totalFiles: files.length,
      successful: results.length,
      failed: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    };
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
      limits: { fileSize: 7 * 1024 * 1024 * 1024 }, // 7GB max
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePdfDto,
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
      const updateData = {
        ...finalDto,
        file: file.filename,
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

  // Dedicated endpoint for bulk/large PDF uploads (Multiple files)
  @Post('bulk-upload')
  @UseInterceptors(
    FilesInterceptor('files', 10000, { // Support up to 10,000 files
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `bulk-doc-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept PDF files and common document types
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF and document files are allowed for bulk upload'), false);
        }
      },
      limits: {
        fileSize: 7 * 1024 * 1024 * 1024, // 7GB max per file
        files: 10000 // Maximum 10,000 files per request
      },
    }),
  )
  async bulkUpload(
    @Body() dto: CreatePdfDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required for bulk upload');
    }

    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    const startTime = Date.now();

    console.log(`\n🚀 Bulk upload initiated:`);
    console.log(`   Files: ${files.length}`);
    console.log(`   Total size: ${(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`);
    console.log(`   Uploaded by: ${uploadedBy}\n`);

    // Process files in batches for better performance
    const results = [];
    const errors = [];
    const batchSize = 100; // Process 100 files at a time

    for (let batchStart = 0; batchStart < files.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, files.length);
      const batch = files.slice(batchStart, batchEnd);

      console.log(`Processing batch: ${batchStart + 1}-${batchEnd} of ${files.length}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (file, localIndex) => {
        const globalIndex = batchStart + localIndex;
        try {
          // Parse dto for each file
          const finalDto = { ...dto };

          // Handle court data parsing
          if (typeof dto.court === 'string') {
            try {
              finalDto.court = JSON.parse(dto.court);
            } catch (e) {
              console.error('Court parse error:', e);
            }
          }

          // Handle multiple titles if provided as array
          let fileTitle = finalDto.title || file.originalname;
          if (finalDto.titles && Array.isArray(finalDto.titles) && finalDto.titles[globalIndex]) {
            fileTitle = finalDto.titles[globalIndex];
          } else if (files.length > 1 && finalDto.title) {
            fileTitle = `${finalDto.title} (${globalIndex + 1})`;
          }

          const createData = {
            ...finalDto,
            title: fileTitle,
            file: file.filename,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            isLargeFile: file.size > 1024 * 1024 * 1024, // Flag files larger than 1GB
            uploadBatch: startTime, // Group files from same upload
            batchIndex: globalIndex + 1,
          };

          const result = await this.pdfsService.create(createData as any, uploadedBy);

          return {
            success: true,
            index: globalIndex + 1,
            filename: file.originalname,
            size: file.size,
            documentId: result._id,
            data: result
          };
        } catch (error) {
          console.error(`✗ File ${globalIndex + 1} failed: ${file.originalname}`, error.message);
          return {
            success: false,
            index: globalIndex + 1,
            filename: file.originalname,
            size: file.size,
            error: error.message || 'Upload failed'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Separate successes and failures
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result);
          console.log(`  ✓ [${result.index}/${files.length}] ${result.filename}`);
        } else {
          errors.push(result);
          console.log(`  ✗ [${result.index}/${files.length}] ${result.filename}: ${result.error}`);
        }
      });
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Bulk upload completed in ${duration}s`);
    console.log(`   Successful: ${results.length}/${files.length}`);
    console.log(`   Failed: ${errors.length}/${files.length}\n`);

    return {
      message: `Bulk upload completed: ${results.length} succeeded, ${errors.length} failed`,
      totalFiles: files.length,
      successful: results.length,
      failed: errors.length,
      duration: `${duration}s`,
      uploadBatch: startTime,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  @Post('run-cleanup')
  async runCleanup() {
    return this.pdfsService.runCleanup();
  }
}
