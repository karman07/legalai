import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScoreAiQuizDto } from './dto/score-ai-quiz.dto';

@Controller('ai/quizzes')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateQuizDto) {
    const questions = await this.aiService.generateQuiz(dto.topic, dto.count);
    return {
      title: `${dto.topic} - AI Generated`,
      topic: dto.topic,
      type: 'mocktest' as const,
      isPublished: false,
      questions,
    };
  }

  @Post('score')
  async score(@Body() dto: ScoreAiQuizDto) {
    const { questions, answers } = dto;
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return {
        statusCode: 400,
        message: 'answers length must match number of questions',
      };
    }
    let score = 0;
    const details = questions.map((q, idx) => {
      const correct = q.correctOptionIndex === answers[idx];
      if (correct) score += 1;
      return {
        question: q.text,
        selectedIndex: answers[idx],
        correctIndex: q.correctOptionIndex,
        correct,
        explanation: q.explanation,
      };
    });
    return {
      totalQuestions: questions.length,
      score,
      percentage: Math.round((score / questions.length) * 100),
      details,
    };
  }
}
