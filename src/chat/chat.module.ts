import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: Conversation.name, schema: ConversationSchema },
        ]),
        AiConfigModule,
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule { }
