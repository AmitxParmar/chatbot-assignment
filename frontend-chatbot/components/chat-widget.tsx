"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [sessionId, setSessionId] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session ID
    useEffect(() => {
        let storedSessionId = localStorage.getItem("chat_session_id");
        if (!storedSessionId) {
            storedSessionId = "sess_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("chat_session_id", storedSessionId);
        }
        setSessionId(storedSessionId);

        // Add initial welcome message
        setMessages([
            {
                id: "welcome",
                text: "Hello! How can I help you today?",
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        // Simulate bot response (placeholder)
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I received your message: " + inputText,
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">AI Assistant</h3>
                                <p className="text-xs text-blue-100">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.sender === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p
                                        className={`text-[10px] mt-1 text-right ${msg.sender === "user" ? "text-blue-100" : "text-gray-400"
                                            }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
                        >
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">
                                Session ID: {sessionId}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
                        ? "bg-gray-200 text-gray-600 rotate-90"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30"
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
