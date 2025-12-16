import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from '../schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
  ) {}

  async create(createDto: CreateQuizDto, createdBy?: string) {
    // Ensure each question's correctOptionIndex is within bounds
    createDto.questions.forEach((q) => {
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        throw new BadRequestException('correctOptionIndex must reference an existing option');
      }
    });
    const doc = new this.quizModel({ ...createDto, createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined });
    return await doc.save();
  }

  async findAll(params: { page?: number; limit?: number; topic?: string; type?: 'pyq' | 'mocktest'; isPublished?: boolean }) {
    const { page = 1, limit = 10, topic, type, isPublished } = params;
    const filter: Record<string, any> = {};
    if (topic) filter.topic = { $regex: new RegExp(`^${this.escapeRegExp(topic)}$`, 'i') };
    if (type) filter.type = type;
    if (typeof isPublished === 'boolean') filter.isPublished = isPublished;

    const [items, total] = await Promise.all([
      this.quizModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.quizModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quiz id');
    }
    const quiz = await this.quizModel.findById(id).lean();
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async update(id: string, updateDto: UpdateQuizDto) {
    if (updateDto.questions) {
      updateDto.questions.forEach((q) => {
        if (q.options && q.correctOptionIndex !== undefined && (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length)) {
          throw new BadRequestException('correctOptionIndex must reference an existing option');
        }
      });
    }
    const updated = await this.quizModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!updated) throw new NotFoundException('Quiz not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.quizModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Quiz not found');
    return { message: 'Quiz deleted successfully', id };
  }

  sanitizeForUser(quiz: any) {
    // Remove correctOptionIndex for user consumption
    const q = { ...quiz } as any;
    q.questions = q.questions?.map((x: any) => ({ text: x.text, options: x.options, explanation: x.explanation }));
    return q;
  }

  async getForUserList(params: { page?: number; limit?: number; topic?: string; type?: 'pyq' | 'mocktest' }) {
    const data = await this.findAll({ ...params, isPublished: true });
    data.items = data.items.map((it) => this.sanitizeForUser(it));
    return data;
  }

  async getForUser(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quiz id');
    }
    const quiz = await this.quizModel.findOne({ _id: id, isPublished: true }).lean();
    if (!quiz) throw new NotFoundException('Quiz not found');
    return this.sanitizeForUser(quiz);
  }

  async submitAndScore(id: string, answers: number[]) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quiz id');
    }
    const quiz = await this.quizModel.findById(id).lean();
    if (!quiz || !quiz.isPublished) throw new NotFoundException('Quiz not found');
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      throw new BadRequestException('answers length must match number of questions');
    }
    let score = 0;
    const details = quiz.questions.map((q: any, idx: number) => {
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
      quizId: quiz._id,
      totalQuestions: quiz.questions.length,
      score,
      percentage: Math.round((score / quiz.questions.length) * 100),
      details,
    };
  }

  private escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
