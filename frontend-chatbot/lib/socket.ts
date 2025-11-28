import { io, Socket } from "socket.io-client";

class SocketClient {
    private static instance: SocketClient;
    public socket: Socket | null = null;

    private constructor() {
        // Initialize socket only if it doesn't exist
        // We'll connect to the same host by default, or a specific URL if provided
        // For now, we'll assume the socket server is on the same origin or configured via env
        // You might want to change the URL to your backend URL
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

        this.socket = io(SOCKET_URL, {
            autoConnect: false, // We'll connect manually when needed
            reconnection: true,
            reconnectionAttempts: 5,      // Maximum number of attempts (default: Infinity)
            reconnectionDelay: 1000,      // Initial delay between attempts in ms (default: 1000)
            reconnectionDelayMax: 5000,   // Maximum delay between attempts in ms (default: 5000)
            randomizationFactor: 0.5
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
}

export const socketClient = SocketClient.getInstance();
