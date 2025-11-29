import { prisma } from "../lib/prisma";
import { Conversation, Message } from "../types/types";
import { emitNewMessage } from "../socket";

class ChatService {


    // save message
    async saveMessage({ conversationId, role, message }: Pick<Message, 'conversationId' | 'role' | 'message'>) {
        try {
            // Ensure the conversation exists and update its lastMessage
            await prisma.conversation.upsert({
                where: { id: conversationId },
                update: { lastMessage: message },
                create: { id: conversationId, lastMessage: message },
            });

            const savedMessage = await prisma.message.create({
                data: {
                    conversationId,
                    role,
                    message
                }
            });

            // Emit socket event after successfully saving to database
            emitNewMessage(conversationId, savedMessage);

            return savedMessage;
        } catch (error) {
            console.error("Error saving message:", error);
            throw error;
        }
    }

    // get all the messages
    async getChatHistory(conversationId: string) {
        try {
            return await prisma.message.findMany({
                where: {
                    conversationId,
                },
                orderBy: {
                    createdAt: 'asc', // Assuming messages should be ordered chronologically
                },
            });
        } catch (error) {
            console.error("Error fetching chat history:", error);
            throw error;
        }
    }

    // get all the converstions for addmin
    async getAllConversations() {
        try {
            return await prisma.conversation.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            });
        } catch (error) {
            console.error("Error fetching all conversations:", error);
            throw error;
        }
    }
}


export default new ChatService();