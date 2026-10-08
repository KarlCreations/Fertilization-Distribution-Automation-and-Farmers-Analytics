import { Head, usePage, usePoll } from '@inertiajs/react';
import { Boxes, Database, Gauge, Leaf, Package, Search, ShieldCheck, TriangleAlert, UsersRound, WalletCards, Warehouse } from 'lucide-react';
import { useState } from 'react';

import WorkspaceHelpButton from '@/components/workspace-help-button';
import WorkspaceNotifications from '@/components/workspace-notifications';
import WorkspaceSidebar, { WorkspaceMobileNavigation } from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type Role = 'inventory' | 'sales' | 'finance' | 'hr' | 'subsidy';

const dashboardContent: Record<Role, { title: string; description: string }> = {
    subsidy: {
        title: 'Farmer management dashboard',
        description:
            'Coordinate farmer registration, field verification, subsidy eligibility, and fertilizer condition visibility for field operations.',
    },
    inventory: {
        title: 'Inventory operations dashboard',
        description: 'Monitor stock, warehouse activity, replenishment, and fulfillment from one focused workspace.',
    },
    sales: {
        title: 'Sales operations dashboard',
        description: 'Track contracts, orders, commodity movement, and commercial activity as connected data becomes available.',
    },
    finance: {
        title: 'Finance operations dashboard',
        description: 'Prepare treasury, disbursement, receivables, and reconciliation workflows for live financial data.',
    },
    hr: {
        title: 'HR operations dashboard',
        description: 'Coordinate workforce records, attendance, field staffing, and compliance from one workspace.',
    },
};

const metricIcons = [UsersRound, Database, ShieldCheck, WalletCards];

type DashboardMetric = { label: string; value: number | string };
type DashboardRecord = { name: string; detail: string; status: string; value: number | string };
type InventoryCharts = {
    monthlyInventoryActivity: { month: string; label: string; transfers: number; reconciliationVariance: number }[];
    statusBreakdown: { status: string; count: number }[];
    commodityOnHand: { name: string; quantity: number }[];
    depotUtilization: { name: string; onHand: number; capacity: number; utilization: number | null }[];
    replenishmentWatchlist: { name: string; depot: string; status: string; runwayDays: number | null; onHand: number }[];
};
type RoleCharts = {
    categoryTitle: string;
    activityTitle: string;
    activityUnit: string;
    categoryBreakdown: { label: string; value: number }[];
    activityBreakdown: { label: string; value: number }[];
};

const chartColors = ['#175cd3', '#f79009', '#d92d20', '#12b76a', '#7a5af8'];

function InventoryInsights({ charts }: { charts: InventoryCharts }) {
    const totalLevels = charts.statusBreakdown.reduce((total, item) => total + item.count, 0);
    const circumference = 2 * Math.PI * 46;
    let offset = 0;
    const maxQuantity = Math.max(...charts.commodityOnHand.map((item) => item.quantity), 0);
    const activityValues = charts.monthlyInventoryActivity.flatMap((item) => [item.transfers, item.reconciliationVariance]);
    const hasActivity = activityValues.some((value) => value !== 0);
    const activityMin = Math.min(0, ...activityValues);
    const activityMax = Math.max(0, ...activityValues);
    const activityRange = activityMax - activityMin || 1;
    const plot = { left: 58, right: 780, top: 22, bottom: 180 };
    const chartX = (index: number) => plot.left + (index * (plot.right - plot.left)) / Math.max(charts.monthlyInventoryActivity.length - 1, 1);
    const chartY = (value: number) => plot.top + ((activityMax - value) / activityRange) * (plot.bottom - plot.top);
    const transferPoints = charts.monthlyInventoryActivity.map((item, index) => `${chartX(index)},${chartY(item.transfers)}`).join(' ');
    const variancePoints = charts.monthlyInventoryActivity.map((item, index) => `${chartX(index)},${chartY(item.reconciliationVariance)}`).join(' ');

    return (
        <section className="mt-7 grid gap-5 xl:grid-cols-2" aria-label="Inventory analytics">
            <article className="rounded-2xl border border-[#e7edf2] bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.05)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f5ef] text-[#087443]">
                            <Gauge className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-[#101828]">Stock health</h2>
                            <p className="mt-1 text-xs text-[#667085]">Inventory levels by operational status</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-semibold text-[#067647]">
                        <span className="size-1.5 rounded-full bg-[#12b76a]" />
                        Live
                    </span>
                </div>
                {totalLevels === 0 ? (
                    <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        No stock levels to chart yet.
                    </div>
                ) : (
                    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
                        <div
                            className="relative size-44 shrink-0"
                            role="img"
                            aria-label={`Donut chart showing ${totalLevels} stock levels by status`}
                        >
                            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                                <circle cx="60" cy="60" r="46" fill="none" stroke="#f2f4f7" strokeWidth="14" />
                                {charts.statusBreakdown.map((item, index) => {
                                    const segmentLength = (item.count / totalLevels) * circumference;
                                    const currentOffset = offset;
                                    offset += segmentLength;

                                    return (
                                        <circle
                                            key={item.status}
                                            cx="60"
                                            cy="60"
                                            r="46"
                                            fill="none"
                                            stroke={chartColors[index % chartColors.length]}
                                            strokeWidth="14"
                                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                            strokeDashoffset={-currentOffset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-semibold tracking-tight text-[#101828]">{totalLevels}</span>
                                <span className="text-[11px] text-[#667085]">stock levels</span>
                            </div>
                        </div>
                        <ul className="grid w-full gap-3">
                            {charts.statusBreakdown.map((item, index) => (
                                <li key={item.status} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex min-w-0 items-center gap-2 text-[#475467]">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                        />
                                        <span className="truncate capitalize">{item.status.replaceAll('_', ' ')}</span>
                                    </span>
                                    <span className="shrink-0 font-semibold text-[#101828]">
                                        {item.count}{' '}
                                        <span className="font-normal text-[#667085]">({Math.round((item.count / totalLevels) * 100)}%)</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>
            <article className="rounded-2xl border border-[#e7edf2] bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.05)] sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#175cd3]">
                        <Package className="size-5" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-[#101828]">Stock by commodity</h2>
                        <p className="mt-1 text-xs text-[#667085]">Top commodities by available quantity</p>
                    </div>
                </div>
                {charts.commodityOnHand.length === 0 ? (
                    <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        No stock quantities to chart yet.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4">
                        {charts.commodityOnHand.map((item) => {
                            const percentage = maxQuantity > 0 ? (item.quantity / maxQuantity) * 100 : 0;

                            return (
                                <div key={item.name} className="group">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                        <span className="truncate font-medium text-[#344054]">{item.name}</span>
                                        <span className="shrink-0 font-semibold text-[#344054] tabular-nums">
                                            {item.quantity.toLocaleString()} MT
                                        </span>
                                    </div>
                                    <div
                                        className="h-3 overflow-hidden rounded-full bg-[#f2f4f7]"
                                        role="img"
                                        aria-label={`${item.name}: ${item.quantity.toLocaleString()} metric tons`}
                                    >
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#0b6b4f] via-[#12b76a] to-[#84e1bc] transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </article>
            <article className="rounded-2xl border border-[#e7edf2] bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.05)] sm:p-6 xl:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#087443]">
                            <Gauge className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-[#101828]">Inventory activity trend</h2>
                            <p className="mt-1 text-xs text-[#667085]">Recorded transfers and reconciliation variance · last 6 months</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                        <span className="inline-flex items-center gap-2 text-[#475467]">
                            <span className="h-0.5 w-5 rounded-full bg-[#0b6b4f]" />
                            Transferred (MT)
                        </span>
                        <span className="inline-flex items-center gap-2 text-[#475467]">
                            <span className="h-0.5 w-5 rounded-full bg-[#f79009]" />
                            Reconciliation variance (MT)
                        </span>
                    </div>
                </div>
                <div className="mt-5 overflow-x-auto">
                    <svg
                        viewBox="0 0 800 220"
                        className="h-56 w-full min-w-[620px] overflow-visible"
                        role="img"
                        aria-label="Line chart of monthly inventory transfer quantities and reconciliation variance"
                    >
                        {[0, 1, 2, 3, 4].map((tick) => {
                            const value = activityMax - (tick * activityRange) / 4;
                            const y = plot.top + (tick * (plot.bottom - plot.top)) / 4;

                            return (
                                <g key={tick}>
                                    <line x1={plot.left} y1={y} x2={plot.right} y2={y} stroke="#eaecf0" strokeDasharray="4 5" />
                                    <text x={plot.left - 10} y={y + 4} textAnchor="end" className="fill-[#98a2b3] text-[10px]">
                                        {hasActivity ? Math.round(value).toLocaleString() : '0'}
                                    </text>
                                </g>
                            );
                        })}
                        {hasActivity ? (
                            <>
                                <polyline
                                    points={transferPoints}
                                    fill="none"
                                    stroke="#0b6b4f"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <polyline
                                    points={variancePoints}
                                    fill="none"
                                    stroke="#f79009"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </>
                        ) : (
                            <>
                                <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke="#98a2b3" strokeDasharray="5 5" />
                                <text x={plot.right} y={plot.top + 12} textAnchor="end" className="fill-[#667085] text-[11px]">
                                    No recorded activity yet
                                </text>
                            </>
                        )}
                        {charts.monthlyInventoryActivity.map((item, index) => (
                            <g key={item.month}>
                                {hasActivity && (
                                    <>
                                        <circle
                                            cx={chartX(index)}
                                            cy={chartY(item.transfers)}
                                            r="4.5"
                                            fill="white"
                                            stroke="#0b6b4f"
                                            strokeWidth="2.5"
                                        >
                                            <title>{`${item.label}: ${item.transfers.toLocaleString()} MT transferred`}</title>
                                        </circle>
                                        <circle
                                            cx={chartX(index)}
                                            cy={chartY(item.reconciliationVariance)}
                                            r="4.5"
                                            fill="white"
                                            stroke="#f79009"
                                            strokeWidth="2.5"
                                        >
                                            <title>{`${item.label}: ${item.reconciliationVariance.toLocaleString()} MT reconciliation variance`}</title>
                                        </circle>
                                    </>
                                )}
                                <text x={chartX(index)} y="204" textAnchor="middle" className="fill-[#667085] text-[10px]">
                                    {item.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </article>
            <article className="rounded-2xl border border-[#e7edf2] bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.05)] sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f3ff] text-[#6941c6]">
                        <Warehouse className="size-5" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-[#101828]">Depot capacity</h2>
                        <p className="mt-1 text-xs text-[#667085]">On-hand stock compared with depot capacity</p>
                    </div>
                </div>
                {charts.depotUtilization.length === 0 ? (
                    <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        Depot capacity data will appear when depots are added.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-5">
                        {charts.depotUtilization.map((depot) => {
                            const utilization = depot.utilization ?? 0;
                            const barColor =
                                utilization >= 85
                                    ? 'from-[#d92d20] to-[#f97066]'
                                    : utilization >= 65
                                      ? 'from-[#dc6803] to-[#fdb022]'
                                      : 'from-[#6941c6] to-[#9b8afb]';

                            return (
                                <div key={depot.name}>
                                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                        <span className="truncate font-medium text-[#344054]">{depot.name}</span>
                                        <span className="shrink-0 font-semibold text-[#344054] tabular-nums">
                                            {depot.utilization === null ? 'Capacity not set' : `${utilization}%`}
                                        </span>
                                    </div>
                                    <div
                                        className="h-3 overflow-hidden rounded-full bg-[#f2f4f7]"
                                        role="img"
                                        aria-label={`${depot.name}: ${depot.utilization === null ? 'capacity not set' : `${utilization}% utilized`}`}
                                    >
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                                            style={{ width: `${Math.min(utilization, 100)}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-[#667085] tabular-nums">
                                        {depot.onHand.toLocaleString()} MT on hand
                                        {depot.capacity > 0 ? ` of ${depot.capacity.toLocaleString()} MT capacity` : ''}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </article>
            <article className="rounded-2xl border border-[#e7edf2] bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.05)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fffaeb] text-[#b54708]">
                            <TriangleAlert className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-[#101828]">Replenishment watchlist</h2>
                            <p className="mt-1 text-xs text-[#667085]">Low stock and short-runway items</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-[#fffaeb] px-2.5 py-1 text-[11px] font-semibold text-[#b54708]">
                        {charts.replenishmentWatchlist.length} to review
                    </span>
                </div>
                {charts.replenishmentWatchlist.length === 0 ? (
                    <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        No low-stock or short-runway items need attention.
                    </div>
                ) : (
                    <ul className="mt-4 divide-y divide-[#f2f4f7]">
                        {charts.replenishmentWatchlist.map((item) => {
                            const isOutOfStock = item.status === 'out_of_stock';
                            const isReorderDue = item.status === 'reorder_due';

                            return (
                                <li key={`${item.name}-${item.depot}`} className="flex items-center justify-between gap-3 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                                isOutOfStock
                                                    ? 'bg-[#fef3f2] text-[#b42318]'
                                                    : isReorderDue
                                                      ? 'bg-[#fffaeb] text-[#b54708]'
                                                      : 'bg-[#eff8ff] text-[#175cd3]'
                                            }`}
                                        >
                                            <Boxes className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-[#344054]">{item.name}</p>
                                            <p className="mt-0.5 truncate text-[11px] text-[#667085]">{item.depot}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p
                                            className={`text-[11px] font-semibold ${
                                                isOutOfStock ? 'text-[#b42318]' : isReorderDue ? 'text-[#b54708]' : 'text-[#175cd3]'
                                            }`}
                                        >
                                            {isOutOfStock ? 'Out of stock' : isReorderDue ? 'Reorder due' : 'Short runway'}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-[#667085]">
                                            {item.runwayDays === null ? 'Runway unknown' : `${item.runwayDays} days left`}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </article>
        </section>
    );
}

function RoleInsights({ charts }: { charts: RoleCharts }) {
    const total = charts.categoryBreakdown.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 42;
    const largestActivity = Math.max(...charts.activityBreakdown.map((item) => item.value), 0);
    let offset = 0;

    return (
        <section className="mt-6 grid gap-4 xl:grid-cols-2" aria-label="Workspace analytics">
            <article className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div>
                    <h2 className="text-sm font-semibold text-[#101828]">{charts.categoryTitle}</h2>
                    <p className="mt-1 text-xs text-[#667085]">Current distribution from SQLite records</p>
                </div>
                {total === 0 ? (
                    <div className="mt-5 flex h-44 items-center justify-center rounded-md border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        Data will appear when records are added.
                    </div>
                ) : (
                    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
                        <div className="relative size-40 shrink-0" role="img" aria-label={`${charts.categoryTitle}, ${total} total records`}>
                            <svg viewBox="0 0 110 110" className="size-full -rotate-90">
                                <circle cx="55" cy="55" r="42" fill="none" stroke="#f2f4f7" strokeWidth="13" />
                                {charts.categoryBreakdown.map((item, index) => {
                                    const segmentLength = (item.value / total) * circumference;
                                    const currentOffset = offset;
                                    offset += segmentLength;

                                    return (
                                        <circle
                                            key={item.label}
                                            cx="55"
                                            cy="55"
                                            r="42"
                                            fill="none"
                                            stroke={chartColors[index % chartColors.length]}
                                            strokeWidth="13"
                                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                            strokeDashoffset={-currentOffset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-semibold text-[#101828]">{total.toLocaleString()}</span>
                                <span className="text-[11px] text-[#667085]">records</span>
                            </div>
                        </div>
                        <ul className="grid w-full gap-3">
                            {charts.categoryBreakdown.map((item, index) => (
                                <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex min-w-0 items-center gap-2 text-[#475467]">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                        />
                                        <span className="truncate capitalize">{item.label}</span>
                                    </span>
                                    <span className="font-semibold text-[#101828]">{item.value.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>
            <article className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div>
                    <h2 className="text-sm font-semibold text-[#101828]">{charts.activityTitle}</h2>
                    <p className="mt-1 text-xs text-[#667085]">Highest activity by category</p>
                </div>
                {charts.activityBreakdown.length === 0 ? (
                    <div className="mt-5 flex h-44 items-center justify-center rounded-md border border-dashed border-[#d0d5dd] text-sm text-[#667085]">
                        Data will appear when records are added.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4">
                        {charts.activityBreakdown.map((item) => (
                            <div key={item.label}>
                                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                    <span className="truncate font-medium text-[#344054]">{item.label}</span>
                                    <span className="shrink-0 text-[#667085] tabular-nums">
                                        {charts.activityUnit === '$' ? '$' : ''}
                                        {item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        {charts.activityUnit !== '$' ? ` ${charts.activityUnit}` : ''}
                                    </span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#175cd3] to-[#84adff]"
                                        style={{ width: `${largestActivity > 0 ? (item.value / largestActivity) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </article>
        </section>
    );
}

export default function RoleDashboard({
    role,
    metrics,
    records,
    inventoryCharts,
    roleCharts,
}: {
    role: Role;
    metrics: DashboardMetric[];
    records: DashboardRecord[];
    inventoryCharts?: InventoryCharts;
    roleCharts?: RoleCharts;
}) {
    const { auth } = usePage<SharedData>().props;
    const [recordSearch, setRecordSearch] = useState('');
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const content = dashboardContent[role];
    const filteredRecords = records.filter((record) =>
        `${record.name} ${record.detail} ${record.status} ${record.value}`.toLowerCase().includes(recordSearch.trim().toLowerCase()),
    );

    usePoll(30_000, { only: ['metrics', 'records', 'inventoryCharts', 'roleCharts'] });

    return (
        <>
            <Head title={content.title} />
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
                        <span className="sr-only">Search workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3]"
                            placeholder="Search workspace"
                            value={recordSearch}
                            onChange={(event) => setRecordSearch(event.target.value)}
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
                        {role === 'inventory' ? (
                            <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3b31] via-[#0e5a47] to-[#175cd3] p-6 text-white shadow-[0_18px_50px_rgba(11,59,49,0.18)] sm:p-8">
                                <div className="pointer-events-none absolute -top-24 right-8 size-64 rounded-full border border-white/10" />
                                <div className="pointer-events-none absolute -right-10 -bottom-36 size-80 rounded-full bg-white/5 blur-2xl" />
                                <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                                    <div>
                                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-emerald-100 uppercase">
                                            <span className="size-2 rounded-full bg-[#6ce9a6] shadow-[0_0_14px_rgba(108,233,166,0.8)]" />
                                            Inventory command center
                                        </div>
                                        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Inventory, in full view.</h1>
                                        <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/90">{content.description}</p>
                                    </div>
                                    <div className="grid min-w-56 gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-inner backdrop-blur-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-xs font-medium text-emerald-50">Current stock position</span>
                                            <Package className="size-4 text-emerald-100" />
                                        </div>
                                        <p className="text-3xl font-semibold tracking-tight">
                                            {metrics.find((metric) => metric.label === 'Stock on hand')?.value ?? '—'}
                                        </p>
                                        <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-3 text-xs">
                                            <span className="text-emerald-50/90">
                                                {metrics.find((metric) => metric.label === 'Depots')?.value ?? 0} depots connected
                                            </span>
                                            <span className="rounded-full bg-[#fdb022]/20 px-2.5 py-1 font-semibold text-[#ffdf9e]">
                                                {metrics.find((metric) => metric.label === 'Reorder alerts')?.value ?? 0} alerts
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ) : (
                            <div className="mb-7">
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Role workspace</span>
                                </div>
                                <h1 className="text-2xl font-semibold sm:text-3xl">{content.title}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{content.description}</p>
                            </div>
                        )}
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Live workspace metrics">
                            {metrics.map(({ label, value }, index) => {
                                const Icon =
                                    role === 'inventory'
                                        ? label === 'Stock on hand'
                                            ? Package
                                            : label === 'Depots'
                                              ? Warehouse
                                              : label === 'Reorder alerts'
                                                ? TriangleAlert
                                                : Boxes
                                        : (metricIcons[index] ?? Package);
                                const iconTone =
                                    role !== 'inventory'
                                        ? 'rounded-md bg-[#eff4ff] text-[#175cd3]'
                                        : label === 'Reorder alerts'
                                          ? 'bg-[#fffaeb] text-[#b54708]'
                                          : label === 'Depots'
                                            ? 'bg-[#f4f3ff] text-[#6941c6]'
                                            : 'bg-[#e7f5ef] text-[#087443]';
                                return (
                                    <div
                                        key={label}
                                        className={`rounded-2xl border bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.045)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.09)] ${
                                            role === 'inventory'
                                                ? 'border-[#e7edf2]'
                                                : 'rounded-lg border-[#eaecf0] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">{label}</p>
                                            <span
                                                className={`flex size-9 items-center justify-center ${role === 'inventory' ? 'rounded-xl' : ''} ${iconTone}`}
                                            >
                                                <Icon className="size-4" />
                                            </span>
                                        </div>
                                        <p
                                            className={`mt-5 font-semibold tracking-tight text-[#101828] ${role === 'inventory' ? 'text-3xl' : 'text-2xl'}`}
                                        >
                                            {typeof value === 'number' ? value.toLocaleString() : value}
                                        </p>
                                        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#667085]">
                                            {role === 'inventory' && <span className="size-1.5 rounded-full bg-[#12b76a]" />}
                                            Live from SQLite
                                        </p>
                                    </div>
                                );
                            })}
                        </section>
                        {role === 'inventory' && inventoryCharts && <InventoryInsights charts={inventoryCharts} />}
                        {role !== 'inventory' && roleCharts && <RoleInsights charts={roleCharts} />}
                        <section className="mt-6 overflow-hidden rounded-lg border border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            <div className="border-b border-[#eaecf0] p-5">
                                <h2 className="text-sm font-semibold text-[#101828]">Latest {content.title.toLowerCase()} records</h2>
                                <p className="mt-1 text-xs text-[#667085]">Current records read directly from the local SQLite database.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[620px] text-left text-sm">
                                    <thead className="bg-[#f9fafb] text-xs text-[#667085] uppercase">
                                        <tr>
                                            <th className="px-5 py-3">Record</th>
                                            <th className="px-5 py-3">Details</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eaecf0]">
                                        {filteredRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-10 text-center text-sm text-[#667085]">
                                                    {records.length === 0
                                                        ? 'No records yet. Add records from the related workspace.'
                                                        : 'No records match your search.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRecords.map((record) => (
                                                <tr key={`${record.name}-${record.detail}`} className="text-[#475467]">
                                                    <td className="px-5 py-3 font-medium text-[#101828]">{record.name}</td>
                                                    <td className="px-5 py-3">{record.detail}</td>
                                                    <td className="px-5 py-3 capitalize">{record.status}</td>
                                                    <td className="px-5 py-3">
                                                        {typeof record.value === 'number' ? record.value.toLocaleString() : record.value}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
