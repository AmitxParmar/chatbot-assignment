import { Message } from '@/types/chat.types';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const chatService = {
    saveMessage: async (message: Omit<Message, "id">): Promise<Message> => {
        const response = await axios.post(`${API_BASE_URL}/api/chat/messages`, { ...message });
        return response.data;
    },

    getChatHistory: async (conversationId: string): Promise<Message[]> => {
        if (!conversationId) {
            console.log('No conversation ID provided');
            return [];
        }
        const response = await axios.get(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    getAllConversations: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/chat/conversations`);
        return response.data;
    },

    toggleAI: async (conversationId: string, aiEnabled: boolean) => {
        console.log('Service toggleAI called:', { conversationId, aiEnabled });
        const response = await axios.patch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/toggle-ai`, { aiEnabled });
        console.log('Service toggleAI response:', response.data);
        return response.data;
    },
};
