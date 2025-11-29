"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socketClient } from "@/lib/socket";
import { Switch } from "@/components/ui/switch";
import { useGetConversations, chatKeys } from "@/hooks/useChat";
import { calculateTime } from "@/lib/calculateTime";
import { useAdmin } from "@/hooks/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat.types";



export default function AdminPage() {
    const router = useRouter();
    const { data } = useGetConversations();
    const { admin, isLoading: isLoadingAdmin } = useAdmin();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize socket connection
        socketClient.connect();

        // Admin joins admin room to receive all messages
        socketClient.adminJoin();

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
            // Invalidate conversations to update lastMessage
            queryClient.invalidateQueries({
                queryKey: chatKeys.conversations()
            });
        };

        socketClient.onNewMessage(handleNewMessage);

        return () => {
            socketClient.offNewMessage();
            // Optional: disconnect on unmount if desired
            // socketClient.disconnect();
        };
    }, [queryClient]);

    const handleToggle = (id: string, checked: boolean) => {

    };

    const handleRowClick = (id: string) => {
        router.push(`/admin/conversation/${id}`);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Chats</h2>
                {admin && (
                    <div className="text-sm text-gray-600">
                        Logged in as: <span className="font-semibold">{admin.name}</span>
                    </div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-[1fr_2fr_100px_100px] p-4 border-b bg-gray-50 font-medium text-sm text-gray-500">
                    <div>User</div>
                    <div>Last message</div>
                    <div className="text-center">AI Agent</div>
                    <div className="text-right">Timestamp</div>
                </div>
                <div className="divide-y">
                    {data && data.length > 0 ? (
                        data.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => handleRowClick(chat.id)}
                                className="grid grid-cols-[1fr_2fr_100px_100px] p-4 hover:bg-gray-50 transition-colors items-center cursor-pointer"
                            >
                                <div className="font-medium text-gray-900">{chat.id}</div>
                                <div className="text-gray-500 truncate pr-4">{chat.lastMessage}</div>
                                <div className="flex justify-center">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={chat.aiEnabled}
                                            onCheckedChange={(checked) => handleToggle(chat.id, checked)}
                                            className="scale-90"
                                        />
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-400">{chat?.createdAt ? calculateTime(chat.createdAt) : '-'}</div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No messages yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
