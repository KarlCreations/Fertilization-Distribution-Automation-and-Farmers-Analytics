import { Head, useForm, usePage } from '@inertiajs/react';
import { Bell, Eye, KeyRound, Leaf, Search, Settings, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const settingsGroups = [
    {
        title: 'Profile & account',
        description: 'Edit the name and email address used by your account.',
        icon: UserRound,
        action: 'Edit profile',
        destination: 'profile',
    },
    {
        title: 'Notifications',
        description: 'Review and mark operational updates as read.',
        icon: Bell,
        action: 'Open notifications',
        destination: 'notifications',
    },
    {
        title: 'Security & access',
        description: 'Change your password using your current credentials.',
        icon: KeyRound,
        action: 'Change password',
        destination: 'security',
    },
] as const;

type SettingsDialog = 'profile' | 'security' | null;

export default function EmployeeSettings() {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSetting, setActiveSetting] = useState<SettingsDialog>(null);
    const [savedNotice, setSavedNotice] = useState('');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const filteredSettingsGroups = settingsGroups.filter(({ title, description, action }) =>
        `${title} ${description} ${action}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

    const profileForm = useForm({ name: auth.user.name, email: auth.user.email });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function closeSetting(open: boolean) {
        if (open) {
            return;
        }

        setActiveSetting(null);
        profileForm.clearErrors();
        passwordForm.reset();
        passwordForm.clearErrors();
    }

    function openSetting(destination: SettingsDialog) {
        setSavedNotice('');
        setActiveSetting(destination);
    }

    function submitProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        profileForm.patch(route('employee-settings.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setActiveSetting(null);
                setSavedNotice('Your profile was updated.');
            },
        });
    }

    function submitPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setActiveSetting(null);
                setSavedNotice('Your password was changed.');
            },
        });
    }

    return (
        <>
            <Head title="My settings" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <WorkspaceMobileNavigation />
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
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search my settings"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <WorkspaceNotifications />
                        <WorkspaceHelpButton />
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
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475467]">
                                Manage your account, notifications, and security in focused dialogs.
                            </p>
                        </div>
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#c7d7fe] bg-[#eff4ff] p-4 text-sm text-[#344054]">
                            <Settings className="size-5 shrink-0 text-[#175cd3]" />
                            <span>Changes are saved to your account and use the same readable colors as your workspace dashboard.</span>
                        </div>
                        {savedNotice && (
                            <p
                                role="status"
                                className="mb-5 rounded-md border border-[#a6f4c5] bg-[#ecfdf3] px-4 py-3 text-sm font-medium text-[#05603a]"
                            >
                                {savedNotice}
                            </p>
                        )}
                        <div className="grid gap-5 md:grid-cols-2">
                            {filteredSettingsGroups.map(({ title, description, icon: Icon, action, destination }) => (
                                <section
                                    key={title}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Icon className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#475467]">{description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        {destination === 'notifications' ? (
                                            <button
                                                type="button"
                                                onClick={() => window.dispatchEvent(new Event('workspace-notifications-open'))}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-[#d0d5dd] px-3 text-left text-sm font-medium text-[#344054] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#175cd3]"
                                            >
                                                <span>{action}</span>
                                                <Eye className="size-4 text-[#667085]" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openSetting(destination)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-[#d0d5dd] px-3 text-left text-sm font-medium text-[#344054] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#175cd3]"
                                            >
                                                <span>{action}</span>
                                                <Eye className="size-4 text-[#667085]" />
                                            </button>
                                        )}
                                    </div>
                                </section>
                            ))}
                            {filteredSettingsGroups.length === 0 && (
                                <p className="rounded-lg border border-dashed border-[#d0d5dd] bg-white p-6 text-sm text-[#475467] md:col-span-2">
                                    No settings match “{searchQuery}”.
                                </p>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <Dialog open={activeSetting !== null} onOpenChange={closeSetting}>
                <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto border-[#d0d5dd] bg-white text-[#101828] shadow-2xl sm:max-w-lg">
                    {activeSetting === 'profile' && (
                        <>
                            <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[#eff4ff] text-[#175cd3]">
                                <UserRound className="size-5" />
                            </div>
                            <DialogTitle className="text-[#101828]">Profile & account</DialogTitle>
                            <DialogDescription className="text-[#475467]">Update the name and email address saved on your account.</DialogDescription>
                            <form onSubmit={submitProfile} className="grid gap-4">
                                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                    Full name
                                    <input
                                        required
                                        maxLength={255}
                                        autoComplete="name"
                                        value={profileForm.data.name}
                                        onChange={(event) => profileForm.setData('name', event.target.value)}
                                        className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    />
                                    {profileForm.errors.name && <span className="text-xs font-normal text-[#b42318]">{profileForm.errors.name}</span>}
                                </label>
                                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                    Email address
                                    <input
                                        required
                                        type="email"
                                        maxLength={255}
                                        autoComplete="email"
                                        value={profileForm.data.email}
                                        onChange={(event) => profileForm.setData('email', event.target.value)}
                                        className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    />
                                    {profileForm.errors.email && (
                                        <span className="text-xs font-normal text-[#b42318]">{profileForm.errors.email}</span>
                                    )}
                                </label>
                                <DialogFooter className="gap-2 border-t border-[#eaecf0] pt-4">
                                    <button
                                        type="button"
                                        onClick={() => closeSetting(false)}
                                        className="h-10 rounded-md border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="h-10 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white hover:bg-[#1849a9] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {profileForm.processing ? 'Saving…' : 'Save profile'}
                                    </button>
                                </DialogFooter>
                            </form>
                        </>
                    )}

                    {activeSetting === 'security' && (
                        <>
                            <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[#eff4ff] text-[#175cd3]">
                                <KeyRound className="size-5" />
                            </div>
                            <DialogTitle className="text-[#101828]">Security & access</DialogTitle>
                            <DialogDescription className="text-[#475467]">
                                Enter your current password, then choose and confirm a new password.
                            </DialogDescription>
                            <form onSubmit={submitPassword} className="grid gap-4">
                                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                    Current password
                                    <input
                                        required
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordForm.data.current_password}
                                        onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                                        className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    />
                                    {passwordForm.errors.current_password && (
                                        <span className="text-xs font-normal text-[#b42318]">{passwordForm.errors.current_password}</span>
                                    )}
                                </label>
                                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                    New password
                                    <input
                                        required
                                        minLength={8}
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordForm.data.password}
                                        onChange={(event) => passwordForm.setData('password', event.target.value)}
                                        className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    />
                                    {passwordForm.errors.password && (
                                        <span className="text-xs font-normal text-[#b42318]">{passwordForm.errors.password}</span>
                                    )}
                                </label>
                                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                    Confirm new password
                                    <input
                                        required
                                        minLength={8}
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                        className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm text-[#101828] outline-none focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                    />
                                </label>
                                <DialogFooter className="gap-2 border-t border-[#eaecf0] pt-4">
                                    <button
                                        type="button"
                                        onClick={() => closeSetting(false)}
                                        className="h-10 rounded-md border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="h-10 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white hover:bg-[#1849a9] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {passwordForm.processing ? 'Updating…' : 'Update password'}
                                    </button>
                                </DialogFooter>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
