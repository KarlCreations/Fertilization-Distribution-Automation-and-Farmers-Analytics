import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BarChart3,
    BookOpenCheck,
    BriefcaseBusiness,
    Building2,
    ChartNoAxesCombined,
    FileDown,
    FileText,
    Landmark,
    LayoutDashboard,
    Leaf,
    LogOut,
    Play,
    Plus,
    ReceiptText,
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

import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const metrics = [
    { key: 'tradeValue', label: 'Committed trade value', icon: Landmark, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { key: 'quotaDisbursed', label: 'Quota disbursed (MT)', icon: WalletCards, tone: 'bg-[#ecfdf3] text-[#067647]' },
    { key: 'quotaAllocated', label: 'Quota allocated (MT)', icon: ReceiptText, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
    { key: 'tradeVolume', label: 'Contract volume (MT)', icon: ChartNoAxesCombined, tone: 'bg-[#fffaeb] text-[#b54708]' },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof Landmark;
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
                    <Building2 className="size-4" />
                    Inventory
                </Link>
                <Link
                    href={route('sales-commodities')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <Truck className="size-4" />
                    Trade hub
                </Link>
                <Link
                    href={route('finance-impact')}
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
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

type FinanceRecord = {
    contract_ref: string;
    counterparty: string | null;
    status: string;
    contract_type: string;
    volume_mt: number | null;
    price_per_mt: number | null;
    commodity_name: string;
};

export default function FinanceImpact({
    financeMetrics,
    financeRecords,
}: {
    financeMetrics: Record<string, number>;
    financeRecords: FinanceRecord[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [financeSearch, setFinanceSearch] = useState('');
    const [financeContractType, setFinanceContractType] = useState('all');
    const [financeStatus, setFinanceStatus] = useState('all');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const filteredFinanceRecords = financeRecords.filter((record) => {
        const matchesType = financeContractType === 'all' || record.contract_type === financeContractType;
        const matchesStatus = financeStatus === 'all' || record.status === financeStatus;
        const searchableText = [record.contract_ref, record.counterparty ?? '', record.commodity_name, record.contract_type, record.status]
            .join(' ')
            .toLowerCase();

        return matchesType && matchesStatus && searchableText.includes(financeSearch.trim().toLowerCase());
    });

    function exportFinanceLedger() {
        const headers = ['Contract reference', 'Counterparty', 'Commodity', 'Type', 'Status', 'Volume (MT)', 'Price per MT', 'Committed value'];
        const rows = filteredFinanceRecords.map((record) => [
            record.contract_ref,
            record.counterparty ?? '',
            record.commodity_name,
            record.contract_type,
            record.status,
            record.volume_mt ?? 0,
            record.price_per_mt ?? 0,
            Number(record.volume_mt ?? 0) * Number(record.price_per_mt ?? 0),
        ]);
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const download = document.createElement('a');
        download.href = url;
        download.download = 'finance-ledger.csv';
        download.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Head title="Finance & impact" />
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
                        <span className="sr-only">Search finance workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search ledger, settlement, or counterparty"
                            value={financeSearch}
                            onChange={(event) => setFinanceSearch(event.target.value)}
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
                                    <span className="text-[#175cd3]">Finance & impact</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Finance, treasury & economic impact</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Review treasury, disbursements, financial scenarios, receivables, and compliance from a connected financial
                                    workspace.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <FileDown className="size-4" />
                                    Export audit trail
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <FileText className="size-4" />
                                    Statements
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Disbursement batch
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Financial metrics">
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
                                            ? `$${(financeMetrics[key] ?? 0).toLocaleString()}`
                                            : (financeMetrics[key] ?? 0).toLocaleString()}
                                    </p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Calculated from SQLite records</p>
                                </article>
                            ))}
                        </section>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Liquidity & yield scenario matrix" icon={Sparkles}>
                                    <div className="flex flex-wrap gap-2 px-5 pb-4">
                                        <button
                                            type="button"
                                            disabled
                                            title="Financial scenario models are not configured."
                                            className="h-8 cursor-not-allowed rounded-md bg-[#101828] px-3 text-xs font-medium text-white opacity-50"
                                        >
                                            Baseline scenario
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            title="Financial scenario models are not configured."
                                            className="h-8 cursor-not-allowed rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] opacity-50"
                                        >
                                            Commodity shock
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            title="Financial scenario models are not configured."
                                            className="h-8 cursor-not-allowed rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] opacity-50"
                                        >
                                            Climate scenario
                                        </button>
                                        <button
                                            type="button"
                                            disabled
                                            title="Financial scenario models are not configured."
                                            className="ml-auto flex h-8 cursor-not-allowed items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467] opacity-50"
                                        >
                                            <Play className="size-3.5" />
                                            Run simulation
                                        </button>
                                    </div>
                                    <div className="grid gap-3 px-5 sm:grid-cols-3">
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Projected net revenue</p>
                                            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-[#dbeafe]" />
                                        </div>
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Subsidy support burden</p>
                                            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-[#dbeafe]" />
                                        </div>
                                        <div className="rounded-md bg-[#f5f8ff] p-4">
                                            <p className="text-xs text-[#667085]">Working capital buffer</p>
                                            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-[#dbeafe]" />
                                        </div>
                                    </div>
                                    <div className="px-5 pt-5 pb-5">
                                        <div className="relative h-48 overflow-hidden rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe]">
                                            <div className="absolute inset-x-5 top-1/4 border-t border-[#dbeafe]" />
                                            <div className="absolute inset-x-5 top-1/2 border-t border-[#dbeafe]" />
                                            <div className="absolute inset-x-5 top-3/4 border-t border-[#dbeafe]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="rounded-md bg-white px-3 py-2 text-xs font-medium text-[#667085] shadow-sm">
                                                    Scenario curve will populate from analytics API
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mx-5 mb-5 flex gap-3 rounded-md bg-[#f5f8ff] p-4">
                                        <ShieldCheck className="size-4 shrink-0 text-[#175cd3]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#344054]">Finance advisory</p>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                                                Scenario guidance and risk signals will appear after financial models are configured.
                                            </p>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Trade contract financial ledger" icon={BookOpenCheck} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-[#667085]">
                                            Showing {filteredFinanceRecords.length} of {financeRecords.length} contract records from SQLite.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <label className="sr-only" htmlFor="finance-contract-type">
                                                Filter by contract type
                                            </label>
                                            <select
                                                id="finance-contract-type"
                                                value={financeContractType}
                                                onChange={(event) => setFinanceContractType(event.target.value)}
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                <option value="all">All contract types</option>
                                                {[...new Set(financeRecords.map((record) => record.contract_type))].map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                            <label className="sr-only" htmlFor="finance-status">
                                                Filter by contract status
                                            </label>
                                            <select
                                                id="finance-status"
                                                value={financeStatus}
                                                onChange={(event) => setFinanceStatus(event.target.value)}
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                <option value="all">All statuses</option>
                                                {[...new Set(financeRecords.map((record) => record.status))].map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={exportFinanceLedger}
                                                className="flex h-8 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                <FileDown className="size-3.5" />
                                                Export CSV
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[720px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">Batch identifier</th>
                                                    <th className="px-5 py-3">Beneficiary / channel</th>
                                                    <th className="px-5 py-3">Vouchers</th>
                                                    <th className="px-5 py-3">Settled amount</th>
                                                    <th className="px-5 py-3">Audit status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {filteredFinanceRecords.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-5 py-16">
                                                            <EmptyState
                                                                title={
                                                                    financeRecords.length === 0
                                                                        ? 'No contract records yet'
                                                                        : 'No contracts match these filters'
                                                                }
                                                                description={
                                                                    financeRecords.length === 0
                                                                        ? 'Trade contract values will appear here when entered.'
                                                                        : 'Change the filters or search text to see other records.'
                                                                }
                                                                className="h-36"
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredFinanceRecords.map((record) => (
                                                        <tr key={record.contract_ref} className="text-xs text-[#475467]">
                                                            <td className="px-5 py-4 font-medium text-[#101828]">{record.contract_ref}</td>
                                                            <td className="px-5 py-4">
                                                                {record.counterparty ?? '—'} · {record.commodity_name}
                                                            </td>
                                                            <td className="px-5 py-4">{record.contract_type}</td>
                                                            <td className="px-5 py-4">
                                                                ${(Number(record.volume_mt ?? 0) * Number(record.price_per_mt ?? 0)).toLocaleString()}
                                                            </td>
                                                            <td className="px-5 py-4 capitalize">{record.status}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Budget vs. actual variance" icon={BarChart3}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No budget data available"
                                            description="Budget pacing and variance will appear after allocation data is connected."
                                            className="h-56"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Letters of credit & receivables" icon={BriefcaseBusiness}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No receivables available"
                                            description="Counterparty and settlement instruments will appear here."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                                <section className="rounded-lg bg-[#101828] p-5 text-white shadow-[0_1px_2px_rgba(16,24,40,0.2)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <BadgeDollarSign className="size-4 text-[#84adff]" />
                                        Regulatory compliance
                                    </div>
                                    <p className="mt-4 text-sm font-medium">Compliance records are ready for connection</p>
                                    <p className="mt-2 text-xs leading-5 text-[#cbd5e1]">
                                        Audit seals, ledger anchoring, and review milestones will populate here from your registry.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={exportFinanceLedger}
                                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#175cd3] px-3 text-xs font-semibold text-white"
                                    >
                                        <FileDown className="size-3.5" />
                                        Download finance ledger
                                    </button>
                                </section>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
