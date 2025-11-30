"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useGetChatHistory, useSaveMessage } from "@/hooks/useChat";
import { calculateTime } from "@/lib/calculateTime";
import { socketClient } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/hooks/useChat";
import type { Message } from "@/types/chat.types";

interface ChatMessageProps {
    message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
    const isFromUser = message.role === 'user';

    return (
        <div
            className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} items-start`}
        >
            {/* Icons for Admin and AI messages (left side) */}
            {!isFromUser && (
                <div className="mr-2 shrink-0 mt-1">
                    {message.role === "ai" && <Bot size={20} className="text-blue-500" />}
                    {message.role === "admin" && (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    )}
                </div>
            )}

            {/* Message Bubble */}
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${isFromUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : message.role === "admin"
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 rounded-bl-none'
                        : 'bg-blue-50 text-blue-800 border border-blue-200 rounded-bl-none'
                    }`}
            >
                <p className="text-sm leading-relaxed">{message.message}</p>
                <p
                    className={`text-[10px] mt-1 text-right ${isFromUser
                        ? 'text-blue-100'
                        : message.role === "admin"
                            ? 'text-purple-400'
                            : 'text-blue-400'
                        }`}
                >
                    {message.createdAt ? calculateTime(message.createdAt) : '-'}
                </p>
            </div>

            {/* Icon for User messages (right side) */}
            {isFromUser && (
                <div className="ml-2 shrink-0 mt-1">
                    <User size={20} className="text-blue-600" />
                </div>
            )}
        </div>
    );
}

export default function ConversationPage() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : '';

    const [inputMessage, setInputMessage] = useState('');
    const [isUserTyping, setIsUserTyping] = useState(false);
    const { data: chatHistory, isLoading } = useGetChatHistory(id);
    const { mutate: saveMessage, isPending: isSending } = useSaveMessage();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // Listen for typing indicators
        const handleTyping = (data: { isTyping: boolean; role: string }) => {
            // Only show typing indicator for user, not for admin's own typing
            if (data.role === 'user') {
                setIsUserTyping(data.isTyping);
            }
        };

        socketClient.onNewMessage(handleNewMessage);
        socketClient.onTyping(handleTyping);

        // Cleanup
        return () => {
            socketClient.offNewMessage();
            socketClient.offTyping();
        };
    }, [id, queryClient]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !id) return;

        // Stop typing indicator when sending
        socketClient.emitTyping(id, false, 'admin');
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        saveMessage({
            conversationId: id,
            role: 'admin',
            message: inputMessage,
        });

        setInputMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputMessage(value);

        // Emit typing indicator
        if (value.trim()) {
            socketClient.emitTyping(id, true, 'admin');

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing indicator after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socketClient.emitTyping(id, false, 'admin');
            }, 2000);
        } else {
            socketClient.emitTyping(id, false, 'admin');
        }
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
                {/*   <div className="ml-auto flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="ai-mode" className="text-sm font-medium cursor-pointer">AI Agent</Label>
                    <Switch
                        id="ai-mode"
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                        className="scale-75"
                    />
                </div> */}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                {isLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : chatHistory && chatHistory.length > 0 ? (
                    chatHistory.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                ) : (
                    <div className="text-center text-gray-500">No messages yet</div>
                )}

                {/* Typing Indicator */}
                {isUserTyping && (
                    <div className="flex justify-end items-start">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-br-none px-4 py-2.5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">User is typing</span>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-2 shrink-0 mt-1">
                            <User size={20} className="text-blue-600" />
                        </div>
                    </div>
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
                        onChange={handleInputChange}
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
