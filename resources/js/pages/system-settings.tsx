import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    ChevronDown,
    CircleHelp,
    ClipboardList,
    Database,
    Download,
    FileKey2,
    LayoutDashboard,
    Leaf,
    LogOut,
    Menu,
    Package,
    Save,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sprout,
    Truck,
    Upload,
    UserCog,
    UsersRound,
    Vault,
    WalletCards,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

const metrics = [
    { label: 'Provisioned accounts', icon: UsersRound },
    { label: 'Security baseline', icon: ShieldCheck },
    { label: 'Database snapshot engine', icon: Database },
    { label: 'Cluster topology', icon: SlidersHorizontal },
];

const configurationAreas = [
    { title: 'Farmer management', icon: Sprout },
    { title: 'Fertilizer & subsidy', icon: Package },
    { title: 'Inventory & silos', icon: Database },
    { title: 'Sales & commodities', icon: Truck },
    { title: 'Analytics & intelligence', icon: ClipboardList },
    { title: 'Security administration', icon: ShieldCheck },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof Settings;
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
            <span className="size-2 rounded-full bg-[#b2ddff]" />
            <p className="mt-3 text-sm font-medium text-[#475467]">{title}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#98a2b3]">{description}</p>
        </div>
    );
}

function Navigation() {
    const links = [
        { label: 'Overview', icon: LayoutDashboard, href: route('dashboard') },
        { label: 'Farmer registry', icon: Sprout, href: route('farmer-registry') },
        { label: 'Inventory', icon: Package, href: route('inventory-warehouses') },
        { label: 'Trade hub', icon: Truck, href: route('sales-commodities') },
        { label: 'Financials', icon: WalletCards, href: route('finance-impact') },
        { label: 'HR & workforce', icon: UsersRound, href: route('hr-workforce') },
        { label: 'System administration', icon: UserCog, href: route('system-admin') },
        { label: 'System settings', icon: Settings, href: route('system-settings'), active: true },
    ];

    return (
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-[#eaecf0] bg-white p-3 lg:block">
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-[#98a2b3] uppercase">Workspace</p>
            <nav className="grid gap-1" aria-label="Primary navigation">
                {links.map(({ label, icon: Icon, href, active }) => (
                    <Link
                        key={label}
                        href={href}
                        className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                            active ? 'bg-[#eff4ff] text-[#175cd3]' : 'text-[#475467] hover:bg-[#f9fafb]'
                        }`}
                    >
                        <Icon className="size-4" />
                        {label}
                    </Link>
                ))}
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

export default function SystemSettings() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    return (
        <>
            <Head title="System settings" />
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
                        <span className="sr-only">Search system settings</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search settings and configuration"
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
                        <div className="mb-4"><PowerBiReport title="Configuration analytics" /></div>
                        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-2 flex flex-wrap gap-2 text-xs font-medium text-[#667085]">
                                    <span>Enterprise</span>
                                    <span>/</span>
                                    <span>System administration</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Settings & preferences</span>
                                </div>
                                <h1 className="text-2xl font-semibold sm:text-3xl">System settings & configuration console</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Prepare global configuration, environment parameters, access settings, and audit integrations for connected
                                    operational systems.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Download className="size-4" />
                                    Export configuration
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Database className="size-4" />
                                    Test connection
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#101828] px-3 text-sm font-medium text-white"
                                >
                                    <Save className="size-4" />
                                    Save changes
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-[#eaecf0] bg-white p-2">
                            {['Account settings', 'User management', 'Roles & permissions', 'System configuration', 'Notifications'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`h-9 shrink-0 rounded-md px-3 text-sm font-medium ${tab === 'System configuration' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-[#f2f4f7]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {metrics.map(({ label, icon: Icon }) => (
                                <div key={label} className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">{label}</p>
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <div className="mt-5 h-7 w-24 animate-pulse rounded bg-[#eef2f6]" />
                                    <p className="mt-3 text-xs text-[#98a2b3]">Awaiting configuration source</p>
                                </div>
                            ))}
                        </section>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                            <Panel title="Provisioned personnel directory" icon={UsersRound}>
                                <div className="border-y border-[#eaecf0] bg-[#fbfcfe] p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <label className="relative flex-1">
                                            <span className="sr-only">Find a user</span>
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                            <input
                                                className="h-9 w-full rounded-md border border-[#d0d5dd] bg-white pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3]"
                                                placeholder="Search when directory data is connected"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#475467]"
                                        >
                                            All roles
                                            <ChevronDown className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-medium text-white"
                                        >
                                            <UserCog className="size-4" />
                                            Add user
                                        </button>
                                    </div>
                                </div>
                                <EmptyState
                                    className="m-5 min-h-52"
                                    title="No personnel records loaded"
                                    description="Directory records will appear here after the identity service and database are connected."
                                />
                            </Panel>
                            <Panel title="Backup & cold recovery" icon={Vault}>
                                <EmptyState
                                    className="mx-5 mb-5 min-h-52"
                                    title="No recovery snapshots available"
                                    description="Backup status, recovery points, and storage checks will be supplied by the configured backup service."
                                />
                                <div className="flex gap-2 border-t border-[#eaecf0] p-4">
                                    <button
                                        type="button"
                                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-medium text-white"
                                    >
                                        <Upload className="size-4" />
                                        Create backup
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                    >
                                        <FileKey2 className="size-4" />
                                        Restore
                                    </button>
                                </div>
                            </Panel>
                        </div>

                        <Panel title="Role entitlements & granular permission matrix" icon={ShieldCheck} className="mt-6">
                            <div className="flex flex-col gap-3 border-b border-[#eaecf0] px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Permission scopes will be available after roles and entitlements are synchronized.
                                </p>
                                <button
                                    type="button"
                                    className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    Select role
                                    <ChevronDown className="size-4" />
                                </button>
                            </div>
                            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                                {configurationAreas.map(({ title, icon: Icon }) => (
                                    <div key={title} className="min-h-36 rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#344054]">
                                            <Icon className="size-4 text-[#175cd3]" />
                                            {title}
                                        </div>
                                        <div className="mt-5 space-y-2">
                                            <div className="h-3 w-4/5 animate-pulse rounded bg-[#eef2f6]" />
                                            <div className="h-3 w-3/5 animate-pulse rounded bg-[#eef2f6]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eaecf0] bg-[#fbfcfe] p-4 text-xs text-[#667085]">
                                <span>Entitlement changes will be validated when security policies are connected.</span>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#101828] px-3 text-sm font-medium text-white"
                                >
                                    <Save className="size-4" />
                                    Save permission matrix
                                </button>
                            </div>
                        </Panel>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                            <Panel title="System configuration & database settings" icon={Settings}>
                                <div className="grid gap-4 p-5 sm:grid-cols-2">
                                    <div className="rounded-md bg-[#f5f8ff] p-4">
                                        <p className="text-xs font-semibold text-[#475467] uppercase">Tenant configuration</p>
                                        <div className="mt-5 space-y-3">
                                            <div className="h-9 animate-pulse rounded bg-white" />
                                            <div className="h-9 animate-pulse rounded bg-white" />
                                        </div>
                                    </div>
                                    <div className="rounded-md bg-[#f5f8ff] p-4">
                                        <p className="text-xs font-semibold text-[#475467] uppercase">Localization presets</p>
                                        <div className="mt-5 space-y-3">
                                            <div className="h-9 animate-pulse rounded bg-white" />
                                            <div className="h-9 animate-pulse rounded bg-white" />
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-dashed border-[#d0d5dd] p-4 sm:col-span-2">
                                        <p className="text-sm font-medium text-[#475467]">Database & API connectivity</p>
                                        <p className="mt-1 text-xs leading-5 text-[#98a2b3]">
                                            Connection health, replica state, and service latency will populate here when integrations are configured.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-[#eaecf0] p-4">
                                    <button
                                        type="button"
                                        className="flex h-9 items-center gap-2 rounded-md bg-[#101828] px-3 text-sm font-medium text-white"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Apply environment configuration
                                    </button>
                                </div>
                            </Panel>
                            <Panel title="Subsystem integration health" icon={Database}>
                                <EmptyState
                                    className="mx-5 mb-5 min-h-64"
                                    title="No integration status received"
                                    description="Connected subsystem health checks will be presented as each service is configured."
                                />
                            </Panel>
                        </div>

                        <Panel title="Cryptographic audit ledger & security journal" icon={FileKey2} className="mt-6">
                            <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Immutable audit events will be displayed after the ledger service is connected.
                                </p>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Search className="size-4" />
                                    Filter audit stream
                                </button>
                            </div>
                            <EmptyState
                                className="m-5 min-h-44"
                                title="No audit events available"
                                description="Security events and verification records will be populated from the connected audit source."
                            />
                        </Panel>
                    </main>
                </div>
            </div>
        </>
    );
}
