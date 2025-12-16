import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioLesson, AudioLessonSchema } from '../schemas/audio-lesson.schema';
import { AudioLessonsService } from './audio-lessons.service';
import { AudioLessonsAdminController } from './audio-lessons.admin.controller';
import { AudioLessonsController } from './audio-lessons.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AudioLesson.name, schema: AudioLessonSchema }])],
  controllers: [AudioLessonsAdminController, AudioLessonsController],
  providers: [AudioLessonsService],
  exports: [AudioLessonsService],
})
export class AudioLessonsModule {}
