import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, CircleHelp, Leaf, Menu, Pencil, Search, Settings, ShieldCheck, UserRound } from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import WorkspaceHeader from '@/components/workspace-header';
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
        created_at: string;
        updated_at: string;
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

export default function HrProfile({ profile }: { profile: ProfileData }) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const employee = profile.employee;

    const details: Array<[string, string]> = [
        ['Employee code', employee?.employee_code ?? 'Not assigned'],
        ['Department', employee?.department ?? 'Not assigned'],
        ['Position', employee?.position ?? 'Not assigned'],
        ['Zone', employee?.zone_name ?? 'No zone assigned'],
        ['Depot', employee?.depot_name ? `${employee.depot_name}${employee.depot_code ? ` (${employee.depot_code})` : ''}` : 'No depot assigned'],
        ['Employment status', employee ? (employee.is_active ? 'Active' : 'Inactive') : 'No employee record'],
        ['Account role', profile.user.role ?? 'Unassigned'],
        ['Member since', new Date(profile.user.created_at).toLocaleDateString()],
        ['Employee record created', employee?.created_at ? new Date(employee.created_at).toLocaleDateString() : '—'],
        ['Record last updated', employee?.updated_at ? new Date(employee.updated_at).toLocaleDateString() : '—'],
    ];

    return (
        <>
            <Head title="My profile" />
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

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">My profile</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">My profile</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Your employee account as recorded in the workforce system.
                                </p>
                            </div>
                            <Link
                                href={route('hr-settings')}
                                className="flex h-9 w-fit items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                            >
                                <Settings className="size-4" />
                                Edit profile & settings
                            </Link>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                            <section className="rounded-lg border border-[#eaecf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex flex-col items-center text-center">
                                    {profile.user.avatar ? (
                                        <img src={profile.user.avatar} alt={profile.user.name} className="size-24 rounded-full object-cover" />
                                    ) : (
                                        <span className="flex size-24 items-center justify-center rounded-full bg-[#eff4ff] text-2xl font-semibold text-[#175cd3]">
                                            {initials(profile.user.name)}
                                        </span>
                                    )}
                                    <h2 className="mt-4 text-lg font-semibold text-[#101828]">{profile.user.name}</h2>
                                    <p className="text-sm text-[#667085]">{profile.user.email}</p>
                                    <span
                                        className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
                                            employee?.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#f2f4f7] text-[#667085]'
                                        }`}
                                    >
                                        {employee?.is_active ? 'Active employee account' : 'Inactive employee account'}
                                    </span>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-[#98a2b3]">
                                        <UserRound className="size-3.5" />
                                        {employee?.position || 'Position not assigned'}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex items-center gap-2 border-b border-[#eaecf0] p-5 text-sm font-semibold text-[#101828]">
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                        <Pencil className="size-4" />
                                    </span>
                                    Employment details
                                </div>
                                {employee === null ? (
                                    <div className="p-5">
                                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 py-10 text-center">
                                            <div className="size-2 rounded-full bg-[#b2ddff]" />
                                            <p className="mt-3 text-sm font-medium text-[#475467]">No employee record linked</p>
                                            <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a2b3]">
                                                Ask your HR administrator to link an employee record to your account.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <dl className="grid gap-3 p-5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                                        {details.map(([label, value]) => (
                                            <div key={label} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                                <dt className="text-[10px] font-semibold tracking-[0.08em] text-[#98a2b3] uppercase">{label}</dt>
                                                <dd className="mt-1 font-medium text-[#344054]">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}