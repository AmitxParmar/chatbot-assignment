"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";

export default function ConversationPage() {
    const params = useParams();
    const id = params?.id;
    const [aiEnabled, setAiEnabled] = useState(true);

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
                    <h2 className="font-semibold">User {id}</h2>
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
                {/* Dummy Message from User */}
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] border">
                        <p className="text-sm">Hello, I need help with my account settings.</p>
                        <span className="text-xs text-gray-400 mt-1 block">10:30 AM</span>
                    </div>
                </div>

                {/* Dummy Message from Admin */}
                <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
                        <p className="text-sm">Hi there! I'd be happy to help. What seems to be the issue?</p>
                        <span className="text-xs text-blue-100 mt-1 block">10:31 AM</span>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
