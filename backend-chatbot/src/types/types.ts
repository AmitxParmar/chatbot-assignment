export type Conversation = {
    id?: string;
    lastMessage?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    messages?: Message[];
};

export type Message = {
    id: string;
    conversationId: string;
    role: 'user' | 'ai' | 'admin';
    message: string;
    createdAt?: Date;
    conversation?: Conversation;
};