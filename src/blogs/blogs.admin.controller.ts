import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { BlogListResponse, BlogResponse, BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('admin/blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BlogsAdminController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async create(@Body() dto: CreateBlogDto): Promise<BlogResponse> {
    return this.blogsService.create(dto);
  }

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
      includeDrafts: true,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogResponse> {
    return this.blogsService.findOneById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto): Promise<BlogResponse> {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string; id: string }> {
    return this.blogsService.remove(id);
  }
}
