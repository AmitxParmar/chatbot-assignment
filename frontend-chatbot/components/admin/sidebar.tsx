"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Settings, Bot } from "lucide-react";


export function Sidebar() {
    const pathname = usePathname();

    const links = [
        {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            disabled: true,
        },
        {
            href: "/admin", // This maps to "Chats" as per requirement
            label: "Chats",
            icon: MessageSquare,
            active: pathname === "/admin" || pathname.startsWith("/admin/conversation"),
        },
        {
            href: "/admin/settings",
            label: "Settings",
            icon: Settings,
            disabled: true,
        },
    ];

    return (
        <div className="w-64 hidden md:flex border-r bg-white h-full flex-col">
            <div className="md:p-6 border-b">
                <h1 className="text-2xl font-bold">Admin</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.disabled ? "#" : link.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            link.active
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                            link.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                        )}
                    >
                        {/* <link.icon className="w-5 h-5" /> */}
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

        </div>
    );
}
