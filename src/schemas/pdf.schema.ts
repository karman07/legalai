import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PdfDocument = HydratedDocument<Pdf>;

@Schema({ _id: false })
export class Court {
  @Prop()
  id?: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ enum: ['supreme', 'high', 'district'] })
  level?: 'supreme' | 'high' | 'district';

  @Prop({ trim: true })
  state?: string;

  @Prop()
  created_at?: Date;
}

const CourtSchema = SchemaFactory.createForClass(Court);

@Schema({ timestamps: true })
export class Pdf {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  fileName: string;

  @Prop()
  fileSize?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  uploadedBy?: Types.ObjectId;

  @Prop({ default: true, index: true })
  isActive: boolean;

  // Case Law Information
  @Prop({ trim: true, index: true })
  caseTitle?: string;

  @Prop({ trim: true, index: true })
  caseNumber?: string;

  @Prop({ type: CourtSchema })
  court?: Court;

  @Prop()
  judgmentDate?: Date;

  @Prop()
  year?: number;

  @Prop({ trim: true })
  citation?: string;

  @Prop({ type: [String] })
  judges?: string[];

  @Prop({ trim: true })
  summary?: string;

  @Prop({ select: false })
  fullText?: string;

  @Prop({ type: [String], index: true })
  keywords?: string[];

  @Prop({ trim: true, index: true })
  category?: string;

  @Prop({ default: 0, index: true })
  viewCount?: number;

  @Prop({ index: true })
  lastViewed?: Date;

  @Prop({ default: 0 })
  downloadCount?: number;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);

// Compound indexes for better query performance
PdfSchema.index({ isActive: 1, category: 1 });
PdfSchema.index({ isActive: 1, year: 1 });
PdfSchema.index({ isActive: 1, 'court.level': 1 });
PdfSchema.index({ isActive: 1, createdAt: -1 });
PdfSchema.index({ isActive: 1, viewCount: -1 });
PdfSchema.index({ category: 1, year: 1 });
PdfSchema.index({ 'court.level': 1, year: 1 });

// Text search index
PdfSchema.index({
  title: 'text',
  description: 'text',
  caseTitle: 'text',
  summary: 'text',
  keywords: 'text'
}, {
  weights: {
    title: 10,
    caseTitle: 8,
    keywords: 6,
    description: 4,
    summary: 2
  }
});
