
import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEventHandler, useRef } from 'react';
import {
    Bell,
    CheckCircle2,
    CircleHelp,
    KeyRound,
    Leaf,
    LockKeyhole,
    Mail,
    Menu,
    Search,
    Settings,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

export default function EmployeeSettings() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Farm ERP';

    const profile = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const saveProfile: FormEventHandler = (event) => {
        event.preventDefault();
        profile.patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const savePassword: FormEventHandler = (event) => {
        event.preventDefault();

        password.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => password.reset(),
            onError: (errors) => {
                if (errors.password) {
                    password.reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    password.reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const settingsLinks = [
        { label: 'Profile & account', href: '#profile', icon: UserRound },
        { label: 'Security & password', href: '#security', icon: KeyRound },
        { label: 'Notifications', href: '#notifications', icon: Bell },
        { label: 'Workspace preferences', href: '#preferences', icon: SlidersHorizontal },
    ];

    return (
        <>
            <Head title="My settings" />

            <div className="min-h-screen bg-[#f5f8f6] text-[#172b23]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e1eae4] bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        aria-label="Navigation"
                        className="flex size-9 items-center justify-center rounded-lg border border-[#dce7df] text-[#176b45] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-[#176b45] text-white">
                            <Leaf className="size-5" />
                        </span>
                        <span className="font-semibold tracking-tight">{systemName}</span>
                    </div>

                    <label className="relative mx-auto hidden max-w-md flex-1 md:block">
                        <span className="sr-only">Search settings</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#82948a]" />
                        <input
                            className="h-10 w-full rounded-lg border border-[#e1eae4] bg-[#f8faf8] pr-3 pl-9 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                            placeholder="Search settings..."
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    const query = event.currentTarget.value.toLowerCase();
                                    const target = settingsLinks.find((item) =>
                                        item.label.toLowerCase().includes(query),
                                    );
                                    if (target) window.location.hash = target.href;
                                }
                            }}
                        />
                    </label>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-[#66796e] sm:block">
                            {auth.user.name}
                        </span>
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#dcefe2] text-sm font-semibold text-[#176b45]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />

                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-7">
                            <div className="mb-2 flex gap-2 text-xs font-medium text-[#718278]">
                                <span>Workspace</span>
                                <span>/</span>
                                <span className="text-[#176b45]">My settings</span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                My settings
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66796e]">
                                Manage your account, password, and personal workspace preferences.
                            </p>
                        </div>

                        <div className="mb-7 flex items-start gap-3 rounded-xl border border-[#c8e3d1] bg-[#edf7f0] p-4">
                            <Settings className="mt-0.5 size-5 shrink-0 text-[#176b45]" />
                            <div>
                                <p className="text-sm font-semibold text-[#185c3c]">
                                    Personal workspace settings
                                </p>
                                <p className="mt-1 text-sm leading-5 text-[#547461]">
                                    Changes to your profile and password are handled by the existing
                                    account services. Organization-wide settings remain restricted
                                    to authorized administrators.
                                </p>
                            </div>
                        </div>

                        <div className="grid items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
                            <nav className="rounded-xl border border-[#e1eae4] bg-white p-3 shadow-sm">
                                <p className="px-3 pb-3 pt-2 text-xs font-semibold tracking-wider text-[#829187] uppercase">
                                    Settings menu
                                </p>
                                {settingsLinks.map(({ label, href, icon: Icon }, index) => (
                                    <a
                                        key={label}
                                        href={href}
                                        className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                                            index === 0
                                                ? 'bg-[#edf7f0] font-semibold text-[#176b45]'
                                                : 'text-[#56675d] hover:bg-[#f5f8f6] hover:text-[#176b45]'
                                        }`}
                                    >
                                        <Icon className="size-4 shrink-0" />
                                        {label}
                                    </a>
                                ))}
                            </nav>

                            <div className="min-w-0 space-y-6">
                                <section
                                    id="profile"
                                    className="scroll-mt-24 rounded-xl border border-[#e1eae4] bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="mb-6 flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f0] text-[#176b45]">
                                            <UserRound className="size-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-semibold">Profile & account</h2>
                                            <p className="mt-1 text-sm text-[#718278]">
                                                Update your name and email address.
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={saveProfile} className="space-y-5">
                                        <div>
                                            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium">
                                                Full name
                                            </label>
                                            <input
                                                id="profile-name"
                                                value={profile.data.name}
                                                onChange={(event) => profile.setData('name', event.target.value)}
                                                required
                                                autoComplete="name"
                                                className="h-11 w-full rounded-lg border border-[#dce7df] px-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                                            />
                                            {profile.errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{profile.errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="profile-email" className="mb-2 block text-sm font-medium">
                                                Email address
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#829187]" />
                                                <input
                                                    id="profile-email"
                                                    type="email"
                                                    value={profile.data.email}
                                                    onChange={(event) => profile.setData('email', event.target.value)}
                                                    required
                                                    autoComplete="username"
                                                    className="h-11 w-full rounded-lg border border-[#dce7df] pr-3 pl-10 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                                                />
                                            </div>
                                            {profile.errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{profile.errors.email}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 border-t border-[#edf1ee] pt-5">
                                            <button
                                                type="submit"
                                                disabled={profile.processing}
                                                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#176b45] px-5 text-sm font-semibold text-white transition hover:bg-[#125637] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {profile.processing ? 'Saving...' : 'Save changes'}
                                            </button>
                                            {profile.recentlySuccessful && (
                                                <span className="flex items-center gap-1.5 text-sm font-medium text-[#176b45]">
                                                    <CheckCircle2 className="size-4" />
                                                    Profile saved
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>

                                <section
                                    id="security"
                                    className="scroll-mt-24 rounded-xl border border-[#e1eae4] bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="mb-6 flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f0] text-[#176b45]">
                                            <LockKeyhole className="size-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-semibold">Security & password</h2>
                                            <p className="mt-1 text-sm text-[#718278]">
                                                Enter your current password to choose a new one.
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={savePassword} className="space-y-5">
                                        <div>
                                            <label htmlFor="current-password" className="mb-2 block text-sm font-medium">
                                                Current password
                                            </label>
                                            <input
                                                id="current-password"
                                                ref={currentPasswordInput}
                                                type="password"
                                                value={password.data.current_password}
                                                onChange={(event) => password.setData('current_password', event.target.value)}
                                                required
                                                autoComplete="current-password"
                                                className="h-11 w-full rounded-lg border border-[#dce7df] px-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                                            />
                                            {password.errors.current_password && (
                                                <p className="mt-1 text-sm text-red-600">{password.errors.current_password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="new-password" className="mb-2 block text-sm font-medium">
                                                New password
                                            </label>
                                            <input
                                                id="new-password"
                                                ref={passwordInput}
                                                type="password"
                                                value={password.data.password}
                                                onChange={(event) => password.setData('password', event.target.value)}
                                                required
                                                autoComplete="new-password"
                                                className="h-11 w-full rounded-lg border border-[#dce7df] px-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                                            />
                                            {password.errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{password.errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">
                                                Confirm new password
                                            </label>
                                            <input
                                                id="confirm-password"
                                                type="password"
                                                value={password.data.password_confirmation}
                                                onChange={(event) => password.setData('password_confirmation', event.target.value)}
                                                required
                                                autoComplete="new-password"
                                                className="h-11 w-full rounded-lg border border-[#dce7df] px-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10"
                                            />
                                            {password.errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-600">{password.errors.password_confirmation}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 border-t border-[#edf1ee] pt-5">
                                            <button
                                                type="submit"
                                                disabled={password.processing}
                                                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#176b45] px-5 text-sm font-semibold text-white transition hover:bg-[#125637] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {password.processing ? 'Updating...' : 'Update password'}
                                            </button>
                                            {password.recentlySuccessful && (
                                                <span className="flex items-center gap-1.5 text-sm font-medium text-[#176b45]">
                                                    <CheckCircle2 className="size-4" />
                                                    Password updated
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>

                                <section
                                    id="notifications"
                                    className="scroll-mt-24 rounded-xl border border-[#e1eae4] bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f0] text-[#176b45]">
                                            <Bell className="size-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-semibold">Notifications</h2>
                                            <p className="mt-1 text-sm leading-6 text-[#718278]">
                                                Notification preferences will be added in the next step.
                                                We will connect them to persistent storage so your choices
                                                remain saved after you sign out.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section
                                    id="preferences"
                                    className="scroll-mt-24 rounded-xl border border-[#e1eae4] bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f0] text-[#176b45]">
                                            <SlidersHorizontal className="size-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-semibold">Workspace preferences</h2>
                                            <p className="mt-1 text-sm leading-6 text-[#718278]">
                                                Saved filters, table density, and default landing-page
                                                options will be implemented after account settings are tested.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex items-center gap-2 px-1 pb-4 text-xs text-[#829187]">
                                    <CircleHelp className="size-4" />
                                    Need access to organization-wide settings? Contact your administrator.
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
