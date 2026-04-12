import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  slug: string;

  @Prop({ trim: true, default: '' })
  excerpt?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ trim: true, default: '' })
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ trim: true, default: 'LegalPadhai Editorial' })
  author?: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt?: Date;

  @Prop({ default: 0 })
  views: number;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
