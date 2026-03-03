import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
    userId: string;

    @Prop({ required: true })
    title: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
