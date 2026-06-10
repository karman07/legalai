import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [QuizzesModule, AiConfigModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
