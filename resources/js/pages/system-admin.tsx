import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    CircleHelp,
    ClipboardList,
    Download,
    Fingerprint,
    KeyRound,
    LayoutDashboard,
    Leaf,
    LogOut,
    MapPinned,
    Menu,
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

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

const metrics = [
    { label: 'Total provisioned users', icon: UsersRound, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { label: 'MFA & biometric security', icon: Fingerprint, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
    { label: 'Role-based access matrix', icon: ShieldCheck, tone: 'bg-[#eff4ff] text-[#175cd3]' },
    { label: 'Subsystem health & latency', icon: Network, tone: 'bg-[#ecfdf3] text-[#067647]' },
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

export default function SystemAdmin() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const accessColumns = ['Enterprise subsystem module', 'System admin', 'Operations director', 'Field officer', 'Warehouse manager'];

    return (
        <>
            <Head title="System administration" />
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
                        <span className="sr-only">Search system administration</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search users, roles, policies, or logs"
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                        >
                            <Bell className="size-4" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#d92d20]" />
                        </button>
                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7] sm:flex"
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
                        <div className="mb-4"><PowerBiReport title="System analytics" /></div>
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
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Vault className="size-4" />
                                    System backup
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Download className="size-4" />
                                    Security audit export
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#101828] px-3 text-sm font-semibold text-white"
                                >
                                    <Plus className="size-4" />
                                    Provision user account
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Security metrics">
                            {metrics.map(({ label, icon: Icon, tone }) => (
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
                                    <div className="mt-5 h-7 w-28 animate-pulse rounded bg-[#eef2f6]" />
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Awaiting security data source</p>
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
                                        <button type="button" className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]">
                                            Immutable baseline
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-8 items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467]"
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
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-16">
                                                        <EmptyState
                                                            title="No RBAC policy records available"
                                                            description="Subsystem modules and permission scopes will appear when identity services are connected."
                                                            className="h-36"
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Panel>
                                <Panel title="User accounts & active session directory" icon={UserCog} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row">
                                        <label className="relative min-w-0 flex-1">
                                            <span className="sr-only">Filter directory</span>
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#98a2b3]" />
                                            <input
                                                className="h-8 w-full rounded-md bg-[#f9fafb] pr-3 pl-8 text-xs placeholder:text-[#98a2b3]"
                                                placeholder="Filter by name, role, or scope"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="flex h-8 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                        >
                                            Filters <ChevronDown className="size-3.5" />
                                        </button>
                                    </div>
                                    <EmptyState
                                        title="No user or session records available"
                                        description="Provisioned accounts and live session details will appear after the identity database is connected."
                                        className="mx-5 mb-5 h-40"
                                    />
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Real-time security & audit log" icon={ClipboardList}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No audit events available"
                                            description="Security events and authorization activity will stream here."
                                            className="h-56"
                                        />
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
