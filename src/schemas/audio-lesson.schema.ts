import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VALID_CATEGORY_IDS } from '../common/enums/audio-lesson-category.enum';

export type AudioLessonDocument = AudioLesson & Document;

@Schema({ timestamps: true })
export class AudioLesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  audioUrl: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number; // in bytes

  @Prop()
  duration?: number; // in seconds

  @Prop()
  transcript?: string; // Auto-generated transcript from Whisper API

  @Prop({ enum: VALID_CATEGORY_IDS })
  category?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  language?: string; // e.g., 'en', 'hi', etc.

  @Prop()
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop()
  transcriptionError?: string;
}

export const AudioLessonSchema = SchemaFactory.createForClass(AudioLesson);

// Indexes for better query performance
AudioLessonSchema.index({ title: 1 });
AudioLessonSchema.index({ category: 1 });
AudioLessonSchema.index({ tags: 1 });
AudioLessonSchema.index({ isActive: 1 });
AudioLessonSchema.index({ createdAt: -1 });
