import { Head, usePage } from '@inertiajs/react';
import { Bell, CircleHelp, Eye, KeyRound, Leaf, Menu, Search, Settings, SlidersHorizontal, UserRound } from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const settingsGroups = [
    {
        title: 'Profile & account',
        description: 'Manage your personal display information and account preferences.',
        icon: UserRound,
        items: ['Display name', 'Profile photo', 'Contact details'],
    },
    {
        title: 'Notifications',
        description: 'Choose which operational updates appear in your workspace.',
        icon: Bell,
        items: ['Task alerts', 'Approval notifications', 'Email summaries'],
    },
    {
        title: 'Workspace preferences',
        description: 'Set the default view and filters for your assigned work area.',
        icon: SlidersHorizontal,
        items: ['Default landing screen', 'Saved filters', 'Table density'],
    },
    {
        title: 'Security & access',
        description: 'Manage your password and personal sign-in protections.',
        icon: KeyRound,
        items: ['Change password', 'Sign-in alerts', 'Session preferences'],
    },
];

export default function EmployeeSettings() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    return (
        <>
            <Head title="My settings" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                            <Leaf className="size-4" />
                        </span>
                        <span className="font-semibold">{systemName}</span>
                    </div>
                    <label className="relative mx-auto hidden max-w-md flex-1 md:block">
                        <span className="sr-only">Search settings</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3]"
                            placeholder="Search my settings"
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="flex size-9 items-center justify-center rounded-md text-[#475467]"
                        >
                            <Bell className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] sm:flex"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-7">
                            <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                <span>Workspace</span>
                                <span>/</span>
                                <span className="text-[#175cd3]">My settings</span>
                            </div>
                            <h1 className="text-2xl font-semibold sm:text-3xl">My settings</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                Manage personal preferences for your assigned ERP workspace. Organization-wide settings are managed by authorized
                                administrators.
                            </p>
                        </div>
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#c7d7fe] bg-[#eff4ff] p-4 text-sm text-[#344054]">
                            <Settings className="size-5 shrink-0 text-[#175cd3]" />
                            <span>Your access is limited to personal workspace preferences and account security.</span>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            {settingsGroups.map(({ title, description, icon: Icon, items }) => (
                                <section
                                    key={title}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Icon className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold">{title}</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 space-y-2">
                                        {items.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-[#eaecf0] px-3 text-left text-sm text-[#475467] hover:bg-[#f9fafb]"
                                            >
                                                <span>{item}</span>
                                                <Eye className="size-4 text-[#98a2b3]" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
