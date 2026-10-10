import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Leaf,
    MapPinned,
    Menu,
    Moon,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    Sun,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';
import { type SharedData } from '@/types';

type NotificationItem = {
    id: number;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'success' | 'info' | 'warning';
};

const defaultNotifications: NotificationItem[] = [
    {
        id: 1,
        title: 'Workforce Roster Updated',
        description: 'New employee accounts and field zone assignments logged.',
        time: '10 mins ago',
        read: false,
        type: 'info',
    },
    {
        id: 2,
        title: 'Shift Schedule Confirmed',
        description: 'Field inspection shift allocated for Delta Zone 1.',
        time: '1 hour ago',
        read: false,
        type: 'success',
    },
    {
        id: 3,
        title: 'Safety Audit Completed',
        description: 'HR compliance audit logged 100% safety readiness.',
        time: '3 hours ago',
        read: false,
        type: 'success',
    },
    {
        id: 4,
        title: 'Staffing Action Open',
        description: 'Field officer dispatch requested for Northern Depot.',
        time: 'Yesterday',
        read: true,
        type: 'warning',
    },
];

const navigationShortcuts = [
    { label: 'My HR dashboard', routeName: 'hr-dashboard', icon: UsersRound, category: 'Navigation' },
    { label: 'HR & workforce management', routeName: 'hr-workforce', icon: UsersRound, category: 'Navigation' },
    { label: 'My profile', routeName: 'hr-profile', icon: UserRound, category: 'Navigation' },
    { label: 'HR settings', routeName: 'hr-settings', icon: Settings, category: 'Navigation' },
];

export default function WorkspaceHeader() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Fertilization & Farmers Analytics';

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const toggleNotif = (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const filteredNavigation = navigationShortcuts.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const initials = auth.user.name
        ? auth.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'HR';

    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white dark:bg-gray-900 dark:border-gray-800 px-4 sm:px-6 shadow-sm">
            {/* Mobile menu toggle */}
            <button
                type="button"
                aria-label="Open navigation"
                className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] dark:border-gray-700 text-[#475467] dark:text-gray-300 lg:hidden hover:bg-[#f9fafb] dark:hover:bg-gray-800"
            >
                <Menu className="size-4" />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                    <Leaf className="size-4" />
                </span>
                <span className="font-semibold text-sm sm:text-base text-[#101828] dark:text-white">{systemName}</span>
            </div>

            {/* Global Search Bar with Live Results Dropdown */}
            <div ref={searchRef} className="relative mx-auto hidden max-w-md flex-1 md:block">
                <label className="relative block">
                    <span className="sr-only">Search workspace</span>
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                    <input
                        value={searchQuery}
                        onFocus={() => setIsSearchOpen(true)}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        className="h-9 w-full rounded-md border border-[#eaecf0] dark:border-gray-700 bg-[#f9fafb] dark:bg-gray-800 dark:text-white pr-8 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[#175cd3]/15 transition-all"
                        placeholder="Search workspace, employees, shifts, settings..."
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#98a2b3] hover:text-[#344054]"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </label>

                {/* Search Results Dropdown */}
                {isSearchOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full rounded-lg border border-[#eaecf0] dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-xl z-50">
                        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-[#98a2b3] uppercase">
                            Workspace Shortcuts & Pages
                        </div>
                        <div className="space-y-1">
                            {filteredNavigation.length === 0 ? (
                                <div className="px-3 py-3 text-xs text-[#667085] dark:text-gray-400 text-center">
                                    No pages found matching &quot;{searchQuery}&quot;
                                </div>
                            ) : (
                                filteredNavigation.map(({ label, routeName, icon: Icon }) => (
                                    <Link
                                        key={routeName}
                                        href={route(routeName)}
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-[#344054] dark:text-gray-200 hover:bg-[#eff4ff] dark:hover:bg-gray-800 hover:text-[#175cd3] transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex size-6 items-center justify-center rounded bg-[#f2f4f7] dark:bg-gray-800 text-[#475467] dark:text-gray-300">
                                                <Icon className="size-3.5" />
                                            </span>
                                            <span>{label}</span>
                                        </div>
                                        <ChevronRight className="size-3.5 text-[#98a2b3]" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Header Right Actions */}
            <div className="ml-auto flex items-center gap-2">
                {/* Dark Mode Toggle Button */}
                <button
                    type="button"
                    aria-label="Toggle dark mode"
                    onClick={toggleTheme}
                    title={appearance === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    className="flex size-9 items-center justify-center rounded-md border border-transparent text-[#475467] dark:text-gray-300 hover:bg-[#f2f4f7] dark:hover:bg-gray-800 transition-colors"
                >
                    {appearance === 'dark' ? (
                        <Sun className="size-4 text-amber-400" />
                    ) : (
                        <Moon className="size-4 text-[#475467]" />
                    )}
                </button>

                {/* Working Notifications Dropdown */}
                <div ref={notifRef} className="relative">
                    <button
                        type="button"
                        aria-label="Notifications"
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative flex size-9 items-center justify-center rounded-md border transition-colors ${
                            isNotifOpen
                                ? 'border-[#175cd3] bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400'
                                : 'border-transparent text-[#475467] dark:text-gray-300 hover:bg-[#f2f4f7] dark:hover:bg-gray-800'
                        }`}
                    >
                        <Bell className="size-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex size-2.5 items-center justify-center rounded-full bg-[#d92d20] ring-2 ring-white dark:ring-gray-900" />
                        )}
                    </button>

                    {/* Notifications Popover */}
                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[#eaecf0] dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[#eaecf0] dark:border-gray-700 bg-[#f9fafb] dark:bg-gray-800 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-semibold text-[#101828] dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="rounded-full bg-[#eff4ff] dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-[#175cd3] dark:text-blue-300">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllRead}
                                        className="text-[11px] font-semibold text-[#175cd3] dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <Check className="size-3" /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-[#f2f4f7] dark:divide-gray-800">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => toggleNotif(n.id)}
                                        className={`flex items-start gap-3 p-3 text-xs transition-colors cursor-pointer ${
                                            n.read
                                                ? 'bg-white dark:bg-gray-900 hover:bg-[#f9fafb] dark:hover:bg-gray-800/60'
                                                : 'bg-[#eff4ff]/40 dark:bg-gray-800/80 hover:bg-[#eff4ff]/70 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <span
                                            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                                                n.type === 'success'
                                                    ? 'bg-[#ecfdf3] dark:bg-emerald-950/80 text-[#067647] dark:text-emerald-400'
                                                    : n.type === 'warning'
                                                    ? 'bg-[#fffaeb] dark:bg-amber-950/80 text-[#b54708] dark:text-amber-400'
                                                    : 'bg-[#eff4ff] dark:bg-blue-950/80 text-[#175cd3] dark:text-blue-400'
                                            }`}
                                        >
                                            {n.type === 'success' ? (
                                                <CheckCircle2 className="size-3.5" />
                                            ) : n.type === 'warning' ? (
                                                <Activity className="size-3.5" />
                                            ) : (
                                                <ShieldCheck className="size-3.5" />
                                            )}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`font-semibold ${n.read ? 'text-[#344054] dark:text-gray-300' : 'text-[#101828] dark:text-white'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-[#98a2b3] dark:text-gray-400">{n.time}</span>
                                            </div>
                                            <p className="mt-0.5 leading-4 text-[#667085] dark:text-gray-400">{n.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[#eaecf0] dark:border-gray-700 bg-[#f9fafb] dark:bg-gray-800 p-2 text-center">
                                <Link
                                    href={route('hr-workforce')}
                                    onClick={() => setIsNotifOpen(false)}
                                    className="text-xs font-medium text-[#175cd3] dark:text-blue-400 hover:underline"
                                >
                                    View HR activity log &rarr;
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Button */}
                <button
                    type="button"
                    aria-label="Help"
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    className="hidden size-9 items-center justify-center rounded-md border border-transparent text-[#475467] dark:text-gray-300 hover:bg-[#f2f4f7] dark:hover:bg-gray-800 sm:flex"
                >
                    <CircleHelp className="size-4" />
                </button>

                {/* User Avatar */}
                <Link
                    href={route('hr-profile')}
                    className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-[#175cd3]/30 transition-all"
                    title="View My Profile"
                >
                    {auth.user.avatar ? (
                        <img
                            src={auth.user.avatar}
                            alt={auth.user.name}
                            className="size-8 rounded-full object-cover ring-2 ring-[#067647]"
                        />
                    ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                            {initials}
                        </div>
                    )}
                </Link>
            </div>
        </header>
    );
}

