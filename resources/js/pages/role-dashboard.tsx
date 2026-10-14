import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    CircleHelp,
    Clock,
    Database,
    FileText,
    Leaf,
    MapPinned,
    Menu,
    Plus,
    Search,
    ShieldCheck,
    UserCheck,
    UsersRound,
    WalletCards,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import PowerBiReport from '@/components/power-bi-report';
import WorkspaceHeader from '@/components/workspace-header';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type Role = 'inventory' | 'sales' | 'finance' | 'hr' | 'subsidy' | 'field_operations';

type DashboardData = {
    metrics: {
        workforceRoster: number;
        fieldReadiness: number;
        attendanceActivity: number;
        openStaffingActions: number;
        attendanceSummary?: {
            present: number;
            late: number;
            absent: number;
            onLeave: number;
            restDay?: number;
        };
    };
    pendingLeaveRequests?: Array<{
        id: number;
        employee_name: string;
        employee_code: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        reason: string | null;
    }>;
    upcomingSchedules?: Array<{
        id: number;
        employee_name: string;
        employee_code: string;
        shift_type: string;
        shift_date: string;
        zone_name: string | null;
    }>;
    recentActivity: Array<{
        id: number;
        action: string;
        target_type: string;
        target_id: string;
        created_at: string;
        user_name?: string;
    }>;
    fieldOperations: Array<{
        id: number;
        name: string;
        zone_group: string;
        staff_count: number;
    }>;
    staffingActions: Array<{
        id: number;
        title: string;
        action_type: string;
        status: string;
        details: string;
        created_at: string;
        zone_name?: string;
    }>;
    departmentBreakdown: Array<{
        department: string;
        total: number;
    }>;
    zones: Array<{ id: number; name: string; zone_no: number }>;
    depots: Array<{ id: number; name: string; code: string }>;
};

const dashboardContent: Record<Role, { title: string; description: string; metrics: string[]; panels: string[] }> = {
    field_operations: {
        title: 'Field Operations Dashboard',
        description:
            'Coordinate field visits, verify farmer and farm information, monitor fertilizer deliveries, and track field issues.',
        metrics: [
            "Today's Field Visits",
            'Pending Farm Verification',
            'Deliveries to Confirm',
            'Open Field Issues',
        ],
        panels: [
            'Upcoming Field Visits',
            'Farmer Verification Activity',
            'Delivery and Field Issue Monitoring',
        ],
    },
        
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

const metricIcons = [UsersRound, MapPinned, ShieldCheck, FileText];

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
                <WorkspaceHeader />
                <header className="hidden">
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
        <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:text-blue-400">
                    <Icon className="size-4" />
                </span>
                {title}
            </div>
            <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 text-center dark:border-gray-700 dark:bg-gray-800/40">
                <span className="size-2 rounded-full bg-[#b2ddff]" />
                <p className="mt-3 text-sm font-medium text-[#475467] dark:text-gray-300">No records loaded</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#98a2b3] dark:text-gray-400">
                    This workspace will populate when its database and analytics API connections are available.
                </p>
            </div>
        </section>
    );
}

export default function RoleDashboard({ role, dashboardData }: { role: Role; dashboardData?: DashboardData }) {
    const { flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const content = dashboardContent[role];

    const [showActionModal, setShowActionModal] = useState(false);
    const {
        data: actionData,
        setData: setActionData,
        post: postAction,
        processing: actionProcessing,
        reset: resetAction,
    } = useForm({
        title: '',
        action_type: 'dispatch',
        zone_id: '',
        details: '',
    });

    const handleCreateAction = (e: React.FormEvent) => {
        e.preventDefault();
        postAction(route('hr.staffing-actions.store'), {
            onSuccess: () => {
                setShowActionModal(false);
                resetAction();
            },
        });
    };

    const handleReviewLeave = (id: number, status: 'approved' | 'rejected') => {
        router.post(
            route('hr.leave-requests.review', id),
            {
                status,
                admin_notes: status === 'approved' ? 'Approved by HR Manager from dashboard.' : 'Rejected from dashboard.',
            },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={content.title} />
            <div
                className={`${role === 'hr' ? 'hr-interface' : ''}min-h-screen bg-[#f6f8fb] text-[#101828] transition-colors dark:bg-gray-950 dark:text-gray-100`}
            >
                <WorkspaceHeader />

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm font-medium text-[#067647] dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                <CheckCircle2 className="size-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085] dark:text-gray-400">
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3] dark:text-blue-400">Role workspace</span>
                                </div>
                                <h1 className="text-2xl font-semibold text-[#101828] sm:text-3xl dark:text-white">{content.title}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085] dark:text-gray-400">{content.description}</p>
                            </div>
                            {role === 'hr' && (
                                <button
                                    type="button"
                                    onClick={() => setShowActionModal(true)}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    New staffing action
                                </button>
                            )}
                        </div>

                        {/* Top KPI Cards */}
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {role === 'hr' && dashboardData ? (
                                <>
                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase dark:text-gray-400">
                                                WORKFORCE ROSTER
                                            </p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:text-blue-400">
                                                <UsersRound className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">
                                            {dashboardData.metrics.workforceRoster}
                                        </p>
                                        <p className="mt-2 text-xs text-[#067647] dark:text-emerald-400">Live from ERP database</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase dark:text-gray-400">
                                                FIELD READINESS
                                            </p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef] dark:bg-gray-800 dark:text-purple-400">
                                                <MapPinned className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">
                                            {dashboardData.metrics.fieldReadiness} Assigned
                                        </p>
                                        <p className="mt-2 text-xs text-[#175cd3] dark:text-blue-400">Zones & depots active</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase dark:text-gray-400">
                                                ATTENDANCE SUMMARY
                                            </p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#ecfdf3] text-[#067647] dark:bg-gray-800 dark:text-emerald-400">
                                                <UserCheck className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">
                                            {dashboardData.metrics.attendanceSummary?.present ?? 0} Present
                                        </p>
                                        <p className="mt-2 text-xs text-[#667085] dark:text-gray-400">
                                            Late: {dashboardData.metrics.attendanceSummary?.late ?? 0} | Absent:{' '}
                                            {dashboardData.metrics.attendanceSummary?.absent ?? 0} | Leave:{' '}
                                            {dashboardData.metrics.attendanceSummary?.onLeave ?? 0} | Rest day:{' '}
                                            {dashboardData.metrics.attendanceSummary?.restDay ?? 0}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase dark:text-gray-400">
                                                OPEN STAFFING ACTIONS
                                            </p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#fffaeb] text-[#b54708] dark:bg-gray-800 dark:text-amber-400">
                                                <FileText className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">
                                            {dashboardData.metrics.openStaffingActions}
                                        </p>
                                        <p className="mt-2 text-xs text-[#b54708] dark:text-amber-400">Action required</p>
                                    </div>
                                </>
                            ) : (
                                content.metrics.map((label, index) => {
                                    const Icon = metricIcons[index];
                                    return (
                                        <div
                                            key={label}
                                            className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            <div className="flex items-start justify-between">
                                                <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase dark:text-gray-400">
                                                    {label}
                                                </p>
                                                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:text-blue-400">
                                                    <Icon className="size-4" />
                                                </span>
                                            </div>
                                            <div className="mt-5 h-7 w-24 animate-pulse rounded bg-[#eef2f6] dark:bg-gray-800" />
                                            <p className="mt-3 text-xs text-[#98a2b3] dark:text-gray-400">Awaiting data connection</p>
                                        </div>
                                    );
                                })
                            )}
                        </section>

                        <div className="mt-6">
                            <PowerBiReport title={`${content.title} analytics`} />
                        </div>

                        {/* Panels section */}
                        {role === 'hr' && dashboardData ? (
                            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                                {/* Pending Leave Requests Panel */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#101828] dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef] dark:bg-gray-800 dark:text-purple-400">
                                                <CalendarClock className="size-4" />
                                            </span>
                                            Pending Leave Requests ({dashboardData.pendingLeaveRequests?.length ?? 0})
                                        </div>
                                        <Link
                                            href={route('hr-attendance-leave')}
                                            className="text-xs font-semibold text-[#175cd3] hover:underline dark:text-blue-400"
                                        >
                                            View all &rarr;
                                        </Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {!dashboardData.pendingLeaveRequests || dashboardData.pendingLeaveRequests.length === 0 ? (
                                            <p className="py-4 text-center text-xs text-[#667085] dark:text-gray-400">
                                                No pending leave requests at this time.
                                            </p>
                                        ) : (
                                            dashboardData.pendingLeaveRequests.map((leave) => (
                                                <div
                                                    key={leave.id}
                                                    className="flex flex-col justify-between gap-3 rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-800/60"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-[#101828] dark:text-white">
                                                            {leave.employee_name} ({leave.employee_code})
                                                        </p>
                                                        <p className="mt-0.5 text-[#667085] capitalize dark:text-gray-400">
                                                            {leave.leave_type} Leave: {leave.start_date} to {leave.end_date}
                                                        </p>
                                                        {leave.reason && (
                                                            <p className="mt-1 text-[11px] text-[#98a2b3] italic dark:text-gray-400">
                                                                &quot;{leave.reason}&quot;
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReviewLeave(leave.id, 'approved')}
                                                            className="flex items-center gap-1 rounded bg-[#067647] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#05603a]"
                                                        >
                                                            <CheckCircle2 className="size-3" /> Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReviewLeave(leave.id, 'rejected')}
                                                            className="flex items-center gap-1 rounded bg-[#b42318] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#912015]"
                                                        >
                                                            <XCircle className="size-3" /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                {/* Upcoming Schedules Panel */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#101828] dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:text-blue-400">
                                                <Clock className="size-4" />
                                            </span>
                                            Upcoming Employee Schedules
                                        </div>
                                        <Link
                                            href={route('hr-workforce')}
                                            className="text-xs font-semibold text-[#175cd3] hover:underline dark:text-blue-400"
                                        >
                                            Shift Scheduler &rarr;
                                        </Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {!dashboardData.upcomingSchedules || dashboardData.upcomingSchedules.length === 0 ? (
                                            <p className="py-4 text-center text-xs text-[#667085] dark:text-gray-400">
                                                No upcoming schedules created.
                                            </p>
                                        ) : (
                                            dashboardData.upcomingSchedules.map((sch) => (
                                                <div
                                                    key={sch.id}
                                                    className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs dark:border-gray-800 dark:bg-gray-800/60"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-[#101828] dark:text-white">
                                                            {sch.employee_name} ({sch.employee_code})
                                                        </p>
                                                        <p className="mt-0.5 text-[#667085] capitalize dark:text-gray-400">
                                                            {sch.shift_type} Shift · {sch.shift_date}
                                                        </p>
                                                    </div>
                                                    <span className="rounded bg-[#eff4ff] px-2 py-1 text-[10px] font-semibold text-[#175cd3] dark:bg-blue-950 dark:text-blue-300">
                                                        {sch.zone_name || 'All Zones'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                {/* Workforce Activity */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3] dark:bg-gray-800 dark:text-blue-400">
                                            <Activity className="size-4" />
                                        </span>
                                        Workforce activity
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.recentActivity.map((act) => (
                                            <div
                                                key={act.id}
                                                className="flex items-start justify-between rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs dark:border-gray-800 dark:bg-gray-800/60"
                                            >
                                                <div>
                                                    <p className="font-semibold text-[#101828] dark:text-white">{act.action.replace(/_/g, ' ')}</p>
                                                    <p className="mt-1 text-[#667085] dark:text-gray-400">
                                                        {act.target_type} ({act.target_id}) • By {act.user_name || 'HR Admin'}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-[#98a2b3] dark:text-gray-400">
                                                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Field Operations */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef] dark:bg-gray-800 dark:text-purple-400">
                                            <MapPinned className="size-4" />
                                        </span>
                                        Field operations & zone allocation
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.fieldOperations.map((zone) => (
                                            <div
                                                key={zone.id}
                                                className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs dark:border-gray-800 dark:bg-gray-800/60"
                                            >
                                                <div>
                                                    <p className="font-semibold text-[#101828] dark:text-white">{zone.name}</p>
                                                    <p className="mt-1 text-[#667085] dark:text-gray-400">{zone.zone_group || 'Field Region'}</p>
                                                </div>
                                                <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-xs font-semibold text-[#175cd3] dark:bg-blue-950 dark:text-blue-300">
                                                    {zone.staff_count} Staff Assigned
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                                {content.panels.map((title, index) => (
                                    <EmptyPanel key={title} title={title} icon={[Warehouse, Database, ShieldCheck][index]} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Staffing Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg border border-transparent bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-[#101828] dark:text-white">Create Staffing Action</h2>
                            <button
                                type="button"
                                onClick={() => setShowActionModal(false)}
                                className="text-[#667085] hover:text-[#101828] dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAction} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054] dark:text-gray-300">Action Title</label>
                                <input
                                    type="text"
                                    required
                                    value={actionData.title}
                                    onChange={(e) => setActionData('title', e.target.value)}
                                    placeholder="e.g. Dispatch 4 Field Officers to Zone 1"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] bg-white p-2 text-xs text-[#101828] outline-none focus:border-[#175cd3] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054] dark:text-gray-300">Action Type</label>
                                <select
                                    value={actionData.action_type}
                                    onChange={(e) => setActionData('action_type', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] bg-white p-2 text-xs text-[#101828] outline-none focus:border-[#175cd3] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="dispatch">Field Dispatch</option>
                                    <option value="transfer">Zone Transfer</option>
                                    <option value="compliance_check">Compliance Check</option>
                                    <option value="onboarding">Staff Onboarding</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054] dark:text-gray-300">Target Zone (Optional)</label>
                                <select
                                    value={actionData.zone_id}
                                    onChange={(e) => setActionData('zone_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] bg-white p-2 text-xs text-[#101828] outline-none focus:border-[#175cd3] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Select Zone</option>
                                    {dashboardData?.zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054] dark:text-gray-300">Details / Instructions</label>
                                <textarea
                                    value={actionData.details}
                                    onChange={(e) => setActionData('details', e.target.value)}
                                    placeholder="Add operational details..."
                                    className="mt-1 h-20 w-full rounded-md border border-[#d0d5dd] bg-white p-2 text-xs text-[#101828] outline-none focus:border-[#175cd3] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 border-t border-[#eaecf0] pt-2 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowActionModal(false)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionProcessing}
                                    className="rounded-md bg-[#175cd3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    {actionProcessing ? 'Saving...' : 'Submit Action'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
