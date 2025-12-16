import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PdfDocument = HydratedDocument<Pdf>;

@Schema({ _id: false })
export class Court {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['supreme', 'high', 'district'] })
  level: 'supreme' | 'high' | 'district';

  @Prop({ trim: true })
  state?: string;

  @Prop()
  created_at: Date;
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

  @Prop({ default: true })
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

  @Prop()
  fullText?: string;

  @Prop({ type: [String], index: true })
  keywords?: string[];

  @Prop({ trim: true, index: true })
  category?: string;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);
