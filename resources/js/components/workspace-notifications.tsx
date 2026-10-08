import { Link, router, usePage, usePoll } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type SharedData } from '@/types';

type NotificationItem = {
    id: number;
    title: string;
    description: string;
    href: string;
    createdAt: string;
    isRead: boolean;
};

export default function WorkspaceNotifications() {
    const { notifications } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const openNotifications = () => setIsOpen(true);
        window.addEventListener('workspace-notifications-open', openNotifications);

        return () => window.removeEventListener('workspace-notifications-open', openNotifications);
    }, []);

    usePoll(30_000, { only: ['notifications'] });

    function markRead(eventId: number) {
        router.post(route('notifications.read', { event: eventId }), {}, { preserveScroll: true });
    }

    return (
        <div className="relative">
            <button
                type="button"
                aria-label={`Notifications${notifications.unreadCount > 0 ? `, ${notifications.unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
                aria-controls="workspace-notifications-panel"
                onClick={() => setIsOpen((open) => !open)}
                className="relative flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
            >
                <Bell className="size-4" />
                {notifications.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#d92d20] px-1 text-[9px] font-semibold text-white">
                        {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <section
                    id="workspace-notifications-panel"
                    aria-label="Workspace notifications"
                    className="absolute top-12 right-0 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#eaecf0] bg-white text-[#101828] shadow-xl"
                >
                    <div className="flex items-center justify-between border-b border-[#eaecf0] px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold">Notifications</h2>
                            <p className="mt-0.5 text-xs text-[#667085]">{notifications.unreadCount} unread · live from your workspace</p>
                        </div>
                        <button
                            type="button"
                            disabled={notifications.unreadCount === 0}
                            onClick={() => router.post(route('notifications.read-all'), {}, { preserveScroll: true })}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#175cd3] hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:text-[#98a2b3]"
                        >
                            <CheckCheck className="size-3.5" />
                            Mark all read
                        </button>
                    </div>
                    <div className="max-h-[min(26rem,65vh)] divide-y divide-[#f2f4f7] overflow-y-auto">
                        {notifications.items.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <Check className="mx-auto size-5 text-[#12b76a]" />
                                <p className="mt-2 text-sm font-medium text-[#344054]">You’re all caught up</p>
                                <p className="mt-1 text-xs text-[#667085]">New activity for your workspace will appear here.</p>
                            </div>
                        ) : (
                            notifications.items.map((notification: NotificationItem) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 px-4 py-3 ${notification.isRead ? 'bg-white' : 'bg-[#f8faff]'}`}
                                >
                                    <span
                                        className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-[#175cd3]'}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={notification.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block rounded-sm focus:ring-2 focus:ring-[#175cd3] focus:outline-none"
                                        >
                                            <p className="text-sm font-medium text-[#344054]">{notification.title}</p>
                                            <p className="mt-1 text-xs text-[#667085]">{notification.description}</p>
                                            <time className="mt-1.5 block text-[11px] text-[#98a2b3]" dateTime={notification.createdAt}>
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </time>
                                        </Link>
                                        {!notification.isRead && (
                                            <button
                                                type="button"
                                                onClick={() => markRead(notification.id)}
                                                className="mt-1.5 text-[11px] font-medium text-[#175cd3] hover:underline"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
