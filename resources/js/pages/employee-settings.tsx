import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Camera,
    CircleHelp,
    Eye,
    ImagePlus,
    KeyRound,
    Leaf,
    Menu,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

interface FinancePreferences {
    quota_updates: boolean;
    contract_updates: boolean;
    audit_updates: boolean;
    [key: string]: boolean;
}

interface ProfileForm {
    name: string;
    email: string;
    [key: string]: string;
}

interface PasswordForm {
    current_password: string;
    password: string;
    password_confirmation: string;
    [key: string]: string;
}

interface ProfilePhotoForm {
    avatar: File | null;
    [key: string]: File | null;
}

function FinanceSettingsPage({ financePreferences }: { financePreferences: FinancePreferences }) {
    const { auth } = usePage<SharedData>().props;
    const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
    const choosePhotoRef = useRef<HTMLInputElement>(null);
    const takePhotoRef = useRef<HTMLInputElement>(null);
    const profileForm = useForm<ProfileForm>({ name: auth.user.name, email: auth.user.email });
    const passwordForm = useForm<PasswordForm>({ current_password: '', password: '', password_confirmation: '' });
    const notificationForm = useForm<FinancePreferences>(financePreferences);
    const profilePhotoForm = useForm<ProfilePhotoForm>({ avatar: null });
    const roleName = String(auth.user.role ?? 'finance').replaceAll('_', ' ');
    const profileInitials = auth.user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    const updateProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        profileForm.patch(route('profile.update'));
    };

    const updatePassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        passwordForm.put(route('password.update'), {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const updateNotifications = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        notificationForm.patch(route('finance-settings.update'));
    };

    const uploadProfilePhoto = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        profilePhotoForm.post(route('finance-settings.avatar'), {
            forceFormData: true,
            onSuccess: () => {
                profilePhotoForm.reset();
                if (choosePhotoRef.current) {
                    choosePhotoRef.current.value = '';
                }
                if (takePhotoRef.current) {
                    takePhotoRef.current.value = '';
                }
            },
        });
    };

    const notificationOptions: { key: keyof FinancePreferences; label: string; description: string }[] = [
        { key: 'quota_updates', label: 'Quota record updates', description: 'Changes to allocated or disbursed fertilizer quantities.' },
        { key: 'contract_updates', label: 'Trade contract updates', description: 'Changes to contract status and recorded values.' },
        { key: 'audit_updates', label: 'Finance audit activity', description: 'New finance actions recorded in the ERP audit trail.' },
    ];

    return (
        <>
            <Head title="Settings" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileNavigationOpen}
                        onClick={() => setMobileNavigationOpen((open) => !open)}
                        className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                            <Leaf className="size-4" />
                        </span>
                        <span className="font-semibold">{import.meta.env.VITE_APP_NAME || 'Your System Name'}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Settings help"
                            title="Manage your personal account details, password, and finance preferences."
                            className="flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <span
                            className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]"
                            aria-label={auth.user.name}
                        >
                            {profileInitials}
                        </span>
                    </div>
                </header>
                {mobileNavigationOpen && (
                    <div className="fixed inset-x-0 top-16 z-30 border-b border-[#eaecf0] bg-white p-4 shadow-lg lg:hidden">
                        <Link href={route('finance-dashboard')} className="block rounded-md px-3 py-2 text-sm text-[#475467]">
                            My finance dashboard
                        </Link>
                        <Link href={route('finance-impact')} className="block rounded-md px-3 py-2 text-sm text-[#475467]">
                            Financials
                        </Link>
                        <Link href={route('employee-settings')} className="block rounded-md px-3 py-2 text-sm text-[#175cd3]">
                            Settings
                        </Link>
                    </div>
                )}
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-7">
                            <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                <span>Finance workspace</span>
                                <span>/</span>
                                <span className="text-[#175cd3]">Settings</span>
                            </div>
                            <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                Update your account information, sign-in security, and finance workspace preferences.
                            </p>
                        </div>
                        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="h-fit rounded-lg border border-[#eaecf0] bg-white p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full bg-[#d1fadf] text-2xl font-semibold text-[#067647]">
                                    {auth.user.avatar ? (
                                        <img src={auth.user.avatar} alt={`${auth.user.name} profile`} className="size-full object-cover" />
                                    ) : (
                                        profileInitials
                                    )}
                                </div>
                                <p className="mt-4 text-lg font-semibold text-[#101828]">{auth.user.name}</p>
                                <p className="mt-1 text-sm break-all text-[#667085]">{auth.user.email}</p>
                                <form onSubmit={uploadProfilePhoto} className="mt-4 grid gap-2">
                                    <input
                                        ref={choosePhotoRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={(event) => profilePhotoForm.setData('avatar', event.target.files?.[0] ?? null)}
                                        aria-label="Choose profile picture"
                                    />
                                    <input
                                        ref={takePhotoRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        capture="user"
                                        className="sr-only"
                                        onChange={(event) => profilePhotoForm.setData('avatar', event.target.files?.[0] ?? null)}
                                        aria-label="Take profile picture"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => choosePhotoRef.current?.click()}
                                            className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#d0d5dd] px-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
                                        >
                                            <ImagePlus className="size-4" />
                                            Choose photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => takePhotoRef.current?.click()}
                                            className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#d0d5dd] px-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
                                        >
                                            <Camera className="size-4" />
                                            Take photo
                                        </button>
                                    </div>
                                    {profilePhotoForm.data.avatar && (
                                        <>
                                            <span className="truncate text-xs text-[#667085]">{profilePhotoForm.data.avatar.name}</span>
                                            <button
                                                type="submit"
                                                disabled={profilePhotoForm.processing}
                                                className="h-9 rounded-md bg-[#101828] px-3 text-xs font-semibold text-white disabled:opacity-50"
                                            >
                                                {profilePhotoForm.processing ? 'Uploading…' : 'Upload profile picture'}
                                            </button>
                                        </>
                                    )}
                                    {profilePhotoForm.errors.avatar && <InputError message={profilePhotoForm.errors.avatar} />}
                                    {profilePhotoForm.recentlySuccessful && (
                                        <span role="status" className="text-xs text-[#067647]">
                                            Profile picture updated.
                                        </span>
                                    )}
                                </form>
                                <span className="mt-3 inline-flex rounded-full bg-[#eff8ff] px-2.5 py-1 text-xs font-medium text-[#175cd3] capitalize">
                                    {roleName}
                                </span>
                                <div className="mt-6 border-t border-[#eaecf0] pt-5 text-left">
                                    <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">Account details</p>
                                    <dl className="mt-3 grid gap-3 text-sm">
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#667085]">Email status</dt>
                                            <dd className="font-medium text-[#344054]">
                                                {auth.user.email_verified_at ? 'Verified' : 'Not verified'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#667085]">Account created</dt>
                                            <dd className="text-right font-medium text-[#344054]">
                                                {new Date(auth.user.created_at).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </aside>
                            <div className="grid content-start gap-5">
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <UserRound className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold">Account information</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                                                Set the name and email address associated with your user account.
                                            </p>
                                        </div>
                                    </div>
                                    <form onSubmit={updateProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                            Full name
                                            <input
                                                required
                                                autoComplete="name"
                                                value={profileForm.data.name}
                                                onChange={(event) => profileForm.setData('name', event.target.value)}
                                                className="h-10 rounded-md border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#175cd3]"
                                            />
                                            <InputError message={profileForm.errors.name} />
                                        </label>
                                        <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                            Email address
                                            <input
                                                required
                                                type="email"
                                                autoComplete="email"
                                                value={profileForm.data.email}
                                                onChange={(event) => profileForm.setData('email', event.target.value)}
                                                className="h-10 rounded-md border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#175cd3]"
                                            />
                                            <InputError message={profileForm.errors.email} />
                                        </label>
                                        <div className="flex items-center gap-3 sm:col-span-2">
                                            <button
                                                type="submit"
                                                disabled={profileForm.processing}
                                                className="h-9 rounded-md bg-[#101828] px-4 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                {profileForm.processing ? 'Saving…' : 'Save account details'}
                                            </button>
                                            {profileForm.recentlySuccessful && (
                                                <span role="status" className="text-sm text-[#067647]">
                                                    Saved
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <KeyRound className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold">Password and sign-in security</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">Change your password using your current password.</p>
                                        </div>
                                    </div>
                                    <form onSubmit={updatePassword} className="mt-5 grid gap-4 sm:grid-cols-3">
                                        {(
                                            [
                                                ['current_password', 'Current password', 'current-password'],
                                                ['password', 'New password', 'new-password'],
                                                ['password_confirmation', 'Confirm new password', 'new-password'],
                                            ] as const
                                        ).map(([field, label, autoComplete]) => (
                                            <label key={field} className="grid gap-1.5 text-sm font-medium text-[#344054]">
                                                {label}
                                                <input
                                                    required
                                                    type="password"
                                                    autoComplete={autoComplete}
                                                    value={passwordForm.data[field]}
                                                    onChange={(event) => passwordForm.setData(field, event.target.value)}
                                                    className="h-10 rounded-md border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#175cd3]"
                                                />
                                                <InputError message={passwordForm.errors[field]} />
                                            </label>
                                        ))}
                                        <div className="flex items-center gap-3 sm:col-span-3">
                                            <button
                                                type="submit"
                                                disabled={passwordForm.processing}
                                                className="h-9 rounded-md border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#344054] disabled:opacity-50"
                                            >
                                                {passwordForm.processing ? 'Updating…' : 'Update password'}
                                            </button>
                                            {passwordForm.recentlySuccessful && (
                                                <span role="status" className="text-sm text-[#067647]">
                                                    Password updated
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Bell className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold">Finance record preferences</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                                                Choose which finance record updates are highlighted in your workspace.
                                            </p>
                                        </div>
                                    </div>
                                    <form onSubmit={updateNotifications} className="mt-4">
                                        <div className="divide-y divide-[#eaecf0]">
                                            {notificationOptions.map(({ key, label, description }) => (
                                                <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4">
                                                    <span>
                                                        <span className="block text-sm font-medium text-[#344054]">{label}</span>
                                                        <span className="mt-1 block text-xs leading-5 text-[#667085]">{description}</span>
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationForm.data[key]}
                                                        onChange={(event) => notificationForm.setData(key, event.target.checked)}
                                                        className="size-4 shrink-0 accent-[#175cd3]"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={notificationForm.processing}
                                                className="h-9 rounded-md bg-[#101828] px-4 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                {notificationForm.processing ? 'Saving…' : 'Save preferences'}
                                            </button>
                                            {notificationForm.recentlySuccessful && (
                                                <span role="status" className="text-sm text-[#067647]">
                                                    Preferences saved
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#ecfdf3] text-[#067647]">
                                            <ShieldCheck className="size-4" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-semibold">Account status</h2>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">Verification status recorded for your account.</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-[#475467]">
                                        Your email {auth.user.email_verified_at ? 'is verified.' : 'has not been verified.'} Role-based access is
                                        managed by your administrator.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

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

export default function EmployeeSettings({ financePreferences }: { financePreferences?: FinancePreferences }) {
    const { auth } = usePage<SharedData>().props;

    if (['finance', 'finance_staff'].includes(String(auth.user.role)) && financePreferences) {
        return <FinanceSettingsPage financePreferences={financePreferences} />;
    }

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
