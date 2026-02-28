import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pdf, PdfDocument } from '../schemas/pdf.schema';
import { AudioLesson, AudioLessonDocument } from '../schemas/audio-lesson.schema';
import { Quiz, QuizDocument } from '../schemas/quiz.schema';

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(Pdf.name) private readonly pdfModel: Model<PdfDocument>,
        @InjectModel(AudioLesson.name) private readonly audioModel: Model<AudioLessonDocument>,
        @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    ) { }

    async globalSearch(query: string, limit = 10) {
        if (!query || query.trim().length < 2) {
            return {
                pdfs: [],
                audioLessons: [],
                quizzes: [],
            };
        }

        const searchRegex = new RegExp(query, 'i');

        const [pdfs, audioLessons, quizzes] = await Promise.all([
            // Search PDFs
            this.pdfModel
                .find({
                    isActive: true,
                    $or: [
                        { title: searchRegex },
                        { category: searchRegex },
                        { case_no: searchRegex },
                        { diary_no: searchRegex },
                        { pet: searchRegex },
                    ],
                })
                .limit(limit)
                .select('-fullText')
                .lean(),

            // Search Audio Lessons
            this.audioModel
                .find({
                    isActive: true,
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex },
                        { category: searchRegex },
                        { tags: { $in: [searchRegex] } },
                    ],
                })
                .limit(limit)
                .lean(),

            // Search Quizzes
            this.quizModel
                .find({
                    isActive: true,
                    $or: [
                        { title: searchRegex },
                        { topic: searchRegex },
                        { description: searchRegex },
                    ],
                })
                .limit(limit)
                .lean(),
        ]);

        return {
            results: {
                pdfs: pdfs.map(p => ({ ...p, type: 'pdf' })),
                audioLessons: audioLessons.map(a => ({ ...a, type: 'audio' })),
                quizzes: quizzes.map(q => ({ ...q, type: 'quiz' })),
            },
            total: pdfs.length + audioLessons.length + quizzes.length,
            query,
        };
    }
}
