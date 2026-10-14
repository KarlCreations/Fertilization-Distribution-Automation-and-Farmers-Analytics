import { Head, Link, usePage } from '@inertiajs/react';
import { KeyRound, Settings, UserRound } from 'lucide-react';

import WorkspaceHeader from '@/components/workspace-header';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

export default function EmployeeSettings() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Settings" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <WorkspaceHeader />
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-7">
                            <p className="text-xs font-semibold tracking-wide text-[#175cd3] uppercase">Workspace settings</p>
                            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Account settings</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">Manage your profile and account security.</p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                            <section className="rounded-xl border border-[#eaecf0] bg-white p-6 shadow-sm">
                                <UserRound className="size-6 text-[#175cd3]" />
                                <h2 className="mt-4 text-lg font-semibold">Profile</h2>
                                <p className="mt-2 text-sm text-[#667085]">Update your name, email, and profile photo.</p>
                                <Link href={route('employee-settings.profile')} className="mt-5 inline-flex rounded-md bg-[#175cd3] px-4 py-2 text-sm font-semibold text-white">Open profile</Link>
                            </section>
                            <section className="rounded-xl border border-[#eaecf0] bg-white p-6 shadow-sm">
                                <KeyRound className="size-6 text-[#175cd3]" />
                                <h2 className="mt-4 text-lg font-semibold">Password and preferences</h2>
                                <p className="mt-2 text-sm text-[#667085]">Your account is signed in as {auth.user.email}.</p>
                                <Link href={route('hr-settings')} className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#d0d5dd] px-4 py-2 text-sm font-semibold text-[#344054]"><Settings className="size-4" />Open settings</Link>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
