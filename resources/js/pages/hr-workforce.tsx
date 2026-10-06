import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarClock,
    CheckCircle2,
    CircleHelp,
    Edit3,
    Eye,
    Leaf,
    MapPinOff,
    MapPinned,
    Menu,
    Plus,
    Search,
    ShieldCheck,
    UserCheck,
    UserMinus,
    Users,
    UsersRound,
    X,
} from 'lucide-react';

import WorkspaceSidebar from '@/components/workspace-sidebar';
import PowerBiReport from '@/components/power-bi-report';
import { type SharedData } from '@/types';

type WorkforceMetrics = Record<string, number>;

const metricDefinitions = [
    {
        key: 'activeWorkforce',
        label: 'Active employees',
        icon: UsersRound,
        tone: 'bg-[#eff8ff] text-[#175cd3]',
        format: (value: number) => value.toLocaleString(),
        progress: (metrics: WorkforceMetrics) =>
            metrics.totalWorkforce > 0 ? (metrics.activeWorkforce / metrics.totalWorkforce) * 100 : 0,
    },
    {
        key: 'totalWorkforce',
        label: 'Total employees',
        icon: Users,
        tone: 'bg-[#f4f3ff] text-[#6938ef]',
        format: (value: number) => value.toLocaleString(),
        progress: null,
    },
    {
        key: 'inactiveWorkforce',
        label: 'Inactive employees',
        icon: UserMinus,
        tone: 'bg-[#fef3f2] text-[#b42318]',
        format: (value: number) => value.toLocaleString(),
        progress: (metrics: WorkforceMetrics) =>
            metrics.totalWorkforce > 0 ? (metrics.inactiveWorkforce / metrics.totalWorkforce) * 100 : 0,
    },
    {
        key: 'fieldDispatch',
        label: 'Field/zone assigned',
        icon: MapPinned,
        tone: 'bg-[#ecfdf3] text-[#067647]',
        format: (value: number) => value.toLocaleString(),
        progress: (metrics: WorkforceMetrics) =>
            metrics.totalWorkforce > 0 ? (metrics.fieldDispatch / metrics.totalWorkforce) * 100 : 0,
    },
    {
        key: 'unassignedWorkforce',
        label: 'Unassigned employees',
        icon: MapPinOff,
        tone: 'bg-[#fffaeb] text-[#b54708]',
        format: (value: number) => value.toLocaleString(),
        progress: (metrics: WorkforceMetrics) =>
            metrics.totalWorkforce > 0 ? (metrics.unassignedWorkforce / metrics.totalWorkforce) * 100 : 0,
    },
    {
        key: 'workforceReadiness',
        label: 'Workforce readiness',
        icon: CheckCircle2,
        tone: 'bg-[#eff4ff] text-[#175cd3]',
        format: (value: number) => `${value.toLocaleString()}%`,
        progress: (metrics: WorkforceMetrics) => metrics.workforceReadiness ?? 0,
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
        <div className={`flex flex-col items-center justify-center rounded-md border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-5 text-center ${className}`}>
            <div className="size-2 rounded-full bg-[#b2ddff]" />
            <p className="mt-3 text-sm font-medium text-[#475467]">{title}</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a2b3]">{description}</p>
        </div>
    );
}

type Employee = {
    id: number;
    employee_code: string;
    department: string | null;
    position: string | null;
    is_active: boolean;
    name: string;
    email: string;
    profile_photo_path: string | null;
    created_at: string;
    updated_at: string;
    zone_id: number | null;
    zone_name: string | null;
    depot_id: number | null;
    depot_name: string | null;
};

type Zone = {
    id: number;
    name: string;
    zone_no: number;
    zone_group: string;
    staff_count: number;
};

type Depot = {
    id: number;
    name: string;
    code: string;
};

type Shift = {
    id: number;
    shift_type: string;
    shift_date: string;
    status: string;
    notes: string;
    employee_name: string;
    employee_code: string;
    zone_name: string | null;
};

type TimelineEvent = {
    id: number;
    action: string;
    target_type: string | null;
    target_id: string | null;
    created_at: string;
    user_name: string | null;
};

export default function HrWorkforce({
    workforceMetrics,
    employees = [],
    zones = [],
    depots = [],
    shifts = [],
    timelineEvents = [],
}: {
    workforceMetrics: WorkforceMetrics;
    employees: Employee[];
    zones: Zone[];
    depots: Depot[];
    shifts: Shift[];
    timelineEvents: TimelineEvent[];
}) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;
    const systemName = import.meta.env.VITE_APP_NAME || 'Your System Name';

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [assignmentFilter, setAssignmentFilter] = useState('ALL');
    const [zoneFilter, setZoneFilter] = useState('ALL');
    const [depotFilter, setDepotFilter] = useState('ALL');

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    const [confirmToggleEmployee, setConfirmToggleEmployee] = useState<Employee | null>(null);

    // Form for Add Employee
    const {
        data: addData,
        setData: setAddData,
        post: postAdd,
        processing: addProcessing,
        reset: resetAdd,
    } = useForm({
        name: '',
        email: '',
        employee_code: `EMP-HR-${Math.floor(100 + Math.random() * 900)}`,
        department: 'Field Operations',
        position: 'Field Inspection Officer',
        zone_id: '',
        depot_id: '',
        is_active: true as boolean,
    });

    // Form for Edit Employee
    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editProcessing,
    } = useForm({
        department: '',
        position: '',
        zone_id: '',
        depot_id: '',
        is_active: true as boolean,
    });

    // Form for Shift Scheduler
    const {
        data: shiftData,
        setData: setShiftData,
        post: postShift,
        processing: shiftProcessing,
        reset: resetShift,
    } = useForm({
        employee_id: '',
        shift_type: 'morning',
        shift_date: new Date().toISOString().split('T')[0],
        zone_id: '',
        notes: '',
    });

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('hr.employees.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const handleEditEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        postEdit(route('hr.employees.update', editingEmployee.id), {
            onSuccess: () => {
                setEditingEmployee(null);
            },
        });
    };

    const handleScheduleShift = (e: React.FormEvent) => {
        e.preventDefault();
        postShift(route('hr.shifts.store'), {
            onSuccess: () => {
                setShowShiftModal(false);
                resetShift();
            },
        });
    };

    const openEditModal = (emp: Employee) => {
        setEditingEmployee(emp);
        setEditData({
            department: emp.department || 'Field Operations',
            position: emp.position || 'Staff',
            zone_id: emp.zone_id ? String(emp.zone_id) : '',
            depot_id: emp.depot_id ? String(emp.depot_id) : '',
            is_active: emp.is_active,
        });
    };

    // Filter employees
    const filteredEmployees = employees.filter((emp) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            emp.name.toLowerCase().includes(term) ||
            emp.employee_code.toLowerCase().includes(term) ||
            emp.email.toLowerCase().includes(term) ||
            (emp.department && emp.department.toLowerCase().includes(term)) ||
            (emp.position && emp.position.toLowerCase().includes(term));

        const matchesDept =
            departmentFilter === 'ALL' ||
            (departmentFilter === 'ACTIVE' && emp.is_active) ||
            (departmentFilter === 'INACTIVE' && !emp.is_active) ||
            emp.department === departmentFilter;

        const isAssigned = Boolean(emp.zone_id || emp.depot_id);
        const matchesAssignment =
            assignmentFilter === 'ALL' ||
            (assignmentFilter === 'ASSIGNED' && isAssigned) ||
            (assignmentFilter === 'UNASSIGNED' && !isAssigned);

        const matchesZone = zoneFilter === 'ALL' || String(emp.zone_id ?? '') === zoneFilter;
        const matchesDepot = depotFilter === 'ALL' || String(emp.depot_id ?? '') === depotFilter;

        return matchesSearch && matchesDept && matchesAssignment && matchesZone && matchesDepot;
    });

    const departments = Array.from(
        new Set(employees.map((emp) => emp.department).filter((dept): dept is string => Boolean(dept))),
    ).sort((a, b) => a.localeCompare(b));

    const formatAction = (action: string) => {
        const words = action.replace(/_/g, ' ').toLowerCase();
        return words.charAt(0).toUpperCase() + words.slice(1);
    };

    const initials = (name: string) =>
        name
            .split(' ')
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

    const photoUrl = (path: string | null) => (path ? `/storage/${path}` : null);

    const handleToggleStatus = (employee: Employee) => {
        setConfirmToggleEmployee(null);
        router.post(route('hr.employees.toggle', employee.id), {}, { preserveScroll: true });
    };

    const columns = ['Employee / ID', 'Role & operational depot', 'Department', 'Zone', 'Status', 'Actions'];

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        {auth.user.avatar ? (
                            <img
                                src={auth.user.avatar}
                                alt={auth.user.name}
                                className="size-8 rounded-full object-cover"
                            />
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
                        {flash?.error && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#fecdca] bg-[#fef3f2] p-4 text-sm font-medium text-[#b42318]">
                                <CircleHelp className="size-5 shrink-0" />
                                <span>{flash.error}</span>
                            </div>
                        )}

                        <div className="mb-4">
                            <PowerBiReport title="HR workforce analytics" />
                        </div>

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
                                    onClick={() => setShowShiftModal(true)}
                                    className="flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
                                >
                                    <CalendarClock className="size-4" />
                                    Shift scheduler
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="flex h-9 items-center gap-2 rounded-md bg-[#175cd3] px-3 text-sm font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    <Plus className="size-4" />
                                    Add employee
                                </button>
                            </div>
                        </div>

                        {/* Workforce metric cards */}
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Workforce metrics">
                            {metricDefinitions.map(({ key, label, icon: Icon, tone, format, progress }) => (
                                <article key={label} className="rounded-lg border border-[#eaecf0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-[#475467]">{label}</p>
                                        <span className={`flex size-9 items-center justify-center rounded-md ${tone}`}>
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-2xl font-semibold tracking-tight text-[#101828]">{format(workforceMetrics[key] ?? 0)}</p>
                                    {progress !== null && (
                                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                            <div
                                                className="h-full rounded-full bg-[#175cd3]"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, progress(workforceMetrics)))}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-[#98a2b3]">Live from ERP database</p>
                                </article>
                            ))}
                        </section>

                        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                            {/* Employee Roster Table */}
                            <div className="space-y-4">
                                <Panel title="Employee roster & field operations" icon={UsersRound} className="overflow-hidden">
                                    <div className="flex flex-col gap-3 border-t border-[#eaecf0] p-5 sm:flex-row sm:items-center">
                                        <label className="relative min-w-0 flex-1">
                                            <span className="sr-only">Search employees</span>
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#98a2b3]" />
                                            <input
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-8 w-full rounded-md bg-[#f9fafb] pr-3 pl-8 text-xs placeholder:text-[#98a2b3] outline-none border border-[#eaecf0] focus:border-[#175cd3]"
                                                placeholder="Search employee or ID"
                                            />
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <select
                                                value={departmentFilter}
                                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                                aria-label="Filter by department or status"
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] outline-none border border-transparent"
                                            >
                                                <option value="ALL">All staff</option>
                                                <option value="ACTIVE">Active Staff</option>
                                                <option value="INACTIVE">Inactive Staff</option>
                                                {departments.map((dept) => (
                                                    <option key={dept} value={dept}>
                                                        {dept}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={assignmentFilter}
                                                onChange={(e) => setAssignmentFilter(e.target.value)}
                                                aria-label="Filter by zone assignment"
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] outline-none border border-transparent"
                                            >
                                                <option value="ALL">All assignments</option>
                                                <option value="ASSIGNED">Assigned</option>
                                                <option value="UNASSIGNED">Unassigned</option>
                                            </select>
                                            <select
                                                value={zoneFilter}
                                                onChange={(e) => setZoneFilter(e.target.value)}
                                                aria-label="Filter by zone"
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] outline-none border border-transparent"
                                            >
                                                <option value="ALL">All zones</option>
                                                {zones.map((zone) => (
                                                    <option key={zone.id} value={String(zone.id)}>
                                                        {zone.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={depotFilter}
                                                onChange={(e) => setDepotFilter(e.target.value)}
                                                aria-label="Filter by depot"
                                                className="h-8 rounded-md bg-[#f2f4f7] px-3 text-xs font-medium text-[#475467] outline-none border border-transparent"
                                            >
                                                <option value="ALL">All depots</option>
                                                {depots.map((depot) => (
                                                    <option key={depot.id} value={String(depot.id)}>
                                                        {depot.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
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
                                                {filteredEmployees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 py-16">
                                                            <EmptyState
                                                                title="No employee records found"
                                                                description="Try adjusting your search criteria or add a new employee."
                                                                className="h-36"
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEmployees.map((employee) => (
                                                        <tr key={employee.id} className="text-xs text-[#475467] hover:bg-[#f9fafb]">
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {employee.profile_photo_path ? (
                                                                        <img
                                                                            src={photoUrl(employee.profile_photo_path) ?? ''}
                                                                            alt={employee.name}
                                                                            className="size-9 shrink-0 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-semibold text-[#175cd3]">
                                                                            {initials(employee.name)}
                                                                        </span>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="font-semibold text-[#101828]">{employee.name}</p>
                                                                        <p className="mt-1 text-[#98a2b3]">{employee.employee_code}</p>
                                                                        <p className="mt-1 text-[11px] text-[#667085]">{employee.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="font-medium text-[#344054]">{employee.position || 'Unassigned position'}</p>
                                                                <p className="mt-1 text-[#667085]">{employee.depot_name || 'No depot assigned'}</p>
                                                            </td>
                                                            <td className="px-5 py-4">{employee.department || 'Unassigned department'}</td>
                                                            <td className="px-5 py-4">{employee.zone_name || 'No zone assigned'}</td>
                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                                                        employee.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#f2f4f7] text-[#667085]'
                                                                    }`}
                                                                >
                                                                    {employee.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setViewingEmployee(employee)}
                                                                        className="flex items-center gap-1 text-xs font-semibold text-[#475467] hover:underline"
                                                                    >
                                                                        <Eye className="size-3.5" /> View
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditModal(employee)}
                                                                        className="flex items-center gap-1 text-xs font-semibold text-[#175cd3] hover:underline"
                                                                    >
                                                                        <Edit3 className="size-3.5" /> Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setConfirmToggleEmployee(employee)}
                                                                        className={`flex items-center gap-1 text-xs font-semibold hover:underline ${
                                                                            employee.is_active ? 'text-[#b42318]' : 'text-[#067647]'
                                                                        }`}
                                                                    >
                                                                        {employee.is_active ? (
                                                                            <>
                                                                                <UserMinus className="size-3.5" /> Deactivate
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UserCheck className="size-3.5" /> Reactivate
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Panel>
                            </div>

                            {/* Sidebar Widgets */}
                            <aside className="grid content-start gap-4">
                                <Panel title="Regional coverage & shifts" icon={MapPinned}>
                                    <div className="px-5 pb-5 space-y-3">
                                        <div
                                            className="relative h-36 overflow-hidden rounded-md bg-[#dbeafe] p-3"
                                            style={{
                                                backgroundImage:
                                                    'radial-gradient(circle at 30% 35%, #175cd3 0 3px, transparent 4px), radial-gradient(circle at 70% 55%, #175cd3 0 3px, transparent 4px), linear-gradient(25deg, transparent 49%, rgba(23,92,211,.35) 50%, transparent 51%, transparent 52%)',
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#175cd3] shadow-sm">
                                                    Live Zone Staffing Map
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {zones.length === 0 ? (
                                                <EmptyState
                                                    title="No zones configured"
                                                    description="Operational zones and their staffing will appear here once they exist."
                                                    className="h-36"
                                                />
                                            ) : (
                                                zones.map((zone) => (
                                                    <div key={zone.id} className="flex items-center justify-between text-xs rounded border border-[#eaecf0] p-2 bg-[#f9fafb]">
                                                        <span className="font-medium text-[#344054]">{zone.name}</span>
                                                        <span className="rounded bg-[#eff4ff] px-2 py-0.5 font-semibold text-[#175cd3]">
                                                            {zone.staff_count} Officers
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </Panel>

                                <Panel title="Shift schedules & field timeline" icon={CalendarClock}>
                                    <div className="px-5 pb-5">
                                        {shifts.length === 0 ? (
                                            <EmptyState
                                                title="No scheduled shifts"
                                                description="Click 'Shift scheduler' to assign upcoming field shifts."
                                                className="h-36"
                                            />
                                        ) : (
                                            <div className="space-y-2 text-xs">
                                                {shifts.map((sh) => (
                                                    <div key={sh.id} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                                        <div className="flex justify-between font-semibold text-[#101828]">
                                                            <span>{sh.employee_name}</span>
                                                            <span className="capitalize text-[#175cd3]">{sh.shift_type}</span>
                                                        </div>
                                                        <p className="mt-1 text-[#667085]">
                                                            Date: {sh.shift_date} • {sh.zone_name || 'All Zones'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                                <Panel title="HR & compliance activity" icon={ShieldCheck}>
                                    <div className="px-5 pb-5 space-y-3">
                                        <div className="flex items-center justify-between rounded-md border border-[#eaecf0] bg-[#fbfcfe] px-3 py-2 text-xs">
                                            <span className="font-medium text-[#475467]">Compliance records logged</span>
                                            <span className="rounded bg-[#eff4ff] px-2 py-0.5 font-semibold text-[#175cd3]">
                                                {(workforceMetrics['complianceRecords'] ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        {timelineEvents.length === 0 ? (
                                            <EmptyState
                                                title="No HR activity yet"
                                                description="Employee, shift, and compliance actions will appear here as they are recorded."
                                                className="h-36"
                                            />
                                        ) : (
                                            <ul className="space-y-2 text-xs">
                                                {timelineEvents.map((event) => (
                                                    <li key={event.id} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="font-semibold text-[#101828]">{formatAction(event.action)}</p>
                                                            <span className="shrink-0 text-[10px] text-[#98a2b3]">
                                                                {new Date(event.created_at).toLocaleString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-[#667085]">
                                                            {event.user_name ?? 'System'}
                                                            {event.target_type ? ` · ${event.target_type}` : ''}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </Panel>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>

            {/* Modal: Add Employee */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">Add New Employee</h2>
                            <button type="button" onClick={() => setShowAddModal(false)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee} className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addData.name}
                                    onChange={(e) => setAddData('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={addData.email}
                                    onChange={(e) => setAddData('email', e.target.value)}
                                    placeholder="e.g. j.doe@erp.org"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Employee Code</label>
                                <input
                                    type="text"
                                    required
                                    value={addData.employee_code}
                                    onChange={(e) => setAddData('employee_code', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Department</label>
                                <select
                                    value={addData.department}
                                    onChange={(e) => setAddData('department', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="HR & Workforce">HR & Workforce</option>
                                    <option value="Field Operations">Field Operations</option>
                                    <option value="Inventory & Logistics">Inventory & Logistics</option>
                                    <option value="Sales & Trade">Sales & Trade</option>
                                    <option value="Farmer Subsidies">Farmer Subsidies</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Position / Role</label>
                                <input
                                    type="text"
                                    required
                                    value={addData.position}
                                    onChange={(e) => setAddData('position', e.target.value)}
                                    placeholder="e.g. Field Supervisor"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Assign Zone</label>
                                <select
                                    value={addData.zone_id}
                                    onChange={(e) => setAddData('zone_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">No Zone (Unassigned)</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Assign Depot</label>
                                <select
                                    value={addData.depot_id}
                                    onChange={(e) => setAddData('depot_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">No Depot (Unassigned)</option>
                                    {depots.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-4 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={addData.is_active}
                                    onChange={(e) => setAddData('is_active', e.target.checked)}
                                    className="size-4 rounded text-[#175cd3]"
                                />
                                <label htmlFor="is_active" className="text-xs font-medium text-[#344054]">
                                    Set Employee Active immediately
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 sm:col-span-2 border-t border-[#eaecf0]">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addProcessing}
                                    className="rounded-md bg-[#175cd3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    {addProcessing ? 'Saving...' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Employee */}
            {editingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">Edit Employee Record</h2>
                            <button type="button" onClick={() => setEditingEmployee(null)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-[#667085]">
                            Modifying details for <strong className="text-[#101828]">{editingEmployee.name}</strong> ({editingEmployee.employee_code})
                        </p>
                        <form onSubmit={handleEditEmployee} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Department</label>
                                <input
                                    type="text"
                                    value={editData.department}
                                    onChange={(e) => setEditData('department', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Position</label>
                                <input
                                    type="text"
                                    value={editData.position}
                                    onChange={(e) => setEditData('position', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Zone</label>
                                <select
                                    value={editData.zone_id}
                                    onChange={(e) => setEditData('zone_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">No Zone</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Depot</label>
                                <select
                                    value={editData.depot_id}
                                    onChange={(e) => setEditData('depot_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">No Depot</option>
                                    {depots.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit_active"
                                    checked={editData.is_active}
                                    onChange={(e) => setEditData('is_active', e.target.checked)}
                                    className="size-4 rounded text-[#175cd3]"
                                />
                                <label htmlFor="edit_active" className="text-xs font-medium text-[#344054]">
                                    Active Employee Status
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-[#eaecf0]">
                                <button
                                    type="button"
                                    onClick={() => setEditingEmployee(null)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="rounded-md bg-[#175cd3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    {editProcessing ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Employee details */}
            {viewingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">Employee details</h2>
                            <button type="button" onClick={() => setViewingEmployee(null)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="mt-5 flex items-center gap-4">
                            {viewingEmployee.profile_photo_path ? (
                                <img
                                    src={photoUrl(viewingEmployee.profile_photo_path) ?? ''}
                                    alt={viewingEmployee.name}
                                    className="size-14 rounded-full object-cover"
                                />
                            ) : (
                                <span className="flex size-14 items-center justify-center rounded-full bg-[#eff4ff] text-sm font-semibold text-[#175cd3]">
                                    {initials(viewingEmployee.name)}
                                </span>
                            )}
                            <div>
                                <p className="text-base font-semibold text-[#101828]">{viewingEmployee.name}</p>
                                <p className="text-sm text-[#667085]">{viewingEmployee.email}</p>
                                <span
                                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                        viewingEmployee.is_active ? 'bg-[#ecfdf3] text-[#067647]' : 'bg-[#f2f4f7] text-[#667085]'
                                    }`}
                                >
                                    {viewingEmployee.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
                            {(
                                [
                                    ['Employee code', viewingEmployee.employee_code],
                                    ['Department', viewingEmployee.department || 'Unassigned department'],
                                    ['Position', viewingEmployee.position || 'Unassigned position'],
                                    ['Zone', viewingEmployee.zone_name || 'No zone assigned'],
                                    ['Depot', viewingEmployee.depot_name || 'No depot assigned'],
                                    ['Employment status', viewingEmployee.is_active ? 'Active' : 'Inactive'],
                                    ['Record created', viewingEmployee.created_at ? new Date(viewingEmployee.created_at).toLocaleString() : '—'],
                                    ['Last updated', viewingEmployee.updated_at ? new Date(viewingEmployee.updated_at).toLocaleString() : '—'],
                                ] as Array<[string, string]>
                            ).map(([label, value]) => (
                                <div key={label} className="rounded-md border border-[#eaecf0] bg-[#fbfcfe] p-3">
                                    <dt className="text-[10px] font-semibold tracking-[0.08em] text-[#98a2b3] uppercase">{label}</dt>
                                    <dd className="mt-1 font-medium text-[#344054]">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewingEmployee(null)}
                                className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm status change */}
            {confirmToggleEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">
                                {confirmToggleEmployee.is_active ? 'Deactivate employee' : 'Reactivate employee'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setConfirmToggleEmployee(null)}
                                className="text-[#667085] hover:text-[#101828]"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[#475467]">
                            {confirmToggleEmployee.is_active
                                ? `Are you sure you want to deactivate ${confirmToggleEmployee.name} (${confirmToggleEmployee.employee_code})? They will be marked as an inactive employee. This action is recorded in the HR audit log.`
                                : `Are you sure you want to reactivate ${confirmToggleEmployee.name} (${confirmToggleEmployee.employee_code})? They will be restored as an active employee.`}
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmToggleEmployee(null)}
                                className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleStatus(confirmToggleEmployee)}
                                className={`rounded-md px-4 py-2 text-xs font-semibold text-white ${
                                    confirmToggleEmployee.is_active ? 'bg-[#b42318] hover:bg-[#912018]' : 'bg-[#067647] hover:bg-[#05603a]'
                                }`}
                            >
                                {confirmToggleEmployee.is_active ? 'Deactivate employee' : 'Reactivate employee'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Shift Scheduler */}
            {showShiftModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">Shift Scheduler</h2>
                            <button type="button" onClick={() => setShowShiftModal(false)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleScheduleShift} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Select Employee</label>
                                <select
                                    required
                                    value={shiftData.employee_id}
                                    onChange={(e) => setShiftData('employee_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name} ({e.employee_code}) - {e.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Shift Type</label>
                                <select
                                    value={shiftData.shift_type}
                                    onChange={(e) => setShiftData('shift_type', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="morning">Morning Shift (08:00 - 16:00)</option>
                                    <option value="afternoon">Afternoon Shift (16:00 - 00:00)</option>
                                    <option value="night">Night Shift (00:00 - 08:00)</option>
                                    <option value="field_duty">Field Duty / Inspection</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Shift Date</label>
                                <input
                                    type="date"
                                    required
                                    value={shiftData.shift_date}
                                    onChange={(e) => setShiftData('shift_date', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Target Zone (Optional)</label>
                                <select
                                    value={shiftData.zone_id}
                                    onChange={(e) => setShiftData('zone_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Shift Notes / Location</label>
                                <input
                                    type="text"
                                    value={shiftData.notes}
                                    onChange={(e) => setShiftData('notes', e.target.value)}
                                    placeholder="e.g. Depot inspection and biometric roster check"
                                    className="mt-1 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-[#eaecf0]">
                                <button
                                    type="button"
                                    onClick={() => setShowShiftModal(false)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={shiftProcessing}
                                    className="rounded-md bg-[#175cd3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1849a9]"
                                >
                                    {shiftProcessing ? 'Scheduling...' : 'Confirm Shift'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
