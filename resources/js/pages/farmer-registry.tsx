import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    CircleHelp,
    Edit3,
    Leaf,
    Menu,
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
    ShieldCheck,
    Trash2,
    UserPlus,
    Sprout,
    Truck,
    UsersRound,
    X,
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

type Zone = {
    id: number;
    name: string;
};

type RegistryMetrics = {
    registeredFarmers: number;
    pendingVerification: number;
    verifiedFarmers: number;
};

type FarmerRegistryProps = SharedData & {
    registryMetrics: RegistryMetrics;
    farmers: Farmer[];
    zones: Zone[];
    flash?: {
        success?: string;
        error?: string;
    };
};

type FarmerFormData = {
type QuotaLedgerEntry = {
    id: number;
    farmer_id: number;
    cycle_id: number;
    commodity_id: number;
    farmer_name: string;
    national_id: string;
    full_name: string;
    phone: string;
    zone_id: string;
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

                        <div className="min-w-0">
                            <span className="block truncate text-sm font-bold tracking-tight text-[#173d2b] sm:text-base">
                                {systemName}
                            </span>
                            <span className="hidden text-[11px] text-[#829488] sm:block">
                                Fertilizer Distribution Management
                            </span>
                        </div>
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
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium">
                                    <span className="rounded-md bg-[#e7f3e9] px-2 py-1 text-[#42624d]">
                                        Subsidy
                                    </span>
                                    <span className="text-[#a2b1a6]">/</span>
                                    <span className="text-[#176b45]">
                                        Farmer Management
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-[#173d2b] sm:text-3xl">
                                    Farmer Management
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718176]">
                                    Register, verify, update, and manage farmer
                                    records for subsidy distribution.
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

                        {/* Success message */}
                        {flash?.success && (
                            <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#b8e2c5] bg-[#edf9f0] px-4 py-3.5 text-sm text-[#176b45] shadow-sm">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                                    <CheckCircle2 className="size-4" />
                                </span>
                                <span className="font-medium">
                                    {flash.success}
                                </span>
                            </div>
                        )}

                        {/* General error */}
                        {errors?.farmer && (
                            <div className="mb-5 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3.5 text-sm text-[#b42318]">
                                {errors.farmer}
                            </div>
                        )}

                        {/* Metrics */}
                        <section
                            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                            aria-label="Farmer metrics"
                        >
                            <MetricCard
                                label="Registered Farmers"
                                description="Total farmer records"
                                value={registryMetrics.registeredFarmers}
                                icon={UsersRound}
                                tone="green"
                            />

                            <MetricCard
                                label="Pending Verification"
                                description="Awaiting verification"
                                value={registryMetrics.pendingVerification}
                                icon={ShieldCheck}
                                tone="amber"
                            />

                            <MetricCard
                                label="Verified Farmers"
                                description="Verified farmer records"
                                value={registryMetrics.verifiedFarmers}
                                icon={CheckCircle2}
                                tone="green"
                            />
                        </section>

                        {/* Search and filters */}
                        <section className="mt-6 rounded-xl border border-[#e0ebe3] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#eaf7ef] text-[#176b45]">
                                    <Search className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[#234832]">
                                        Find Farmers
                                    </h2>
                                    <p className="text-xs text-[#829488]">
                                        Search and filter registered records
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <label className="relative min-w-0 flex-1">
                                    <span className="sr-only">
                                        Search farmers
                                    </span>

                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a99d]" />

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

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dcebe0] bg-[#f5faf6] px-3 py-1.5 text-xs font-semibold text-[#42624d]">
                                    <span className="size-1.5 rounded-full bg-[#29965d]" />
                                    {filteredFarmers.length} records
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left">
                                    <thead className="bg-[#f0f7f2] text-[10px] font-bold tracking-[0.08em] text-[#42624d] uppercase">
                                        <tr>
                                            <th className="px-5 py-4">
                                                Farmer
                                            </th>
                                            <th className="px-5 py-4">
                                                National ID
                                            </th>
                                            <th className="px-5 py-4">
                                                Phone
                                            </th>
                                            <th className="px-5 py-4">
                                                Zone
                                            </th>
                                            <th className="px-5 py-4">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#edf2ee]">
                                        {filteredFarmers.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-5 py-16 text-center"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f0f7f2]">
                                                            <UsersRound className="size-7 text-[#86a18e]" />
                                                        </div>

                                                        <p className="mt-4 text-sm font-semibold text-[#344b3b]">
                                                            No farmers found
                                                        </p>

                                                        <p className="mt-1 max-w-xs text-xs leading-5 text-[#829488]">
                                                            No records match
                                                            your search. Try
                                                            another name or
                                                            change your filter.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFarmers.map((farmer) => (
                                                <tr
                                                    key={farmer.id}
                                                    className="text-sm text-[#475b4c] transition-colors hover:bg-[#f7fbf8]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f3e9] text-xs font-bold text-[#176b45]">
                                                                {farmer.full_name
                                                                    .split(' ')
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .slice(0, 2)
                                                                    .map(
                                                                        (part) =>
                                                                            part[0],
                                                                    )
                                                                    .join('')
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-[#234832]">
                                                                    {
                                                                        farmer.full_name
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#98a99d]">
                                                                    Farmer #
                                                                    {
                                                                        farmer.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 font-medium text-[#475b4c]">
                                                        {farmer.national_id}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.phone || (
                                                            <span className="text-[#a3b0a7]">
                                                                Not provided
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.zone_name || (
                                                            <span className="inline-flex items-center rounded-md bg-[#f5f7f5] px-2 py-1 text-xs text-[#98a99d]">
                                                                No zone
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {farmer.biometric_verified ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b8e2c5] bg-[#edf9f0] px-2.5 py-1.5 text-xs font-semibold text-[#176b45]">
                                                                <CheckCircle2 className="size-3.5" />
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f1dfae] bg-[#fff8e7] px-2.5 py-1.5 text-xs font-semibold text-[#a15c07]">
                                                                <ShieldCheck className="size-3.5" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        farmer,
                                                                    )
                                                                }
                                                                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#d5e3d9] bg-white px-3 text-xs font-semibold text-[#42624d] transition hover:border-[#a8cdb2] hover:bg-[#f0f7f2] hover:text-[#176b45]"
                                                            >
                                                                <Edit3 className="size-3.5" />
                                                                Edit
                                                            </button>

                                                            {!farmer.biometric_verified && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        verifyFarmer(
                                                                            farmer,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    className="flex h-9 items-center gap-1.5 rounded-lg border border-[#b8e2c5] bg-[#edf9f0] px-3 text-xs font-semibold text-[#176b45] transition hover:bg-[#d9f1df] disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <ShieldCheck className="size-3.5" />
                                                                    Verify
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteFarmer(
                                                                        farmer,
                                                                    )
                                                                }
                                                                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#fecdca] bg-[#fff6f5] px-3 text-xs font-semibold text-[#b42318] transition hover:bg-[#fee4e2]"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
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

                                    <div>
                                        <h2 className="text-base font-bold text-[#173d2b]">
                                            {editingFarmer
                                                ? 'Edit Farmer'
                                                : 'Register Farmer'}
                                        </h2>

                                        <p className="mt-1 text-xs text-[#829488]">
                                            {editingFarmer
                                                ? 'Update the farmer information below.'
                                                : 'Enter the farmer information to create a new record.'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={processing}
                                    aria-label="Close form"
                                    className="flex size-9 items-center justify-center rounded-lg text-[#718176] transition hover:bg-[#eaf2ec] hover:text-[#176b45] disabled:opacity-50"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={submitForm}
                                className="space-y-4 p-5 sm:p-6"
                            >
                                <FormField
                                    label="Full Name"
                                    required
                                    error={formErrors.full_name}
                                >
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(event) =>
                                            setData(
                                                'full_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter farmer's full name"
                                        className={inputClass}
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="National ID"
                                    required
                                    error={formErrors.national_id}
                                >
                                    <input
                                        type="text"
                                        value={data.national_id}
                                        onChange={(event) =>
                                            setData(
                                                'national_id',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter national ID"
                                        className={inputClass}
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number"
                                    error={formErrors.phone}
                                >
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField
                                    label="Service Zone"
                                    error={formErrors.zone_id}
                                >
                                    <select
                                        value={data.zone_id}
                                        onChange={(event) =>
                                            setData(
                                                'zone_id',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select a zone
                                        </option>

                                        {zones.map((zone) => (
                                            <option
                                                key={zone.id}
                                                value={zone.id}
                                            >
                                                {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <div className="flex flex-col-reverse gap-2 border-t border-[#e6eee8] pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        disabled={processing}
                                        className="h-10 rounded-lg border border-[#d5e3d9] bg-white px-5 text-sm font-semibold text-[#42624d] transition hover:bg-[#f5faf6] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#176b45] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <UserPlus className="size-4" />

                                        {processing
                                            ? 'Saving...'
                                            : editingFarmer
                                              ? 'Save Changes'
                                              : 'Register Farmer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete confirmation modal */}
                {deleteFarmer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102c1d]/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e0ebe3] bg-white shadow-2xl">
                            <div className="p-6">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff0ee] text-[#c43226]">
                                    <Trash2 className="size-5" />
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-[#173d2b]">
                                    Delete farmer?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#718176]">
                                    You are about to delete{' '}
                                    <strong className="font-semibold text-[#344b3b]">
                                        {deleteFarmer.full_name}
                                    </strong>
                                    . This action cannot be undone.
                                </p>

                                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteFarmer(null)
                                        }
                                        className="h-10 rounded-lg border border-[#d5e3d9] px-5 text-sm font-semibold text-[#42624d] transition hover:bg-[#f5faf6]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        disabled={processing}
                                        className="h-10 rounded-lg bg-[#c43226] px-5 text-sm font-semibold text-white transition hover:bg-[#a9271d] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Deleting...'
                                            : 'Delete Farmer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function MetricCard({
    label,
    description,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    description: string;
    value: number;
    icon: typeof UsersRound;
    tone: 'green' | 'amber';
}) {
    const styles = {
        green: {
            icon: 'bg-[#eaf7ef] text-[#176b45]',
            accent: 'bg-[#29965d]',
        },
        amber: {
            icon: 'bg-[#fff6df] text-[#a15c07]',
            accent: 'bg-[#d99a28]',
        },
    };

    return (
        <article className="group relative overflow-hidden rounded-xl border border-[#e0ebe3] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d8c1] hover:shadow-md">
            <div
                className={`absolute top-0 left-0 h-full w-1 ${styles[tone].accent} opacity-80`}
            />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#42624d]">
                        {label}
                    </p>
                    <p className="mt-1 text-xs text-[#98a99d]">
                        {description}
                    </p>
                </div>

                <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${styles[tone].icon}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>

            <div className="mt-6 flex items-end justify-between">
                <p className="text-3xl font-bold tracking-tight text-[#173d2b]">
                    {value.toLocaleString()}
                </p>
                <span className="mb-1 text-xs font-medium text-[#829488]">
                    Total
                </span>
            </div>
        </article>
    );
}

function FormField({
    label,
    required = false,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#344b3b]">
                {label}
                {required && (
                    <span className="ml-1 text-[#c43226]">*</span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-[#b42318]">
                    {error}
                </p>
            )}
        </div>
    );
}
