import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {
  ResourceCategoryResponse,
  ResourceListResponse,
  ResourceResponse,
  ResourcesService,
} from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Controller('admin/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ResourcesAdminController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('categories')
  async listCategories(
    @Query('isActive') isActive?: string,
    @Query('kind') kind: 'resource' | 'study-material' = 'resource',
  ): Promise<ResourceCategoryResponse[]> {
    return this.resourcesService.getCategoryDetails(
      typeof isActive === 'string' ? isActive === 'true' : undefined,
      kind,
    );
  }

  @Post('categories')
  async createCategory(
    @Body('name') name: string,
    @Body('kind') kind: 'resource' | 'study-material' = 'resource',
  ): Promise<ResourceCategoryResponse> {
    return this.resourcesService.createCategory(name, kind);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('kind') kind: 'resource' | 'study-material' = 'resource',
  ): Promise<ResourceCategoryResponse> {
    return this.resourcesService.updateCategory(id, name, kind);
  }

  @Delete('categories/:id')
  async removeCategory(
    @Param('id') id: string,
    @Query('kind') kind: 'resource' | 'study-material' = 'resource',
  ): Promise<{ message: string; id: string }> {
    return this.resourcesService.removeCategory(id, kind);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resources',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `resource-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedExt = ['.pdf', '.md'];
        const allowedMime = ['application/pdf', 'text/markdown', 'text/plain'];

        if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new BadRequestException('Only PDF and MD files are allowed'), false);
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateResourceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ResourceResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadedBy = (req as any)?.user?.id || (req as any)?.user?._id;
    return this.resourcesService.create(
      {
        ...dto,
        kind: dto.kind || 'resource',
        title: dto.title || file.originalname,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
      uploadedBy,
    );
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('fileType') fileType?: 'pdf' | 'md',
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('kind') kind: 'resource' | 'study-material' = 'resource',
  ): Promise<ResourceListResponse> {
    return this.resourcesService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      fileType,
      category,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      kind,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ResourceResponse> {
    return this.resourcesService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resources',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `resource-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedExt = ['.pdf', '.md'];
        const allowedMime = ['application/pdf', 'text/markdown', 'text/plain'];
        if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new BadRequestException('Only PDF and MD files are allowed'), false);
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResourceResponse> {
    const payload: any = { ...dto };
    if (file) {
      payload.fileName = file.filename;
      payload.originalName = file.originalname;
      payload.mimeType = file.mimetype;
      payload.fileSize = file.size;
    }

    return this.resourcesService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string; id: string }> {
    return this.resourcesService.remove(id);
  }
}
