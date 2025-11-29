"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";
import { useGetChatHistory, useSaveMessage } from "@/hooks/useChat";
import { calculateTime } from "@/lib/calculateTime";
import { socketClient } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/hooks/useChat";
import type { Message } from "@/types/chat.types";

export default function ConversationPage() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : '';
    const [aiEnabled, setAiEnabled] = useState(true);
    const [inputMessage, setInputMessage] = useState('');
    const { data: chatHistory, isLoading } = useGetChatHistory(id);
    const { mutate: saveMessage, isPending: isSending } = useSaveMessage();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Socket integration
    useEffect(() => {
        if (!id) return;

        // Connect socket
        socketClient.connect();

        // Admin joins admin room and specific conversation
        socketClient.adminJoin();
        socketClient.adminJoinConversation(id);

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
            // Only update if message is for this conversation
            if (message.conversationId === id) {
                queryClient.setQueryData<Message[]>(
                    chatKeys.messages(id),
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
    }, [id, queryClient]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !id) return;

        saveMessage({
            conversationId: id,
            role: 'admin',
            message: inputMessage,
        });

        setInputMessage('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="font-semibold">Conversation {id}</h2>
                    <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="ai-mode" className="text-sm font-medium cursor-pointer">AI Agent</Label>
                    <Switch
                        id="ai-mode"
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                        className="scale-75"
                    />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                {isLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : chatHistory && chatHistory.length > 0 ? (
                    chatHistory.map((msg) => {
                        // Admin and AI messages go to the right, user messages to the left
                        const isFromAdmin = msg.role === 'admin' || msg.role === 'ai';

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-lg shadow-sm max-w-[80%] ${isFromAdmin
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white border rounded-tl-none'
                                        }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <span
                                        className={`text-xs mt-1 block ${isFromAdmin ? 'text-blue-100' : 'text-gray-400'
                                            }`}
                                    >
                                        {msg.createdAt ? calculateTime(msg.createdAt) : '-'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">No messages yet</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        className="flex-1"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isSending}
                    />
                    <Button size="icon" type="submit" disabled={isSending || !inputMessage.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
