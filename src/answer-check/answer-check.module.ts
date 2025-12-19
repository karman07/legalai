import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerCheckController } from './answer-check.controller';
import { AnswerCheckService } from './answer-check.service';
import { AnswerCheck, AnswerCheckSchema } from '../schemas/answer-check.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnswerCheck.name, schema: AnswerCheckSchema },
    ]),
  ],
  controllers: [AnswerCheckController],
  providers: [AnswerCheckService],
  exports: [AnswerCheckService],
})
export class AnswerCheckModule {}