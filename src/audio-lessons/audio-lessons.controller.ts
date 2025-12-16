import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AudioLessonsService } from './audio-lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audio-lessons')
@UseGuards(JwtAuthGuard)
export class AudioLessonsController {
  constructor(private readonly audioLessonsService: AudioLessonsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = { isActive: true };

    if (category) filters.category = category;

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { transcript: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

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
    return this.audioLessonsService.getCategories();
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    if (!query) {
      return { items: [], total: 0, page: 1, limit: parseInt(limit), totalPages: 0 };
    }

    const filters: any = {
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { transcript: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    return this.audioLessonsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
    });
  }

  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.audioLessonsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { category, isActive: true },
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.audioLessonsService.findOne(id);
  }
}
