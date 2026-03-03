import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
    userId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true })
    conversationId: string;

    @Prop({ required: true })
    query: string;

    @Prop({ required: true })
    response: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
