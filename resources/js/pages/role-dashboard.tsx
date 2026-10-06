import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CheckCircle2,
    CircleHelp,
    Database,
    FileText,
    Leaf,
    MapPinned,
    Menu,
    Plus,
    Search,
    ShieldCheck,
    UsersRound,
    Warehouse,
    X,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

type Role = 'inventory' | 'sales' | 'finance' | 'hr' | 'subsidy';

type DashboardData = {
    metrics: {
        workforceRoster: number;
        fieldReadiness: number;
        attendanceActivity: number;
        openStaffingActions: number;
    };
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

export default function RoleDashboard({ role, dashboardData }: { role: Role; dashboardData?: DashboardData }) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
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
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#d92d20]" />
                        </button>
                        <button
                            type="button"
                            aria-label="Help"
                            className="hidden size-9 items-center justify-center rounded-md text-[#475467] sm:flex"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        {auth.user.avatar ? (
                            <img src={auth.user.avatar} alt={auth.user.name} className="size-8 rounded-full object-cover" />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-full bg-[#d1fadf] text-xs font-semibold text-[#067647]">
                                {auth.user.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm font-medium text-[#067647]">
                                <CheckCircle2 className="size-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Operations</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Role workspace</span>
                                </div>
                                <h1 className="text-2xl font-semibold sm:text-3xl">{content.title}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{content.description}</p>
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
                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">WORKFORCE ROSTER</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                                <UsersRound className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828]">{dashboardData.metrics.workforceRoster}</p>
                                        <p className="mt-2 text-xs text-[#067647]">Live from ERP database</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">FIELD READINESS</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef]">
                                                <MapPinned className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828]">{dashboardData.metrics.fieldReadiness} Assigned</p>
                                        <p className="mt-2 text-xs text-[#175cd3]">Zones & depots active</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">ATTENDANCE ACTIVITY</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#ecfdf3] text-[#067647]">
                                                <ShieldCheck className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828]">{dashboardData.metrics.attendanceActivity}%</p>
                                        <p className="mt-2 text-xs text-[#067647]">Active shift rate</p>
                                    </div>

                                    <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">OPEN STAFFING ACTIONS</p>
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#fffaeb] text-[#b54708]">
                                                <FileText className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-[#101828]">{dashboardData.metrics.openStaffingActions}</p>
                                        <p className="mt-2 text-xs text-[#b54708]">Action required</p>
                                    </div>
                                </>
                            ) : (
                                content.metrics.map((label, index) => {
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
                                })
                            )}
                        </section>

                        <div className="mt-6">
                            <PowerBiReport title={`${content.title} analytics`} />
                        </div>

                        {/* Panels section */}
                        {role === 'hr' && dashboardData ? (
                            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                                {/* Workforce Activity */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                            <Activity className="size-4" />
                                        </span>
                                        Workforce activity
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.recentActivity.map((act) => (
                                            <div key={act.id} className="flex items-start justify-between rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs">
                                                <div>
                                                    <p className="font-semibold text-[#101828]">{act.action.replace(/_/g, ' ')}</p>
                                                    <p className="mt-1 text-[#667085]">
                                                        {act.target_type} ({act.target_id}) • By {act.user_name || 'HR Admin'}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-[#98a2b3]">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Field Operations */}
                                <section className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                                        <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef]">
                                            <MapPinned className="size-4" />
                                        </span>
                                        Field operations & zone allocation
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {dashboardData.fieldOperations.map((zone) => (
                                            <div key={zone.id} className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#f9fafb] p-3 text-xs">
                                                <div>
                                                    <p className="font-semibold text-[#101828]">{zone.name}</p>
                                                    <p className="mt-1 text-[#667085]">{zone.zone_group || 'Field Region'}</p>
                                                </div>
                                                <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-xs font-semibold text-[#175cd3]">
                                                    {zone.staff_count} Staff Assigned
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Staffing and Compliance */}
                                <section className="xl:col-span-2 rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#101828]">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-[#ecfdf3] text-[#067647]">
                                                <ShieldCheck className="size-4" />
                                            </span>
                                            Staffing actions & compliance workflow
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowActionModal(true)}
                                            className="text-xs font-semibold text-[#175cd3] hover:underline"
                                        >
                                            + Create action
                                        </button>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {dashboardData.staffingActions.map((action) => (
                                            <div key={action.id} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-4 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-[#101828]">{action.title}</p>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                            action.status === 'completed'
                                                                ? 'bg-[#ecfdf3] text-[#067647]'
                                                                : action.status === 'in_progress'
                                                                ? 'bg-[#eff4ff] text-[#175cd3]'
                                                                : 'bg-[#fffaeb] text-[#b54708]'
                                                        }`}
                                                    >
                                                        {action.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[#667085]">{action.details || 'Operational staffing task'}</p>
                                                <div className="mt-3 flex items-center justify-between text-[11px] text-[#98a2b3]">
                                                    <span>Type: {action.action_type}</span>
                                                    <span>{action.zone_name || 'General Zone'}</span>
                                                </div>
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
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">Create Staffing Action</h2>
                            <button type="button" onClick={() => setShowActionModal(false)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAction} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Action Title</label>
                                <input
                                    type="text"
                                    required
                                    value={actionData.title}
                                    onChange={(e) => setActionData('title', e.target.value)}
                                    placeholder="e.g. Dispatch 4 Field Officers to Zone 1"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Action Type</label>
                                <select
                                    value={actionData.action_type}
                                    onChange={(e) => setActionData('action_type', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="dispatch">Field Dispatch</option>
                                    <option value="transfer">Zone Transfer</option>
                                    <option value="compliance_check">Compliance Check</option>
                                    <option value="onboarding">Staff Onboarding</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Target Zone (Optional)</label>
                                <select
                                    value={actionData.zone_id}
                                    onChange={(e) => setActionData('zone_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
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
                                <label className="block text-xs font-semibold text-[#344054]">Details / Instructions</label>
                                <textarea
                                    value={actionData.details}
                                    onChange={(e) => setActionData('details', e.target.value)}
                                    placeholder="Add operational details..."
                                    className="mt-1 h-20 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowActionModal(false)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054]"
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
