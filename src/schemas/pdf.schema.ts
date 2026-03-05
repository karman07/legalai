import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PdfDocument = HydratedDocument<Pdf>;

@Schema({ timestamps: true })
export class Pdf {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  diary_no?: string;

  @Prop({ trim: true })
  case_no?: string;

  @Prop({ trim: true })
  pet?: string;

  @Prop({ trim: true })
  pet_adv?: string;

  @Prop({ trim: true })
  res_adv?: string;

  @Prop({ trim: true })
  bench?: string;

  @Prop({ trim: true })
  judgement_by?: string;

  @Prop()
  judgment_dates?: Date;

  @Prop({ trim: true })
  link?: string;

  @Prop({ trim: true })
  file?: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  court?: {
    level: string;
    name: string;
  };

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  uploadedBy?: any;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  lastViewed?: Date;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);
