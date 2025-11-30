import { Router } from "express";
import chatController from "../controllers/chat.controller";

const router: Router = Router();

// POST /api/chat/messages - Save a message to a conversation
router.post("/messages", chatController.saveMessage);

// GET /api/chat/conversations/:conversationId/messages - Get chat history
router.get("/conversations/:conversationId/messages", chatController.getChatHistory);

// GET /api/chat/conversations - Get all conversations (admin)
router.get("/conversations", chatController.getAllConversations);

// PATCH /api/chat/conversations/:conversationId/toggle-ai - Toggle AI enabled status
router.patch("/conversations/:conversationId/toggle-ai", chatController.toggleAI);

export default router;
