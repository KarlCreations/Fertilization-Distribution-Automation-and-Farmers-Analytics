import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Boxes,
    Building2,
    ChevronDown,
    CircleHelp,
    ClipboardList,
    Download,
    FileCheck2,
    Gauge,
    LayoutDashboard,
    Leaf,
    LogOut,
    MapPin,
    Menu,
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

import WorkspaceSidebar from '@/components/workspace-sidebar';
import CrudManager from '@/components/crud-manager';
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

export default function InventoryWarehouses({
    inventoryMetrics,
    stockRecords,
    depots,
    commodities,
    batches,
}: {
    inventoryMetrics: Record<string, number>;
    stockRecords: StockRecord[];
    depots: { id: number; name: string }[];
    commodities: { id: number; name: string; sku: string }[];
    batches: { id: number; lot_no: string; commodity_id: number }[];
}) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const stockColumns = ['SKU & batch trace', 'Depot / physical bay', 'Capacity & reorder line', 'On-hand stock', 'Runway & status'];

    return (
        <>
            <Head title="Inventory & warehouses" />
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
                        <span className="sr-only">Search inventory</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search inventory, depot, or batch"
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
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <Building2 className="size-4" />
                                    Transfer depots
                                </button>
                                <button
                                    type="button"
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
                                            <button type="button" className="h-9 rounded-md bg-[#101828] px-3 text-xs font-medium text-white">
                                                All commodities
                                            </button>
                                            <label className="relative min-w-0 flex-1">
                                                <span className="sr-only">Search stock roster</span>
                                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                                <input
                                                    className="h-9 w-full rounded-md border border-[#d0d5dd] bg-white pr-3 pl-9 text-sm placeholder:text-[#98a2b3]"
                                                    placeholder="Search stock roster"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="flex h-9 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                All facilities <ChevronDown className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Inventory filters"
                                                className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467]"
                                            >
                                                <SlidersHorizontal className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                <Download className="size-3.5" />
                                                Export
                                            </button>
                                        </div>
                                    </div>
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
                                                {stockRecords.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-5 py-16">
                                                            <EmptyState title="No stock records yet" description="Create a stock level to populate the active roster." className="h-36" />
                                                        </td>
                                                    </tr>
                                                ) : stockRecords.map((stock) => (
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
                                <Panel title="Physical bay allocation & transit staging" icon={MapPin}>
                                    <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                                        <EmptyState
                                            title="Depot capacity view"
                                            description="Facility and bay availability will appear here."
                                            className="h-36"
                                        />
                                        <EmptyState
                                            title="Transit staging view"
                                            description="Inbound and outbound movement will appear here."
                                            className="h-36"
                                        />
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Auto-procurement" icon={ClipboardList}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No procurement triggers"
                                            description="Reorder rules will create review items when stock thresholds are connected."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Silo & sensor telemetry" icon={Gauge}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No sensor streams connected"
                                            description="Silo temperature, moisture, and air exchange readings will render here."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Weighbridge & slip stream" icon={FileCheck2}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No weighbridge slips"
                                            description="Inbound and outbound scale events will appear here."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                            </aside>
                        </div>
                        <section className="mt-4 grid gap-4 lg:grid-cols-3">
                            <Panel title="Network capacity" icon={Warehouse}>
                                <div className="px-5 pb-5">
                                    <div className="h-7 w-24 animate-pulse rounded bg-[#eef2f6]" />
                                    <p className="mt-3 text-xs text-[#98a2b3]">Awaiting facility capacity feed</p>
                                </div>
                            </Panel>
                            <Panel title="Gate-to-gate movement" icon={Truck}>
                                <div className="px-5 pb-5">
                                    <div className="h-7 w-24 animate-pulse rounded bg-[#eef2f6]" />
                                    <p className="mt-3 text-xs text-[#98a2b3]">Awaiting transit event feed</p>
                                </div>
                            </Panel>
                            <Panel title="Reconciliation status" icon={ShieldCheck}>
                                <div className="px-5 pb-5">
                                    <div className="h-7 w-24 animate-pulse rounded bg-[#eef2f6]" />
                                    <p className="mt-3 text-xs text-[#98a2b3]">Awaiting ledger reconciliation</p>
                                </div>
                            </Panel>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
