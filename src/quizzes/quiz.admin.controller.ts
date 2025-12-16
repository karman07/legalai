import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('admin/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QuizAdminController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async create(@Body() dto: CreateQuizDto) {
    // createdBy can be derived from request.user if needed later
    return this.quizzesService.create(dto);
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('topic') topic?: string,
    @Query('type') type?: 'pyq' | 'mocktest',
    @Query('isPublished') isPublished?: string,
  ) {
    const parsed = typeof isPublished === 'string' ? isPublished === 'true' : undefined;
    return this.quizzesService.findAll({ page: parseInt(page), limit: parseInt(limit), topic, type, isPublished: parsed });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }
}
