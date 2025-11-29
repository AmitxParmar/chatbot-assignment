import { Request, Response } from "express";
import chatService from "../services/chat.service";
import { prisma } from "../lib/prisma";
import { emitConversationUpdate } from "../socket";

class ChatController {

    // Save a message to a conversation
    async saveMessage(req: Request, res: Response) {
        try {
            const { conversationId, role, message } = req.body;

            if (!conversationId || !role || !message) {
                return res.status(400).json({
                    error: "conversationId, role, and message are required"
                });
            }

            if (!['user', 'ai', 'admin'].includes(role)) {
                return res.status(400).json({
                    error: "role must be 'user', 'ai', or 'admin'"
                });
            }

            const updatedMessage = await chatService.saveMessage({
                conversationId,
                role,
                message
            });

            return res.status(201).json(updatedMessage);
        } catch (error) {
            console.error("Error in saveMessage controller:", error);
            return res.status(500).json({
                error: "Failed to save message"
            });
        }
    }

    // Get chat history for a conversation
    async getChatHistory(req: Request, res: Response) {
        try {
            const { conversationId } = req.params;

            if (!conversationId) {
                return res.status(400).json({
                    error: "conversationId is required"
                });
            }

            const messages = await chatService.getChatHistory(conversationId);
            return res.status(200).json(messages);
        } catch (error) {
            console.error("Error in getChatHistory controller:", error);
            return res.status(500).json({
                error: "Failed to fetch chat history"
            });
        }
    }

    // Get all conversations (for admin)
    async getAllConversations(req: Request, res: Response) {
        try {
            const conversations = await chatService.getAllConversations();
            return res.status(200).json(conversations);
        } catch (error) {
            console.error("Error in getAllConversations controller:", error);
            return res.status(500).json({
                error: "Failed to fetch conversations"
            });
        }
    }

    // Toggle AI enabled status for a conversation
    async toggleAI(req: Request, res: Response) {
        try {
            const { conversationId } = req.params;
            const { aiEnabled } = req.body;

            if (!conversationId) {
                return res.status(400).json({
                    error: "conversationId is required"
                });
            }

            if (typeof aiEnabled !== 'boolean') {
                return res.status(400).json({
                    error: "aiEnabled must be a boolean"
                });
            }

            const updatedConversation = await prisma.conversation.update({
                where: { id: conversationId },
                data: { aiEnabled }
            });

            // Emit socket event to notify clients
            emitConversationUpdate(conversationId, {
                id: conversationId,
                aiEnabled: updatedConversation.aiEnabled
            });

            return res.status(200).json(updatedConversation);
        } catch (error) {
            console.error("Error in toggleAI controller:", error);
            return res.status(500).json({
                error: "Failed to toggle AI"
            });
        }
    }
}

export default new ChatController();
