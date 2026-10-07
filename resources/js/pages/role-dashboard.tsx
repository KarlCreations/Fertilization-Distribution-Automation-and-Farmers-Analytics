import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
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
    UserMinus,
    UsersRound,
    UserX,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import WorkspaceHeader from '@/components/workspace-header';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

type Role = 'inventory' | 'sales' | 'finance' | 'hr' | 'subsidy';

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

function EmptyPanel({ title, icon: Icon }: { title: string; icon: typeof Database }) {
    return (
        <section className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] dark:bg-gray-800 text-[#175cd3] dark:text-blue-400">
                    <Icon className="size-4" />
                </span>
                {title}
            </div>
            <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] dark:border-gray-700 bg-[#fbfcfe] dark:bg-gray-800/40 px-5 text-center">
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
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const content = dashboardContent[role];

    const [showActionModal, setShowActionModal] = useState(false);
    const { data: actionData, setData: setActionData, post: postAction, processing: actionProcessing, reset: resetAction } = useForm({
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
        router.post(route('hr.leave-requests.review', id), {
            status,
            admin_notes: status === 'approved' ? 'Approved by HR Manager from dashboard.' : 'Rejected from dashboard.',
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title={content.title} />
            <div
                className={`${role === 'hr' ? 'hr-interface ' : ''}min-h-screen bg-[#f6f8fb] dark:bg-gray-950 text-[#101828] dark:text-gray-100 transition-colors`}
            >
                <WorkspaceHeader />

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] dark:border-emerald-800 bg-[#ecfdf3] dark:bg-emerald-950/80 p-4 text-sm font-medium text-[#067647] dark:text-emerald-300">
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
                                <h1 className="text-2xl font-semibold sm:text-3xl text-[#101828] dark:text-white">{content.title}</h1>
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
                                    <div className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] dark:text-gray-400 uppercase">WORKFORCE ROSTER</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] dark:bg-gray-800 text-[#175cd3] dark:text-blue-400">
                                                <UsersRound className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">{dashboardData.metrics.workforceRoster}</p>
                                        <p className="mt-2 text-xs text-[#067647] dark:text-emerald-400">Live from ERP database</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] dark:text-gray-400 uppercase">FIELD READINESS</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] dark:bg-gray-800 text-[#6938ef] dark:text-purple-400">
                                                <MapPinned className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">{dashboardData.metrics.fieldReadiness} Assigned</p>
                                        <p className="mt-2 text-xs text-[#175cd3] dark:text-blue-400">Zones & depots active</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] dark:text-gray-400 uppercase">ATTENDANCE SUMMARY</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#ecfdf3] dark:bg-gray-800 text-[#067647] dark:text-emerald-400">
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

                                    <div className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] dark:text-gray-400 uppercase">OPEN STAFFING ACTIONS</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#fffaeb] dark:bg-gray-800 text-[#b54708] dark:text-amber-400">
                                                <FileText className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828] dark:text-white">{dashboardData.metrics.openStaffingActions}</p>
                                        <p className="mt-2 text-xs text-[#b54708] dark:text-amber-400">Action required</p>
                                    </div>
                                </>
                            ) : (
                                content.metrics.map((label, index) => {
                                    const Icon = metricIcons[index];
                                    return (
                                        <div
                                            key={label}
                                            className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                        >
                                            <div className="flex items-start justify-between">
                                                <p className="text-xs font-semibold tracking-wide text-[#667085] dark:text-gray-400 uppercase">{label}</p>
                                                <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] dark:bg-gray-800 text-[#175cd3] dark:text-blue-400">
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
                                <section className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#101828] dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] dark:bg-gray-800 text-[#6938ef] dark:text-purple-400">
                                                <CalendarClock className="size-4" />
                                            </span>
                                            Pending Leave Requests ({dashboardData.pendingLeaveRequests?.length ?? 0})
                                        </div>
                                        <Link href={route('hr-attendance-leave')} className="text-xs font-semibold text-[#175cd3] dark:text-blue-400 hover:underline">
                                            View all &rarr;
                                        </Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {!dashboardData.pendingLeaveRequests || dashboardData.pendingLeaveRequests.length === 0 ? (
                                            <p className="text-xs text-[#667085] dark:text-gray-400 py-4 text-center">No pending leave requests at this time.</p>
                                        ) : (
                                            dashboardData.pendingLeaveRequests.map((leave) => (
                                                <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[#eaecf0] dark:border-gray-800 bg-[#f9fafb] dark:bg-gray-800/60 p-3 text-xs">
                                                    <div>
                                                        <p className="font-semibold text-[#101828] dark:text-white">{leave.employee_name} ({leave.employee_code})</p>
                                                        <p className="mt-0.5 text-[#667085] dark:text-gray-400 capitalize">{leave.leave_type} Leave: {leave.start_date} to {leave.end_date}</p>
                                                        {leave.reason && <p className="mt-1 text-[11px] text-[#98a2b3] dark:text-gray-400 italic">&quot;{leave.reason}&quot;</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
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
                                <section className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#101828] dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] dark:bg-gray-800 text-[#175cd3] dark:text-blue-400">
                                                <Clock className="size-4" />
                                            </span>
                                            Upcoming Employee Schedules
                                        </div>
                                        <Link href={route('hr-workforce')} className="text-xs font-semibold text-[#175cd3] dark:text-blue-400 hover:underline">
                                            Shift Scheduler &rarr;
                                        </Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {!dashboardData.upcomingSchedules || dashboardData.upcomingSchedules.length === 0 ? (
                                            <p className="text-xs text-[#667085] dark:text-gray-400 py-4 text-center">No upcoming schedules created.</p>
                                        ) : (
                                            dashboardData.upcomingSchedules.map((sch) => (
                                                <div key={sch.id} className="flex items-center justify-between rounded-md border border-[#eaecf0] dark:border-gray-800 bg-[#f9fafb] dark:bg-gray-800/60 p-3 text-xs">
                                                    <div>
                                                        <p className="font-semibold text-[#101828] dark:text-white">{sch.employee_name} ({sch.employee_code})</p>
                                                        <p className="mt-0.5 text-[#667085] dark:text-gray-400 capitalize">{sch.shift_type} Shift · {sch.shift_date}</p>
                                                    </div>
                                                    <span className="rounded bg-[#eff4ff] dark:bg-blue-950 px-2 py-1 text-[10px] font-semibold text-[#175cd3] dark:text-blue-300">
                                                        {sch.zone_name || 'All Zones'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                {/* Workforce Activity */}
                                <section className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] dark:bg-gray-800 text-[#175cd3] dark:text-blue-400">
                                            <Activity className="size-4" />
                                        </span>
                                        Workforce activity
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.recentActivity.map((act) => (
                                            <div key={act.id} className="flex items-start justify-between rounded-md border border-[#eaecf0] dark:border-gray-800 bg-[#f9fafb] dark:bg-gray-800/60 p-3 text-xs">
                                                <div>
                                                    <p className="font-semibold text-[#101828] dark:text-white">{act.action.replace(/_/g, ' ')}</p>
                                                    <p className="mt-1 text-[#667085] dark:text-gray-400">
                                                        {act.target_type} ({act.target_id}) • By {act.user_name || 'HR Admin'}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-[#98a2b3] dark:text-gray-400">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Field Operations */}
                                <section className="rounded-lg border border-[#eaecf0] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] dark:bg-gray-800 text-[#6938ef] dark:text-purple-400">
                                            <MapPinned className="size-4" />
                                        </span>
                                        Field operations & zone allocation
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.fieldOperations.map((zone) => (
                                            <div key={zone.id} className="flex items-center justify-between rounded-md border border-[#eaecf0] dark:border-gray-800 bg-[#f9fafb] dark:bg-gray-800/60 p-3 text-xs">
                                                <div>
                                                    <p className="font-semibold text-[#101828] dark:text-white">{zone.name}</p>
                                                    <p className="mt-1 text-[#667085] dark:text-gray-400">{zone.zone_group || 'Field Region'}</p>
                                                </div>
                                                <span className="rounded-full bg-[#eff4ff] dark:bg-blue-950 px-2.5 py-1 text-xs font-semibold text-[#175cd3] dark:text-blue-300">
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
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl border border-transparent dark:border-gray-800">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] dark:border-gray-800 pb-3">
                            <h2 className="text-lg font-semibold text-[#101828] dark:text-white">Create Staffing Action</h2>
                            <button type="button" onClick={() => setShowActionModal(false)} className="text-[#667085] dark:text-gray-400 hover:text-[#101828] dark:hover:text-white">
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
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-xs text-[#101828] dark:text-white outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054] dark:text-gray-300">Action Type</label>
                                <select
                                    value={actionData.action_type}
                                    onChange={(e) => setActionData('action_type', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-xs text-[#101828] dark:text-white outline-none focus:border-[#175cd3]"
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
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-xs text-[#101828] dark:text-white outline-none focus:border-[#175cd3]"
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
                                    className="mt-1 h-20 w-full rounded-md border border-[#d0d5dd] dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-xs text-[#101828] dark:text-white outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-[#eaecf0] dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowActionModal(false)}
                                    className="rounded-md border border-[#d0d5dd] dark:border-gray-700 px-4 py-2 text-xs font-medium text-[#344054] dark:text-gray-300 hover:bg-[#f9fafb] dark:hover:bg-gray-800"
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
