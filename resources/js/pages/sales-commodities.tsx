import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChartNoAxesCombined,
    FileCheck2,
    Landmark,
    LayoutDashboard,
    Leaf,
    LogOut,
    Package,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
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

const metrics = [
    { key: 'tradeVolume', label: 'Total trade volume (MT)', icon: ChartNoAxesCombined, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { key: 'activeContracts', label: 'Active contracts', icon: Truck, tone: 'bg-[#ecfdf3] text-[#067647]' },
    { key: 'exportContracts', label: 'Export contracts', icon: Package, tone: 'bg-[#fff1f0] text-[#d92d20]' },
    { key: 'tradeValue', label: 'Committed trade value', icon: Landmark, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
    id,
}: {
    title: string;
    icon: typeof Truck;
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <section id={id} className={`rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
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
                    <Building2 className="size-4" />
                    Inventory
                </Link>
                <Link
                    href={route('sales-commodities')}
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
                >
                    <Truck className="size-4" />
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
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
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

type Contract = {
    id: number;
    contract_ref: string;
    counterparty: string | null;
    status: string;
    contract_type: string;
    volume_mt: number | null;
    price_per_mt: number | null;
    commodity_id: number;
    commodity_name: string;
    grade: string | null;
};

export default function SalesCommodities({
    salesMetrics,
    contracts,
    commodities,
    commodityRecords,
}: {
    salesMetrics: Record<string, number>;
    contracts: Contract[];
    commodities: { id: number; name: string; grade: string | null }[];
    commodityRecords: {
        id: number;
        sku: string;
        name: string;
        category: string;
        grade: string | null;
        unit: string;
        is_hazardous: boolean;
    }[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [contractTypeFilter, setContractTypeFilter] = useState<'all' | 'export' | 'domestic'>('all');
    const [contractSearch, setContractSearch] = useState('');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const columns = ['Contract & reference', 'Counterparty', 'Commodity & grade', 'Volume & terms', 'Logistics / manifest', 'Settlement'];
    const filteredContracts = contracts.filter((contract) => {
        const matchesType = contractTypeFilter === 'all' || contract.contract_type === contractTypeFilter;
        const searchableText = [
            contract.contract_ref,
            contract.counterparty ?? '',
            contract.commodity_name,
            contract.grade ?? '',
            contract.status,
            contract.contract_type,
        ]
            .join(' ')
            .toLowerCase();

        return matchesType && searchableText.includes(contractSearch.trim().toLowerCase());
    });

    function exportContracts() {
        const headers = ['Contract reference', 'Counterparty', 'Commodity', 'Grade', 'Type', 'Status', 'Volume (MT)', 'Price per MT'];
        const rows = filteredContracts.map((contract) => [
            contract.contract_ref,
            contract.counterparty ?? '',
            contract.commodity_name,
            contract.grade ?? '',
            contract.contract_type,
            contract.status,
            contract.volume_mt ?? 0,
            contract.price_per_mt ?? 0,
        ]);
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const download = document.createElement('a');
        download.href = url;
        download.download = 'trade-contracts.csv';
        download.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Head title="Sales & commodities" />
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
                        <span className="sr-only">Search trade workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search contracts, cargo, or commodity"
                            value={contractSearch}
                            onChange={(event) => setContractSearch(event.target.value)}
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
                                    <span className="text-[#175cd3]">Sales & commodities</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Sales & commodities trade hub</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Manage contracts, cargo, commodity pricing, trade execution, import/export activity, and multi-depot sales orders.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled
                                    title="Hedge positions and market feeds are not configured."
                                    className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054] opacity-50"
                                >
                                    <Sparkles className="size-4" />
                                    Hedging calculator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('trade-contracts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <FileCheck2 className="size-4" />
                                    Order monitoring
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('contract-crud')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    New trade contract
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Trade metrics">
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
                                    <p className="mt-5 text-2xl font-semibold text-[#101828]">
                                        {key === 'tradeValue'
                                            ? `$${(salesMetrics[key] ?? 0).toLocaleString()}`
                                            : (salesMetrics[key] ?? 0).toLocaleString()}
                                    </p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from SQLite</p>
                                </article>
                            ))}
                        </section>
                        <CrudManager
                            id="contract-crud"
                            title="Trade contract"
                            records={contracts}
                            createUrl={route('trade-contracts.store')}
                            updateUrl={(id) => route('trade-contracts.update', { tradeContract: id })}
                            deleteUrl={(id) => route('trade-contracts.destroy', { tradeContract: id })}
                            fields={[
                                { name: 'contract_ref', label: 'Contract reference', required: true },
                                { name: 'counterparty', label: 'Counterparty' },
                                {
                                    name: 'commodity_id',
                                    label: 'Commodity',
                                    type: 'select',
                                    required: true,
                                    displayName: 'commodity_name',
                                    options: commodities.map((commodity) => ({
                                        label: `${commodity.name}${commodity.grade ? ` · ${commodity.grade}` : ''}`,
                                        value: commodity.id,
                                    })),
                                },
                                {
                                    name: 'contract_type',
                                    label: 'Contract type',
                                    type: 'select',
                                    required: true,
                                    options: [
                                        { label: 'Domestic', value: 'domestic' },
                                        { label: 'Export', value: 'export' },
                                    ],
                                },
                                {
                                    name: 'status',
                                    label: 'Status',
                                    type: 'select',
                                    required: true,
                                    options: ['draft', 'active', 'completed', 'cancelled'].map((status) => ({ label: status, value: status })),
                                },
                                { name: 'volume_mt', label: 'Volume (MT)', type: 'number' },
                                { name: 'price_per_mt', label: 'Price per MT', type: 'number' },
                            ]}
                        />
                        <CrudManager
                            id="commodity-crud"
                            title="Commodity"
                            records={commodityRecords}
                            createUrl={route('commodities.store')}
                            updateUrl={(id) => route('commodities.update', { commodity: id })}
                            deleteUrl={(id) => route('commodities.destroy', { commodity: id })}
                            fields={[
                                { name: 'sku', label: 'SKU', required: true },
                                { name: 'name', label: 'Commodity name', required: true },
                                { name: 'category', label: 'Category', required: true },
                                { name: 'grade', label: 'Grade' },
                                { name: 'unit', label: 'Unit', required: true },
                                { name: 'is_hazardous', label: 'Hazardous material', type: 'checkbox' },
                            ]}
                        />
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Active contracts & cargo execution" icon={Truck} className="overflow-hidden" id="trade-contracts">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setContractTypeFilter('all')}
                                                className={`h-8 rounded-md px-3 text-xs font-medium ${contractTypeFilter === 'all' ? 'bg-[#101828] text-white' : 'bg-[#f2f4f7] text-[#475467]'}`}
                                            >
                                                All contracts
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setContractTypeFilter('export')}
                                                className={`h-8 rounded-md px-3 text-xs font-medium ${contractTypeFilter === 'export' ? 'bg-[#101828] text-white' : 'bg-[#f2f4f7] text-[#475467]'}`}
                                            >
                                                Export
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setContractTypeFilter('domestic')}
                                                className={`h-8 rounded-md px-3 text-xs font-medium ${contractTypeFilter === 'domestic' ? 'bg-[#101828] text-white' : 'bg-[#f2f4f7] text-[#475467]'}`}
                                            >
                                                Domestic
                                            </button>
                                            <button
                                                type="button"
                                                onClick={exportContracts}
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                Export CSV
                                            </button>
                                        </div>
                                        <label className="relative min-w-0 flex-1">
                                            <span className="sr-only">Filter contracts</span>
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#98a2b3]" />
                                            <input
                                                className="h-8 w-full rounded-md bg-[#f9fafb] pr-3 pl-8 text-xs placeholder:text-[#98a2b3]"
                                                placeholder="Filter counterparty, vessel, or specification"
                                                value={contractSearch}
                                                onChange={(event) => setContractSearch(event.target.value)}
                                            />
                                        </label>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[800px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th key={column} className="px-5 py-3">
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {filteredContracts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 py-16">
                                                            <EmptyState
                                                                title={
                                                                    contracts.length === 0
                                                                        ? 'No trade contracts yet'
                                                                        : 'No contracts match these filters'
                                                                }
                                                                description={
                                                                    contracts.length === 0
                                                                        ? 'Create a contract to start tracking commercial activity.'
                                                                        : 'Change the contract type or search text to see other records.'
                                                                }
                                                                className="h-36"
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredContracts.map((contract) => (
                                                        <tr key={contract.id} className="text-xs text-[#475467]">
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#101828]">{contract.contract_ref}</p>
                                                                <p className="mt-1 capitalize">{contract.contract_type}</p>
                                                            </td>
                                                            <td className="px-5 py-4">{contract.counterparty ?? '—'}</td>
                                                            <td className="px-5 py-4">
                                                                {contract.commodity_name}
                                                                {contract.grade ? ` · ${contract.grade}` : ''}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                {Number(contract.volume_mt ?? 0).toLocaleString()} MT
                                                                <br />${Number(contract.price_per_mt ?? 0).toLocaleString()} / MT
                                                            </td>
                                                            <td className="px-5 py-4 capitalize">{contract.status}</td>
                                                            <td className="px-5 py-4">
                                                                {(
                                                                    Number(contract.volume_mt ?? 0) * Number(contract.price_per_mt ?? 0)
                                                                ).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#eaecf0] px-5 py-4 text-xs text-[#98a2b3]">
                                        <span>
                                            Showing {filteredContracts.length} of {contracts.length} trade contracts loaded from SQLite.
                                        </span>
                                    </div>
                                </Panel>
                                <Panel title="Import reorder recommendation engine" icon={Sparkles}>
                                    <div className="grid gap-3 px-5 pb-5 md:grid-cols-3">
                                        {['Priority reorders', 'Market advisory', 'Stock balancing'].map((label) => (
                                            <EmptyState
                                                key={label}
                                                title={label}
                                                description="Recommendations will be generated from inventory and trade analytics."
                                                className="h-40"
                                            />
                                        ))}
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Live commodities desk" icon={ChartNoAxesCombined}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="Market feeds not connected"
                                            description="Live commodity quotes, spreads, and hedge positions will appear here."
                                            className="h-52"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Fleet & port schedule" icon={Truck}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No active vessel or rail movements"
                                            description="Arrival schedules, cargo status, and port events will render here."
                                            className="h-52"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Letters of credit & trade compliance" icon={ShieldCheck}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No compliance records available"
                                            description="Letters of credit, documents, and counterparty checks will appear here."
                                            className="h-44"
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
