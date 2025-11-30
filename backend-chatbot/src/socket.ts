import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

/**
 * Initializes the Socket.IO server with the given HTTP server.
 * Configures CORS and sets up event listeners for connection, joining conversations,
 * admin actions, typing events, and disconnection.
 *
 * @param httpServer The HTTP server instance to attach Socket.IO to.
 * @returns The initialized Socket.IO Server instance.
 */
export const initializeSocket = (httpServer: http.Server): Server => {
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
 * Retrieves the initialized Socket.IO server instance.
 * Throws an error if the server has not been initialized yet.
 *
 * @returns The Socket.IO Server instance.
 * @throws {Error} If Socket.IO has not been initialized.
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return io;
};

/**
 * Emits a new message event to a specific conversation room and the 'admin_room'.
 *
 * @param conversationId The ID of the conversation to emit the message to.
 * @param message The message object to be sent.
 */
export const emitNewMessage = (conversationId: string, message: any): void => {
    if (!io) return;

    // Emit to the specific conversation room (for users in that conversation)
    io.to(conversationId).emit("new_message", message);

    // Also emit to admin room so admins can see all new messages
    io.to("admin_room").emit("new_message", message);

    console.log(`📨 Message emitted to conversation ${conversationId} and admin_room`);
};

/**
 * Emits a typing indicator event to a specific conversation room.
 *
 * @param conversationId The ID of the conversation to emit the typing status to.
 * @param data An object containing `isTyping` (boolean) and `role` (string) of the typist.
 */
export const emitTyping = (conversationId: string, data: { isTyping: boolean; role: string }): void => {
    if (!io) return;
    io.to(conversationId).emit("typing", data);
};

/**
 * Emits a conversation update event to a specific conversation room and the 'admin_room'.
 * This can be used for updates like AI enabled/disabled status.
 *
 * @param conversationId The ID of the conversation to emit the update to.
 * @param update The update object to be sent.
 */
export const emitConversationUpdate = (conversationId: string, update: any): void => {
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
