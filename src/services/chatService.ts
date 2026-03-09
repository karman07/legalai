export type ChatMessage = {
    id: string;
    message: string;
    response: string;
    created_at: string;
};

export interface Conversation {
    _id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageResponse {
    response: string;
    conversationId: string;
    title: string;
}

// Use environment variable for API URL if available, otherwise fallback to default
const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = VITE_API_URL ? VITE_API_URL.replace(/\/api$/, '') : 'http://api.legalpadhai.ai';
const CHAT_API_URL = `${BASE_URL}/chat`;

class ChatService {
    private getHeaders() {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Send a query to the AI chat system
     */
    async sendMessage(query: string, conversationId?: string | null): Promise<SendMessageResponse> {
        let response;
        try {
            response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    query,
                    ...(conversationId ? { conversationId } : {})
                }),
            });
        } catch (err: any) {
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                throw new Error('Network error: Cannot reach chat service. Please check your internet or if the server is running.');
            }
            throw err;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error (${response.status}): Failed to get response from chat service`);
        }

        return await response.json();
    }

    /**
     * List all conversation sessions for the user
     */
    async getConversations(): Promise<Conversation[]> {
        const token = localStorage.getItem('accessToken');
        if (!token) return [];

        const response = await fetch(`${CHAT_API_URL}/conversations`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch conversations');
        }

        return await response.json();
    }

    /**
     * Get all messages for a specific conversation session
     */
    async getConversationHistory(conversationId: string): Promise<any[]> {
        const token = localStorage.getItem('accessToken');
        if (!token) return [];

        const response = await fetch(`${CHAT_API_URL}/history/${conversationId}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch conversation history');
        }

        return await response.json();
    }

    /**
     * Rename a conversation session
     */
    async renameConversation(id: string, title: string): Promise<Conversation> {
        const response = await fetch(`${CHAT_API_URL}/conversations/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to rename conversation');
        }

        return await response.json();
    }

    /**
     * Delete an entire conversation session
     */
    async deleteConversation(id: string): Promise<{ message: string }> {
        const response = await fetch(`${CHAT_API_URL}/conversations/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete conversation');
        }

        return await response.json();
    }

    /**
     * Delete an individual message
     */
    async deleteMessage(id: string): Promise<{ message: string }> {
        const response = await fetch(`${CHAT_API_URL}/message/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete message');
        }

        return await response.json();
    }
}

export default new ChatService();
