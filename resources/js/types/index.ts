import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    notifications: {
        unreadCount: number;
        items: {
            id: number;
            title: string;
            description: string;
            href: string;
            createdAt: string;
            isRead: boolean;
        }[];
    };
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    preferences?: {
        default_dashboard?: string;
    } | null;
    [key: string]: unknown; // This allows for additional properties...
}
