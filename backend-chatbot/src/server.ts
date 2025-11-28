import { env } from "./config/env";
import app from "./app";
import http from "http";

async function start() {
    // TODO: connect DB

    const httpServer = http.createServer(app);

    httpServer.listen(env.port, () => {
        console.log(`Server listening on http://localhost:${env.port}`);
    });
}

start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
