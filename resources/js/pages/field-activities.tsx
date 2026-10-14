import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    Plus,
    RefreshCw,
    Search,
    Users,
    X,
} from 'lucide-react';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import WorkspaceHeader from '@/components/workspace-header';

type Farmer = {
    id: number;
    full_name: string;
    national_id: string;
    zone_id: number | null;
};

type Employee = {
    id: number;
    name: string;
    zone_id: number | null;
};

type Activity = {
    id: number;
    farmer_id: number;
    farmer_name: string;
    national_id: string;
    zone_name: string | null;
    assigned_employee_id: number | null;
    assigned_employee_name: string | null;
    activity_type: string;
    scheduled_at: string | null;
    status: string;
    inspection_notes: string | null;
    result: string | null;
    completed_at: string | null;
};

type Props = {
    activities: Activity[];
    farmers: Farmer[];
    employees: Employee[];
};

const activityLabels: Record<string, string> = {
    farmer_verification: 'Farmer Verification',
    farm_inspection: 'Farm Inspection',
    field_visit: 'Field Visit',
};

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    in_progress: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
};

const inputClass =
    'w-full rounded-lg border border-[#d0e0d5] bg-white px-3 py-2.5 text-sm text-[#173b2b] outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/10';

export default function FieldActivities({
    activities,
    farmers,
    employees,
}: Props) {
    const [editingActivity, setEditingActivity] =
        useState<Activity | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const scheduleForm = useForm({
        farmer_id: '',
        assigned_employee_id: '',
        activity_type: 'farmer_verification',
        scheduled_at: '',
    });

    const updateForm = useForm({
        status: 'in_progress',
        inspection_notes: '',
        result: '',
    });

    function scheduleActivity(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        scheduleForm.post('/field-activities', {
            preserveScroll: true,
            onSuccess: () => scheduleForm.reset(),
        });
    }

    function openUpdate(activity: Activity) {
        setEditingActivity(activity);

        updateForm.setData({
            status: activity.status,
            inspection_notes: activity.inspection_notes ?? '',
            result: activity.result ?? '',
        });
    }

    function saveUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingActivity) return;

        updateForm.patch(`/field-activities/${editingActivity.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditingActivity(null),
        });
    }

    const pendingCount = activities.filter(
        (activity) => activity.status === 'pending',
    ).length;

    const inProgressCount = activities.filter(
        (activity) => activity.status === 'in_progress',
    ).length;

    const completedCount = activities.filter(
        (activity) => activity.status === 'completed',
    ).length;

    const filteredActivities = activities.filter((activity) => {
        const query = search.trim().toLowerCase();

        const searchableValues = [
            activity.farmer_name,
            activity.national_id,
            activity.zone_name ?? '',
            activity.assigned_employee_name ?? '',
            activityLabels[activity.activity_type] ??
                activity.activity_type,
        ];

        const matchesSearch = searchableValues.some((value) =>
            value.toLowerCase().includes(query),
        );

        const matchesStatus =
            statusFilter === 'all' || activity.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const metrics = [
        {
            label: 'Total Activities',
            value: activities.length,
            icon: ClipboardList,
            description: 'All recorded activities',
        },
        {
            label: 'Pending',
            value: pendingCount,
            icon: CalendarDays,
            description: 'Awaiting action',
        },
        {
            label: 'In Progress',
            value: inProgressCount,
            icon: RefreshCw,
            description: 'Currently ongoing',
        },
        {
            label: 'Completed',
            value: completedCount,
            icon: ClipboardCheck,
            description: 'Successfully completed',
        },
    ];

    return (
        <>
            <Head title="Field Activities" />

        <div className="min-h-screen bg-[#f5f8f6] dark:bg-gray-950">
            <WorkspaceHeader />

            <div className="flex min-h-screen items-start">
                <WorkspaceSidebar />

                <main className="min-w-0 flex-1 px-4 py-4 sm:px-5 lg:px-6">
                    <div className="mx-auto max-w-[1600px] space-y-4">
                        {/* Page heading */}
                        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#176b45]">
                                    Subsidy Management / Field Operations
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-[#173b2b]">
                                    Field Activities
                                </h1>

                                <p className="mt-1 text-sm text-[#667085]">
                                    Schedule farmer visits, assign employees,
                                    and monitor field inspection progress.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById('schedule-activity')
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center',
                                        })
                                }
                                className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#176b45] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638] focus:outline-none focus:ring-2 focus:ring-[#176b45]/30"
                            >
                                <Plus className="h-4 w-4" />
                                Schedule Activity
                            </button>
                        </header>

                        {/* Summary cards */}
                        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                            {metrics.map((metric) => {
                                const Icon = metric.icon;

                                return (
                                    <div
                                        key={metric.label}
                                        className="rounded-xl border border-[#dce8df] bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-[#667085]">
                                                    {metric.label}
                                                </p>

                                                <p className="mt-2 text-2xl font-bold text-[#176b45]">
                                                    {metric.value}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-[#e8f5ec] p-2">
                                                <Icon className="h-5 w-5 text-[#176b45]" />
                                            </div>
                                        </div>

                                        <p className="mt-1 text-xs text-[#667085]">
                                            {metric.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Schedule activity */}
                        <section
                            id="schedule-activity"
                            className="scroll-mt-4 rounded-xl border border-[#dce8df] bg-white shadow-sm"
                        >
                            <div className="flex items-center gap-3 border-b border-[#e0ebe3] px-4 py-3">
                                <div className="rounded-lg bg-[#e8f5ec] p-2">
                                    <Plus className="h-5 w-5 text-[#176b45]" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-[#173b2b]">
                                        Schedule a Field Activity
                                    </h2>
                                    <p className="text-xs text-[#667085]">
                                        Choose a farmer, activity type, and
                                        assigned employee.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={scheduleActivity}
                                className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4"
                            >
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                        Farmer *
                                    </label>

                                    <select
                                        required
                                        value={scheduleForm.data.farmer_id}
                                        onChange={(e) =>
                                            scheduleForm.setData(
                                                'farmer_id',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">Select farmer</option>

                                        {farmers.map((farmer) => (
                                            <option
                                                key={farmer.id}
                                                value={farmer.id}
                                            >
                                                {farmer.full_name} —{' '}
                                                {farmer.national_id}
                                            </option>
                                        ))}
                                    </select>

                                    {scheduleForm.errors.farmer_id && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {scheduleForm.errors.farmer_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                        Activity Type *
                                    </label>

                                    <select
                                        required
                                        value={scheduleForm.data.activity_type}
                                        onChange={(e) =>
                                            scheduleForm.setData(
                                                'activity_type',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="farmer_verification">
                                            Farmer Verification
                                        </option>
                                        <option value="farm_inspection">
                                            Farm Inspection
                                        </option>
                                        <option value="field_visit">
                                            Field Visit
                                        </option>
                                    </select>

                                    {scheduleForm.errors.activity_type && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {scheduleForm.errors.activity_type}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                        Assigned Employee
                                    </label>

                                    <select
                                        value={
                                            scheduleForm.data
                                                .assigned_employee_id
                                        }
                                        onChange={(e) =>
                                            scheduleForm.setData(
                                                'assigned_employee_id',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">Unassigned</option>

                                        {employees.map((employee) => (
                                            <option
                                                key={employee.id}
                                                value={employee.id}
                                            >
                                                {employee.name}
                                            </option>
                                        ))}
                                    </select>

                                    {scheduleForm.errors
                                        .assigned_employee_id && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                scheduleForm.errors
                                                    .assigned_employee_id
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                        Scheduled Date and Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={scheduleForm.data.scheduled_at}
                                        onChange={(e) =>
                                            scheduleForm.setData(
                                                'scheduled_at',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {scheduleForm.errors.scheduled_at && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {scheduleForm.errors.scheduled_at}
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2 xl:col-span-4">
                                    <button
                                        type="submit"
                                        disabled={scheduleForm.processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176b45] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638] focus:outline-none focus:ring-2 focus:ring-[#176b45]/30 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />

                                        {scheduleForm.processing
                                            ? 'Scheduling...'
                                            : 'Schedule Activity'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Activity records */}
                        <section className="overflow-hidden rounded-xl border border-[#dce8df] bg-white shadow-sm">
                            <div className="border-b border-[#e0ebe3] p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#176b45]" />

                                            <h2 className="font-semibold text-[#173b2b]">
                                                Field Activity Records
                                            </h2>

                                            <span className="rounded-full bg-[#e8f5ec] px-2.5 py-1 text-xs font-semibold text-[#176b45]">
                                                {filteredActivities.length}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-[#667085]">
                                            Review visits and update inspection
                                            progress.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#667085]" />

                                            <input
                                                type="search"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Search farmer or employee..."
                                                aria-label="Search field activities"
                                                className={`${inputClass} py-2 pl-9 sm:w-64`}
                                            />
                                        </div>

                                        <select
                                            value={statusFilter}
                                            onChange={(e) =>
                                                setStatusFilter(e.target.value)
                                            }
                                            className={`${inputClass} py-2 sm:w-40`}
                                            aria-label="Filter by status"
                                        >
                                            <option value="all">
                                                All statuses
                                            </option>
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="in_progress">
                                                In Progress
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                    <thead className="bg-[#f0f7f2] text-xs uppercase tracking-wide text-[#426653]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">
                                                Farmer
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Zone
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Activity
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Assigned To
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Schedule
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#e6eee8]">
                                        {filteredActivities.map((activity) => (
                                            <tr
                                                key={activity.id}
                                                className="transition-colors hover:bg-[#f5faf6]"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-[#173b2b]">
                                                        {activity.farmer_name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-[#667085]">
                                                        {activity.national_id}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-3 text-[#667085]">
                                                    {activity.zone_name ??
                                                        'Unassigned'}
                                                </td>

                                                <td className="px-4 py-3 text-[#344054]">
                                                    {activityLabels[
                                                        activity.activity_type
                                                    ] ?? activity.activity_type}
                                                </td>

                                                <td className="px-4 py-3 text-[#667085]">
                                                    {activity.assigned_employee_name ??
                                                        'Unassigned'}
                                                </td>

                                                <td className="px-4 py-3 text-[#667085]">
                                                    {activity.scheduled_at
                                                        ? new Date(
                                                              activity.scheduled_at.replace(
                                                                  ' ',
                                                                  'T',
                                                              ),
                                                          ).toLocaleString()
                                                        : 'Not scheduled'}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            statusStyles[
                                                                activity.status
                                                            ] ??
                                                            statusStyles.pending
                                                        }`}
                                                    >
                                                        {activity.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openUpdate(activity)
                                                        }
                                                        className="rounded-lg border border-[#b8d7c2] bg-white px-3 py-1.5 text-xs font-semibold text-[#176b45] transition hover:bg-[#e8f5ec]"
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredActivities.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-12 text-center"
                                                >
                                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                                        <div className="rounded-full bg-[#e8f5ec] p-3">
                                                            <ClipboardList className="h-6 w-6 text-[#176b45]" />
                                                        </div>

                                                        <p className="mt-3 font-semibold text-[#173b2b]">
                                                            No activities found
                                                        </p>

                                                        <p className="mt-1 text-sm text-[#667085]">
                                                            {activities.length ===
                                                            0
                                                                ? 'Schedule your first field activity using the form above.'
                                                                : 'Try another search term or select a different status.'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-[#e0ebe3] px-4 py-3">
                                <p className="text-xs text-[#667085]">
                                    Showing {filteredActivities.length} of{' '}
                                    {activities.length} activities
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
            </div>

            {/* Update activity modal */}
            {editingActivity && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#10271b]/50 p-4 backdrop-blur-[2px]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setEditingActivity(null);
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-lg rounded-2xl border border-[#dce8df] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#e0ebe3] p-5">
                            <div>
                                <h2 className="font-semibold text-[#173b2b]">
                                    Update Field Activity
                                </h2>

                                <p className="mt-1 text-sm text-[#667085]">
                                    {editingActivity.farmer_name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingActivity(null)}
                                className="rounded-lg p-2 text-[#667085] transition hover:bg-[#f0f7f2] hover:text-[#176b45]"
                                aria-label="Close update form"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={saveUpdate}
                            className="space-y-4 p-5"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Status *
                                </label>

                                <select
                                    required
                                    value={updateForm.data.status}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'status',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">
                                        In Progress
                                    </option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                {updateForm.errors.status && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {updateForm.errors.status}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Inspection Notes
                                </label>

                                <textarea
                                    rows={3}
                                    value={updateForm.data.inspection_notes}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'inspection_notes',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Record observations from the visit..."
                                />

                                {updateForm.errors.inspection_notes && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {updateForm.errors.inspection_notes}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                                    Result / Findings
                                </label>

                                <textarea
                                    rows={3}
                                    value={updateForm.data.result}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'result',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Record verification results or findings..."
                                />

                                {updateForm.errors.result && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {updateForm.errors.result}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[#e0ebe3] pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingActivity(null)}
                                    className="rounded-lg border border-[#d0e0d5] px-4 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f5faf6]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updateForm.processing}
                                    className="rounded-lg bg-[#176b45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#125638] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updateForm.processing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
