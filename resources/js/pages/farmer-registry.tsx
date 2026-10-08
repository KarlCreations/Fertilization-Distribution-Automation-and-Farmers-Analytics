import { Head, Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Download,
    FileUp,
    Fingerprint,
    LayoutDashboard,
    Leaf,
    LogOut,
    Map,
    MapPinned,
    Package,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    Sprout,
    Truck,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';

import CrudManager from '@/components/crud-manager';
import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const metricDefinitions = [
    {
        key: 'registeredFarmers',
        label: 'Registered farmers',
        icon: UsersRound,
        tone: 'bg-[#eff8ff] text-[#175cd3]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'quotaDisbursed',
        label: 'Fertilizer quota disbursed',
        icon: Package,
        tone: 'bg-[#ecfdf3] text-[#067647]',
        format: (value: number) => `${value.toLocaleString()} MT`,
    },
    {
        key: 'activeQuotaRecords',
        label: 'Active quota records',
        icon: ClipboardList,
        tone: 'bg-[#f4f3ff] text-[#6938ef]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'quotaAllocated',
        label: 'Allocated fertilizer quota',
        icon: WalletCards,
        tone: 'bg-[#fffaeb] text-[#b54708]',
        format: (value: number) => `${value.toLocaleString()} MT`,
    },
];

function AppNavigation() {
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
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
                >
                    <Sprout className="size-4" />
                    Farmer registry
                </Link>
                <Link
                    href={route('inventory-warehouses')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Package className="size-4" />
                    Inventory
                </Link>
                <Link
                    href={route('sales-commodities')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Truck className="size-4" />
                    Trade hub
                </Link>
                <Link
                    href={route('finance-impact')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <WalletCards className="size-4" />
                    Financials
                </Link>
                <Link
                    href={route('hr-workforce')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <UsersRound className="size-4" />
                    HR & workforce
                </Link>
                <Link
                    href={route('system-admin')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Settings className="size-4" />
                    System administration
                </Link>
            </nav>
            <div className="mt-7 border-t border-[#eaecf0] pt-5">
                <Link
                    href={route('system-settings')}
                    className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Settings className="size-4" />
                    System settings
                </Link>
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

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof ClipboardList;
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

function EmptyState({ label, className = '' }: { label: string; className?: string }) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-4 text-center ${className}`}
        >
            <div className="size-2 rounded-full bg-[#b2ddff]" />
            <p className="mt-3 text-sm font-medium text-[#475467]">{label}</p>
            <p className="mt-1 text-xs leading-5 text-[#98a2b3]">Waiting for connected data source</p>
        </div>
    );
}

type QuotaLedgerEntry = {
    id: number;
    farmer_id: number;
    cycle_id: number;
    commodity_id: number;
    farmer_name: string;
    national_id: string;
    commodity_name: string;
    cycle_name: string;
    allocated_qty: number;
    disbursed_qty: number;
};

type FarmerRecord = {
    id: number;
    national_id: string;
    full_name: string;
    phone: string | null;
    zone_id: number | null;
    status: string;
    biometric_verified: boolean;
    zone_name: string | null;
};

export default function FarmerRegistry({
    registryMetrics,
    quotaLedger,
    farmers,
    zones,
    quotaFarmers,
    quotaCommodities,
    subsidyCycles,
}: {
    registryMetrics: Record<string, number>;
    quotaLedger: QuotaLedgerEntry[];
    farmers: FarmerRecord[];
    zones: { id: number; name: string }[];
    quotaFarmers: { id: number; full_name: string; national_id: string }[];
    quotaCommodities: { id: number; name: string; grade: string | null }[];
    subsidyCycles: { id: number; name: string }[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [farmerSearch, setFarmerSearch] = useState('');
    const [farmerStatusFilter, setFarmerStatusFilter] = useState('all');
    const [farmerZoneFilter, setFarmerZoneFilter] = useState('all');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const filteredFarmers = farmers.filter((farmer) => {
        const matchesStatus = farmerStatusFilter === 'all' || farmer.status === farmerStatusFilter;
        const matchesZone = farmerZoneFilter === 'all' || String(farmer.zone_id ?? '') === farmerZoneFilter;
        const searchableText = [farmer.full_name, farmer.national_id, farmer.phone ?? '', farmer.zone_name ?? ''].join(' ').toLowerCase();

        return matchesStatus && matchesZone && searchableText.includes(farmerSearch.trim().toLowerCase());
    });

    function exportFarmers() {
        const headers = ['National ID', 'Full name', 'Phone', 'Zone', 'Status', 'Biometric verified'];
        const rows = filteredFarmers.map((farmer) => [
            farmer.national_id,
            farmer.full_name,
            farmer.phone ?? '',
            farmer.zone_name ?? '',
            farmer.status,
            farmer.biometric_verified ? 'Yes' : 'No',
        ]);
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const download = document.createElement('a');
        download.href = url;
        download.download = 'farmer-registry.csv';
        download.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Head title="Farmer registry" />
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
                        <span className="sr-only">Search registry</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search registry"
                            value={farmerSearch}
                            onChange={(event) => setFarmerSearch(event.target.value)}
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
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Farmer registry</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Farmer registry</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Manage farmer profiles, cadastral parcel records, verification, allocation, and subsidy distribution from one
                                    workspace.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled
                                    title="No GIS import provider is configured."
                                    className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054] opacity-50"
                                >
                                    <FileUp className="size-4" />
                                    Import GIS
                                </button>
                                <button
                                    type="button"
                                    onClick={exportFarmers}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Download className="size-4" />
                                    Export
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('farmer-crud')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Register farmer
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Registry metrics">
                            {metricDefinitions.map(({ key, label, icon: Icon, tone, format }) => (
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
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">{format(registryMetrics[key] ?? 0)}</p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from ERP database</p>
                                </article>
                            ))}
                        </section>
                        <section className="mt-4 rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                                <label className="relative block min-w-0 flex-1">
                                    <span className="sr-only">Search farmers</span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                    <input
                                        className="h-10 w-full rounded-md border border-[#d0d5dd] bg-white pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3]"
                                        placeholder="Search farmer name, registry ID, or phone"
                                        value={farmerSearch}
                                        onChange={(event) => setFarmerSearch(event.target.value)}
                                    />
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <label className="sr-only" htmlFor="farmer-status-filter">
                                        Filter farmers by status
                                    </label>
                                    <select
                                        id="farmer-status-filter"
                                        value={farmerStatusFilter}
                                        onChange={(event) => setFarmerStatusFilter(event.target.value)}
                                        className="h-9 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="pending_verification">Pending verification</option>
                                        <option value="verified">Verified</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                    <label className="sr-only" htmlFor="farmer-zone-filter">
                                        Filter farmers by service zone
                                    </label>
                                    <select
                                        id="farmer-zone-filter"
                                        value={farmerZoneFilter}
                                        onChange={(event) => setFarmerZoneFilter(event.target.value)}
                                        className="h-9 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                    >
                                        <option value="all">All service zones</option>
                                        {zones.map((zone) => (
                                            <option key={zone.id} value={zone.id}>
                                                {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <p className="mt-4 border-t border-[#eaecf0] pt-4 text-xs text-[#98a2b3]">
                                Crop, parcel-size, and bank filters require data sources that are not currently configured.
                            </p>
                        </section>
                        <CrudManager
                            id="farmer-crud"
                            title="Farmer"
                            records={filteredFarmers}
                            totalRecordCount={farmers.length}
                            emptyMessage={farmers.length === 0 ? 'No farmer records yet.' : 'No farmers match the current search and filters.'}
                            createUrl={route('farmers.store')}
                            updateUrl={(id) => route('farmers.update', { farmer: id })}
                            deleteUrl={(id) => route('farmers.destroy', { farmer: id })}
                            fields={[
                                { name: 'national_id', label: 'National ID', required: true },
                                { name: 'full_name', label: 'Full name', required: true },
                                { name: 'phone', label: 'Phone number', displayName: 'phone' },
                                {
                                    name: 'zone_id',
                                    label: 'Service zone',
                                    type: 'select',
                                    displayName: 'zone_name',
                                    options: zones.map((zone) => ({ label: zone.name, value: zone.id })),
                                },
                                {
                                    name: 'status',
                                    label: 'Verification status',
                                    type: 'select',
                                    required: true,
                                    options: [
                                        { label: 'Pending verification', value: 'pending_verification' },
                                        { label: 'Verified', value: 'verified' },
                                        { label: 'Suspended', value: 'suspended' },
                                    ],
                                },
                                { name: 'biometric_verified', label: 'Biometric verified', type: 'checkbox' },
                            ]}
                        />
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <Panel title="Farmer quota and voucher ledger" icon={ClipboardList} className="overflow-hidden">
                                <div className="border-t border-[#eaecf0] px-5 py-3 text-xs text-[#667085]">
                                    Live quota and voucher records from the ERP database.
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[720px] text-left">
                                        <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                            <tr>
                                                <th className="px-5 py-3">Farmer & registry ID</th>
                                                <th className="px-5 py-3">Commodity / cycle</th>
                                                <th className="px-5 py-3">Allocated</th>
                                                <th className="px-5 py-3">Disbursed / balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eaecf0]">
                                            {quotaLedger.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-5 py-16">
                                                        <EmptyState label="No farmer records available" className="h-36" />
                                                    </td>
                                                </tr>
                                            ) : (
                                                quotaLedger.map((entry) => {
                                                    const allocated = Number(entry.allocated_qty);
                                                    const disbursed = Number(entry.disbursed_qty);
                                                    const balance = Math.max(allocated - disbursed, 0);

                                                    return (
                                                        <tr key={entry.id} className="text-xs text-[#475467]">
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#101828]">{entry.farmer_name}</p>
                                                                <p className="mt-1 text-[#98a2b3]">{entry.national_id}</p>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#344054]">{entry.commodity_name}</p>
                                                                <p className="mt-1 text-[#98a2b3]">{entry.cycle_name}</p>
                                                            </td>
                                                            <td className="px-5 py-4">{allocated.toLocaleString()} MT</td>
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#175cd3]">
                                                                    {disbursed.toLocaleString()} MT disbursed
                                                                </p>
                                                                <p className="mt-1 text-[#667085]">{balance.toLocaleString()} MT remaining</p>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between border-t border-[#eaecf0] px-5 py-4 text-xs text-[#98a2b3]">
                                    <span>{quotaLedger.length} live quota records shown.</span>
                                    <div className="flex gap-1">
                                        <span className="flex size-7 items-center justify-center rounded bg-[#f2f4f7]">1</span>
                                        <span className="flex size-7 items-center justify-center rounded bg-[#f9fafb]">2</span>
                                    </div>
                                </div>
                                <CrudManager
                                    id="quota-crud"
                                    title="Farmer quota"
                                    records={quotaLedger}
                                    createUrl={route('farmer-quotas.store')}
                                    updateUrl={(id) => route('farmer-quotas.update', { farmerQuota: id })}
                                    deleteUrl={(id) => route('farmer-quotas.destroy', { farmerQuota: id })}
                                    fields={[
                                        {
                                            name: 'farmer_id',
                                            label: 'Farmer',
                                            type: 'select',
                                            required: true,
                                            displayName: 'farmer_name',
                                            options: quotaFarmers.map((farmer) => ({
                                                label: `${farmer.full_name} · ${farmer.national_id}`,
                                                value: farmer.id,
                                            })),
                                        },
                                        {
                                            name: 'cycle_id',
                                            label: 'Subsidy cycle',
                                            type: 'select',
                                            required: true,
                                            displayName: 'cycle_name',
                                            options: subsidyCycles.map((cycle) => ({ label: cycle.name, value: cycle.id })),
                                        },
                                        {
                                            name: 'commodity_id',
                                            label: 'Commodity',
                                            type: 'select',
                                            required: true,
                                            displayName: 'commodity_name',
                                            options: quotaCommodities.map((commodity) => ({
                                                label: `${commodity.name}${commodity.grade ? ` · ${commodity.grade}` : ''}`,
                                                value: commodity.id,
                                            })),
                                        },
                                        { name: 'allocated_qty', label: 'Allocated quantity (MT)', type: 'number', required: true },
                                        { name: 'disbursed_qty', label: 'Disbursed quantity (MT)', type: 'number', required: true },
                                    ]}
                                />
                            </Panel>
                            <div className="grid content-start gap-4">
                                <Panel title="Regional cadastral GIS" icon={MapPinned}>
                                    <div className="px-5 pb-5">
                                        <div
                                            className="relative h-48 overflow-hidden rounded-md bg-[#e9f7ef]"
                                            style={{
                                                backgroundImage:
                                                    'linear-gradient(30deg, transparent 47%, rgba(23,92,211,.18) 48%, rgba(23,92,211,.18) 52%, transparent 53%), linear-gradient(90deg, rgba(11,107,79,.10) 1px, transparent 1px), linear-gradient(rgba(11,107,79,.10) 1px, transparent 1px)',
                                                backgroundSize: '100% 100%, 28px 28px, 28px 28px',
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="rounded-md bg-white px-3 py-2 text-xs font-medium text-[#475467] shadow-sm">
                                                    GIS map ready for parcels
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div className="rounded-md bg-[#f5f8ff] p-3">
                                                <p className="text-xs text-[#667085]">Registry sync</p>
                                                <div className="mt-3 h-5 w-12 animate-pulse rounded bg-[#dbeafe]" />
                                            </div>
                                            <div className="rounded-md bg-[#f5f8ff] p-3">
                                                <p className="text-xs text-[#667085]">Parcel coverage</p>
                                                <div className="mt-3 h-5 w-12 animate-pulse rounded bg-[#dbeafe]" />
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Biometrics & integrity" icon={Fingerprint}>
                                    <div className="grid gap-2 px-5 pb-5">
                                        {['Identity verification', 'Duplicate claim prevention', 'Geo-fence enforcement'].map((label, index) => (
                                            <div key={label} className="flex items-center gap-3 rounded-md bg-[#f8fafc] p-3">
                                                <span className="flex size-8 items-center justify-center rounded-md bg-white text-[#175cd3]">
                                                    <ShieldCheck className="size-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-[#344054]">{label}</p>
                                                    <p className="mt-0.5 text-xs text-[#98a2b3]">No validation results</p>
                                                </div>
                                                <span className={`size-2 rounded-full ${index === 0 ? 'bg-[#d0d5dd]' : 'bg-[#e4e7ec]'}`} />
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <Panel title="Weekly distribution velocity" icon={Package}>
                                <div className="px-5 pb-5">
                                    <div className="mb-4 flex items-center justify-between text-xs text-[#667085]">
                                        <span>Distribution analytics will render from API feeds.</span>
                                        <span className="rounded bg-[#eff4ff] px-2 py-1 font-medium text-[#175cd3]">Analytics ready</span>
                                    </div>
                                    <div className="flex h-48 items-end gap-2 rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] p-5">
                                        {Array.from({ length: 12 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 rounded-t bg-[#dbeafe]"
                                                style={{ height: `${25 + ((index * 13) % 50)}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Panel>
                            <Panel title="Subsidy release timeline" icon={Map}>
                                <div className="px-5 pb-5">
                                    <EmptyState label="No release schedule available" className="h-44" />
                                </div>
                            </Panel>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
