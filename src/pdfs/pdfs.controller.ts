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
    @Query('limit') limit = '12',
    @Query('category') category?: string,
    @Query('year') year?: string,
    @Query('courtLevel') courtLevel?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = { isActive: true }; // Only show active PDFs to users

    if (category) filters.category = category;
    if (year) filters.year = parseInt(year);
    if (courtLevel) filters['court.level'] = courtLevel;

    // Handle search across multiple fields
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
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
    @Query('limit') limit = '12',
  ) {
    if (!query) {
      return { items: [], total: 0, page: 1, limit: parseInt(limit), totalPages: 0 };
    }

    const filters: any = {
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { caseTitle: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    return this.pdfsService.findAll({
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
    return this.pdfsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { category, isActive: true },
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
      filters: { 'court.level': level, isActive: true },
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
      filters: { year: parseInt(year), isActive: true },
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.pdfsService.findOne(id);
  }
}
