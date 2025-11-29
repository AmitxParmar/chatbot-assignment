"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";
import { useGetChatHistory, useSaveMessage, chatKeys } from "@/hooks/useChat";
import { calculateTime } from "@/lib/calculateTime";
import { socketClient } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat.types";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [sessionId, setSessionId] = useState("");
    const { data: messages } = useGetChatHistory(sessionId);
    const { mutate: saveMessage, isPending: isSending } = useSaveMessage();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Initialize session ID
    useEffect(() => {
        let storedSessionId = localStorage.getItem("chat_session_id");
        if (!storedSessionId) {
            storedSessionId = "sess_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("chat_session_id", storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    // Socket integration
    useEffect(() => {
        if (!sessionId) return;

        // Connect socket
        socketClient.connect();

        // User joins their conversation room
        socketClient.joinConversation(sessionId);

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
            // Only update if message is for this conversation
            if (message.conversationId === sessionId) {
                queryClient.setQueryData<Message[]>(
                    chatKeys.messages(sessionId),
                    (old = []) => {
                        // Avoid duplicates
                        const exists = old.some(m => m.id === message.id);
                        if (exists) return old;
                        return [...old, message];
                    }
                );
            }
        };

        socketClient.onNewMessage(handleNewMessage);

        // Cleanup
        return () => {
            socketClient.offNewMessage();
        };
    }, [sessionId, queryClient]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputText.trim()) return;
        saveMessage({
            conversationId: sessionId,
            role: "user",
            message: inputText,
        });
        setInputText("");
    };




    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">

                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg?.role === "user" ? "justify-end" : "justify-start"
                                    } items-start`}
                            >
                                {(msg.role === "ai" || msg.role === "admin") && (
                                    <div className="mr-2 shrink-0 mt-1">
                                        {msg.role === "ai" && <Bot size={20} className="text-gray-500" />}
                                        {msg.role === "admin" && (
                                            // Placeholder for Admin Icon (e.g., <ShieldCheck size={20} className="text-purple-600" />)
                                            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">A</div>
                                        )}
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${msg?.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : msg?.role === "admin"
                                            ? "bg-purple-100 text-purple-800 border border-purple-200 rounded-bl-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                    <p
                                        className={`text-[10px] mt-1 text-right ${msg?.role === "user"
                                            ? "text-blue-100"
                                            : msg?.role === "admin"
                                                ? "text-purple-400"
                                                : "text-gray-400"
                                            }`}
                                    >
                                        {msg?.createdAt ? calculateTime(msg.createdAt) : '-'}
                                    </p>
                                </div>
                                {msg.role === "user" && (
                                    <div className="ml-2 shrink-0 mt-1">
                                        <User size={20} className="text-blue-600" />
                                    </div>
                                )}
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
