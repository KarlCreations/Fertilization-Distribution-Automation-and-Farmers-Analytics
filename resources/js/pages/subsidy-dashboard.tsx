
import { Head, usePage } from '@inertiajs/react';
import {
    Bell,
    CircleHelp,
    ClipboardList,
    Leaf,
    Menu,
    Search,
    ShieldCheck,
    UsersRound,
    WalletCards,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type SubsidyMetrics = {
    registeredFarmers: number;
    pendingVerification: number;
    verifiedFarmers: number;
    totalAllocated: number;
    totalDisbursed: number;
    activeCycles: number;
};

type QuotaLedgerEntry = {
    id: number;
    farmer_name: string;
    commodity_name: string;
    cycle_name: string;
    allocated_qty: number;
    disbursed_qty: number;
};

type ZoneSummary = {
    zone_name: string | null;
    farmer_count: number;
};

type VerificationQueueEntry = {
    id: number;
    full_name: string;
    national_id: string;
    created_at: string;
    status: string;
    zone_name: string | null;
};

type SubsidyPageProps = SharedData & {
    subsidyMetrics: SubsidyMetrics;
    quotaLedger: QuotaLedgerEntry[];
    zoneSummary: ZoneSummary[];
    verificationQueue: VerificationQueueEntry[];
};

function MetricCard({
    label,
    value,
    icon: Icon,
    description,
    tone = 'green',
}: {
    label: string;
    value: string;
    icon: typeof UsersRound;
    description: string;
    tone?: 'green' | 'amber' | 'blue';
}) {
    const styles = {
        green: {
            icon: 'bg-[#e8f5ec] text-[#176b45]',
            accent: 'bg-[#29965d]',
        },
        amber: {
            icon: 'bg-[#fff5df] text-[#a15c07]',
            accent: 'bg-[#d99a28]',
        },
        blue: {
            icon: 'bg-[#eaf2ff] text-[#315e9e]',
            accent: 'bg-[#608bd0]',
        },
    };

    return (
        <article className="group relative overflow-hidden rounded-xl border border-[#e0ebe3] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d8c1] hover:shadow-md">
            <div
                className={`absolute top-0 left-0 h-full w-1 ${styles[tone].accent}`}
            />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider text-[#607b68] uppercase">
                        {label}
                    </p>

                    <p className="mt-4 break-words text-2xl font-bold tracking-tight text-[#173d2b]">
                        {value}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#829488]">
                        {description}
                    </p>
                </div>

                <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${styles[tone].icon}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>
        </article>
    );
}

export default function SubsidyDashboard({
    subsidyMetrics,
    quotaLedger,
    zoneSummary,
    verificationQueue,
}: SubsidyPageProps) {
    const { auth } = usePage<SharedData>().props;

    const systemName =
        import.meta.env.VITE_APP_NAME || 'Your System Name';

    const remainingQuota =
        subsidyMetrics.totalAllocated -
        subsidyMetrics.totalDisbursed;

    const utilization =
        subsidyMetrics.totalAllocated > 0
            ? (subsidyMetrics.totalDisbursed /
                  subsidyMetrics.totalAllocated) *
              100
            : 0;

    return (
        <>
            <Head title="Subsidy Dashboard" />

            <div className="min-h-screen bg-[#f4f8f5] text-[#172b21]">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e0ebe3] bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#d5e3d9] text-[#42624d] transition hover:bg-[#f0f7f2] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>

                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-sm">
                            <Leaf className="size-5" />
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
                        <span className="sr-only">Search workspace</span>

                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a99d]" />

                        <input
                            className="h-10 w-full rounded-lg border border-[#d5e3d9] bg-[#fcfefc] pr-3 pl-9 text-sm outline-none transition placeholder:text-[#98a99d] focus:border-[#176b45] focus:bg-white focus:ring-4 focus:ring-[#176b45]/10"
                            placeholder="Search subsidy records..."
                        />
                    </label>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex size-9 items-center justify-center rounded-lg text-[#42624d] transition hover:bg-[#f0f7f2]"
                        >
                            <Bell className="size-[18px]" />
                        </button>

                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-lg text-[#42624d] transition hover:bg-[#f0f7f2] sm:flex"
                        >
                            <CircleHelp className="size-[18px]" />
                        </button>

                        <div className="ml-1 flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#d9f1df] text-xs font-bold text-[#176b45] shadow-sm ring-1 ring-[#c4e4ce]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />

                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {/* Page heading */}
                        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium">
                                    <span className="rounded-md bg-[#e7f3e9] px-2 py-1 text-[#42624d]">
                                        Subsidy
                                    </span>

                                    <span className="text-[#a2b1a6]">
                                        /
                                    </span>

                                    <span className="font-semibold text-[#176b45]">
                                        Dashboard
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-[#173d2b] sm:text-3xl">
                                    Subsidy Dashboard
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718176]">
                                    Monitor farmer eligibility, subsidy
                                    allocations, fertilizer disbursement, and
                                    quota utilization in one place.
                                </p>
                            </div>

                            <div className="flex w-fit items-center gap-2 rounded-lg border border-[#cfe6d5] bg-white px-3 py-2 text-xs font-medium text-[#42624d] shadow-sm">
                                <span className="size-2 rounded-full bg-[#29965d]" />
                                Subsidy Overview
                            </div>
                        </div>

                        {/* Farmer KPIs */}
                        <section
                            className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
                            aria-label="Farmer metrics"
                        >
                            <MetricCard
                                label="Registered Farmers"
                                value={subsidyMetrics.registeredFarmers.toLocaleString()}
                                icon={UsersRound}
                                description="Total farmer records"
                                tone="green"
                            />

                            <MetricCard
                                label="Pending Verification"
                                value={subsidyMetrics.pendingVerification.toLocaleString()}
                                icon={ShieldCheck}
                                description="Farmers awaiting verification"
                                tone="amber"
                            />

                            <MetricCard
                                label="Verified Farmers"
                                value={subsidyMetrics.verifiedFarmers.toLocaleString()}
                                icon={ShieldCheck}
                                description="Biometrically verified farmers"
                                tone="green"
                            />

                            <MetricCard
                                label="Active Cycles"
                                value={subsidyMetrics.activeCycles.toLocaleString()}
                                icon={ClipboardList}
                                description="Currently active subsidy cycles"
                                tone="blue"
                            />
                        </section>

                        {/* Allocation summary */}
                        <section className="mt-6">
                            <div className="mb-4">
                                <h2 className="text-base font-bold text-[#234832]">
                                    Fertilizer Allocation Summary
                                </h2>
                                <p className="mt-1 text-xs text-[#829488]">
                                    Overview of allocated, disbursed, and
                                    available fertilizer.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                                <MetricCard
                                    label="Total Allocated"
                                    value={`${subsidyMetrics.totalAllocated.toLocaleString()} MT`}
                                    icon={WalletCards}
                                    description="Total fertilizer allocation"
                                    tone="green"
                                />

                                <MetricCard
                                    label="Total Disbursed"
                                    value={`${subsidyMetrics.totalDisbursed.toLocaleString()} MT`}
                                    icon={Leaf}
                                    description="Fertilizer already disbursed"
                                    tone="green"
                                />

                                <MetricCard
                                    label="Remaining Quota"
                                    value={`${remainingQuota.toLocaleString()} MT`}
                                    icon={ClipboardList}
                                    description="Allocation still available"
                                    tone="amber"
                                />
                            </div>
                        </section>

                        {/* Utilization */}
                        <section className="mt-6 rounded-xl border border-[#e0ebe3] bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#176b45]">
                                        <WalletCards className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-[#234832]">
                                            Subsidy Utilization
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-[#829488]">
                                            Disbursed fertilizer compared with
                                            total allocation
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold tracking-wider text-[#829488] uppercase">
                                            Utilization rate
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#176b45]">
                                            {utilization.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf3ee]"
                                role="progressbar"
                                aria-label="Subsidy utilization"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.min(
                                    Math.max(utilization, 0),
                                    100,
                                )}
                            >
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#176b45] to-[#49a96d] transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            Math.max(utilization, 0),
                                            100,
                                        )}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                                <span className="flex items-center gap-2 text-[#607b68]">
                                    <span className="size-2 rounded-full bg-[#29965d]" />
                                    <span>
                                        <strong className="text-[#234832]">
                                            {subsidyMetrics.totalDisbursed.toLocaleString()} MT
                                        </strong>{' '}
                                        disbursed
                                    </span>
                                </span>

                                <span className="text-[#829488]">
                                    {subsidyMetrics.totalAllocated.toLocaleString()}{' '}
                                    MT total allocation
                                </span>
                            </div>
                        </section>

                        {/* Quota activity and zone summary */}
                        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
                            {/* Quota activity */}
                            <section className="min-w-0 overflow-hidden rounded-xl border border-[#e0ebe3] bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-[#e6eee8] px-5 py-5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#176b45]">
                                        <ClipboardList className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-[#234832]">
                                            Recent Quota Activity
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-[#829488]">
                                            Latest farmer allocation and
                                            disbursement records
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-sm">
                                        <thead className="bg-[#f0f7f2] text-[10px] font-bold tracking-wider text-[#42624d] uppercase">
                                            <tr>
                                                <th className="px-5 py-4">
                                                    Farmer
                                                </th>
                                                <th className="px-5 py-4">
                                                    Commodity
                                                </th>
                                                <th className="px-5 py-4">
                                                    Cycle
                                                </th>
                                                <th className="px-5 py-4">
                                                    Allocated
                                                </th>
                                                <th className="px-5 py-4">
                                                    Disbursed
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#edf2ee]">
                                            {quotaLedger.map((entry) => (
                                                <tr
                                                    key={entry.id}
                                                    className="transition-colors hover:bg-[#f7fbf8]"
                                                >
                                                    <td className="px-5 py-4 font-semibold text-[#234832]">
                                                        {entry.farmer_name}
                                                    </td>

                                                    <td className="px-5 py-4 text-[#607b68]">
                                                        {entry.commodity_name}
                                                    </td>

                                                    <td className="px-5 py-4 text-[#607b68]">
                                                        {entry.cycle_name}
                                                    </td>

                                                    <td className="px-5 py-4 font-medium text-[#344b3b]">
                                                        {Number(
                                                            entry.allocated_qty,
                                                        ).toLocaleString()}{' '}
                                                        MT
                                                    </td>

                                                    <td className="px-5 py-4 font-bold text-[#176b45]">
                                                        {Number(
                                                            entry.disbursed_qty,
                                                        ).toLocaleString()}{' '}
                                                        MT
                                                    </td>
                                                </tr>
                                            ))}

                                            {quotaLedger.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-5 py-14 text-center"
                                                    >
                                                        <ClipboardList className="mx-auto size-8 text-[#b5c7ba]" />
                                                        <p className="mt-3 text-sm font-semibold text-[#42624d]">
                                                            No quota records
                                                            found
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#98a99d]">
                                                            Allocation records
                                                            will appear here.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {quotaLedger.length > 0 && (
                                    <div className="border-t border-[#e6eee8] bg-[#fbfdfb] px-5 py-3 text-xs text-[#829488]">
                                        Showing {quotaLedger.length} quota
                                        {quotaLedger.length === 1
                                            ? ' record'
                                            : ' records'}
                                    </div>
                                )}
                            </section>

                            {/* Farmers by zone */}
                            <section className="min-w-0 overflow-hidden rounded-xl border border-[#e0ebe3] bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-[#e6eee8] px-5 py-5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#176b45]">
                                        <UsersRound className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-[#234832]">
                                            Farmers by Zone
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-[#829488]">
                                            Registered farmers across
                                            operational zones
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="space-y-5">
                                        {zoneSummary.map((zone) => (
                                            <div
                                                key={
                                                    zone.zone_name ??
                                                    'unassigned'
                                                }
                                            >
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="font-semibold text-[#344b3b]">
                                                        {zone.zone_name ??
                                                            'Unassigned'}
                                                    </span>

                                                    <span className="rounded-md bg-[#eaf7ef] px-2 py-1 text-xs font-bold text-[#176b45]">
                                                        {Number(
                                                            zone.farmer_count,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#edf3ee]">
                                                    <div
                                                        className="h-full rounded-full bg-[#29965d] transition-all duration-500"
                                                        style={{
                                                            width: `${
                                                                subsidyMetrics.registeredFarmers >
                                                                0
                                                                    ? Math.min(
                                                                          (Number(
                                                                              zone.farmer_count,
                                                                          ) /
                                                                              subsidyMetrics.registeredFarmers) *
                                                                              100,
                                                                          100,
                                                                      )
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>

                                                <p className="mt-1.5 text-right text-[10px] text-[#98a99d]">
                                                    {subsidyMetrics.registeredFarmers >
                                                    0
                                                        ? (
                                                              (Number(
                                                                  zone.farmer_count,
                                                              ) /
                                                                  subsidyMetrics.registeredFarmers) *
                                                              100
                                                          ).toFixed(1)
                                                        : '0.0'}
                                                    % of registered farmers
                                                </p>
                                            </div>
                                        ))}

                                        {zoneSummary.length === 0 && (
                                            <div className="py-12 text-center">
                                                <UsersRound className="mx-auto size-8 text-[#b5c7ba]" />
                                                <p className="mt-3 text-sm font-semibold text-[#42624d]">
                                                    No zone data available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Farmer verification queue */}
                        <section className="mt-6 overflow-hidden rounded-xl border border-[#e0ebe3] bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-[#e6eee8] p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff5df] text-[#a15c07]">
                                        <ShieldCheck className="size-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-[#234832]">
                                            Farmer Verification Queue
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-[#829488]">
                                            Farmers awaiting verification by
                                            the subsidy team
                                        </p>
                                    </div>
                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-full border border-[#f1dfae] bg-[#fff8e7] px-3 py-2 text-xs font-semibold text-[#a15c07]">
                                    <span className="size-2 animate-pulse rounded-full bg-[#d99a28]" />
                                    {subsidyMetrics.pendingVerification}{' '}
                                    Pending
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left text-sm">
                                    <thead className="bg-[#f0f7f2] text-[10px] font-bold tracking-wider text-[#42624d] uppercase">
                                        <tr>
                                            <th className="px-5 py-4">
                                                Farmer
                                            </th>
                                            <th className="px-5 py-4">
                                                National ID
                                            </th>
                                            <th className="px-5 py-4">
                                                Zone
                                            </th>
                                            <th className="px-5 py-4">
                                                Registration Date
                                            </th>
                                            <th className="px-5 py-4">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#edf2ee]">
                                        {verificationQueue.map((farmer) => (
                                            <tr
                                                key={farmer.id}
                                                className="transition-colors hover:bg-[#f7fbf8]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e7f3e9] text-xs font-bold text-[#176b45]">
                                                            {farmer.full_name
                                                                .split(' ')
                                                                .filter(Boolean)
                                                                .slice(0, 2)
                                                                .map(
                                                                    (part) =>
                                                                        part[0],
                                                                )
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>

                                                        <span className="font-semibold text-[#234832]">
                                                            {farmer.full_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 font-mono text-xs text-[#607b68]">
                                                    {farmer.national_id}
                                                </td>

                                                <td className="px-5 py-4 text-[#607b68]">
                                                    {farmer.zone_name ??
                                                        'Unassigned'}
                                                </td>

                                                <td className="px-5 py-4 text-[#607b68]">
                                                    {farmer.created_at
                                                        ? new Date(
                                                              farmer.created_at,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f1dfae] bg-[#fff8e7] px-2.5 py-1.5 text-xs font-semibold text-[#a15c07]">
                                                        <span className="size-1.5 rounded-full bg-[#d99a28]" />
                                                        Pending Verification
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {verificationQueue.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-14 text-center"
                                                >
                                                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#eaf7ef] text-[#176b45]">
                                                        <ShieldCheck className="size-6" />
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold text-[#234832]">
                                                        All caught up!
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#829488]">
                                                        No farmers are currently
                                                        awaiting verification.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {verificationQueue.length > 0 && (
                                <div className="border-t border-[#e6eee8] bg-[#fbfdfb] px-5 py-3 text-xs text-[#829488]">
                                    Showing {verificationQueue.length} pending
                                    farmers
                                    {subsidyMetrics.pendingVerification >
                                    verificationQueue.length
                                        ? ` out of ${subsidyMetrics.pendingVerification} total pending`
                                        : ''}
                                </div>
                            )}
                        </section>

                        <p className="mt-6 text-center text-xs text-[#98a99d]">
                            Subsidy Dashboard · Fertilization Distribution ERP
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
