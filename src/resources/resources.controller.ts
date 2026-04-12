import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcesService } from './resources.service';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('fileType') fileType?: 'pdf' | 'md',
    @Query('category') category?: string,
  ) {
    return this.resourcesService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      fileType,
      category,
      isActive: true,
    });
  }

  @Get('categories')
  async categories() {
    return this.resourcesService.getCategories();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }
}
