import { prisma } from "../lib/prisma";
import { Conversation, Message } from "../types/types";
import { emitNewMessage, emitTyping } from "../socket";
import aiService from "./ai.service";

/**
 * Service class for handling chat-related operations, including saving messages,
 * generating AI responses, and retrieving chat history and conversations.
 */
class ChatService {

    /**
     * Saves a new message to the database and emits a socket event.
     * If the message is from a user and AI is enabled for the conversation,
     * it triggers an asynchronous AI response generation.
     *
     * @param {Pick<Message, 'conversationId' | 'role' | 'message'>} messageData - The message data to save.
     * @param {string} messageData.conversationId - The ID of the conversation the message belongs to.
     * @param {'user' | 'ai'} messageData.role - The role of the sender (user or ai).
     * @param {string} messageData.message - The content of the message.
     * @returns {Promise<Message>} The saved message object.
     * @throws {Error} If there's an error saving the message.
     */
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
                this.generateAIResponse(conversationId, message).catch((error: any) => {
                    console.error("Error generating AI response:", error);
                });
            }

            return savedMessage;
        } catch (error) {
            console.error("Error saving message:", error);
            throw error;
        }
    }

    /**
     * Generates an AI response to a user message, saves it, and emits socket events.
     * This method handles the AI's typing indicator, response generation, and saving the AI's message.
     *
     * @private
     * @param {string} conversationId - The ID of the conversation.
     * @param {string} userMessage - The user's message to which the AI should respond.
     * @returns {Promise<void>}
     * @throws {Error} If there's an error during AI response generation or saving.
     */
    private async generateAIResponse(conversationId: string, userMessage: string) {
        try {
            // Check if AI should respond to this message
            if (!aiService.shouldRespond(userMessage)) {
                return;
            }

            // Emit typing indicator - AI is typing
            emitTyping(conversationId, { isTyping: true, role: 'ai' });

            // Get conversation history for context (optional)
            const history = await this.getChatHistory(conversationId);

            // Generate AI response
            const aiResponse = await aiService.generateResponse(userMessage, history);

            // Add a small delay to make it feel more natural (1-2 seconds)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));

            // Stop typing indicator
            emitTyping(conversationId, { isTyping: false, role: 'ai' });

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
            // Stop typing indicator on error
            emitTyping(conversationId, { isTyping: false, role: 'ai' });
            throw error;
        }
    }

    /**
     * Retrieves the chat history (all messages) for a given conversation.
     * Messages are ordered chronologically.
     *
     * @param {string} conversationId - The ID of the conversation.
     * @returns {Promise<Message[]>} An array of message objects for the specified conversation.
     * @throws {Error} If there's an error fetching the chat history.
     */
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

    /**
     * Retrieves all conversations, ordered by creation date in descending order.
     * This is typically used for administrative purposes.
     *
     * @returns {Promise<Conversation[]>} An array of all conversation objects.
     * @throws {Error} If there's an error fetching all conversations.
     */
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