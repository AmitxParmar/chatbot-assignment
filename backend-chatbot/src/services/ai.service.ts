import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

/**
 * AI Response Service using Google Gemini Flash
 */

class AIService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        // Initialize Gemini AI
        const apiKey = env.geminiApiKey;

        if (!apiKey) {
            console.warn("⚠️ GEMINI_API_KEY not found in environment variables. AI responses will be disabled.");
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            console.log("✅ Gemini AI initialized successfully");
        }
    }

    /**
     * Generate an AI response using Gemini Flash
     */
    async generateResponse(userMessage: string, conversationHistory?: any[]): Promise<string> {
        // Fallback if Gemini is not configured
        if (!this.model) {
            return "I'm currently unavailable. Please contact our support team for assistance.";
        }

        try {
            // Build context from conversation history
            let context = "You are a helpful customer support assistant. Be friendly, concise, and helpful.\n\n";

            if (conversationHistory && conversationHistory.length > 0) {
                context += "Previous conversation:\n";
                // Include last 5 messages for context
                const recentMessages = conversationHistory.slice(-5);
                recentMessages.forEach(msg => {
                    const roleLabel = msg.role === 'user' ? 'Customer' : 'Assistant';
                    context += `${roleLabel}: ${msg.message}\n`;
                });
                context += "\n";
            }

            context += `Customer: ${userMessage}\nAssistant:`;

            // Generate response using Gemini
            const result = await this.model.generateContent(context);
            const response = result.response;
            const text = response.text();
            console.log(text)
            return text.trim();
        } catch (error) {
            console.error("Error generating AI response with Gemini:", error);

            // Fallback response
            return "I apologize, but I'm having trouble processing your request right now. A human agent has been notified and will assist you shortly.";
        }
    }

    /**
     * Check if message requires AI response
     */
    shouldRespond(userMessage: string): boolean {
        // Don't respond to very short messages or just emojis
        if (userMessage.trim().length < 2) {
            return false;
        }

        // Add more logic as needed
        return true;
    }

    /**
     * Check if Gemini AI is available
     */
    isAvailable(): boolean {
        return this.model !== null;
    }
}

export default new AIService();
