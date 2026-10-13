import { Head, Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Download,
    Fingerprint,
    KeyRound,
    LayoutDashboard,
    Leaf,
    LogOut,
    MapPinned,
    Network,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sprout,
    UserCog,
    UsersRound,
    Vault,
    WalletCards,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';

import CrudManager from '@/components/crud-manager';
import SystemUserManager from '@/components/system-user-manager';
import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const metrics = [
    { key: 'userCount', label: 'Registered user accounts', icon: UsersRound, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { key: 'roleCount', label: 'Configured roles', icon: Fingerprint, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
    { key: 'activeEmployeeCount', label: 'Active employees', icon: ShieldCheck, tone: 'bg-[#eff4ff] text-[#175cd3]' },
    { key: 'auditCount', label: 'Audit events', icon: Network, tone: 'bg-[#ecfdf3] text-[#067647]' },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof ShieldCheck;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
            <div className="flex items-center gap-2 p-5 text-sm font-semibold text-[#101828]">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                    <Icon className="size-4" />
                </span>
                {title}
            </div>
            {children}
        </section>
    );
}

function EmptyState({ title, description, className = '' }: { title: string; description: string; className?: string }) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 text-center ${className}`}
        >
            <div className="size-2 rounded-full bg-[#b2ddff]" />
            <p className="mt-3 text-sm font-medium text-[#475467]">{title}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a2b3]">{description}</p>
        </div>
    );
}

function Navigation() {
    return (
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-[#eaecf0] bg-white p-3 lg:block">
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-[#98a2b3] uppercase">Workspace</p>
            <nav className="grid gap-1" aria-label="Primary navigation">
                <Link
                    href={route('dashboard')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <LayoutDashboard className="size-4" />
                    Overview
                </Link>
                <Link
                    href={route('farmer-registry')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Sprout className="size-4" />
                    Farmer registry
                </Link>
                <Link
                    href={route('inventory-warehouses')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Warehouse className="size-4" />
                    Inventory
                </Link>
                <Link
                    href={route('sales-commodities')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <ClipboardList className="size-4" />
                    Trade hub
                </Link>
                <Link
                    href={route('finance-impact')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <WalletCards className="size-4" />
                    Financials
                </Link>
                <Link
                    href={route('hr-workforce')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <UsersRound className="size-4" />
                    HR & workforce
                </Link>
                <Link
                    href={route('system-admin')}
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
                >
                    <Settings className="size-4" />
                    System administration
                </Link>
                <Link
                    href={route('system-settings')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <SlidersHorizontal className="size-4" />
                    System settings
                </Link>
            </nav>
            <div className="mt-7 border-t border-[#eaecf0] pt-5">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <LogOut className="size-4" />
                    Sign out
                </Link>
            </div>
        </aside>
    );
}

type SystemUser = { id: number; name: string; email: string; role: string | null; is_active: boolean | null };
type SystemRole = { id: number; code: string; name: string; description: string | null };
type AuditEvent = { id: number; action: string; module: string | null; created_at: string; user_name: string | null };

export default function SystemAdmin({
    systemMetrics,
    systemUsers,
    systemRoles,
    auditEvents,
}: {
    systemMetrics: Record<string, number>;
    systemUsers: SystemUser[];
    systemRoles: SystemRole[];
    auditEvents: AuditEvent[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [userSearch, setUserSearch] = useState('');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const accessColumns = ['Role name', 'Role code', 'Description'];
    const filteredUsers = systemUsers.filter((user) =>
        `${user.name} ${user.email} ${user.role ?? ''}`.toLowerCase().includes(userSearch.trim().toLowerCase()),
    );

    function exportSecurityAudit() {
        const headers = ['ID', 'User', 'Action', 'Module', 'Date'];
        const rows = auditEvents.map((event) => [event.id, event.user_name ?? 'System', event.action, event.module ?? 'system', event.created_at]);
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const download = document.createElement('a');
        download.href = url;
        download.download = 'security-audit.csv';
        download.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Head title="System administration" />
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
                        <span className="sr-only">Search system administration</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search users by name, email, or role"
                            value={userSearch}
                            onChange={(event) => setUserSearch(event.target.value)}
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
                        <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Enterprise</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">System administration & RBAC</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">System administration & RBAC security console</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Manage enterprise identity, role permissions, security audit logging, and core integration health from connected
                                    sources.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled
                                    title="Backup storage is not configured."
                                    className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054] opacity-50"
                                >
                                    <Vault className="size-4" />
                                    System backup
                                </button>
                                <button
                                    type="button"
                                    onClick={exportSecurityAudit}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Download className="size-4" />
                                    Security audit export
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById('system-user-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#101828] px-3 text-sm font-semibold text-white"
                                >
                                    <Plus className="size-4" />
                                    Provision user account
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Security metrics">
                            {metrics.map(({ key, label, icon: Icon, tone }) => (
                                <article
                                    key={label}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-[#475467]">{label}</p>
                                        <span className={`flex size-9 items-center justify-center rounded-md ${tone}`}>
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-2xl font-semibold text-[#101828]">{(systemMetrics[key] ?? 0).toLocaleString()}</p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from SQLite</p>
                                </article>
                            ))}
                        </section>
                        <section className="mt-4 grid gap-4 rounded-lg bg-[#101828] p-5 text-white lg:grid-cols-3">
                            <div className="flex gap-3">
                                <Vault className="size-5 text-[#84adff]" />
                                <div>
                                    <p className="font-semibold">Cryptographic engine</p>
                                    <p className="mt-1 text-xs text-[#cbd5e1]">Key management and ledger sealing status will appear here.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <MapPinned className="size-5 text-[#84adff]" />
                                <div>
                                    <p className="font-semibold">Regional geo-fence enforcer</p>
                                    <p className="mt-1 text-xs text-[#cbd5e1]">Monitored scopes will populate from security policies.</p>
                                </div>
                            </div>
                            <div className="rounded-md bg-white/10 p-3">
                                <p className="text-xs font-semibold tracking-wide text-[#cbd5e1] uppercase">Authentication ingestion stream</p>
                                <div className="mt-3 h-6 w-28 animate-pulse rounded bg-white/15" />
                            </div>
                        </section>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Granular role-based access control matrix" icon={ShieldCheck} className="overflow-hidden">
                                    <div className="flex flex-wrap gap-2 border-t border-[#eaecf0] p-5">
                                        <span className="inline-flex h-8 items-center rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]">
                                            Immutable baseline
                                        </span>
                                        <button
                                            type="button"
                                            disabled
                                            title="Fine-grained permission scopes are not represented by the current SQLite schema."
                                            className="flex h-8 cursor-not-allowed items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467] opacity-50"
                                        >
                                            <SlidersHorizontal className="size-3.5" />
                                            Configure scopes
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    {accessColumns.map((column) => (
                                                        <th key={column} className="px-5 py-3">
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {systemRoles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-5 py-16 text-center text-sm text-[#667085]">
                                                            No roles configured in SQLite.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    systemRoles.map((systemRole) => (
                                                        <tr key={systemRole.id} className="border-t border-[#eaecf0] text-xs text-[#475467]">
                                                            <td className="px-5 py-4 font-medium text-[#101828]">{systemRole.name}</td>
                                                            <td className="px-5 py-4">{systemRole.code}</td>
                                                            <td className="px-5 py-4">{systemRole.description ?? '—'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <CrudManager
                                        title="System role"
                                        records={systemRoles}
                                        canCreate={false}
                                        canDelete={false}
                                        createUrl={route('system-admin')}
                                        updateUrl={(id) => route('system-roles.update', { role: id })}
                                        deleteUrl={() => ''}
                                        fields={[
                                            { name: 'code', label: 'Role code', required: true, readOnlyOnEdit: true },
                                            { name: 'name', label: 'Role name', required: true },
                                            { name: 'description', label: 'Description' },
                                        ]}
                                    />
                                </Panel>
                                <Panel title="User accounts & active session directory" icon={UserCog} className="overflow-hidden">
                                    <SystemUserManager users={filteredUsers} roles={systemRoles} />
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Real-time security & audit log" icon={ClipboardList}>
                                    <div className="px-5 pb-5">
                                        {auditEvents.length === 0 ? (
                                            <EmptyState
                                                title="No audit events yet"
                                                description="Changes made through the application will appear here."
                                                className="h-56"
                                            />
                                        ) : (
                                            <ul className="grid gap-3 px-5 pb-5">
                                                {auditEvents.map((event) => (
                                                    <li key={event.id} className="border-b border-[#eaecf0] pb-3 text-xs">
                                                        <p className="font-medium text-[#344054]">
                                                            {event.user_name ?? 'System'} {event.action} · {event.module ?? 'system'}
                                                        </p>
                                                        <p className="mt-1 text-[#98a2b3]">{new Date(event.created_at).toLocaleString()}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </Panel>
                                <Panel title="Subsystem integrations health" icon={Network}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No integration health records"
                                            description="Gateway connectivity and latency will appear here."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Session security & token policies" icon={KeyRound}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No token policy data"
                                            description="Session controls and credential rotation status will render here."
                                            className="h-40"
                                        />
                                    </div>
                                </Panel>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
