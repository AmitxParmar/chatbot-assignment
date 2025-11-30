/**
 * @file This file initializes and configures the Express application.
 * It sets up middleware, serves static files, and defines API routes.
 */
import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import chatRoutes from "./routes/chat.routes";

/**
 * Initializes the Express application.
 * @type {Express}
 */
const app: Express = express();

/**
 * Defines the allowed client URLs for CORS.
 * Includes the client URL from environment variables and a common localhost development URL.
 */
const allowedClientUrls = [env.clientUrl, "http://localhost:3000"].filter(
    (url): url is string => url !== undefined
);

/**
 * Middleware to parse incoming requests with JSON payloads.
 */
app.use(express.json());

/**
 * Middleware to parse incoming requests with URL-encoded payloads.
 * The `extended: false` option means that the URL-encoded data will be parsed with the `querystring` library.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Configures CORS (Cross-Origin Resource Sharing) for the application.
 * Allows requests from the `allowedClientUrls` and enables sending credentials (e.g., cookies).
 */
app.use(
    cors({
        origin: allowedClientUrls,
        credentials: true,
    })
);

/**
 * Serves static files from the 'public' directory.
 * This can be used for serving frontend assets if the frontend is hosted by this server.
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * Mounts API routes under the `/api/chat` path.
 * All chat-related endpoints will be handled by `chatRoutes`.
 */
app.use("/api/chat", chatRoutes);

export default app;
