import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('topic') topic?: string,
    @Query('type') type?: 'pyq' | 'mocktest',
  ) {
    return this.quizzesService.getForUserList({ page: parseInt(page), limit: parseInt(limit), topic, type });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.quizzesService.getForUser(id);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() dto: SubmitQuizDto) {
    return this.quizzesService.submitAndScore(id, dto.answers);
  }
}
