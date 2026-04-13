import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true, trim: true, enum: ['resource', 'study-material'], default: 'resource' })
  kind: 'resource' | 'study-material';

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ trim: true, enum: ['pdf', 'md'], required: true })
  fileType: 'pdf' | 'md';

  @Prop({ trim: true, required: true })
  fileName: string;

  @Prop({ trim: true })
  originalName?: string;

  @Prop({ trim: true, default: 'General' })
  category?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: 'ObjectId', ref: 'User' })
  uploadedBy?: any;

  @Prop()
  fileSize?: number;

  @Prop({ trim: true })
  mimeType?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
