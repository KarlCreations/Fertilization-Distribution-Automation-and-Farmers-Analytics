import { Head, usePage } from '@inertiajs/react';
import { Bell, CircleHelp, Database, Leaf, Menu, Search, ShieldCheck, UsersRound, WalletCards, Warehouse } from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
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

export default function RoleDashboard({ role }: { role: Role }) {
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
