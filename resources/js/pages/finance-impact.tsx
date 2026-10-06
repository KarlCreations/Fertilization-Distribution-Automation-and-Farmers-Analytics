import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BarChart3,
    Bell,
    BookOpenCheck,
    BriefcaseBusiness,
    Building2,
    ChartNoAxesCombined,
    ChevronDown,
    CircleHelp,
    FileDown,
    FileText,
    Landmark,
    LayoutDashboard,
    Leaf,
    LogOut,
    Menu,
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

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

const metrics = [
    { label: 'Working capital & treasury', icon: Landmark, tone: 'bg-[#eff8ff] text-[#175cd3]' },
    { label: 'Disbursement fund', icon: WalletCards, tone: 'bg-[#ecfdf3] text-[#067647]' },
    { label: 'Trade receivables & aging', icon: ReceiptText, tone: 'bg-[#f4f3ff] text-[#6938ef]' },
    { label: 'Economic impact outlook', icon: ChartNoAxesCombined, tone: 'bg-[#fffaeb] text-[#b54708]' },
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

export default function FinanceImpact() {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    return (
        <>
            <Head title="Finance & impact" />
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
                        <span className="sr-only">Search finance workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search ledger, settlement, or counterparty"
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
                        <div className="mb-4"><PowerBiReport title="Finance analytics" /></div>
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
                                    <p className="mt-2 text-xs text-[#98a2b3]">Awaiting financial data source</p>
                                </article>
                            ))}
                        </section>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Liquidity & yield scenario matrix" icon={Sparkles}>
                                    <div className="flex flex-wrap gap-2 px-5 pb-4">
                                        <button type="button" className="h-8 rounded-md bg-[#101828] px-3 text-xs font-medium text-white">
                                            Baseline scenario
                                        </button>
                                        <button type="button" className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]">
                                            Commodity shock
                                        </button>
                                        <button type="button" className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]">
                                            Climate scenario
                                        </button>
                                        <button
                                            type="button"
                                            className="ml-auto flex h-8 items-center gap-2 rounded-md border border-[#d0d5dd] px-3 text-xs font-medium text-[#475467]"
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
                                <Panel title="Disbursement & subsidy reconciliation ledger" icon={BookOpenCheck} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-[#667085]">Settlement records will be synchronized from your finance database.</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="flex h-8 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                All zones <ChevronDown className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                className="flex h-8 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                            >
                                                All channels <ChevronDown className="size-3.5" />
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
                                            <tbody>
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-16">
                                                        <EmptyState
                                                            title="No disbursement records available"
                                                            description="Approved batches will appear here after the finance source is connected."
                                                            className="h-36"
                                                        />
                                                    </td>
                                                </tr>
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
                                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#175cd3] px-3 text-xs font-semibold text-white"
                                    >
                                        <FileDown className="size-3.5" />
                                        Download audit package
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
