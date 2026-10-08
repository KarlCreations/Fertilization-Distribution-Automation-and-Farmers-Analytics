import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CheckCircle2,
    ClipboardList,
    Database,
    Download,
    FileKey2,
    LayoutDashboard,
    Leaf,
    LogOut,
    Package,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sprout,
    Truck,
    UserCog,
    UsersRound,
    Vault,
    WalletCards,
} from 'lucide-react';

import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const metrics = [
    { key: 'connected', label: 'SQLite connection', icon: Database },
    { key: 'farmers', label: 'Farmer records', icon: Sprout },
    { key: 'stockRecords', label: 'Stock records', icon: Package },
    { key: 'contracts', label: 'Trade contracts', icon: Truck },
];

const configurationAreas = [
    { title: 'Farmer management', icon: Sprout, routeName: 'farmer-registry' },
    { title: 'Fertilizer & subsidy', icon: Package, routeName: 'farmer-registry' },
    { title: 'Inventory & silos', icon: Database, routeName: 'inventory-warehouses' },
    { title: 'Sales & commodities', icon: Truck, routeName: 'sales-commodities' },
    { title: 'Analytics & intelligence', icon: ClipboardList, routeName: 'dashboard' },
    { title: 'Security administration', icon: ShieldCheck, routeName: 'system-admin' },
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

type DatabaseStatus = {
    driver: string;
    database: string;
    connected: boolean;
    appName: string;
    locale: string;
    timezone: string;
    farmers: number;
    stockRecords: number;
    contracts: number;
    employees: number;
};
type AuditEvent = { id: number; action: string; module: string | null; created_at: string; user_name: string | null };

export default function SystemSettings({ databaseStatus, auditEvents }: { databaseStatus: DatabaseStatus; auditEvents: AuditEvent[] }) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const [auditSearch, setAuditSearch] = useState('');
    const [settingsSearch, setSettingsSearch] = useState('');
    const matchingConfigurationAreas = useMemo(
        () => configurationAreas.filter(({ title }) => title.toLocaleLowerCase().includes(settingsSearch.trim().toLocaleLowerCase())),
        [settingsSearch],
    );
    const matchingAuditEvents = useMemo(() => {
        const query = auditSearch.trim().toLocaleLowerCase();

        return auditEvents.filter((event) => !query
            || [event.user_name ?? '', event.action, event.module ?? ''].some((value) => value.toLocaleLowerCase().includes(query)));
    }, [auditEvents, auditSearch]);

    return (
        <>
            <Head title="System settings" />
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
                        <span className="sr-only">Search system settings</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search configuration modules"
                            value={settingsSearch}
                            onChange={(event) => setSettingsSearch(event.target.value)}
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
                                <a
                                    href={route('system-settings.export')}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Download className="size-4" />
                                    Export configuration
                                </a>
                                <button
                                    type="button"
                                    onClick={() => router.reload({ only: ['databaseStatus'] })}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Database className="size-4" />
                                    Refresh connection status
                                </button>
                                <span className="flex items-center text-xs text-[#667085]">Runtime settings are read-only; configure them in the local environment.</span>
                            </div>
                        </div>

                        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-[#eaecf0] bg-white p-2" aria-label="Settings sections">
                            {[
                                { label: 'Account settings', href: route('profile.edit') },
                                { label: 'User management', href: route('system-admin') },
                                { label: 'Roles & permissions', href: route('system-admin') },
                                { label: 'System configuration', href: route('system-settings'), active: true },
                                { label: 'Audit activity', href: '#audit-history' },
                            ].map(({ label, href, active }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className={`flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-medium ${
                                        active ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-[#f2f4f7]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {metrics.map(({ key, label, icon: Icon }) => (
                                <div key={label} className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">{label}</p>
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <p className="mt-5 truncate text-lg font-semibold text-[#101828]">
                                        {key === 'connected'
                                            ? databaseStatus.connected ? 'Connected' : 'Unavailable'
                                            : (databaseStatus[key as keyof DatabaseStatus] ?? 0).toLocaleString()}
                                    </p>
                                    <p className="mt-3 text-xs text-[#98a2b3]">Live from SQLite</p>
                                </div>
                            ))}
                        </section>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                            <Panel title="Provisioned personnel directory" icon={UsersRound}>
                                <p className="px-5 text-sm text-[#667085]">
                                    User accounts are stored in SQLite and managed through the protected system administration screen.
                                </p>
                                <Link href={route('system-admin')} className="mx-5 mb-5 mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-medium text-white">
                                    <UserCog className="size-4" />
                                    Manage user accounts
                                </Link>
                                <EmptyState
                                    className="m-5 min-h-52"
                                    title={`${databaseStatus.employees.toLocaleString()} employee profiles in SQLite`}
                                    description="Open system administration to provision accounts or update an employee's application role."
                                />
                            </Panel>
                            <Panel title="Backup & cold recovery" icon={Vault}>
                                <EmptyState
                                    className="mx-5 mb-5 min-h-52"
                                    title="No recovery snapshots available"
                                    description="Backup status, recovery points, and storage checks will be supplied by the configured backup service."
                                />
                                <div className="border-t border-[#eaecf0] p-4 text-xs leading-5 text-[#667085]">
                                    Backup and restore are unavailable until a backup provider is configured. No inactive action buttons are shown.
                                </div>
                            </Panel>
                        </div>

                        <Panel title="Role entitlements & granular permission matrix" icon={ShieldCheck} className="mt-6">
                            <div className="flex flex-col gap-3 border-b border-[#eaecf0] px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Application roles and role descriptions are managed in system administration. Fine-grained permissions are not part of the current SQLite schema.
                                </p>
                                <Link href={route('system-admin')} className="flex h-9 items-center rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]">
                                    Manage roles
                                </Link>
                            </div>
                            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                                {matchingConfigurationAreas.map(({ title, icon: Icon, routeName }) => (
                                    <Link key={title} href={route(routeName)} className="min-h-36 rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4 transition hover:border-[#b2ccff] hover:bg-[#f8faff]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#344054]">
                                            <Icon className="size-4 text-[#175cd3]" />
                                            {title}
                                        </div>
                                        <p className="mt-5 text-xs text-[#667085]">Open live SQLite workspace</p>
                                    </Link>
                                ))}
                                {matchingConfigurationAreas.length === 0 && (
                                    <p className="text-sm text-[#667085]">No configuration modules match this search.</p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eaecf0] bg-[#fbfcfe] p-4 text-xs text-[#667085]">
                                <span>Role key and description updates are stored in SQLite.</span>
                                <Link href={route('system-admin')} className="flex h-9 items-center rounded-md bg-[#101828] px-3 text-sm font-medium text-white">
                                    Open role management
                                </Link>
                            </div>
                        </Panel>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                            <Panel title="System configuration & database settings" icon={Settings}>
                                <div className="grid gap-3 p-5 sm:grid-cols-2">
                                    {[
                                        ['Application', databaseStatus.appName],
                                        ['Database driver', databaseStatus.driver],
                                        ['SQLite database file', databaseStatus.database],
                                        ['Connection', databaseStatus.connected ? 'Connected' : 'Unavailable'],
                                        ['Application locale', databaseStatus.locale],
                                        ['Application timezone', databaseStatus.timezone],
                                        ['Farmer records', databaseStatus.farmers.toLocaleString()],
                                        ['Stock records', databaseStatus.stockRecords.toLocaleString()],
                                        ['Trade contracts', databaseStatus.contracts.toLocaleString()],
                                        ['Employee records', databaseStatus.employees.toLocaleString()],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-[#f9fafb] p-3 text-sm">
                                            <span className="text-[#667085]">{label}</span>
                                            <span className="max-w-[60%] truncate font-medium text-[#101828]" title={value}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <Panel title="Subsystem integration health" icon={Database}>
                                <div className="grid gap-3 px-5 pb-5">
                                    <div className="rounded-md border border-[#a6f4c5] bg-[#ecfdf3] p-4">
                                        <p className="text-sm font-semibold text-[#067647]">SQLite operational data · Connected</p>
                                        <p className="mt-1 break-all text-xs text-[#475467]">{databaseStatus.database}</p>
                                    </div>
                                    <div className="rounded-md border border-[#fedf89] bg-[#fffaeb] p-4">
                                        <p className="text-sm font-semibold text-[#b54708]">Power BI · Optional integration</p>
                                        <p className="mt-1 text-xs text-[#667085]">Core dashboards and records use SQLite. Power BI requires separate credentials.</p>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div id="audit-history" className="scroll-mt-24">
                        <Panel title="Audit activity & security journal" icon={FileKey2} className="mt-6">
                            <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">{matchingAuditEvents.length} matching changes recorded in SQLite.</p>
                                <label className="relative block w-full sm:max-w-xs">
                                    <span className="sr-only">Filter audit stream</span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                    <input
                                        value={auditSearch}
                                        onChange={(event) => setAuditSearch(event.target.value)}
                                        placeholder="Filter by user, action, or module"
                                        className="h-9 w-full rounded-md border border-[#d0d5dd] bg-white pr-3 pl-9 text-sm"
                                    />
                                </label>
                            </div>
                            {matchingAuditEvents.length === 0 ? (
                                <EmptyState className="m-5 min-h-44" title="No audit events yet" description="Changes made in the app are listed here." />
                            ) : (
                                <ul className="grid gap-3 p-5">
                                    {matchingAuditEvents.map((event) => (
                                        <li key={event.id} className="border-b border-[#eaecf0] pb-3 text-xs">
                                            <p className="font-medium text-[#344054]">{event.user_name ?? 'System'} {event.action} · {event.module ?? 'system'}</p>
                                            <p className="mt-1 text-[#98a2b3]">{new Date(event.created_at).toLocaleString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Panel>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
