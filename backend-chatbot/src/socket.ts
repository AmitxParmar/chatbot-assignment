import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer: http.Server) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

        // Handle user joining their conversation room
        socket.on("join_conversation", (conversationId: string) => {
            socket.join(conversationId);
            console.log(`🔗 Socket ${socket.id} joined conversation: ${conversationId}`);
        });

        // Handle admin joining the admin room
        socket.on("admin_join", () => {
            socket.join("admin_room");
            console.log(`👨‍💼 Admin ${socket.id} joined admin_room`);
        });

        // Handle admin joining a specific conversation
        socket.on("admin_join_conversation", (conversationId: string) => {
            socket.join(conversationId);
            console.log(`👨‍💼 Admin ${socket.id} joined conversation: ${conversationId}`);
        });

        // Handle typing events
        socket.on("typing", (data: { conversationId: string; isTyping: boolean; role: string }) => {
            const { conversationId, isTyping, role } = data;
            // Broadcast typing status to all clients in the conversation room except sender
            socket.to(conversationId).emit("typing", { isTyping, role });
            console.log(`⌨️  ${role} typing in ${conversationId}: ${isTyping}`);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    console.log("🚀 Socket.IO server initialized");
    return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return io;
};

/**
 * Emit a new message to the conversation room and admin room
 */
export const emitNewMessage = (conversationId: string, message: any) => {
    if (!io) return;

    // Emit to the specific conversation room (for users in that conversation)
    io.to(conversationId).emit("new_message", message);

    // Also emit to admin room so admins can see all new messages
    io.to("admin_room").emit("new_message", message);

    console.log(`📨 Message emitted to conversation ${conversationId} and admin_room`);
};

/**
 * Emit typing indicator
 */
export const emitTyping = (conversationId: string, data: { isTyping: boolean; role: string }) => {
    if (!io) return;
    io.to(conversationId).emit("typing", data);
};

/**
 * Emit conversation update (e.g., AI enabled/disabled)
 */
export const emitConversationUpdate = (conversationId: string, update: any) => {
    if (!io) return;
    io.to(conversationId).emit("conversation_update", update);
    io.to("admin_room").emit("conversation_update", update);
};

export default {
    initializeSocket,
    getIO,
    emitNewMessage,
    emitTyping,
    emitConversationUpdate,
};
