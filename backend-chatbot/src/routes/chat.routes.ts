import { Router } from "express";
import chatController from "../controllers/chat.controller";

const router: Router = Router();

// POST /api/chat/messages - Save a message to a conversation
router.post("/messages", chatController.saveMessage);

// GET /api/chat/conversations/:conversationId/messages - Get chat history
router.get("/conversations/:conversationId/messages", chatController.getChatHistory);

// GET /api/chat/conversations - Get all conversations (admin)
router.get("/conversations", chatController.getAllConversations);

export default router;
