import { prisma } from "../lib/prisma";
import { Conversation, Message } from "../types/types";
import { emitNewMessage } from "../socket";
import aiService from "./ai.service";

class ChatService {

    // save message
    async saveMessage({ conversationId, role, message }: Pick<Message, 'conversationId' | 'role' | 'message'>) {
        try {
            // Ensure the conversation exists and update its lastMessage
            const conversation = await prisma.conversation.upsert({
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

            // Check if AI should respond (only for user messages when AI is enabled)
            if (role === 'user' && conversation.aiEnabled) {
                // Generate and send AI response asynchronously
                this.generateAIResponse(conversationId, message).catch(error => {
                    console.error("Error generating AI response:", error);
                });
            }

            return savedMessage;
        } catch (error) {
            console.error("Error saving message:", error);
            throw error;
        }
    }

    // Generate AI response
    private async generateAIResponse(conversationId: string, userMessage: string) {
        try {
            // Check if AI should respond to this message
            if (!aiService.shouldRespond(userMessage)) {
                return;
            }

            // Get conversation history for context (optional)
            const history = await this.getChatHistory(conversationId);

            // Generate AI response
            const aiResponse = await aiService.generateResponse(userMessage, history);

            // Add a small delay to make it feel more natural (1-2 seconds)
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            // Save AI response
            const aiMessage = await prisma.message.create({
                data: {
                    conversationId,
                    role: 'ai',
                    message: aiResponse
                }
            });

            // Update conversation's lastMessage
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { lastMessage: aiResponse }
            });

            // Emit socket event for AI response
            emitNewMessage(conversationId, aiMessage);

            console.log(`🤖 AI responded to conversation ${conversationId}`);
        } catch (error) {
            console.error("Error in generateAIResponse:", error);
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