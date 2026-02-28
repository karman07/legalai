import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Pdf, PdfSchema } from '../schemas/pdf.schema';
import { AudioLesson, AudioLessonSchema } from '../schemas/audio-lesson.schema';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Pdf.name, schema: PdfSchema },
            { name: AudioLesson.name, schema: AudioLessonSchema },
            { name: Quiz.name, schema: QuizSchema },
        ]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule { }
