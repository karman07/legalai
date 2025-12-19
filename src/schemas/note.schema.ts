import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ _id: false })
export class NoteReference {
  @Prop({ required: true })
  type: string; // 'pdf', 'audio', 'quiz', 'video', etc.

  @Prop({ required: true })
  id: string; // ID of the referenced resource

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional context like page number, timestamp, etc.
}

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: NoteReference, required: true })
  reference: NoteReference;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([String])
  tags?: string[];

  @Prop({ default: false })
  isBookmarked: boolean;

  @Prop({ default: false })
  isFavourite: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Indexes for better performance
NoteSchema.index({ userId: 1, 'reference.type': 1, 'reference.id': 1 });
NoteSchema.index({ userId: 1, isBookmarked: 1 });
NoteSchema.index({ userId: 1, isFavourite: 1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ createdAt: -1 });