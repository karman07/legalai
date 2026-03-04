import { Body, Controller, Get, Post, Put, Delete, Patch, UseGuards, Request, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    async chat(@Body() body: any, @Request() req) {
        const { query, conversationId } = body;
        if (!query) {
            return {
                statusCode: 400,
                message: 'query is required',
            };
        }

        const userId = req.user?.userId;
        const result = await this.chatService.processChat(userId, query, conversationId);

        return {
            query,
            ...result,
        };
    }

    @Get('conversations')
    @UseGuards(JwtAuthGuard)
    async getConversations(@Request() req) {
        const userId = req.user.userId;
        return this.chatService.getConversationList(userId);
    }

    @Get('history/:conversationId')
    @UseGuards(JwtAuthGuard)
    async getHistory(@Request() req, @Param('conversationId') conversationId: string) {
        // You might want to verify that the conversation belongs to the user
        return this.chatService.getChatHistory(conversationId);
    }

    @Patch('conversations/:id')
    @UseGuards(JwtAuthGuard)
    async updateConversation(@Param('id') id: string, @Body('title') title: string) {
        return this.chatService.updateConversation(id, title);
    }

    @Delete('conversations/:id')
    @UseGuards(JwtAuthGuard)
    async deleteConversation(@Param('id') id: string) {
        return this.chatService.deleteConversation(id);
    }

    @Delete('message/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMessage(@Param('id') id: string) {
        return this.chatService.deleteChatMessage(id);
    }
}
