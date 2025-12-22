import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VALID_CATEGORY_IDS } from '../common/enums/audio-lesson-category.enum';

export type AudioLessonDocument = AudioLesson & Document;

@Schema({ _id: false })
export class AudioFile {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop()
  duration?: number;
}

@Schema({ _id: false })
export class AudioSubsection {
  @Prop({ required: true })
  title: string;

  @Prop()
  hindiText?: string;

  @Prop()
  englishText?: string;

  @Prop()
  easyHindiText?: string;

  @Prop()
  easyEnglishText?: string;

  // Audio files for each text variant
  @Prop({ type: AudioFile })
  hindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  englishAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyHindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyEnglishAudio?: AudioFile;
}

@Schema({ _id: false })
export class AudioSection {
  @Prop({ required: true })
  title: string;

  @Prop()
  hindiText?: string;

  @Prop()
  englishText?: string;

  @Prop()
  easyHindiText?: string;

  @Prop()
  easyEnglishText?: string;

  // Audio files for each text variant
  @Prop({ type: AudioFile })
  hindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  englishAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyHindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyEnglishAudio?: AudioFile;

  // Subsections within this section
  @Prop({ type: [AudioSubsection] })
  subsections?: AudioSubsection[];

  @Prop({ default: 0 })
  totalSubsections: number; // Auto-calculated count
}

@Schema({ timestamps: true })
export class AudioLesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  headTitle?: string; // Main heading for the lesson

  @Prop()
  description?: string; // Only description at lesson level

  @Prop({ default: 0 })
  totalSections: number; // Auto-calculated count of sections

  @Prop({ default: 0 })
  totalSubsections: number; // Auto-calculated total count of all subsections

  // Sections with their own audio and subsections
  @Prop({ type: [AudioSection] })
  sections?: AudioSection[];

  @Prop({ enum: VALID_CATEGORY_IDS })
  category?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  // Legacy fields for backward compatibility
  @Prop()
  audioUrl?: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  duration?: number;

  @Prop()
  transcript?: string;

  @Prop()
  language?: string;
}

export const AudioLessonSchema = SchemaFactory.createForClass(AudioLesson);

// Indexes for better query performance
AudioLessonSchema.index({ title: 1 });
AudioLessonSchema.index({ category: 1 });
AudioLessonSchema.index({ tags: 1 });
AudioLessonSchema.index({ isActive: 1 });
AudioLessonSchema.index({ createdAt: -1 });
