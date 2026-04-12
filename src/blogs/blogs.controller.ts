import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogListResponse, BlogResponse, BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ): Promise<BlogListResponse> {
    return this.blogsService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      includeDrafts: false,
    });
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<BlogResponse> {
    return this.blogsService.findOneBySlug(slug);
  }
}
