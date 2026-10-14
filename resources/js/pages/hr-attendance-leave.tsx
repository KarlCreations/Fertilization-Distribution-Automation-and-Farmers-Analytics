import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, CalendarClock, CheckCircle2, Clock, Search, UserCheck, UserX, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import WorkspaceHeader from '@/components/workspace-header';
import WorkspaceSidebar from '@/components/workspace-sidebar';
import { type SharedData } from '@/types';

type AttendanceRecord = {
    id: number;
    date: string;
    status: 'present' | 'late' | 'absent' | 'on_leave';
    clock_in: string | null;
    clock_out: string | null;
    notes: string | null;
    employee_name: string;
    employee_email: string;
    employee_code: string;
    department: string | null;
};

type DailyAttendance = {
    id: number;
    employee_code: string;
    employee_name: string;
    department: string | null;
    clock_in: string | null;
    clock_out: string | null;
    time_in: string | null;
    time_out: string | null;
    status: 'present' | 'late' | 'absent' | 'on_leave' | 'rest_day';
    has_approved_leave: boolean;
};

type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'rest_day';

type AttendanceEntry = {
    employee_id: number;
    status: AttendanceStatus;
    time_in: string;
    time_out: string;
};

type LeaveRequest = {
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    employee_name: string;
    employee_email: string;
    employee_code: string;
    department: string | null;
    reviewer_name: string | null;
};

type Summary = {
    present: number;
    late: number;
    absent: number;
    on_leave: number;
    rest_day: number;
    active_employees: number;
    pending_leaves: number;
};

export default function HrAttendanceLeave({
    summary,
    selectedDate,
    dailyAttendance = [],
    attendanceRecords = [],
    leaveRequests = [],
}: {
    summary: Summary;
    selectedDate: string;
    dailyAttendance: DailyAttendance[];
    attendanceRecords: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
}) {
    const { flash } = usePage<SharedData & { flash?: { success?: string; error?: string } }>().props;

    const [activeTab, setActiveTab] = useState<'leaves' | 'attendance'>('leaves');
    const [leaveSearch, setLeaveSearch] = useState('');
    const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('ALL');

    const [attendanceSearch, setAttendanceSearch] = useState('');
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('ALL');

    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

    const {
        data: attendanceData,
        setData: setAttendanceData,
        post: postAttendance,
        processing: attendanceProcessing,
        errors: attendanceErrors,
    } = useForm<{ date: string; attendance: AttendanceEntry[] }>({
        date: selectedDate,
        attendance: dailyAttendance.map((employee) => ({
            employee_id: employee.id,
            status: employee.status === 'late' ? 'present' : employee.status,
            time_in: employee.time_in ?? '',
            time_out: employee.time_out ?? '',
        })),
    });

    useEffect(() => {
        setAttendanceData({
            date: selectedDate,
            attendance: dailyAttendance.map((employee) => ({
                employee_id: employee.id,
                status: employee.status === 'late' ? 'present' : employee.status,
                time_in: employee.time_in ?? '',
                time_out: employee.time_out ?? '',
            })),
        });
    }, [dailyAttendance, selectedDate, setAttendanceData]);

    const {
        data: reviewData,
        setData: setReviewData,
        post: postReview,
        processing: reviewProcessing,
    } = useForm({
        status: 'approved' as 'approved' | 'rejected',
        admin_notes: '',
    });

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLeave) return;

        postReview(route('hr.leave-requests.review', selectedLeave.id), {
            onSuccess: () => {
                setSelectedLeave(null);
                setReviewData('admin_notes', '');
            },
        });
    };

    const openReviewModal = (leave: LeaveRequest, action: 'approved' | 'rejected') => {
        setSelectedLeave(leave);
        setReviewData({
            status: action,
            admin_notes: action === 'approved' ? 'Approved by HR manager.' : 'Request cannot be granted at this time.',
        });
    };

    const filteredLeaves = leaveRequests.filter((leave) => {
        const term = leaveSearch.toLowerCase();
        const matchesSearch =
            leave.employee_name.toLowerCase().includes(term) ||
            leave.employee_code.toLowerCase().includes(term) ||
            leave.leave_type.toLowerCase().includes(term) ||
            (leave.reason && leave.reason.toLowerCase().includes(term));

        const matchesStatus = leaveStatusFilter === 'ALL' || leave.status === leaveStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const filteredAttendance = attendanceRecords.filter((record) => {
        const term = attendanceSearch.toLowerCase();
        const matchesSearch =
            record.employee_name.toLowerCase().includes(term) ||
            record.employee_code.toLowerCase().includes(term) ||
            (record.department && record.department.toLowerCase().includes(term)) ||
            (record.notes && record.notes.toLowerCase().includes(term));

        const matchesStatus = attendanceStatusFilter === 'ALL' || record.status === attendanceStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const attendanceRows = dailyAttendance.flatMap((employee) => {
        const index = attendanceData.attendance.findIndex((entry) => entry.employee_id === employee.id);
        const entry = attendanceData.attendance[index];
        if (!entry) {
            return [];
        }

        const displayStatus = entry.status === 'present' && entry.time_in && entry.time_in > '08:00' ? 'late' : entry.status;
        const term = attendanceSearch.toLowerCase();
        const matchesSearch =
            employee.employee_name.toLowerCase().includes(term) ||
            employee.employee_code.toLowerCase().includes(term) ||
            (employee.department && employee.department.toLowerCase().includes(term));
        const matchesStatus = attendanceStatusFilter === 'ALL' || displayStatus === attendanceStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus ? [{ employee, entry, index, displayStatus }] : [];
    });

    const updateAttendanceEntry = (employeeId: number, key: keyof Omit<AttendanceEntry, 'employee_id'>, value: string) => {
        setAttendanceData(
            'attendance',
            attendanceData.attendance.map((entry) => (entry.employee_id === employeeId ? { ...entry, [key]: value } : entry)),
        );
    };

    const saveAttendance = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        postAttendance(route('hr.attendance.store'), {
            preserveScroll: true,
        });
    };

    const selectedDateLabel = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${selectedDate}T00:00:00`));

    return (
        <>
            <Head title="Attendance & Leave" />
            <div className="hr-interface min-h-screen bg-[#f6f8fb] text-[#101828]">
                <WorkspaceHeader />

                <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
                    <WorkspaceSidebar />
                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
                        {flash?.success && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-[#abefc6] bg-[#ecfdf3] p-4 text-sm font-medium text-[#067647]">
                                <CheckCircle2 className="size-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex gap-2 text-xs font-medium text-[#667085]">
                                    <span>Enterprise</span>
                                    <span>/</span>
                                    <span className="text-[#175cd3]">Attendance & Leave Management</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Attendance & Leave</h1>
                                <p className="mt-1 max-w-2xl text-sm text-[#667085]">
                                    Monitor employee daily attendance, review check-in history, and approve or reject leave applications.
                                </p>
                            </div>
                        </div>

                        {/* KPI Summary Cards */}
                        <p className="mb-3 text-xs text-[#667085]">
                            Daily attendance for {selectedDateLabel} · {summary.active_employees} active employees
                        </p>
                        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">Present</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#ecfdf3] text-[#067647]">
                                        <UserCheck className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.present}</p>
                                <p className="mt-1 text-xs text-[#067647]">On-time check-ins</p>
                            </div>

                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">Late Check-ins</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#fffaeb] text-[#b54708]">
                                        <Clock className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.late}</p>
                                <p className="mt-1 text-xs text-[#b54708]">Delayed arrivals</p>
                            </div>

                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">Absent</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#fef3f2] text-[#b42318]">
                                        <UserX className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.absent}</p>
                                <p className="mt-1 text-xs text-[#b42318]">Unexcused absences</p>
                            </div>

                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">On Leave</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#eff4ff] text-[#175cd3]">
                                        <CalendarClock className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.on_leave}</p>
                                <p className="mt-1 text-xs text-[#175cd3]">Approved leave status</p>
                            </div>

                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">Rest Day</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#f2f4f7] text-[#475467]">
                                        <Calendar className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.rest_day}</p>
                                <p className="mt-1 text-xs text-[#475467]">No shift scheduled</p>
                            </div>

                            <div className="rounded-lg border border-[#eaecf0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#667085] uppercase">Pending Requests</p>
                                    <span className="flex size-8 items-center justify-center rounded-md bg-[#f4f3ff] text-[#6938ef]">
                                        <Calendar className="size-4" />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold text-[#101828]">{summary.pending_leaves}</p>
                                <p className="mt-1 text-xs text-[#6938ef]">Requires action</p>
                            </div>
                        </section>

                        {/* Navigation Tabs */}
                        <div className="mb-6 border-b border-[#eaecf0]">
                            <nav className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('leaves')}
                                    className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                                        activeTab === 'leaves'
                                            ? 'border-[#175cd3] text-[#175cd3]'
                                            : 'border-transparent text-[#667085] hover:text-[#101828]'
                                    }`}
                                >
                                    Leave Requests Management ({leaveRequests.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('attendance')}
                                    className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                                        activeTab === 'attendance'
                                            ? 'border-[#175cd3] text-[#175cd3]'
                                            : 'border-transparent text-[#667085] hover:text-[#101828]'
                                    }`}
                                >
                                    Attendance History & Logs ({dailyAttendance.length})
                                </button>
                            </nav>
                        </div>

                        {/* TAB 1: Leave Requests */}
                        {activeTab === 'leaves' && (
                            <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative max-w-md min-w-0 flex-1">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                        <input
                                            value={leaveSearch}
                                            onChange={(e) => setLeaveSearch(e.target.value)}
                                            placeholder="Search leave requests by employee or reason..."
                                            className="h-9 w-full rounded-md border border-[#d0d5dd] bg-[#f9fafb] pr-3 pl-9 text-xs outline-none focus:border-[#175cd3]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={leaveStatusFilter}
                                            onChange={(e) => setLeaveStatusFilter(e.target.value)}
                                            className="h-9 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#344054] outline-none"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-[#eaecf0] bg-[#f9fafb] text-[10px] font-semibold tracking-wider text-[#667085] uppercase">
                                            <tr>
                                                <th className="px-5 py-3">Employee</th>
                                                <th className="px-5 py-3">Leave Type</th>
                                                <th className="px-5 py-3">Duration</th>
                                                <th className="px-5 py-3">Reason</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Actions / Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eaecf0]">
                                            {filteredLeaves.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-12 text-center text-[#667085]">
                                                        No leave requests found matching your filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredLeaves.map((leave) => (
                                                    <tr key={leave.id} className="hover:bg-[#f9fafb]">
                                                        <td className="px-5 py-4">
                                                            <p className="font-semibold text-[#101828]">{leave.employee_name}</p>
                                                            <p className="mt-0.5 text-[#98a2b3]">{leave.employee_code}</p>
                                                        </td>
                                                        <td className="px-5 py-4 font-medium text-[#344054] capitalize">{leave.leave_type} Leave</td>
                                                        <td className="px-5 py-4 text-[#475467]">
                                                            <p className="font-medium">
                                                                {leave.start_date} to {leave.end_date}
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-[#98a2b3]">
                                                                Requested: {new Date(leave.created_at).toLocaleDateString()}
                                                            </p>
                                                        </td>
                                                        <td className="max-w-xs truncate px-5 py-4 text-[#475467]">{leave.reason || '—'}</td>
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                                                                    leave.status === 'approved'
                                                                        ? 'bg-[#ecfdf3] text-[#067647]'
                                                                        : leave.status === 'rejected'
                                                                          ? 'bg-[#fef3f2] text-[#b42318]'
                                                                          : 'bg-[#fffaeb] text-[#b54708]'
                                                                }`}
                                                            >
                                                                {leave.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {leave.status === 'pending' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openReviewModal(leave, 'approved')}
                                                                        className="flex items-center gap-1 rounded bg-[#067647] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#05603a]"
                                                                    >
                                                                        <CheckCircle2 className="size-3" /> Approve
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openReviewModal(leave, 'rejected')}
                                                                        className="flex items-center gap-1 rounded bg-[#b42318] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#912015]"
                                                                    >
                                                                        <XCircle className="size-3" /> Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-[11px] text-[#667085]">
                                                                    <p>Reviewed by: {leave.reviewer_name || 'HR Admin'}</p>
                                                                    {leave.admin_notes && (
                                                                        <p className="mt-0.5 text-[#98a2b3] italic">
                                                                            &quot;{leave.admin_notes}&quot;
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* TAB 2: Attendance Records */}
                        {activeTab === 'attendance' && (
                            <div className="space-y-6">
                                <form id="daily-attendance-form" onSubmit={saveAttendance}>
                                    <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white shadow-sm">
                                        <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-sm font-semibold text-[#101828]">Attendance for {selectedDateLabel}</h2>
                                                <p className="mt-1 text-xs text-[#667085]">
                                                    Record each active employee&apos;s status. Approved leave and scheduled shifts are used to prefill
                                                    the day.
                                                </p>
                                            </div>
                                            <label className="flex items-center gap-2 text-xs font-semibold text-[#344054]">
                                                <Calendar className="size-4 text-[#667085]" />
                                                <span className="sr-only">Attendance date</span>
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(event) =>
                                                        router.get(
                                                            route('hr-attendance-leave'),
                                                            { date: event.target.value },
                                                            { preserveState: true, preserveScroll: true, replace: true },
                                                        )
                                                    }
                                                    className="h-9 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#344054] outline-none focus:border-[#175cd3]"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex flex-col gap-3 border-b border-[#eaecf0] p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="relative max-w-md min-w-0 flex-1">
                                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98a2b3]" />
                                                <input
                                                    value={attendanceSearch}
                                                    onChange={(e) => setAttendanceSearch(e.target.value)}
                                                    placeholder="Search employee by name, ID, or department..."
                                                    aria-label="Search daily attendance"
                                                    className="h-9 w-full rounded-md border border-[#d0d5dd] bg-[#f9fafb] pr-3 pl-9 text-xs outline-none focus:border-[#175cd3]"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={attendanceStatusFilter}
                                                    onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                                                    aria-label="Filter daily attendance by status"
                                                    className="h-9 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#344054] outline-none"
                                                >
                                                    <option value="ALL">All Statuses</option>
                                                    <option value="PRESENT">Present</option>
                                                    <option value="LATE">Late</option>
                                                    <option value="ABSENT">Absent</option>
                                                    <option value="ON_LEAVE">On Leave</option>
                                                    <option value="REST_DAY">Rest Day</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="border-b border-[#eaecf0] bg-[#f9fafb] text-[10px] font-semibold tracking-wider text-[#667085] uppercase">
                                                    <tr>
                                                        <th className="px-5 py-3">Employee</th>
                                                        <th className="px-5 py-3">Employee ID</th>
                                                        <th className="px-5 py-3">Time In</th>
                                                        <th className="px-5 py-3">Time Out</th>
                                                        <th className="px-5 py-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#eaecf0]">
                                                    {attendanceRows.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-5 py-12 text-center text-[#667085]">
                                                                No active employees match this date and filter.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        attendanceRows.map(({ employee, entry, index, displayStatus }) => (
                                                            <tr key={employee.id} className="hover:bg-[#f9fafb]">
                                                                <td className="px-5 py-4">
                                                                    <p className="font-semibold text-[#101828]">{employee.employee_name}</p>
                                                                    <p className="mt-0.5 text-[#98a2b3]">{employee.department || 'General'}</p>
                                                                </td>
                                                                <td className="px-5 py-4 font-medium text-[#344054]">{employee.employee_code}</td>
                                                                <td className="px-5 py-4">
                                                                    <input
                                                                        type="time"
                                                                        aria-label={`Time in for ${employee.employee_name}`}
                                                                        value={entry.time_in}
                                                                        disabled={entry.status !== 'present'}
                                                                        onChange={(event) =>
                                                                            updateAttendanceEntry(employee.id, 'time_in', event.target.value)
                                                                        }
                                                                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-xs text-[#344054] outline-none focus:border-[#175cd3] disabled:cursor-not-allowed disabled:opacity-60"
                                                                    />
                                                                    {attendanceErrors[`attendance.${index}.time_in`] && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {attendanceErrors[`attendance.${index}.time_in`]}
                                                                        </p>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <input
                                                                        type="time"
                                                                        aria-label={`Time out for ${employee.employee_name}`}
                                                                        value={entry.time_out}
                                                                        disabled={entry.status !== 'present'}
                                                                        onChange={(event) =>
                                                                            updateAttendanceEntry(employee.id, 'time_out', event.target.value)
                                                                        }
                                                                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-xs text-[#344054] outline-none focus:border-[#175cd3] disabled:cursor-not-allowed disabled:opacity-60"
                                                                    />
                                                                    {attendanceErrors[`attendance.${index}.time_out`] && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {attendanceErrors[`attendance.${index}.time_out`]}
                                                                        </p>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <select
                                                                        aria-label={`Attendance status for ${employee.employee_name}`}
                                                                        value={entry.status}
                                                                        onChange={(event) => {
                                                                            const status = event.target.value as AttendanceStatus;
                                                                            setAttendanceData(
                                                                                'attendance',
                                                                                attendanceData.attendance.map((attendanceEntry) =>
                                                                                    attendanceEntry.employee_id === employee.id
                                                                                        ? {
                                                                                              ...attendanceEntry,
                                                                                              status,
                                                                                              time_in:
                                                                                                  status === 'present' ? attendanceEntry.time_in : '',
                                                                                              time_out:
                                                                                                  status === 'present'
                                                                                                      ? attendanceEntry.time_out
                                                                                                      : '',
                                                                                          }
                                                                                        : attendanceEntry,
                                                                                ),
                                                                            );
                                                                        }}
                                                                        className="h-9 rounded-md border border-[#d0d5dd] bg-white px-2 text-xs font-medium text-[#344054] outline-none focus:border-[#175cd3]"
                                                                    >
                                                                        <option value="present">Present</option>
                                                                        <option value="absent">Absent</option>
                                                                        <option value="on_leave">On Leave</option>
                                                                        <option value="rest_day">Rest Day</option>
                                                                    </select>
                                                                    <span
                                                                        className={`mt-1 block w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                                                                            displayStatus === 'present'
                                                                                ? 'bg-[#ecfdf3] text-[#067647]'
                                                                                : displayStatus === 'late'
                                                                                  ? 'bg-[#fffaeb] text-[#b54708]'
                                                                                  : displayStatus === 'absent'
                                                                                    ? 'bg-[#fef3f2] text-[#b42318]'
                                                                                    : displayStatus === 'rest_day'
                                                                                      ? 'bg-[#f2f4f7] text-[#475467]'
                                                                                      : 'bg-[#eff4ff] text-[#175cd3]'
                                                                        }`}
                                                                    >
                                                                        {displayStatus.replace('_', ' ')}
                                                                    </span>
                                                                    {employee.has_approved_leave && !entry.time_in && (
                                                                        <p className="mt-1 text-[10px] text-[#175cd3]">Approved leave</p>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {attendanceErrors.attendance && (
                                            <p className="px-4 pt-3 text-sm text-red-600">{attendanceErrors.attendance}</p>
                                        )}
                                        <div className="flex items-center justify-end border-t border-[#eaecf0] p-4">
                                            <button
                                                type="submit"
                                                form="daily-attendance-form"
                                                disabled={attendanceProcessing}
                                                className="rounded-md bg-[#175cd3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1849a9] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {attendanceProcessing ? 'Saving attendance...' : 'Save daily attendance'}
                                            </button>
                                        </div>
                                    </section>
                                </form>
                                <section className="overflow-hidden rounded-lg border border-[#eaecf0] bg-white shadow-sm">
                                    <div className="border-b border-[#eaecf0] p-4">
                                        <h2 className="text-sm font-semibold text-[#101828]">Attendance History &amp; Logs</h2>
                                        <p className="mt-1 text-xs text-[#667085]">Recorded attendance entries across dates.</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="border-b border-[#eaecf0] bg-[#f9fafb] text-[10px] font-semibold tracking-wider text-[#667085] uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">Employee</th>
                                                    <th className="px-5 py-3">Department</th>
                                                    <th className="px-5 py-3">Date</th>
                                                    <th className="px-5 py-3">Status</th>
                                                    <th className="px-5 py-3">Time In</th>
                                                    <th className="px-5 py-3">Time Out</th>
                                                    <th className="px-5 py-3">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#eaecf0]">
                                                {filteredAttendance.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-5 py-12 text-center text-[#667085]">
                                                            No attendance history found for these filters.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredAttendance.map((record) => (
                                                        <tr key={record.id} className="hover:bg-[#f9fafb]">
                                                            <td className="px-5 py-4">
                                                                <p className="font-semibold text-[#101828]">{record.employee_name}</p>
                                                                <p className="mt-0.5 text-[#98a2b3]">{record.employee_code}</p>
                                                            </td>
                                                            <td className="px-5 py-4 text-[#475467]">{record.department || 'General'}</td>
                                                            <td className="px-5 py-4 font-medium text-[#101828]">{record.date}</td>
                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                                                                        record.status === 'present'
                                                                            ? 'bg-[#ecfdf3] text-[#067647]'
                                                                            : record.status === 'late'
                                                                              ? 'bg-[#fffaeb] text-[#b54708]'
                                                                              : record.status === 'absent'
                                                                                ? 'bg-[#fef3f2] text-[#b42318]'
                                                                                : 'bg-[#eff4ff] text-[#175cd3]'
                                                                    }`}
                                                                >
                                                                    {record.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-[#475467]">{record.clock_in || '—'}</td>
                                                            <td className="px-5 py-4 text-[#475467]">{record.clock_out || '—'}</td>
                                                            <td className="px-5 py-4 text-[#667085]">{record.notes || '—'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal: Review Leave Request */}
            {selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                            <h2 className="text-lg font-semibold text-[#101828]">
                                {reviewData.status === 'approved' ? 'Approve' : 'Reject'} Leave Request
                            </h2>
                            <button type="button" onClick={() => setSelectedLeave(null)} className="text-[#667085] hover:text-[#101828]">
                                <X className="size-5" />
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-[#667085]">
                            Reviewing request for <strong className="text-[#101828]">{selectedLeave.employee_name}</strong> (
                            {selectedLeave.employee_code})
                        </p>
                        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#344054]">Review Notes / Decision Reason</label>
                                <textarea
                                    value={reviewData.admin_notes}
                                    onChange={(e) => setReviewData('admin_notes', e.target.value)}
                                    placeholder="Enter administrative notes for the employee..."
                                    className="mt-1 h-24 w-full rounded-md border border-[#d0d5dd] p-2 text-xs outline-none focus:border-[#175cd3]"
                                />
                            </div>
                            <div className="flex justify-end gap-2 border-t border-[#eaecf0] pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLeave(null)}
                                    className="rounded-md border border-[#d0d5dd] px-4 py-2 text-xs font-medium text-[#344054]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewProcessing}
                                    className={`rounded-md px-4 py-2 text-xs font-semibold text-white ${
                                        reviewData.status === 'approved' ? 'bg-[#067647] hover:bg-[#05603a]' : 'bg-[#b42318] hover:bg-[#912015]'
                                    }`}
                                >
                                    {reviewProcessing ? 'Saving...' : `Confirm ${reviewData.status === 'approved' ? 'Approval' : 'Rejection'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
