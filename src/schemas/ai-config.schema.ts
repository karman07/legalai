import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiConfigDocument = AiConfig & Document;

@Schema({ timestamps: true })
export class AiConfig {
  @Prop({ required: true, unique: true, default: 'default' })
  configKey: string;

  // Google Cloud / Python AI service
  @Prop() gcpProjectId: string;
  @Prop() gcpDatastoreId: string;
  @Prop({ default: 'global' }) gcpVertexLocation: string;
  @Prop({ default: 'global' }) gcpDiscoveryLocation: string;
  @Prop() serviceAccountJson: string;

  // NestJS / Gemini
  @Prop() geminiApiKey: string;
  @Prop({ default: 'gemini-2.0-flash' }) geminiModel: string;
}

export const AiConfigSchema = SchemaFactory.createForClass(AiConfig);
