import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";

const app: Express = express();
const allowedClientUrls = [env.clientUrl, "http://localhost:3000"].filter(
    (url): url is string => url !== undefined
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    cors({
        origin: allowedClientUrls,
        credentials: true,
    })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

export default app;
