import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceCategoryDocument = HydratedDocument<ResourceCategory>;

@Schema({ timestamps: true })
export class ResourceCategory {
  @Prop({ required: true, trim: true, enum: ['resource', 'study-material'], default: 'resource' })
  kind: 'resource' | 'study-material';

  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ResourceCategorySchema = SchemaFactory.createForClass(ResourceCategory);
ResourceCategorySchema.index({ kind: 1, name: 1 }, { unique: true });
