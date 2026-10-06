import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarClock,
    ChevronDown,
    CircleHelp,
    ClipboardList,
    LayoutDashboard,
    Leaf,
    LogOut,
    MapPinned,
    Menu,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    Sprout,
    UsersRound,
    WalletCards,
    Warehouse,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

const metricDefinitions = [
    {
        key: 'activeWorkforce',
        label: 'Active workforce',
        icon: UsersRound,
        tone: 'bg-[#eff8ff] text-[#175cd3]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'workforceReadiness',
        label: 'Workforce readiness',
        icon: UsersRound,
        tone: 'bg-[#f4f3ff] text-[#6938ef]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'fieldDispatch',
        label: 'Field dispatch & verification',
        icon: MapPinned,
        tone: 'bg-[#ecfdf3] text-[#067647]',
        format: (value: number) => value.toLocaleString(),
    },
    {
        key: 'complianceRecords',
        label: 'Safety & compliance records',
        icon: ShieldCheck,
        tone: 'bg-[#eff4ff] text-[#175cd3]',
        format: (value: number) => value.toLocaleString(),
    },
];

function Panel({
    title,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    icon: typeof UsersRound;
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
                    <Warehouse className="size-4" />
                    Inventory
                </Link>
                <Link
                    href={route('sales-commodities')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <ClipboardList className="size-4" />
                    Trade hub
                </Link>
                <Link
                    href={route('finance-impact')}
                    className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475467] hover:bg-[#f9fafb]"
                >
                    <WalletCards className="size-4" />
                    Financials
                </Link>
                <Link
                    href={route('hr-workforce')}
                    className="flex h-10 items-center gap-3 rounded-md bg-[#eff4ff] px-3 text-sm font-medium text-[#175cd3]"
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

type Employee = {
    employee_code: string;
    department: string | null;
    position: string | null;
    is_active: boolean;
    name: string;
    email: string;
    zone_name: string | null;
    depot_name: string | null;
};

export default function HrWorkforce({ workforceMetrics, employees }: { workforceMetrics: Record<string, number>; employees: Employee[] }) {
    const { auth } = usePage<SharedData>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';
    const columns = ['Employee / ID', 'Role & operational depot', 'Department', 'Zone', 'Status'];

    return (
        <>
            <Head title="HR & workforce" />
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
                        <span className="sr-only">Search workforce</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                        <input
                            className="h-9 w-full rounded-md border border-[#eaecf0] bg-[#f9fafb] pr-3 pl-9 text-sm outline-none placeholder:text-[#98a2b3] focus:border-[#175cd3] focus:ring-2 focus:ring-[#175cd3]/15"
                            placeholder="Search employees, shifts, or field teams"
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
                        <div className="mb-4"><PowerBiReport title="HR workforce analytics" /></div>
                        <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Enterprise</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">HR & workforce management</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">HR & field operations management</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                                    Coordinate workforce rosters, field dispatch, shift logistics, and compliance from connected sources.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054]"
                                >
                                    <CalendarClock className="size-4" />
                                    Shift scheduler
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Add employee
                                </button>
                            </div>
                        </div>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workforce metrics">
                            {metricDefinitions.map(({ key, label, icon: Icon, tone, format }) => (
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
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">{format(workforceMetrics[key] ?? 0)}</p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                        <div className="h-full w-1/4 rounded-full bg-[#d0d5dd]" />
                                    </div>
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from ERP database</p>
                                </article>
                            ))}
                        </section>
                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-4">
                                <Panel title="Employee roster & field operations" icon={UsersRound} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center">
                                        <label className="relative min-w-0 flex-1">
                                            <span className="sr-only">Search employees</span>
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#98a2b3]" />
                                            <input
                                                className="h-8 w-full rounded-md bg-[#f9fafb] pr-3 pl-8 text-xs placeholder:text-[#98a2b3]"
                                                placeholder="Search employee or ID"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="flex h-8 items-center gap-2 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467]"
                                        >
                                            All staff <ChevronDown className="size-3.5" />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] text-left">
                                            <thead className="bg-[#f9fafb] text-[10px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th key={column} className="px-5 py-3">
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {employees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-5 py-16">
                                                            <EmptyState
                                                                title="No employee records available"
                                                                description="Employee roles, shifts, and field assignments will appear after HR data is connected."
                                                                className="h-36"
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    employees.map((employee) => (
                                                        <tr key={employee.employee_code} className="text-xs text-[#475467]">
                                                            <td className="px-5 py-4">
                                                                <p className="font-semibold text-[#101828]">{employee.name}</p>
                                                                <p className="mt-1 text-[#98a2b3]">{employee.employee_code}</p>
                                                                <p className="mt-1 text-[11px] text-[#667085]">{employee.email}</p>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#344054]">{employee.position || 'Unassigned position'}</p>
                                                                <p className="mt-1">{employee.depot_name || 'No depot assigned'}</p>
                                                            </td>
                                                            <td className="px-5 py-4">{employee.department || 'Unassigned department'}</td>
                                                            <td className="px-5 py-4">{employee.zone_name || 'No zone assigned'}</td>
                                                            <td className="px-5 py-4">
                                                                <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${employee.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#f2f4f7] text-[#667085]'}`}>
                                                                    {employee.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Panel>
                            </div>
                            <aside className="grid content-start gap-4">
                                <Panel title="Regional coverage & shifts" icon={MapPinned}>
                                    <div className="px-5 pb-5">
                                        <div
                                            className="relative h-44 overflow-hidden rounded-md bg-[#dbeafe]"
                                            style={{
                                                backgroundImage:
                                                    'radial-gradient(circle at 30% 35%, #175cd3 0 3px, transparent 4px), radial-gradient(circle at 70% 55%, #175cd3 0 3px, transparent 4px), linear-gradient(25deg, transparent 49%, rgba(23,92,211,.35) 50%, transparent 51%, transparent 52%)',
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="rounded-md bg-white px-3 py-2 text-xs font-medium text-[#475467] shadow-sm">
                                                    Coverage map ready for field data
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Field operations timeline" icon={CalendarClock}>
                                    <div className="px-5 pb-5">
                                        <EmptyState
                                            title="No field operations timeline available"
                                            description="Shift schedules, field reviews, and operational milestones will appear here."
                                            className="h-44"
                                        />
                                    </div>
                                </Panel>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
