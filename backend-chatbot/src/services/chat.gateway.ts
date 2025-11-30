// src/modules/chat/chat.gateway.ts

import { Server, Socket } from "socket.io";
import chatService from "./chat.service";

/**
 * Handles real-time communication for chat functionalities using Socket.IO.
 * Manages user connections, message sending, and admin interactions.
 */
class ChatGateway {
    private io: Server;

    /**
     * Creates an instance of ChatGateway.
     * @param io The Socket.IO server instance.
     */
    constructor(io: Server) {
        this.io = io;
        this.initialize();
    }

    /**
     * Initializes the Socket.IO event listeners for various chat actions.
     */
    initialize() {
        this.io.on("connection", (socket: Socket) => {
            console.log("User connected:", socket.id);

            /**
             * Handles a user joining a specific chat session.
             * @param data An object containing the `sessionId` to join.
             */
            socket.on("join_session", ({ sessionId }: { sessionId: string }) => {
                socket.join(sessionId);
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
            });

            /**
             * Handles a user sending a message. Saves the message and emits it to the admin room.
             * @param data An object containing the `conversationId` and the `message` content.
             */
            socket.on("user_message", async ({ conversationId, message }: { conversationId: string, message: string }) => {
                const saved = await chatService.saveMessage({
                    conversationId,
                    role: "user",
                    message,
                });

                // Send message to admin room
                this.io.to("admin_room").emit("new_user_message", saved);
            });

            /**
             * Handles an admin joining the dedicated admin room.
             */
            socket.on("admin_join", () => {
                socket.join("admin_room");
                console.log("Admin joined admin_room");
            });

            /**
             * Handles an admin sending a reply to a specific conversation.
             * Saves the reply and emits it to the user's conversation room.
             * @param data An object containing the `conversationId` and the `message` content.
             */
            socket.on("admin_reply", async ({ conversationId, message }: { conversationId: string, message: string }) => {
                const saved = await chatService.saveMessage({
                    conversationId,
                    role: "admin",
                    message,
                });

                // Send reply to only the chosen user room
                this.io.to(conversationId).emit("admin_reply", saved);
            });

            /**
             * Handles a socket disconnection event.
             */
            socket.on("disconnect", () => {
                console.log("Socket disconnected:", socket.id);
            });
        });
    }
}

export default ChatGateway;
