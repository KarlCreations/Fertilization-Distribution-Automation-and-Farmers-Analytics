import { Head, useForm, usePage } from '@inertiajs/react';
import { Bell, KeyRound, MonitorCog, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { type FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import WorkspaceHeader from '@/components/workspace-header';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type ProfileData = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string | null;
        avatar: string | null;
        created_at: string;
    };
    employee: {
        id: number;
        employee_code: string;
        department: string | null;
        position: string | null;
        is_active: boolean;
        zone_name: string | null;
        depot_name: string | null;
        depot_code: string | null;
    } | null;
};

function initials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

type NotificationPreferences = {
    leave_alerts: boolean;
    attendance_alerts: boolean;
    shift_alerts: boolean;
    employee_updates: boolean;
};

type SecurityDetails = {
    lastPasswordChange: string | null;
    lastLogin: string | null;
    accountStatus: string;
};

const notificationOptions: {
    key: keyof NotificationPreferences;
    title: string;
    description: string;
}[] = [
    {
        key: 'leave_alerts',
        title: 'Leave Request Notifications',
        description: 'Get notified when employees submit or update leave applications.',
    },
    {
        key: 'employee_updates',
        title: 'Employee Update Notifications',
        description: 'Get notified when employees are added or their details are updated.',
    },
    {
        key: 'attendance_alerts',
        title: 'Attendance Alerts',
        description: 'Get notified about late check-ins, unexcused absences, or overtime.',
    },
    {
        key: 'shift_alerts',
        title: 'Shift Schedule Notifications',
        description: 'Get notified when shifts are assigned, changed, or swapped.',
    },
];

export default function HrSettings({
    profile,
    notificationPreferences,
    security,
    routePrefix = 'hr',
}: {
    profile: ProfileData;
    notificationPreferences?: NotificationPreferences;
    security: SecurityDetails;
    routePrefix?: 'hr' | 'employee';
}) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const employee = profile.employee;
    const routeName = (suffix: string) => `${routePrefix === 'hr' ? 'hr-profile' : 'employee-settings'}${suffix}`;
    const notificationRoute = routePrefix === 'hr' ? 'hr.settings.notifications' : 'employee-settings.notifications';
    const avatar = profile.user.avatar ?? (auth.user.avatar as string | null) ?? null;

    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const { appearance, updateAppearance } = useAppearance();
    const [workspacePreferences, setWorkspacePreferences] = useState(() => ({
        density: typeof window === 'undefined' ? 'comfortable' : localStorage.getItem('workspace-density') || 'comfortable',
        refreshInterval: typeof window === 'undefined' ? 'manual' : localStorage.getItem('workspace-refresh-interval') || 'manual',
        landingPage: typeof window === 'undefined' ? 'dashboard' : localStorage.getItem('workspace-landing-page') || 'dashboard',
    }));
    const [preferencesSaved, setPreferencesSaved] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const {
        data: notifData,
        setData: setNotifData,
        post: postNotif,
        processing: notifProcessing,
    } = useForm({
        leave_alerts: Boolean(notificationPreferences?.leave_alerts ?? true),
        attendance_alerts: Boolean(notificationPreferences?.attendance_alerts ?? true),
        shift_alerts: Boolean(notificationPreferences?.shift_alerts ?? true),
        employee_updates: Boolean(notificationPreferences?.employee_updates ?? true),
    });

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        putPassword(route(routeName('.password')), {
            onSuccess: () => {
                resetPassword();
                setPasswordDialogOpen(false);
            },
        });
    };

    const submitNotificationPreferences: FormEventHandler = (e) => {
        e.preventDefault();
        postNotif(route(notificationRoute), {
            preserveScroll: true,
        });
    };

    const saveWorkspacePreferences = () => {
        localStorage.setItem('workspace-density', workspacePreferences.density);
        localStorage.setItem('workspace-refresh-interval', workspacePreferences.refreshInterval);
        localStorage.setItem('workspace-landing-page', workspacePreferences.landingPage);
        setPreferencesSaved(true);
    };

    useEffect(() => {
        if (!preferencesSaved) return;
        const timeout = window.setTimeout(() => setPreferencesSaved(false), 2500);
        return () => window.clearTimeout(timeout);
    }, [preferencesSaved]);

    return (
        <>
            <Head title={routePrefix === 'hr' ? 'My HR settings' : 'My settings'} />
            <div className="hr-interface min-h-screen bg-[#f6f8fb] text-[#101828]">
                <WorkspaceHeader />

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm font-medium text-[#067647]">
                                <ShieldCheck className="size-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#fecdca] bg-[#fff1f2] p-4 text-sm font-medium text-[#b42318]">
                                <X className="size-5 shrink-0" />
                                <span>{flash.error}</span>
                            </div>
                        )}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Operations</span>
                                    <span>/</span>
                                <span className="text-[#175cd3]">{routePrefix === 'hr' ? 'My HR settings' : 'My settings'}</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{routePrefix === 'hr' ? 'My HR settings' : 'My settings'}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Manage your personal account details, contact information, and sign-in security.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                            <aside className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex flex-col items-center text-center">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={profile.user.name}
                                            className="size-24 rounded-full object-cover ring-4 ring-[#eff4ff]"
                                        />
                                    ) : (
                                        <div className="flex size-24 items-center justify-center rounded-full bg-[#eff4ff] text-2xl font-semibold text-[#175cd3]">
                                            {initials(profile.user.name)}
                                        </div>
                                    )}
                                    <h2 className="mt-4 text-xl font-semibold text-[#101828]">{profile.user.name}</h2>
                                    <p className="mt-1 text-sm text-[#667085]">{profile.user.email}</p>
                                    <div className="mt-4 inline-flex items-center rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-medium text-[#067647]">
                                        {employee ? (employee.is_active ? 'Active employee' : 'Inactive employee') : 'No employee record'}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-lg border border-[#eaecf0] bg-[#f9fafb] p-4">
                                    <p className="text-xs font-semibold tracking-[0.08em] text-[#667085] uppercase">Account summary</p>
                                    <dl className="mt-3 space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Role</dt>
                                            <dd className="font-medium text-[#101828]">{profile.user.role ?? 'Employee'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Employee code</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.employee_code ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Department</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.department ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Position</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.position ?? 'Not assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Zone</dt>
                                            <dd className="font-medium text-[#101828]">{employee?.zone_name ?? 'No zone assigned'}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-[#667085]">Depot</dt>
                                            <dd className="font-medium text-[#101828]">
                                                {employee?.depot_name
                                                    ? `${employee.depot_name}${employee.depot_code ? ` (${employee.depot_code})` : ''}`
                                                    : 'No depot assigned'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </aside>

                            <div className="space-y-6">
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#f2f4f7] text-[#344054]">
                                            <KeyRound className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Password & security</h2>
                                            <p className="text-sm text-[#667085]">Update your password to keep your account secure.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPasswordDialogOpen(true)}
                                        className="flex w-full items-center justify-between rounded-lg border border-[#d0d5dd] bg-[#f9fafb] px-4 py-3 text-left transition hover:border-[#175cd3] hover:bg-[#eff4ff]"
                                    >
                                        <span>
                                            <span className="block text-sm font-semibold text-[#101828]">Update password</span>
                                            <span className="mt-1 block text-xs text-[#667085]">Open the secure password change form.</span>
                                        </span>
                                        <KeyRound className="size-4 text-[#175cd3]" />
                                    </button>
                                </section>

                                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Update password</DialogTitle>
                                            <DialogDescription>Enter your current password and choose a new password for this account.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={submitPassword} className="space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="current_password">Current password</Label>
                                                <Input
                                                    id="current_password"
                                                    type="password"
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                                <InputError message={passwordErrors.current_password} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password">New password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={passwordData.password}
                                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <InputError message={passwordErrors.password} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">Confirm new password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={passwordData.password_confirmation}
                                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <InputError message={passwordErrors.password_confirmation} />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={passwordProcessing}>
                                                    {passwordProcessing ? 'Updating...' : 'Update password'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <MonitorCog className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Workspace preferences</h2>
                                            <p className="text-sm text-[#667085]">Control how dashboards behave on this device.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="grid gap-2 text-sm font-medium text-[#344054]">
                                            Appearance
                                            <select
                                                value={appearance}
                                                onChange={(event) => updateAppearance(event.target.value as 'light' | 'dark' | 'system')}
                                                className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm outline-none focus:border-[#175cd3]"
                                            >
                                                <option value="system">Use device setting</option>
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                            </select>
                                        </label>
                                        <label className="grid gap-2 text-sm font-medium text-[#344054]">
                                            Dashboard density
                                            <select
                                                value={workspacePreferences.density}
                                                onChange={(event) => setWorkspacePreferences((current) => ({ ...current, density: event.target.value }))}
                                                className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm outline-none focus:border-[#175cd3]"
                                            >
                                                <option value="comfortable">Comfortable</option>
                                                <option value="compact">Compact</option>
                                            </select>
                                        </label>
                                        <label className="grid gap-2 text-sm font-medium text-[#344054]">
                                            Data refresh
                                            <select
                                                value={workspacePreferences.refreshInterval}
                                                onChange={(event) => setWorkspacePreferences((current) => ({ ...current, refreshInterval: event.target.value }))}
                                                className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm outline-none focus:border-[#175cd3]"
                                            >
                                                <option value="manual">Manual refresh</option>
                                                <option value="30">Every 30 seconds</option>
                                                <option value="60">Every minute</option>
                                                <option value="300">Every 5 minutes</option>
                                            </select>
                                        </label>
                                        <label className="grid gap-2 text-sm font-medium text-[#344054]">
                                            Default landing page
                                            <select
                                                value={workspacePreferences.landingPage}
                                                onChange={(event) => setWorkspacePreferences((current) => ({ ...current, landingPage: event.target.value }))}
                                                className="h-10 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm outline-none focus:border-[#175cd3]"
                                            >
                                                <option value="dashboard">Overview dashboard</option>
                                                <option value="hr-workforce">HR & workforce</option>
                                                <option value="inventory-warehouses">Inventory</option>
                                                <option value="sales-dashboard">Sales</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eaecf0] pt-4">
                                        <p className="flex items-center gap-2 text-xs text-[#667085]"><SlidersHorizontal className="size-4" /> Preferences are saved for this browser.</p>
                                        <Button type="button" onClick={saveWorkspacePreferences}>
                                            {preferencesSaved ? 'Saved' : 'Save preferences'}
                                        </Button>
                                    </div>
                                </section>

                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Bell className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Notification preferences</h2>
                                            <p className="text-sm text-[#667085]">Turn HR operational notifications and system alerts on or off.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={submitNotificationPreferences} className="space-y-3">
                                        {notificationOptions.map(({ key, title, description }) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between gap-4 rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-[#101828]">{title}</p>
                                                    <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
                                                </div>
                                                <label htmlFor={`notification-${key}`} className="flex shrink-0 cursor-pointer items-center gap-2">
                                                    <span className="sr-only">{title}</span>
                                                    <input
                                                        id={`notification-${key}`}
                                                        type="checkbox"
                                                        checked={notifData[key]}
                                                        onChange={(e) => setNotifData(key, e.target.checked)}
                                                        className="peer sr-only"
                                                    />
                                                    <span className="relative h-6 w-11 rounded-full bg-[#d0d5dd] transition-colors peer-checked:bg-[#175cd3] peer-focus-visible:ring-4 peer-focus-visible:ring-[#dbeafe] after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                                                    <span className="min-w-6 text-xs font-medium text-[#667085]">
                                                        {notifData[key] ? 'On' : 'Off'}
                                                    </span>
                                                </label>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-end pt-2">
                                            <Button type="submit" disabled={notifProcessing}>
                                                {notifProcessing ? 'Saving...' : 'Save notification preferences'}
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#f2f4f7] text-[#344054]">
                                            <ShieldCheck className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#101828]">Security</h2>
                                            <p className="text-sm text-[#667085]">Review recent account activity and status.</p>
                                        </div>
                                    </div>

                                    <dl className="divide-y divide-[#eaecf0]">
                                        <div className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                                            <dt className="text-sm text-[#667085]">Last Password Change</dt>
                                            <dd className="text-sm font-medium text-[#101828]">
                                                {security.lastPasswordChange
                                                    ? new Date(security.lastPasswordChange).toLocaleString()
                                                    : 'Not recorded'}
                                            </dd>
                                        </div>
                                        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <dt className="text-sm text-[#667085]">Last Login</dt>
                                            <dd className="text-sm font-medium text-[#101828]">
                                                {security.lastLogin ? new Date(security.lastLogin).toLocaleString() : 'Not recorded'}
                                            </dd>
                                        </div>
                                        <div className="flex flex-col gap-1 py-3 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                            <dt className="text-sm text-[#667085]">Account Status</dt>
                                            <dd>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        security.accountStatus === 'Active'
                                                            ? 'bg-[#ecfdf3] text-[#067647]'
                                                            : security.accountStatus === 'Inactive'
                                                              ? 'bg-[#fef3f2] text-[#b42318]'
                                                              : 'bg-[#f2f4f7] text-[#475467]'
                                                    }`}
                                                >
                                                    {security.accountStatus}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
