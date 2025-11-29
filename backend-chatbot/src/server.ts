// CRITICAL: Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { env } from "./config/env";
import app from "./app";
import http from "http";
import { initializeSocket } from "./socket";

async function start() {
    // TODO: connect DB
    const PORT = env.port || 8000;
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
        console.log(`🔌 Socket.IO ready for connections`);
        console.log(`Environment:`, {
            port: env.port,
            clientUrl: env.clientUrl,
            dbUrl: env.dbUrl ? '***configured***' : 'not set'
        });
    });
}

start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
