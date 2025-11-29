import { io, Socket } from "socket.io-client";

class SocketClient {
    private static instance: SocketClient;
    public socket: Socket | null = null;

    private constructor() {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

        this.socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5
        });

        // Log connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔴 Socket connection error:', error);
        });
    }

    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect() {
        if (this.socket && !this.socket.connected) {
            this.socket.connect();
        }
    }

    public disconnect() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }
    }

    // Join a conversation room
    public joinConversation(conversationId: string) {
        if (this.socket) {
            this.socket.emit('join_conversation', conversationId);
            console.log(`🔗 Joined conversation: ${conversationId}`);
        }
    }

    // Admin joins the admin room
    public adminJoin() {
        if (this.socket) {
            this.socket.emit('admin_join');
            console.log('👨‍💼 Joined admin room');
        }
    }

    // Admin joins a specific conversation
    public adminJoinConversation(conversationId: string) {
        if (this.socket) {
            this.socket.emit('admin_join_conversation', conversationId);
            console.log(`👨‍💼 Admin joined conversation: ${conversationId}`);
        }
    }

    // Listen for new messages
    public onNewMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    // Stop listening for new messages
    public offNewMessage() {
        if (this.socket) {
            this.socket.off('new_message');
        }
    }

    // Listen for typing indicators
    public onTyping(callback: (data: { isTyping: boolean; role: string }) => void) {
        if (this.socket) {
            this.socket.on('typing', callback);
        }
    }

    // Stop listening for typing
    public offTyping() {
        if (this.socket) {
            this.socket.off('typing');
        }
    }

    // Listen for conversation updates
    public onConversationUpdate(callback: (update: any) => void) {
        if (this.socket) {
            this.socket.on('conversation_update', callback);
        }
    }

    // Stop listening for conversation updates
    public offConversationUpdate() {
        if (this.socket) {
            this.socket.off('conversation_update');
        }
    }
}

export const socketClient = SocketClient.getInstance();

