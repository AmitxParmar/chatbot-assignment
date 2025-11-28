"use client";

import { useEffect } from "react";
import Link from "next/link";
import { socketClient } from "@/lib/socket";

const dummyChats = [
    { id: "1", user: "John", lastMessage: "I need help with my account!", timestamp: "10:31 AM" },
    { id: "2", user: "Emily", lastMessage: "Thank you!", timestamp: "9:45 AM" },
    { id: "3", user: "Michael", lastMessage: "Hello!", timestamp: "9:15 AM" },
    { id: "4", user: "Sarah", lastMessage: "Sure, I can help!", timestamp: "8:50 AM" },
];

export default function AdminPage() {
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
            // Optional: disconnect on unmount if desired, but usually for admin panel we might want to keep it open
            // socketClient.disconnect();
        };
    }, []);

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Chats</h2>
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-3 p-4 border-b bg-gray-50 font-medium text-sm text-gray-500">
                    <div>User</div>
                    <div>Last message</div>
                    <div className="text-right">Timestamp</div>
                </div>
                <div className="divide-y">
                    {dummyChats.map((chat) => (
                        <Link
                            key={chat.id}
                            href={`/admin/conversation/${chat.id}`}
                            className="grid grid-cols-3 p-4 hover:bg-gray-50 transition-colors items-center"
                        >
                            <div className="font-medium text-gray-900">{chat.user}</div>
                            <div className="text-gray-500 truncate">{chat.lastMessage}</div>
                            <div className="text-right text-sm text-gray-400">{chat.timestamp}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
