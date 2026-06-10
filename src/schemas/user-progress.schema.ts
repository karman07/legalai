import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true, index: true }) date: string; // 'YYYY-MM-DD'
  @Prop({ default: 0 }) lawsRead: number;
  @Prop({ default: 0 }) audioListened: number;
  @Prop({ default: 0 }) quizzesTaken: number;
  @Prop({ default: 0 }) casesViewed: number;
  @Prop({ default: 0 }) minutesStudied: number;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
UserProgressSchema.index({ userId: 1, date: 1 }, { unique: true });
