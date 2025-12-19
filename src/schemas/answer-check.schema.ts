import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerCheckDocument = AnswerCheck & Document;

@Schema({ timestamps: true })
export class AnswerCheck {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  totalMarks: number;

  @Prop({ required: true })
  scoredMarks: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ required: true })
  feedback: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  filePath: string;

  @Prop()
  suggestions?: string;

  @Prop()
  gradingCriteria?: string;
}

export const AnswerCheckSchema = SchemaFactory.createForClass(AnswerCheck);

AnswerCheckSchema.index({ userId: 1, createdAt: -1 });