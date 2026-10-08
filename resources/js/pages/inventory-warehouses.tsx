import { Head, Link, usePage, usePoll } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Boxes,
    Building2,
    ChevronDown,
    ClipboardList,
    Download,
    FileCheck2,
    Gauge,
    LayoutDashboard,
    Leaf,
    LogOut,
    MapPin,
    Package,
    Plus,
    Radio,
    ReceiptText,
    RefreshCw,
    Search,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sprout,
    Truck,
    UsersRound,
    WalletCards,
    Warehouse,
} from 'lucide-react';

import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import CrudManager from '@/components/crud-manager';
import StockMovementDialog from '@/components/stock-movement-dialog';
import { type SharedData } from '@/types';

const metrics = [
    { key: 'stockOnHand', label: 'Stock on hand (MT)', icon: Boxes, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { key: 'reorderAlerts', label: 'Reorder alerts', icon: ShieldCheck, tone: 'bg-[#fff1f0] text-[#d92d20]' },
    { key: 'batchCount', label: 'Stock batches', icon: Truck, tone: 'bg-[#eff4ff] text-[#175cd3]' },
    { key: 'depotCount', label: 'Active depots', icon: RefreshCw, tone: 'bg-[#ecfdf3] text-[#067647]' },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof Warehouse;
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
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
                >
                    <Package className="size-4" />
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
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
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

type StockRecord = {
    id: number;
    depot_id: number;
    batch_id: number;
    commodity_id: number;
    sku: string;
    commodity_name: string;
    depot_name: string;
    lot_no: string;
    on_hand_qty: number;
    capacity_qty: number | null;
    reorder_point: number | null;
    runway_days: number | null;
    status: string | null;
};
type DepotUtilization = { id: number; name: string; capacity_mt: number | null; on_hand_qty: number };
type InventoryEvent = {
    id: number;
    action: 'transferred' | 'reconciled';
    target_id: string | null;
    payload: Record<string, unknown>;
    created_at: string;
    user_name: string;
};

function exportStockRecords(records: StockRecord[]) {
    const columns: { label: string; value: (record: StockRecord) => string | number }[] = [
        { label: 'SKU', value: (record) => record.sku },
        { label: 'Commodity', value: (record) => record.commodity_name },
        { label: 'Batch', value: (record) => record.lot_no },
        { label: 'Depot', value: (record) => record.depot_name },
        { label: 'On hand (MT)', value: (record) => record.on_hand_qty },
        { label: 'Capacity (MT)', value: (record) => record.capacity_qty ?? '' },
        { label: 'Reorder point (MT)', value: (record) => record.reorder_point ?? '' },
        { label: 'Runway (days)', value: (record) => record.runway_days ?? '' },
        { label: 'Status', value: (record) => record.status ?? 'available' },
    ];
    const csv = [
        columns.map(({ label }) => `"${label}"`).join(','),
        ...records.map((record) => columns
            .map(({ value }) => `"${String(value(record)).replaceAll('"', '""')}"`)
            .join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const download = document.createElement('a');
    download.href = url;
    download.download = 'inventory-stock.csv';
    download.click();
    URL.revokeObjectURL(url);
}

export default function InventoryWarehouses({
    inventoryMetrics,
    stockRecords,
    depots,
    depotUtilization,
    recentInventoryEvents,
    latestReconciliation,
    commodities,
    batches,
}: {
    inventoryMetrics: Record<string, number>;
    stockRecords: StockRecord[];
    depots: { id: number; name: string }[];
    depotUtilization: DepotUtilization[];
    recentInventoryEvents: InventoryEvent[];
    latestReconciliation: { created_at: string; target_id: string | null; user_name: string | null } | null;
    commodities: { id: number; name: string; sku: string }[];
    batches: { id: number; lot_no: string; commodity_id: number }[];
}) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const stockColumns = ['SKU & batch trace', 'Depot / physical bay', 'Capacity & reorder line', 'On-hand stock', 'Runway & status'];

    usePoll(30_000, {
        only: ['inventoryMetrics', 'stockRecords', 'depotUtilization', 'recentInventoryEvents', 'latestReconciliation'],
    });
    const [workflow, setWorkflow] = useState<'transfer' | 'reconcile' | null>(null);
    const [search, setSearch] = useState('');
    const [commodityFilter, setCommodityFilter] = useState('');
    const [depotFilter, setDepotFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const filteredStockRecords = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        return stockRecords.filter((stock) => {
            const matchesSearch = !query || [
                stock.sku,
                stock.commodity_name,
                stock.depot_name,
                stock.lot_no,
                stock.status ?? '',
            ].some((value) => value.toLocaleLowerCase().includes(query));

            return matchesSearch
                && (!commodityFilter || String(stock.commodity_id) === commodityFilter)
                && (!depotFilter || String(stock.depot_id) === depotFilter)
                && (!statusFilter || stock.status === statusFilter);
        });
    }, [commodityFilter, depotFilter, search, statusFilter, stockRecords]);
    const reorderRecords = stockRecords.filter((stock) => stock.status === 'reorder_due' || stock.status === 'out_of_stock');
    const totalDepotCapacity = depotUtilization.reduce((total, depot) => total + (depot.capacity_mt ?? 0), 0);
    const totalDepotStock = depotUtilization.reduce((total, depot) => total + depot.on_hand_qty, 0);
    const networkCapacityPercentage = totalDepotCapacity > 0 ? Math.min((totalDepotStock / totalDepotCapacity) * 100, 100) : null;
    const transferCount = inventoryMetrics.transferCount ?? 0;
    const reconciliationCount = inventoryMetrics.reconciliationCount ?? 0;

    return (
        <>
            <Head title="Inventory & warehouses" />
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
                        <span className="sr-only">Search inventory</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search inventory, depot, or batch"
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
                                    <span className="text-[#175cd3]">Inventory & warehouses</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Inventory & warehouse control</h1>
                                    <span className="flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-medium text-[#067647]">
                                        <Radio className="size-3" />
                                        Live telemetry ready
                                    </span>
                                </div>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Monitor depot stock, inbound activity, facility capacity, and material movement from connected sources.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setWorkflow('transfer')}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Building2 className="size-4" />
                                    Transfer depots
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWorkflow('reconcile')}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <ReceiptText className="size-4" />
                                    Reconcile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('stock-crud')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Stock receipt
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory metrics">
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
                                    <p className="mt-5 text-2xl font-semibold text-[#101828]">{(inventoryMetrics[key] ?? 0).toLocaleString()}</p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from SQLite</p>
                                </article>
                            ))}
                        </section>
                        <CrudManager
                            id="stock-crud"
                            title="Stock level"
                            records={stockRecords}
                            createUrl={route('stock-levels.store')}
                            updateUrl={(id) => route('stock-levels.update', { stockLevel: id })}
                            deleteUrl={(id) => route('stock-levels.destroy', { stockLevel: id })}
                            fields={[
                                { name: 'depot_id', label: 'Depot', type: 'select', required: true, displayName: 'depot_name', options: depots.map((depot) => ({ label: depot.name, value: depot.id })) },
                                { name: 'commodity_id', label: 'Commodity', type: 'select', required: true, displayName: 'commodity_name', options: commodities.map((commodity) => ({ label: `${commodity.sku} · ${commodity.name}`, value: commodity.id })) },
                                { name: 'batch_id', label: 'Stock batch', type: 'select', required: true, displayName: 'lot_no', options: batches.map((batch) => ({ label: batch.lot_no, value: batch.id })) },
                                { name: 'on_hand_qty', label: 'On-hand quantity (MT)', type: 'number', required: true },
                                { name: 'capacity_qty', label: 'Capacity (MT)', type: 'number' },
                                { name: 'reorder_point', label: 'Reorder point (MT)', type: 'number' },
                                { name: 'runway_days', label: 'Runway (days)', type: 'number' },
                                {
                                    name: 'status',
                                    label: 'Stock status',
                                    type: 'select',
                                    options: [
                                        { label: 'Optimal', value: 'optimal' },
                                        { label: 'Reorder due', value: 'reorder_due' },
                                        { label: 'Out of stock', value: 'out_of_stock' },
                                    ],
                                },
                            ]}
                        />
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                        <div className="flex min-w-0 flex-1 gap-2">
                                            <select
                                                aria-label="Filter by commodity"
                                                value={commodityFilter}
                                                onChange={(event) => setCommodityFilter(event.target.value)}
                                                className="h-9 max-w-44 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#344054]"
                                            >
                                                <option value="">All commodities</option>
                                                {commodities.map((commodity) => <option key={commodity.id} value={commodity.id}>{commodity.name}</option>)}
                                            </select>
                                            <label className="relative min-w-0 flex-1">
                                                <span className="sr-only">Search stock roster</span>
                                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                                <input
                                                    value={search}
                                                    onChange={(event) => setSearch(event.target.value)}
                                                    className="h-9 w-full rounded-md border border-[#d0d5dd] bg-white pr-3 pl-9 text-sm placeholder:text-[#98a2b3]"
                                                    placeholder="Search stock roster"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                aria-label="Filter by depot"
                                                value={depotFilter}
                                                onChange={(event) => setDepotFilter(event.target.value)}
                                                className="h-9 max-w-44 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#344054]"
                                            >
                                                <option value="">All depots</option>
                                                {depots.map((depot) => <option key={depot.id} value={depot.id}>{depot.name}</option>)}
                                            </select>
                                            <button
                                                type="button"
                                                aria-label="Inventory filters"
                                                aria-expanded={showStatusFilter}
                                                onClick={() => setShowStatusFilter((visible) => !visible)}
                                                className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467]"
                                            >
                                                <SlidersHorizontal className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => exportStockRecords(filteredStockRecords)}
                                                className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                <Download className="size-3.5" />
                                                Export
                                            </button>
                                        </div>
                                    </div>
                                    {showStatusFilter && (
                                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eaecf0] pt-3">
                                            <label htmlFor="stock-status-filter" className="text-xs font-medium text-[#475467]">Stock status</label>
                                            <select
                                                id="stock-status-filter"
                                                value={statusFilter}
                                                onChange={(event) => setStatusFilter(event.target.value)}
                                                className="h-8 rounded-md border border-[#d0d5dd] bg-white px-2 text-xs"
                                            >
                                                <option value="">All statuses</option>
                                                <option value="optimal">Optimal</option>
                                                <option value="reorder_due">Reorder due</option>
                                                <option value="out_of_stock">Out of stock</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch('');
                                                    setCommodityFilter('');
                                                    setDepotFilter('');
                                                    setStatusFilter('');
                                                }}
                                                className="h-8 rounded-md px-2 text-xs font-medium text-[#175cd3] hover:bg-[#eff4ff]"
                                            >
                                                Clear filters
                                            </button>
                                            <span className="ml-auto text-xs text-[#667085]">{filteredStockRecords.length} matching records</span>
                                        </div>
                                    )}
                                </section>
                                <Panel title="Depot stock roster & capacity utilization" icon={Boxes} className="overflow-hidden">
                                    <div className="border-t border-[#eaecf0] px-5 py-3 text-xs text-[#667085]">
                                        Live stock, capacity, reorder, and runway records from SQLite.
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    {stockColumns.map((column) => (
                                                        <th key={column} className="px-5 py-3">
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {filteredStockRecords.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-5 py-16">
                                                            <EmptyState
                                                                title={stockRecords.length === 0 ? 'No stock records yet' : 'No matching stock records'}
                                                                description={stockRecords.length === 0 ? 'Create a stock level to populate the active roster.' : 'Adjust or clear the active filters to see more stock.'}
                                                                className="h-36"
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : filteredStockRecords.map((stock) => (
                                                    <tr key={stock.id} className="text-xs text-[#475467]">
                                                        <td className="px-5 py-4">
                                                            <p className="font-medium text-[#101828]">{stock.sku} · {stock.commodity_name}</p>
                                                            <p className="mt-1 text-[#98a2b3]">{stock.lot_no}</p>
                                                        </td>
                                                        <td className="px-5 py-4">{stock.depot_name}</td>
                                                        <td className="px-5 py-4">{stock.capacity_qty ?? '—'} MT / reorder {stock.reorder_point ?? '—'} MT</td>
                                                        <td className="px-5 py-4 font-medium text-[#101828]">{Number(stock.on_hand_qty).toLocaleString()} MT</td>
                                                        <td className="px-5 py-4">{stock.runway_days ?? '—'} days · {stock.status ?? 'available'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#eaecf0] px-5 py-4 text-xs text-[#98a2b3]">
                                        <span>{stockRecords.length} stock records loaded from SQLite.</span>
                                    </div>
                                </Panel>
                                <Panel title="Depot capacity & stock movement" icon={MapPin}>
                                    <div className="grid gap-5 px-5 pb-5 lg:grid-cols-2">
                                        <div className="grid gap-3">
                                            <h3 className="text-xs font-semibold text-[#475467]">Depot utilization</h3>
                                            {depotUtilization.map((depot) => {
                                                const percent = depot.capacity_mt && depot.capacity_mt > 0
                                                    ? Math.min((depot.on_hand_qty / depot.capacity_mt) * 100, 100)
                                                    : null;

                                                return (
                                                    <div key={depot.id}>
                                                        <div className="mb-1 flex justify-between gap-2 text-xs">
                                                            <span className="truncate text-[#344054]">{depot.name}</span>
                                                            <span className="shrink-0 text-[#667085]">
                                                                {depot.on_hand_qty.toLocaleString()} MT
                                                                {depot.capacity_mt === null ? '' : ` / ${depot.capacity_mt.toLocaleString()} MT`}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-[#f2f4f7]">
                                                            <div
                                                                className="h-full rounded-full bg-[#175cd3]"
                                                                style={{ width: `${percent ?? 0}%` }}
                                                            />
                                                        </div>
                                                        {percent === null && <p className="mt-1 text-[10px] text-[#98a2b3]">Capacity not configured</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="grid content-start gap-3">
                                            <h3 className="text-xs font-semibold text-[#475467]">Recent transfers and reconciliations</h3>
                                            {recentInventoryEvents.length === 0 ? (
                                                <EmptyState title="No movements recorded" description="Completed transfers and physical counts will appear here." className="min-h-36" />
                                            ) : recentInventoryEvents.map((event) => (
                                                <div key={event.id} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                                    <div className="flex justify-between gap-2">
                                                        <p className="text-xs font-semibold capitalize text-[#344054]">{event.action}</p>
                                                        <time className="shrink-0 text-[10px] text-[#98a2b3]" dateTime={event.created_at}>
                                                            {new Date(event.created_at).toLocaleDateString()}
                                                        </time>
                                                    </div>
                                                    <p className="mt-1 text-xs text-[#667085]">
                                                        {event.action === 'transferred'
                                                            ? `${String(event.payload.quantity ?? 0)} MT · depot ${String(event.payload.source_depot_id ?? '—')} to ${String(event.payload.destination_depot_id ?? '—')}`
                                                            : `Stock #${event.target_id ?? '—'} · ${String(event.payload.previous_qty ?? 0)} → ${String(event.payload.counted_qty ?? 0)} MT`}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-[#98a2b3]">By {event.user_name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Auto-procurement" icon={ClipboardList}>
                                    <div className="px-5 pb-5">
                                        {reorderRecords.length === 0 ? (
                                            <EmptyState title="No reorder alerts" description="All recorded stock is above its reorder threshold." className="h-44" />
                                        ) : (
                                            <div className="grid gap-2">
                                                {reorderRecords.slice(0, 5).map((stock) => (
                                                    <div key={stock.id} className="flex items-center justify-between gap-3 rounded-md bg-[#fffaeb] p-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-medium text-[#344054]">{stock.commodity_name} · {stock.lot_no}</p>
                                                            <p className="mt-1 truncate text-[10px] text-[#667085]">{stock.depot_name}</p>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-semibold text-[#b54708]">{Number(stock.on_hand_qty).toLocaleString()} MT</span>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('stock-crud')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                                    className="mt-1 h-9 rounded-md border border-[#d0d5dd] text-xs font-medium text-[#344054]"
                                                >
                                                    Manage stock levels
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                                <Panel title="Silo & sensor telemetry" icon={Gauge}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No sensor streams connected"
                                            description="No sensor integration is configured. Stock totals and depot utilization remain live from SQLite."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Weighbridge & slip stream" icon={FileCheck2}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No weighbridge slips"
                                            description="No weighbridge provider is configured. Stock receipts and transfers are recorded from the inventory workspace."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                            </aside>
                        </div>
                        <section className="mt-4 grid gap-4 lg:grid-cols-3">
                            <Panel title="Network capacity" icon={Warehouse}>
                                <div className="px-5 pb-5">
                                    <p className="text-2xl font-semibold text-[#101828]">
                                        {networkCapacityPercentage === null ? 'Not configured' : `${networkCapacityPercentage.toFixed(1)}%`}
                                    </p>
                                    <p className="mt-2 text-xs text-[#667085]">
                                        {totalDepotStock.toLocaleString()} MT on hand across {depotUtilization.length} depots
                                        {totalDepotCapacity > 0 ? ` · ${totalDepotCapacity.toLocaleString()} MT total capacity` : ''}
                                    </p>
                                </div>
                            </Panel>
                            <Panel title="Gate-to-gate movement" icon={Truck}>
                                <div className="px-5 pb-5">
                                    <p className="text-2xl font-semibold text-[#101828]">{transferCount.toLocaleString()}</p>
                                    <p className="mt-2 text-xs text-[#667085]">Completed stock transfers recorded in the audit ledger</p>
                                </div>
                            </Panel>
                            <Panel title="Reconciliation status" icon={ShieldCheck}>
                                <div className="px-5 pb-5">
                                    <p className="text-2xl font-semibold text-[#101828]">{reconciliationCount.toLocaleString()}</p>
                                    <p className="mt-2 text-xs text-[#667085]">
                                        {latestReconciliation
                                            ? `Last count ${new Date(latestReconciliation.created_at).toLocaleString()} by ${latestReconciliation.user_name ?? 'System'}`
                                            : 'No physical counts have been reconciled yet'}
                                    </p>
                                </div>
                            </Panel>
                        </section>
                    </main>
                </div>
            </div>
            <StockMovementDialog
                workflow={workflow}
                stocks={stockRecords}
                depots={depots}
                onOpenChange={(open) => {
                    if (!open) {
                        setWorkflow(null);
                    }
                }}
            />
        </>
    );
}
