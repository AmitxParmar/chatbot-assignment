// src/modules/chat/chat.gateway.ts

import { Server, Socket } from "socket.io";
import chatService from "./chat.service";

class ChatGateway {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initialize();
    }

    initialize() {
        this.io.on("connection", (socket: Socket) => {
            console.log("User connected:", socket.id);

            socket.on("join_session", ({ sessionId }) => {
                socket.join(sessionId);
                console.log(`Socket ${socket.id} joined session ${sessionId}`);
            });

            socket.on("user_message", async ({ conversationId, message }) => {
                const saved = await chatService.saveMessage({
                    conversationId,
                    role: "user",
                    message,
                });

                // Send message to admin room
                this.io.to("admin_room").emit("new_user_message", saved);
            });

            socket.on("admin_join", () => {
                socket.join("admin_room");
                console.log("Admin joined admin_room");
            });

            socket.on("admin_reply", async ({ conversationId, message }) => {
                const saved = await chatService.saveMessage({
                    conversationId,
                    role: "admin",
                    message,
                });

                // Send reply to only the chosen user room
                this.io.to(conversationId).emit("admin_reply", saved);
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected:", socket.id);
            });
        });
    }
}

export default ChatGateway;
