import dotenv from "dotenv"
dotenv.config()

export const env = {
    dbUrl: process.env.DB_URL,
    clientUrl: process.env.CLIENT_URL,
    port: process.env.PORT,
    geminiApiKey: process.env.GEMINI_API_KEY
}