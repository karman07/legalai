import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Chat } from '../schemas/chat.schema';
import { Conversation } from '../schemas/conversation.schema';
import { AiConfigService } from '../ai-config/ai-config.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        private readonly config: ConfigService,
        private readonly aiConfigService: AiConfigService,
    ) {}

    async getConversationList(userId: string) {
        return this.conversationModel.find({ userId }).sort({ updatedAt: -1 }).exec();
    }

    async getChatHistory(conversationId: string) {
        return this.chatModel.find({ conversationId }).sort({ createdAt: 1 }).exec();
    }

    async processChat(userId: string | null, query: string, conversationId?: string): Promise<{ response: string; conversationId: string; title: string }> {
        let conversation: any;

        if (conversationId && Types.ObjectId.isValid(conversationId)) {
            conversation = await this.conversationModel.findById(conversationId);
        }

        if (!conversation) {
            // New conversation - generate simple "Chat Name" from first query
            // Strip common stop words and question marks for a cleaner title
            let title = query.replace(/[?]/g, '').trim();
            if (title.length > 40) {
                title = title.substring(0, 37) + '...';
            }

            conversation = new this.conversationModel({
                userId,
                title: title || 'New Chat',
            });
            await conversation.save();
        }

        const apiKey = await this.aiConfigService.getGeminiApiKey();
        const geminiModel = await this.aiConfigService.getGeminiModel();
        const configUrl = this.config.get<string>('CHAT_AI_URL');
        const url = configUrl || `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        let body: any;
        if (configUrl) {
            body = { query };
        } else {
            body = {
                contents: [{ role: 'user', parts: [{ text: query }] }],
            };
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new InternalServerErrorException(`AI Service error: ${res.status} ${errText}`);
        }

        const data = await res.json();
        let responseText = '';

        if (configUrl) {
            responseText = data?.response || data?.answer || data?.text || JSON.stringify(data);
        } else {
            responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        // Save chat history linked to conversation
        const chatEntry = new this.chatModel({
            userId,
            conversationId: conversation._id,
            query,
            response: responseText,
        });
        await chatEntry.save();

        // Update conversation timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

        return {
            response: responseText,
            conversationId: conversation._id,
            title: conversation.title,
        };
    }

    async updateConversation(conversationId: string, title: string) {
        return this.conversationModel.findByIdAndUpdate(conversationId, { title }, { new: true }).exec();
    }

    async deleteConversation(conversationId: string) {
        await this.chatModel.deleteMany({ conversationId }).exec();
        return this.conversationModel.findByIdAndDelete(conversationId).exec();
    }

    async deleteChatMessage(chatId: string) {
        return this.chatModel.findByIdAndDelete(chatId).exec();
    }
}
