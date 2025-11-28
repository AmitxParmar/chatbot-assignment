"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socketClient } from "@/lib/socket";
import { Switch } from "@/components/ui/switch";

const dummyChats = [
    { id: "1", user: "John", lastMessage: "I need help with my account!", timestamp: "10:31 AM", aiEnabled: true },
    { id: "2", user: "Emily", lastMessage: "Thank you!", timestamp: "9:45 AM", aiEnabled: false },
    { id: "3", user: "Michael", lastMessage: "Hello!", timestamp: "9:15 AM", aiEnabled: true },
    { id: "4", user: "Sarah", lastMessage: "Sure, I can help!", timestamp: "8:50 AM", aiEnabled: true },
];

export default function AdminPage() {
    const router = useRouter();
    // Local state to manage toggles for the list view
    const [chats, setChats] = useState(dummyChats);

    useEffect(() => {
        // Hardcode admin details and save to localStorage
        const adminDetails = {
            id: "admin-1",
            name: "Admin User",
            role: "admin",
        };
        localStorage.setItem("adminUser", JSON.stringify(adminDetails));

        // Initialize socket connection
        socketClient.connect();

        return () => {
            // Optional: disconnect on unmount if desired
        };
    }, []);

    const handleToggle = (id: string, checked: boolean) => {
        setChats(chats.map(chat =>
            chat.id === id ? { ...chat, aiEnabled: checked } : chat
        ));
    };

    const handleRowClick = (id: string) => {
        router.push(`/admin/conversation/${id}`);
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Chats</h2>
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-[1fr_2fr_100px_100px] p-4 border-b bg-gray-50 font-medium text-sm text-gray-500">
                    <div>User</div>
                    <div>Last message</div>
                    <div className="text-center">AI Agent</div>
                    <div className="text-right">Timestamp</div>
                </div>
                <div className="divide-y">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleRowClick(chat.id)}
                            className="grid grid-cols-[1fr_2fr_100px_100px] p-4 hover:bg-gray-50 transition-colors items-center cursor-pointer"
                        >
                            <div className="font-medium text-gray-900">{chat.user}</div>
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
                            <div className="text-right text-sm text-gray-400">{chat.timestamp}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
