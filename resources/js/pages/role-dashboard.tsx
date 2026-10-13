import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, BriefcaseBusiness, CircleHelp, Database, Leaf, Menu, Search, ShieldCheck, UsersRound, WalletCards, Warehouse } from 'lucide-react';
import { useMemo, useState } from 'react';

import PowerBiReport from '@/components/power-bi-report';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type Role = 'inventory' | 'sales' | 'finance' | 'hr' | 'subsidy';

const dashboardContent: Record<Role, { title: string; description: string; metrics: string[]; panels: string[] }> = {
    subsidy: {
        title: 'Farmer management dashboard',
        description:
            'Coordinate farmer registration, field verification, subsidy eligibility, and fertilizer condition visibility for field operations.',
        metrics: ['Registered farmers', 'Verification queue', 'Subsidy readiness', 'Fertilizer condition'],
        panels: ['Farmer verification activity', 'Subsidy and voucher workflow', 'Fertilizer condition overview'],
    },
    inventory: {
        title: 'Inventory operations dashboard',
        description: 'Monitor stock, warehouse activity, replenishment, and fulfillment from one focused workspace.',
        metrics: ['Stock position', 'Warehouse activity', 'Reorder queue', 'Inbound movement'],
        panels: ['Warehouse activity', 'Stock movement queue', 'Replenishment readiness'],
    },
    sales: {
        title: 'Sales operations dashboard',
        description: 'Track contracts, orders, commodity movement, and commercial activity as connected data becomes available.',
        metrics: ['Open contracts', 'Order pipeline', 'Shipments in transit', 'Trade activity'],
        panels: ['Active commercial orders', 'Shipment execution', 'Market activity'],
    },
    finance: {
        title: 'Finance operations dashboard',
        description: 'Prepare treasury, disbursement, receivables, and reconciliation workflows for live financial data.',
        metrics: ['Cash position', 'Disbursement queue', 'Receivables', 'Reconciliation status'],
        panels: ['Treasury activity', 'Disbursement queue', 'Reconciliation workspace'],
    },
    hr: {
        title: 'HR operations dashboard',
        description: 'Coordinate workforce records, attendance, field staffing, and compliance from one workspace.',
        metrics: ['Workforce roster', 'Field readiness', 'Attendance activity', 'Open staffing actions'],
        panels: ['Workforce activity', 'Field operations', 'Staffing and compliance'],
    },
};

const metricIcons = [UsersRound, Database, ShieldCheck, WalletCards];

interface FinanceSnapshot {
    metrics: {
        contractValue: number;
        activeContracts: number;
        allocatedMt: number;
        disbursedMt: number;
        remainingMt: number;
    };
    quotaLedger: {
        id: number;
        farmer_name: string;
        commodity_name: string;
        cycle_name: string;
        zone_name: string | null;
        allocated_qty: number | string;
        disbursed_qty: number | string;
    }[];
    tradeContracts: {
        id: number;
        contract_ref: string;
        contract_type: string;
        status: string;
        volume_mt: number | string | null;
        counterparty: string | null;
        commodity_name: string;
        contract_value: number;
    }[];
    financeAuditEvents: {
        id: number;
        action: string;
        created_at: string;
    }[];
}

function FinanceDashboard({ financeData }: { financeData: FinanceSnapshot }) {
    const { auth } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [notice, setNotice] = useState('');
    const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
    const number = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
    const filteredQuotas = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return financeData.quotaLedger.filter((quota) =>
            `${quota.farmer_name} ${quota.commodity_name} ${quota.cycle_name} ${quota.zone_name ?? ''}`.toLowerCase().includes(query),
        );
    }, [financeData.quotaLedger, searchTerm]);
    const filteredContracts = useMemo(() => {
        const query = searchTerm.toLowerCase();

        return financeData.tradeContracts.filter((contract) =>
            `${contract.contract_ref} ${contract.counterparty ?? ''} ${contract.commodity_name}`.toLowerCase().includes(query),
        );
    }, [financeData.tradeContracts, searchTerm]);

    return (
        <>
            <Head title="Finance operations dashboard" />
            <div className="min-h-screen bg-[#f6f8fb] text-[#101828]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#eaecf0] bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={isMobileNavigationOpen}
                        onClick={() => setIsMobileNavigationOpen((open) => !open)}
                        className="flex size-9 items-center justify-center rounded-md border border-[#d0d5dd] text-[#475467] lg:hidden"
                    >
                        <Menu className="size-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md bg-[#0b6b4f] text-white">
                            <Leaf className="size-4" />
                        </span>
                        <span className="font-semibold">{import.meta.env.VITE_APP_NAME || 'Your System Name'}</span>
                    </div>
                    <label className="relative mx-auto hidden max-w-md flex-1 md:block">
                        <span className="sr-only">Search finance records</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none focus:border-[#175cd3]"
                            placeholder="Search contracts or quotas"
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Finance notifications"
                            onClick={() =>
                                setNotice(
                                    `${financeData.financeAuditEvents.length} recent finance audit events. ${financeData.metrics.remainingMt.toLocaleString()} MT quota remains.`,
                                )
                            }
                            className="flex size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7]"
                        >
                            <Bell className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Finance dashboard help"
                            onClick={() =>
                                setNotice(
                                    'Contract value is volume × recorded price and has no currency specified. Quota figures are measured in MT.',
                                )
                            }
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] hover:bg-[#f2f4f7] sm:flex"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                            {auth.user.name.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>
                {isMobileNavigationOpen && (
                    <div className="fixed inset-x-0 top-16 z-30 border-b border-[#eaecf0] bg-white p-4 shadow-lg lg:hidden">
                        <Link href={route('finance-impact')} className="block rounded-md px-3 py-2 text-sm font-medium text-[#175cd3]">
                            Finance & impact
                        </Link>
                    </div>
                )}
                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="mb-2 text-xs font-medium text-[#667085]">Operations / Finance</p>
                                <h1 className="text-2xl font-semibold sm:text-3xl">Finance operations dashboard</h1>
                                <p className="mt-2 max-w-2xl text-sm text-[#667085]">
                                    Live trade contract and fertilizer quota figures sourced from ERP records.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.reload({
                                            only: ['financeData'],
                                            onSuccess: () => setNotice('Finance data refreshed.'),
                                        })
                                    }
                                    className="h-9 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    Refresh
                                </button>
                                <Link
                                    href={route('finance-impact')}
                                    className="flex h-9 items-center rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    Open Financials
                                </Link>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Finance metrics">
                            {[
                                ['Recorded trade value', number(financeData.metrics.contractValue), 'currency unspecified'],
                                ['Active contracts', String(financeData.metrics.activeContracts), 'ERP contract status'],
                                ['Quota allocated', `${number(financeData.metrics.allocatedMt)} MT`, 'Farmer quota records'],
                                [
                                    'Quota disbursed',
                                    `${number(financeData.metrics.disbursedMt)} MT`,
                                    `${number(financeData.metrics.remainingMt)} MT remaining`,
                                ],
                            ].map(([label, value, detail]) => (
                                <article
                                    key={label}
                                    className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <p className="text-sm font-medium text-[#475467]">{label}</p>
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">{value}</p>
                                    <p className="mt-2 text-xs text-[#667085]">{detail}</p>
                                </article>
                            ))}
                        </section>
                        <div className="mt-5 grid gap-5 xl:grid-cols-2">
                            <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white">
                                <div className="flex items-center justify-between gap-3 p-5">
                                    <h2 className="flex items-center gap-2 text-sm font-semibold">
                                        <WalletCards className="size-4 text-[#175cd3]" /> Farmer quotas
                                    </h2>
                                    <Link href={route('finance-impact')} className="text-xs font-semibold text-[#175cd3]">
                                        Manage
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[540px] text-left text-xs">
                                        <thead className="bg-[#f9fafb] text-[#667085]">
                                            <tr>
                                                <th className="px-4 py-3">Farmer</th>
                                                <th className="px-4 py-3">Commodity</th>
                                                <th className="px-4 py-3">Allocated</th>
                                                <th className="px-4 py-3">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuotas.slice(0, 8).map((quota) => (
                                                <tr key={quota.id} className="border-t border-[#eaecf0] text-[#475467]">
                                                    <td className="px-4 py-3 font-medium text-[#101828]">{quota.farmer_name}</td>
                                                    <td className="px-4 py-3">{quota.commodity_name}</td>
                                                    <td className="px-4 py-3">{number(Number(quota.allocated_qty))} MT</td>
                                                    <td className="px-4 py-3">
                                                        {number(Number(quota.allocated_qty) - Number(quota.disbursed_qty))} MT
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredQuotas.length === 0 && (
                                        <p className="p-8 text-center text-sm text-[#667085]">No matching quota records.</p>
                                    )}
                                </div>
                            </section>
                            <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white">
                                <div className="flex items-center justify-between gap-3 p-5">
                                    <h2 className="flex items-center gap-2 text-sm font-semibold">
                                        <BriefcaseBusiness className="size-4 text-[#175cd3]" /> Trade contracts
                                    </h2>
                                    <Link href={route('finance-impact')} className="text-xs font-semibold text-[#175cd3]">
                                        View all
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[540px] text-left text-xs">
                                        <thead className="bg-[#f9fafb] text-[#667085]">
                                            <tr>
                                                <th className="px-4 py-3">Reference</th>
                                                <th className="px-4 py-3">Counterparty</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredContracts.slice(0, 8).map((contract) => (
                                                <tr key={contract.id} className="border-t border-[#eaecf0] text-[#475467]">
                                                    <td className="px-4 py-3 font-medium text-[#101828]">{contract.contract_ref}</td>
                                                    <td className="px-4 py-3">{contract.counterparty || 'Not specified'}</td>
                                                    <td className="px-4 py-3 capitalize">{contract.status}</td>
                                                    <td className="px-4 py-3">
                                                        {contract.volume_mt === null ? '—' : `${number(Number(contract.volume_mt))} MT`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredContracts.length === 0 && (
                                        <p className="p-8 text-center text-sm text-[#667085]">No matching trade contracts.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#eaecf0] bg-white p-4">
                            <p className="text-sm text-[#475467]">
                                <span className="font-semibold text-[#101828]">{financeData.financeAuditEvents.length}</span> recent finance audit
                                events available
                            </p>
                            <Link href={route('finance-impact')} className="text-sm font-semibold text-[#175cd3]">
                                Review Financials and audit trail →
                            </Link>
                        </div>
                    </main>
                </div>
                {notice && (
                    <div
                        role="status"
                        className="fixed right-4 bottom-4 z-40 max-w-sm rounded-lg bg-[#101828] px-4 py-3 text-sm text-white shadow-lg"
                    >
                        {notice}
                        <button type="button" onClick={() => setNotice('')} className="ml-3 text-[#b2ddff] underline">
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

function EmptyPanel({ title, icon: Icon }: { title: string; icon: typeof Database }) {
    return (
        <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                    <Icon className="size-4" />
                </span>
                {title}
            </div>
            <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 text-center">
                <span className="size-2 rounded-full bg-[#b2ddff]" />
                <p className="mt-3 text-sm font-medium text-[#475467]">No records loaded</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#98a2b3]">
                    This workspace will populate when its database and analytics API connections are available.
                </p>
            </div>
        </section>
    );
}

function GenericRoleDashboard({ role }: { role: Exclude<Role, 'finance'> }) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const content = dashboardContent[role];

    return (
        <>
            <Head title={content.title} />
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
                        <span className="sr-only">Search workspace</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3]"
                            placeholder="Search workspace"
                        />
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex size-9 items-center justify-center rounded-md text-[#475467]"
                        >
                            <Bell className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] sm:flex"
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
                        <div className="mb-7">
                            <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                <span>Operations</span>
                                <span>/</span>
                                <span className="text-[#175cd3]">Role workspace</span>
                            </div>
                            <h1 className="text-2xl font-semibold sm:text-3xl">{content.title}</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{content.description}</p>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {content.metrics.map((label, index) => {
                                const Icon = metricIcons[index];
                                return (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">{label}</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                                <Icon className="size-4" />
                                            </span>
                                        </div>
                                        <div className="mt-5 h-7 w-24 animate-pulse rounded bg-[#eef2f6]" />
                                        <p className="mt-3 text-xs text-[#98a2b3]">Awaiting data connection</p>
                                    </div>
                                );
                            })}
                        </section>
                        <div className="mt-6">
                            <PowerBiReport title={`${content.title} analytics`} />
                        </div>
                        <div className="mt-6 grid gap-6 xl:grid-cols-2">
                            {content.panels.map((title, index) => (
                                <EmptyPanel key={title} title={title} icon={[Warehouse, Database, ShieldCheck][index]} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

export default function RoleDashboard({ role }: { role: Role }) {
    const { financeData } = usePage<SharedData & { financeData?: FinanceSnapshot }>().props;

    if (role === 'finance') {
        if (!financeData) {
            return (
                <main role="alert" className="p-8 text-sm text-[#b42318]">
                    Finance dashboard data could not be loaded. Refresh the page or contact an administrator.
                </main>
            );
        }

        return <FinanceDashboard financeData={financeData} />;
    }

    return <GenericRoleDashboard role={role} />;
}
