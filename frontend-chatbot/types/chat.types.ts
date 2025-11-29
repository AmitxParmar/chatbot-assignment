export type Role = 'user' | 'ai' | 'admin';

export interface Message {
    id: string;
    conversationId: string;
    role: Role;
    message: string;
    createdAt?: Date;
}

export interface Conversation {
    id: string;
    lastMessage?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    aiEnabled?: boolean;
    messages?: Message[];
}

export interface CreateConversationParams {
    lastMessage: string;
}

export interface SaveMessageParams {
    conversationId: string;
    role: Role;
    message: string;
}

