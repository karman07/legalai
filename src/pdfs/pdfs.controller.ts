import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PdfsService } from './pdfs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pdfs')
@UseGuards(JwtAuthGuard)
export class PdfsController {
  constructor(private readonly pdfsService: PdfsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('category') category?: string,
    @Query('year') year?: string,
    @Query('courtLevel') courtLevel?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const filters: any = {};

    if (category) filters.category = category;
    if (year) filters.year = parseInt(year);
    if (courtLevel) filters['court.level'] = courtLevel;

    // Handle sorting
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          sort = { title: order };
          break;
        case 'year':
          sort = { year: order };
          break;
        case 'views':
          sort = { viewCount: order };
          break;
        case 'date':
        default:
          sort = { createdAt: order };
      }
    }

    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      sort,
    });
  }

  @Get('categories')
  async getCategories() {
    return this.pdfsService.getCategories();
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('category') category?: string,
    @Query('year') year?: string,
    @Query('courtLevel') courtLevel?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category;
    if (year) filters.year = parseInt(year);
    if (courtLevel) filters['court.level'] = courtLevel;

    return this.pdfsService.searchPdfs({
      query,
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
    });
  }

  @Get('stats')
  async getStats() {
    return this.pdfsService.getStats();
  }

  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { category },
    });
  }

  @Get('court/:level')
  async getByCourtLevel(
    @Param('level') level: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { 'court.level': level },
    });
  }

  @Get('year/:year')
  async getByYear(
    @Param('year') year: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { year: parseInt(year) },
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.pdfsService.findOne(id);
  }
}
