import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ _id: false })
export class Question {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ type: [String], required: true, validate: [(v: string[]) => Array.isArray(v) && v.length >= 2 && v.length <= 8, 'options must be between 2 and 8'], })
  options: string[];

  @Prop({ required: true, min: 0 })
  correctOptionIndex: number;

  @Prop({ trim: true })
  explanation?: string;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, index: true })
  topic: string;

  @Prop({ required: true, enum: ['pyq', 'mocktest'], index: true })
  type: 'pyq' | 'mocktest';

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [QuestionSchema], required: true, validate: [(v: Question[]) => Array.isArray(v) && v.length >= 1 && v.length <= 100, 'questions must be between 1 and 100'], })
  questions: Question[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// Additional validation to ensure correctOptionIndex within bounds
QuizSchema.path('questions').validate(function (questions: any[]) {
  return questions.every((q: any) => Number.isInteger(q.correctOptionIndex) && q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length);
}, 'correctOptionIndex must be a valid index in options');
