import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';

@Module({
  imports: [ConfigModule, QuizzesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
