import { Head, usePage } from '@inertiajs/react';
import {
    Bell,
    Boxes,
    ChartNoAxesCombined,
    ChevronDown,
    CircleHelp,
    ClipboardList,
    Factory,
    Leaf,
    Menu,
    Package,
    Search,
    Truck,
    UsersRound,
    WalletCards,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

const metricDefinitions = [
    {
        key: 'registeredFarmers',
        label: 'Registered farmers',
        icon: UsersRound,
        accent: 'text-[#175cd3] bg-[#eff8ff]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'inventoryOnHand',
        label: 'Inventory on hand',
        icon: Boxes,
        accent: 'text-[#0b6b4f] bg-[#ecfdf3]',
        format: (value: number) => `${value.toLocaleString()} MT`,
    },
    {
        key: 'distributionActivity',
        label: 'Distribution activity',
        icon: Truck,
        accent: 'text-[#7f56d9] bg-[#f4f3ff]',
        format: (value: number) => `${value.toLocaleString()} MT`,
    },
    {
        key: 'tradeValue',
        label: 'Committed trade value',
        icon: WalletCards,
        accent: 'text-[#b54708] bg-[#fffaeb]',
        format: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
];

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
        <section className={`rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                <Icon className="size-4 text-[#175cd3]" aria-hidden="true" />
                {title}
            </div>
            {children}
        </section>
    );
}

type QuotaLedgerEntry = {
    id: number;
    farmer_name: string;
    commodity_name: string;
    cycle_name: string;
    allocated_qty: number;
    disbursed_qty: number;
};

export default function Dashboard({ overviewMetrics, quotaLedger }: { overviewMetrics: Record<string, number>; quotaLedger: QuotaLedgerEntry[] }) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    return (
        <>
            <Head title="Operations overview" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <button
                        className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
                        type="button"
                        aria-label="Open navigation"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                            <Leaf className="size-4" aria-hidden="true" />
                        </div>
                        <span className="font-semibold tracking-normal">{systemName}</span>
                    </div>
                    <div className="mx-auto hidden max-w-md flex-1 md:block">
                        <label className="relative block">
                            <span className="sr-only">Search workspace</span>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                            <input
                                className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                                placeholder="Search workspace"
                            />
                        </label>
                    </div>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <button
                            className="relative flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                            type="button"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#d92d20]" />
                        </button>
                        <button
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7] sm:flex"
                            type="button"
                            aria-label="Help"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <div className="hidden h-7 w-px bg-[#eaecf0] sm:block" />
                        <div className="flex items-center gap-2 pl-1">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                                {auth.user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="hidden max-w-28 truncate text-sm font-medium text-[#344054] xl:block">{auth.user.name}</span>
                        </div>
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />

                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#667085]">
                                    <span className="text-[#175cd3]">Operations</span>
                                    <span>/</span>
                                    <span>Overview</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal text-[#101828] sm:text-3xl">Executive operations</h1>
                                <p className="mt-2 text-sm text-[#667085]">Your connected operational workspace is ready for live data.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    Current period <ChevronDown className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    All locations <ChevronDown className="size-4" />
                                </button>
                            </div>
                        </div>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
                            {metricDefinitions.map(({ key, label, icon: Icon, accent, format }) => (
                                <article
                                    key={label}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-[#475467]">{label}</p>
                                        <div className={`flex size-9 items-center justify-center rounded-md ${accent}`}>
                                            <Icon className="size-4" />
                                        </div>
                                    </div>
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">{format(overviewMetrics[key] ?? 0)}</p>
                                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from ERP database</p>
                                </article>
                            ))}
                        </section>

                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <Panel title="Demand and seasonal outlook" icon={ChartNoAxesCombined} className="min-h-[380px]">
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-4 text-xs text-[#667085]">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-[#175cd3]" />
                                            Actual
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-[#98a2b3]" />
                                            Projection
                                        </span>
                                    </div>
                                    <span className="rounded-md bg-[#eff4ff] px-2.5 py-1 text-xs font-medium text-[#175cd3]">
                                        Analytics API ready
                                    </span>
                                </div>
                                <div className="relative mt-7 h-52 overflow-hidden rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe]">
                                    <div className="absolute inset-x-5 top-1/4 border-t border-[#eaecf0]" />
                                    <div className="absolute inset-x-5 top-1/2 border-t border-[#eaecf0]" />
                                    <div className="absolute inset-x-5 top-3/4 border-t border-[#eaecf0]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="rounded-md bg-white px-3 py-2 text-xs font-medium text-[#667085] shadow-sm ring-1 ring-[#eaecf0]">
                                            Chart will populate from analytics API
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 rounded-md bg-[#f5f8ff] p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#dbeafe] text-[#175cd3]">
                                            <ClipboardList className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#344054]">Decision support</p>
                                            <p className="mt-1 text-xs leading-5 text-[#667085]">
                                                Recommendations will appear here once operational thresholds and forecast feeds are configured.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                            <div className="grid gap-4">
                                <Panel title="Inventory runway" icon={Package}>
                                    <div className="mt-5 grid gap-3">
                                        {['Fertilizer stock', 'Seed reserves', 'Field supplies'].map((label) => (
                                            <div key={label} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium text-[#344054]">{label}</span>
                                                    <span className="text-xs text-[#98a2b3]">No data</span>
                                                </div>
                                                <div className="mt-3 h-1.5 rounded-full bg-[#eaecf0]" />
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                                <Panel title="Zone fulfillment" icon={Factory}>
                                    <div className="mt-5 flex h-28 flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] text-center">
                                        <p className="text-sm font-medium text-[#475467]">No fulfillment records yet</p>
                                        <p className="mt-1 text-xs text-[#98a2b3]">Regional progress will appear here.</p>
                                    </div>
                                </Panel>
                            </div>
                        </div>

                        <Panel title="Farmer quota & voucher ledger" icon={ClipboardList} className="mt-4 overflow-hidden p-0">
                            <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-[#667085]">Allocation and voucher disbursement activity from the ERP database.</p>
                                <button
                                    type="button"
                                    className="flex h-8 items-center gap-2 self-start rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] sm:self-auto"
                                >
                                    Filter activity <ChevronDown className="size-3.5" />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[680px] text-left">
                                    <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                        <tr>
                                            <th className="px-5 py-3">Farmer</th>
                                            <th className="px-5 py-3">Commodity / cycle</th>
                                            <th className="px-5 py-3">Allocated</th>
                                            <th className="px-5 py-3">Disbursed</th>
                                            <th className="px-5 py-3">Balance / status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eaecf0]">
                                        {quotaLedger.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-12 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-[#eff4ff] text-[#175cd3]">
                                                        <ClipboardList className="size-5" />
                                                    </div>
                                                    <p className="mt-3 text-sm font-medium text-[#344054]">No quota records to display</p>
                                                    <p className="mt-1 text-xs leading-5 text-[#98a2b3]">
                                                        Quota allocations and voucher activity will appear when records are available.
                                                    </p>
                                                </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            quotaLedger.map((entry) => {
                                                const balance = Number(entry.allocated_qty) - Number(entry.disbursed_qty);
                                                const isComplete = balance <= 0;

                                                return (
                                                    <tr key={entry.id} className="text-xs text-[#475467]">
                                                        <td className="px-5 py-4 font-medium text-[#101828]">{entry.farmer_name}</td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-medium text-[#344054]">{entry.commodity_name}</p>
                                                            <p className="mt-1 text-[#98a2b3]">{entry.cycle_name}</p>
                                                        </td>
                                                        <td className="px-5 py-4">{Number(entry.allocated_qty).toLocaleString()} MT</td>
                                                        <td className="px-5 py-4 text-[#175cd3]">{Number(entry.disbursed_qty).toLocaleString()} MT</td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-medium text-[#344054]">{Math.max(balance, 0).toLocaleString()} MT remaining</p>
                                                            <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${isComplete ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#eff4ff] text-[#175cd3]'}`}>
                                                                {isComplete ? 'Complete' : 'Pending disbursement'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    </main>
                </div>
            </div>
        </>
    );
}
