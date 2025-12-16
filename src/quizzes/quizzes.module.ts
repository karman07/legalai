import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';
import { QuizzesService } from './quizzes.service';
import { QuizController } from './quiz.controller';
import { QuizAdminController } from './quiz.admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }])],
  controllers: [QuizController, QuizAdminController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
