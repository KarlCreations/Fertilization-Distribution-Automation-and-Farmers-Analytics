<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HrController extends Controller
{
    /**
     * Display the HR operations dashboard.
     */
    public function dashboard(): Response
    {
        $totalEmployees = DB::table('erp_employees')->count();
        $activeEmployees = DB::table('erp_employees')->where('is_active', true)->count();
        $fieldAssigned = DB::table('erp_employees')->whereNotNull('zone_id')->count();
        $openActionsCount = DB::table('erp_staffing_actions')->whereIn('status', ['open', 'in_progress'])->count();
        $todayStr = now()->format('Y-m-d');
        $attendanceSummary = $this->attendanceSummary($this->dailyAttendance($todayStr));
        $attendanceActivity = $activeEmployees > 0
            ? round((($attendanceSummary['present'] + $attendanceSummary['late']) / $activeEmployees) * 100, 1)
            : 0;

        // Pending leave requests
        $pendingLeaveRequests = DB::table('erp_leave_requests')
            ->join('erp_employees', 'erp_employees.id', '=', 'erp_leave_requests.employee_id')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->where('erp_leave_requests.status', 'pending')
            ->orderByDesc('erp_leave_requests.created_at')
            ->limit(6)
            ->get([
                'erp_leave_requests.id',
                'erp_leave_requests.leave_type',
                'erp_leave_requests.start_date',
                'erp_leave_requests.end_date',
                'erp_leave_requests.reason',
                'erp_leave_requests.status',
                'erp_leave_requests.created_at',
                'users.name as employee_name',
                'erp_employees.employee_code',
                'erp_employees.department',
            ]);

        // Upcoming employee schedules
        $upcomingSchedules = DB::table('erp_shifts')
            ->join('erp_employees', 'erp_employees.id', '=', 'erp_shifts.employee_id')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_shifts.zone_id')
            ->where('erp_shifts.shift_date', '>=', now()->format('Y-m-d'))
            ->orderBy('erp_shifts.shift_date')
            ->limit(6)
            ->get([
                'erp_shifts.id',
                'erp_shifts.shift_type',
                'erp_shifts.shift_date',
                'erp_shifts.status',
                'erp_shifts.notes',
                'users.name as employee_name',
                'erp_employees.employee_code',
                'erp_zones.name as zone_name',
            ]);

        // Department breakdown
        $departmentBreakdown = DB::table('erp_employees')
            ->select('department', DB::raw('count(*) as total'))
            ->groupBy('department')
            ->get();

        // Recent workforce audit activity
        $recentActivity = DB::table('erp_audit_events')
            ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
            ->where('erp_audit_events.module', 'hr')
            ->orderByDesc('erp_audit_events.id')
            ->limit(6)
            ->get([
                'erp_audit_events.id',
                'erp_audit_events.action',
                'erp_audit_events.target_type',
                'erp_audit_events.target_id',
                'erp_audit_events.created_at',
                'users.name as user_name',
            ]);

        // Field operations by zone
        $fieldOperations = DB::table('erp_zones')
            ->leftJoin('erp_employees', 'erp_employees.zone_id', '=', 'erp_zones.id')
            ->select('erp_zones.id', 'erp_zones.name', 'erp_zones.zone_group', DB::raw('count(erp_employees.id) as staff_count'))
            ->groupBy('erp_zones.id', 'erp_zones.name', 'erp_zones.zone_group')
            ->get();

        // Open staffing actions
        $staffingActions = DB::table('erp_staffing_actions')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_staffing_actions.zone_id')
            ->orderByDesc('erp_staffing_actions.id')
            ->limit(6)
            ->get([
                'erp_staffing_actions.id',
                'erp_staffing_actions.title',
                'erp_staffing_actions.action_type',
                'erp_staffing_actions.status',
                'erp_staffing_actions.details',
                'erp_staffing_actions.created_at',
                'erp_zones.name as zone_name',
            ]);

        $zones = DB::table('erp_zones')->get(['id', 'name', 'zone_no']);
        $depots = DB::table('erp_depots')->get(['id', 'name', 'code']);

        return Inertia::render('role-dashboard', [
            'role' => 'hr',
            'dashboardData' => [
                'metrics' => [
                    'workforceRoster' => $totalEmployees,
                    'fieldReadiness' => $fieldAssigned,
                    'attendanceActivity' => $attendanceActivity,
                    'openStaffingActions' => $openActionsCount,
                    'attendanceSummary' => [
                        'present' => $attendanceSummary['present'],
                        'late' => $attendanceSummary['late'],
                        'absent' => $attendanceSummary['absent'],
                        'onLeave' => $attendanceSummary['on_leave'],
                        'restDay' => $attendanceSummary['rest_day'],
                    ],
                ],
                'pendingLeaveRequests' => $pendingLeaveRequests,
                'upcomingSchedules' => $upcomingSchedules,
                'recentActivity' => $recentActivity,
                'fieldOperations' => $fieldOperations,
                'staffingActions' => $staffingActions,
                'departmentBreakdown' => $departmentBreakdown,
                'zones' => $zones,
                'depots' => $depots,
            ],
        ]);
    }

    /**
     * Display the HR & workforce management page.
     */
    public function workforce(): Response
    {
        $activeCount = DB::table('erp_employees')->where('is_active', true)->count();
        $inactiveCount = DB::table('erp_employees')->where('is_active', false)->count();
        $totalCount = DB::table('erp_employees')->count();
        $fieldCount = DB::table('erp_employees')
            ->where(fn ($query) => $query->whereNotNull('zone_id')->orWhereNotNull('depot_id'))
            ->count();
        $unassignedCount = $totalCount - $fieldCount;
        $complianceCount = DB::table('erp_audit_events')->where('module', 'hr')->count();

        $activeAssignedCount = DB::table('erp_employees')
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNotNull('zone_id')->orWhereNotNull('depot_id'))
            ->count();

        $workforceReadiness = $totalCount > 0
            ? round(($activeAssignedCount / $totalCount) * 100, 1)
            : 0;

        $employeesRaw = DB::table('erp_employees')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_employees.zone_id')
            ->leftJoin('erp_depots', 'erp_depots.id', '=', 'erp_employees.depot_id')
            ->orderBy('users.name')
            ->get([
                'erp_employees.id',
                'erp_employees.user_id',
                'erp_employees.employee_code',
                'erp_employees.department',
                'erp_employees.position',
                'erp_employees.is_active',
                'erp_employees.created_at',
                'erp_employees.updated_at',
                'users.name',
                'users.email',
                'users.profile_photo_path',
                'erp_zones.id as zone_id',
                'erp_zones.name as zone_name',
                'erp_depots.id as depot_id',
                'erp_depots.name as depot_name',
            ]);

        // Attach attendance summaries, assigned shifts, and leave records to each employee
        $employees = $employeesRaw->map(function ($emp) {
            $attendanceRecords = DB::table('erp_attendance_records')->where('employee_id', $emp->id)->get();
            $shift = DB::table('erp_shifts')
                ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_shifts.zone_id')
                ->where('employee_id', $emp->id)
                ->orderByDesc('shift_date')
                ->first(['erp_shifts.*', 'erp_zones.name as zone_name']);

            $leaves = DB::table('erp_leave_requests')
                ->where('employee_id', $emp->id)
                ->orderByDesc('created_at')
                ->get();

            return array_merge((array) $emp, [
                'attendance_summary' => [
                    'present' => $attendanceRecords->where('status', 'present')->count(),
                    'late' => $attendanceRecords->where('status', 'late')->count(),
                    'absent' => $attendanceRecords->where('status', 'absent')->count(),
                    'on_leave' => $attendanceRecords->where('status', 'on_leave')->count(),
                ],
                'assigned_shift' => $shift,
                'leave_requests' => $leaves,
            ]);
        });

        $zones = DB::table('erp_zones')
            ->leftJoin('erp_employees', 'erp_employees.zone_id', '=', 'erp_zones.id')
            ->select('erp_zones.id', 'erp_zones.name', 'erp_zones.zone_no', 'erp_zones.zone_group', DB::raw('count(erp_employees.id) as staff_count'))
            ->groupBy('erp_zones.id', 'erp_zones.name', 'erp_zones.zone_no', 'erp_zones.zone_group')
            ->get();

        $depots = DB::table('erp_depots')->get(['id', 'name', 'code']);

        $shifts = DB::table('erp_shifts')
            ->join('erp_employees', 'erp_employees.id', '=', 'erp_shifts.employee_id')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_shifts.zone_id')
            ->orderByDesc('erp_shifts.shift_date')
            ->limit(10)
            ->get([
                'erp_shifts.id',
                'erp_shifts.shift_type',
                'erp_shifts.shift_date',
                'erp_shifts.status',
                'erp_shifts.notes',
                'users.name as employee_name',
                'erp_employees.employee_code',
                'erp_zones.name as zone_name',
            ]);

        $timelineEvents = DB::table('erp_audit_events')
            ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
            ->where('erp_audit_events.module', 'hr')
            ->orderByDesc('erp_audit_events.id')
            ->limit(6)
            ->get([
                'erp_audit_events.id',
                'erp_audit_events.action',
                'erp_audit_events.target_type',
                'erp_audit_events.target_id',
                'erp_audit_events.created_at',
                'users.name as user_name',
            ]);

        return Inertia::render('hr-workforce', [
            'workforceMetrics' => [
                'activeWorkforce' => $activeCount,
                'totalWorkforce' => $totalCount,
                'inactiveWorkforce' => $inactiveCount,
                'fieldDispatch' => $fieldCount,
                'unassignedWorkforce' => $unassignedCount,
                'workforceReadiness' => $workforceReadiness,
                'complianceRecords' => $complianceCount,
            ],
            'employees' => $employees,
            'zones' => $zones,
            'depots' => $depots,
            'shifts' => $shifts,
            'timelineEvents' => $timelineEvents,
        ]);
    }

    /**
     * Display the Attendance & Leave management page.
     */
    public function attendanceLeave(Request $request): Response
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);
        $selectedDate = $validated['date'] ?? now()->toDateString();
        $dailyAttendance = $this->dailyAttendance($selectedDate);

        $attendanceRecords = DB::table('erp_attendance_records')
            ->join('erp_employees', 'erp_employees.id', '=', 'erp_attendance_records.employee_id')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->orderByDesc('erp_attendance_records.date')
            ->get([
                'erp_attendance_records.id',
                'erp_attendance_records.date',
                'erp_attendance_records.status',
                'erp_attendance_records.clock_in',
                'erp_attendance_records.clock_out',
                'erp_attendance_records.notes',
                'users.name as employee_name',
                'users.email as employee_email',
                'erp_employees.employee_code',
                'erp_employees.department',
            ]);

        $leaveRequests = DB::table('erp_leave_requests')
            ->join('erp_employees', 'erp_employees.id', '=', 'erp_leave_requests.employee_id')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->leftJoin('users as reviewers', 'reviewers.id', '=', 'erp_leave_requests.reviewed_by')
            ->orderByDesc('erp_leave_requests.created_at')
            ->get([
                'erp_leave_requests.id',
                'erp_leave_requests.leave_type',
                'erp_leave_requests.start_date',
                'erp_leave_requests.end_date',
                'erp_leave_requests.reason',
                'erp_leave_requests.status',
                'erp_leave_requests.admin_notes',
                'erp_leave_requests.created_at',
                'users.name as employee_name',
                'users.email as employee_email',
                'erp_employees.employee_code',
                'erp_employees.department',
                'reviewers.name as reviewer_name',
            ]);

        $summary = $this->attendanceSummary($dailyAttendance);
        $summary['pending_leaves'] = $leaveRequests->where('status', 'pending')->count();

        return Inertia::render('hr-attendance-leave', [
            'summary' => $summary,
            'selectedDate' => $selectedDate,
            'dailyAttendance' => $dailyAttendance,
            'attendanceRecords' => $attendanceRecords,
            'leaveRequests' => $leaveRequests,
        ]);
    }

    /**
     * Save attendance for every active employee on the selected date.
     */
    public function storeDailyAttendance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'attendance' => ['required', 'array', 'min:1'],
            'attendance.*.employee_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('erp_employees', 'id')->where('is_active', true),
            ],
            'attendance.*.status' => ['required', 'in:present,absent,on_leave,rest_day'],
            'attendance.*.time_in' => ['nullable', 'date_format:H:i'],
            'attendance.*.time_out' => ['nullable', 'date_format:H:i'],
        ]);

        foreach ($validated['attendance'] as $index => $record) {
            if ($record['status'] === 'present' && empty($record['time_in'])) {
                throw ValidationException::withMessages([
                    "attendance.{$index}.time_in" => 'Enter a time in for employees marked Present.',
                ]);
            }

            if (
                $record['status'] === 'present'
                && ! empty($record['time_out'])
                && $record['time_out'] < $record['time_in']
            ) {
                throw ValidationException::withMessages([
                    "attendance.{$index}.time_out" => 'Time out must be after time in.',
                ]);
            }
        }

        $activeEmployeeIds = DB::table('erp_employees')
            ->where('is_active', true)
            ->orderBy('id')
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->all();
        $submittedEmployeeIds = collect($validated['attendance'])
            ->pluck('employee_id')
            ->map(fn ($id): int => (int) $id)
            ->sort()
            ->values()
            ->all();
        $expectedEmployeeIds = collect($activeEmployeeIds)->sort()->values()->all();

        if ($submittedEmployeeIds !== $expectedEmployeeIds) {
            throw ValidationException::withMessages([
                'attendance' => 'Refresh the attendance list and submit every active employee.',
            ]);
        }

        $date = $validated['date'];
        $approvedLeaveEmployeeIds = DB::table('erp_leave_requests')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->pluck('employee_id')
            ->flip();
        $now = now();

        DB::transaction(function () use ($validated, $approvedLeaveEmployeeIds, $date, $now): void {
            $records = collect($validated['attendance'])
                ->map(function (array $record) use ($approvedLeaveEmployeeIds, $date, $now): array {
                    $hasTimeIn = ! empty($record['time_in']);
                    $status = $record['status'];

                    if (! $hasTimeIn && $approvedLeaveEmployeeIds->has($record['employee_id'])) {
                        $status = 'on_leave';
                    } elseif ($status === 'present' && Carbon::createFromFormat('H:i', $record['time_in'])->format('H:i:s') > '08:00:00') {
                        $status = 'late';
                    }

                    return [
                        'employee_id' => $record['employee_id'],
                        'date' => $date,
                        'status' => $status,
                        'clock_in' => $hasTimeIn ? Carbon::createFromFormat('H:i', $record['time_in'])->format('h:i A') : null,
                        'clock_out' => ! empty($record['time_out'])
                            ? Carbon::createFromFormat('H:i', $record['time_out'])->format('h:i A')
                            : null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })
                ->all();

            DB::table('erp_attendance_records')->upsert(
                $records,
                ['employee_id', 'date'],
                ['status', 'clock_in', 'clock_out', 'updated_at'],
            );
        });

        return redirect()
            ->route('hr-attendance-leave', ['date' => $date])
            ->with('success', 'Daily attendance saved successfully.');
    }

    /**
     * Build one attendance row per active employee for a selected date.
     */
    private function dailyAttendance(string $date): Collection
    {
        $employees = DB::table('erp_employees')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->where('erp_employees.is_active', true)
            ->orderBy('users.name')
            ->get([
                'erp_employees.id',
                'erp_employees.employee_code',
                'erp_employees.department',
                'users.name as employee_name',
            ]);

        $employeeIds = $employees->pluck('id');
        $attendanceByEmployee = DB::table('erp_attendance_records')
            ->whereDate('date', $date)
            ->whereIn('employee_id', $employeeIds)
            ->get(['employee_id', 'status', 'clock_in', 'clock_out'])
            ->keyBy('employee_id');
        $approvedLeaveEmployeeIds = DB::table('erp_leave_requests')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->whereIn('employee_id', $employeeIds)
            ->pluck('employee_id')
            ->flip();
        $scheduledEmployeeIds = DB::table('erp_shifts')
            ->where('shift_date', $date)
            ->where('status', '!=', 'cancelled')
            ->whereIn('employee_id', $employeeIds)
            ->pluck('employee_id')
            ->flip();

        return $employees->map(function (object $employee) use (
            $attendanceByEmployee,
            $approvedLeaveEmployeeIds,
            $scheduledEmployeeIds,
        ): array {
            $attendance = $attendanceByEmployee->get($employee->id);
            $clockIn = $attendance?->clock_in;
            $hasCheckedIn = is_string($clockIn) && trim($clockIn) !== '';

            if ($hasCheckedIn && in_array($attendance->status, ['present', 'late'], true)) {
                $status = Carbon::parse($clockIn)->format('H:i:s') > '08:00:00' ? 'late' : 'present';
            } elseif ($approvedLeaveEmployeeIds->has($employee->id)) {
                $status = 'on_leave';
            } elseif ($attendance && in_array($attendance->status, ['absent', 'on_leave', 'rest_day'], true)) {
                $status = $attendance->status;
            } elseif (! $scheduledEmployeeIds->has($employee->id)) {
                $status = 'rest_day';
            } else {
                $status = 'absent';
            }

            $timeIn = $hasCheckedIn ? Carbon::parse($clockIn)->format('H:i') : null;
            $timeOut = $hasCheckedIn && $attendance->clock_out
                ? Carbon::parse($attendance->clock_out)->format('H:i')
                : null;

            return [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'clock_in' => $hasCheckedIn ? $clockIn : null,
                'clock_out' => $hasCheckedIn ? $attendance->clock_out : null,
                'time_in' => $timeIn,
                'time_out' => $timeOut,
                'status' => $status,
                'has_approved_leave' => $approvedLeaveEmployeeIds->has($employee->id),
            ];
        });
    }

    /**
     * @return array{active_employees: int, present: int, late: int, absent: int, on_leave: int, rest_day: int}
     */
    private function attendanceSummary(Collection $dailyAttendance): array
    {
        return [
            'active_employees' => $dailyAttendance->count(),
            'present' => $dailyAttendance->where('status', 'present')->count(),
            'late' => $dailyAttendance->where('status', 'late')->count(),
            'absent' => $dailyAttendance->where('status', 'absent')->count(),
            'on_leave' => $dailyAttendance->where('status', 'on_leave')->count(),
            'rest_day' => $dailyAttendance->where('status', 'rest_day')->count(),
        ];
    }

    /**
     * Approve or reject a leave request.
     */
    public function reviewLeaveRequest(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $leave = DB::table('erp_leave_requests')->where('id', $id)->first();
        if (! $leave) {
            return back()->with('error', 'Leave request not found.');
        }

        DB::table('erp_leave_requests')->where('id', $id)->update([
            'status' => $validated['status'],
            'reviewed_by' => auth()->id(),
            'admin_notes' => $validated['admin_notes'] ?? null,
            'updated_at' => now(),
        ]);

        $this->logAuditEvent(
            $validated['status'] === 'approved' ? 'LEAVE_REQUEST_APPROVED' : 'LEAVE_REQUEST_REJECTED',
            'LeaveRequest',
            (string) $id,
            ['employee_id' => $leave->employee_id, 'status' => $validated['status']]
        );

        return back()->with('success', "Leave request has been {$validated['status']}.");
    }

    /**
     * Store a newly created employee in database.
     */
    public function storeEmployee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'employee_code' => 'required|string|max:100|unique:erp_employees,employee_code',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'zone_id' => 'nullable|exists:erp_zones,id',
            'depot_id' => 'nullable|exists:erp_depots,id',
            'is_active' => 'boolean',
        ]);

        $now = now();
        $email = strtolower(trim($validated['email']));

        $user = DB::table('users')->where('email', $email)->first();
        if (! $user) {
            $userId = DB::table('users')->insertGetId([
                'name' => $validated['name'],
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'hr_employee',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $existingEmployee = DB::table('erp_employees')->where('user_id', $user->id)->first();
            if ($existingEmployee) {
                throw ValidationException::withMessages([
                    'email' => 'This Gmail/user is already registered as an employee.',
                ]);
            }
            $userId = $user->id;
        }

        $empId = DB::table('erp_employees')->insertGetId([
            'user_id' => $userId,
            'employee_code' => $validated['employee_code'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'zone_id' => $validated['zone_id'] ?? null,
            'depot_id' => $validated['depot_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $this->logAuditEvent('EMPLOYEE_ADDED', 'Employee', $validated['employee_code'], $validated);

        return back()->with('success', "Employee {$validated['name']} added successfully.");
    }

    /**
     * Update an existing employee.
     */
    public function updateEmployee(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'zone_id' => 'nullable|exists:erp_zones,id',
            'depot_id' => 'nullable|exists:erp_depots,id',
            'is_active' => 'required|boolean',
        ]);

        DB::table('erp_employees')->where('id', $id)->update([
            'department' => $validated['department'],
            'position' => $validated['position'],
            'zone_id' => $validated['zone_id'] ?? null,
            'depot_id' => $validated['depot_id'] ?? null,
            'is_active' => $validated['is_active'],
            'updated_at' => now(),
        ]);

        $this->logAuditEvent('EMPLOYEE_UPDATED', 'Employee', (string) $id, $validated);

        return back()->with('success', 'Employee record updated successfully.');
    }

    /**
     * Schedule a shift.
     */
    public function storeShift(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:erp_employees,id',
            'shift_type' => 'required|string',
            'shift_date' => 'required|date',
            'zone_id' => 'nullable|exists:erp_zones,id',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::table('erp_shifts')->insert([
            'employee_id' => $validated['employee_id'],
            'shift_type' => $validated['shift_type'],
            'shift_date' => $validated['shift_date'],
            'zone_id' => $validated['zone_id'] ?? null,
            'status' => 'scheduled',
            'notes' => $validated['notes'] ?? '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->logAuditEvent('SHIFT_SCHEDULED', 'Shift', (string) $validated['employee_id'], $validated);

        return back()->with('success', 'Shift scheduled successfully.');
    }

    /**
     * Create a staffing action.
     */
    public function storeStaffingAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'action_type' => 'required|string',
            'zone_id' => 'nullable|exists:erp_zones,id',
            'details' => 'nullable|string',
        ]);

        DB::table('erp_staffing_actions')->insert([
            'title' => $validated['title'],
            'action_type' => $validated['action_type'],
            'zone_id' => $validated['zone_id'] ?? null,
            'status' => 'open',
            'requested_by' => auth()->id(),
            'details' => $validated['details'] ?? '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Staffing action created successfully.');
    }

    /**
     * Show the authenticated HR employee's profile page.
     */
    public function profile(): Response
    {
        return Inertia::render('hr-profile', [
            'profile' => $this->profilePayload(),
        ]);
    }

    /**
     * Show the HR account settings page.
     */
    public function hrSettings(): Response
    {
        $user = auth()->user();
        $notifPrefs = DB::table('hr_notification_preferences')->where('user_id', $user->id)->first();
        $profile = $this->profilePayload();

        if (! $notifPrefs) {
            $notifPrefs = (object) [
                'leave_alerts' => true,
                'attendance_alerts' => true,
                'shift_alerts' => true,
                'employee_updates' => true,
            ];
        }

        $lastPasswordChange = $user->password_changed_at
            ?? DB::table('erp_audit_events')
                ->where('user_id', $user->id)
                ->where('module', 'hr')
                ->where('action', 'PASSWORD_CHANGED')
                ->latest('created_at')
                ->value('created_at');

        return Inertia::render('hr-settings', [
            'profile' => $profile,
            'notificationPreferences' => $notifPrefs,
            'security' => [
                'lastPasswordChange' => $lastPasswordChange ? Carbon::parse($lastPasswordChange)->toIso8601String() : null,
                'lastLogin' => $user->last_login_at?->toIso8601String(),
                'accountStatus' => $profile['employee'] === null || (bool) $profile['employee']->is_active
                    ? 'Active'
                    : 'Inactive',
            ],
        ]);
    }

    /**
     * Update Notification Preferences.
     */
    public function updateNotificationPreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_alerts' => 'required|boolean',
            'attendance_alerts' => 'required|boolean',
            'shift_alerts' => 'required|boolean',
            'employee_updates' => 'required|boolean',
        ]);

        DB::table('hr_notification_preferences')->updateOrInsert(
            ['user_id' => auth()->id()],
            array_merge($validated, ['updated_at' => now()])
        );

        $this->logAuditEvent('NOTIFICATION_PREFERENCES_UPDATED', 'UserSettings', (string) auth()->id(), $validated);

        return back()->with('success', 'Notification preferences saved successfully.');
    }

    /**
     * Update the authenticated user's own profile details.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',id,'.$request->user()->id,
        ]);

        $user = $request->user();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        $this->logAuditEvent('PROFILE_UPDATED', 'User', (string) $user->id, ['fields' => array_keys($validated)]);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Change the authenticated user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();
        $user->password = Hash::make($validated['password']);
        $user->password_changed_at = now();
        $user->save();

        $this->logAuditEvent('PASSWORD_CHANGED', 'User', (string) $user->id);

        return back()->with('success', 'Password changed successfully.');
    }

    /**
     * Upload the authenticated user's profile photo.
     */
    public function updateProfilePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ], [
            'profile_photo.image' => 'Please upload a valid JPG or PNG image.',
            'profile_photo.mimes' => 'Please upload a valid JPG or PNG image.',
            'profile_photo.max' => 'Profile photo must not exceed the allowed file size (2 MB).',
        ]);

        $user = $request->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->profile_photo_path = Storage::disk('public')->putFile('profile-photos', $request->file('profile_photo'));
        $user->save();

        $this->logAuditEvent('PROFILE_PHOTO_UPDATED', 'User', (string) $user->id);

        return back()->with('success', 'Profile photo updated successfully.');
    }

    /**
     * Remove the authenticated user's profile photo.
     */
    public function removeProfilePhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
            $user->profile_photo_path = null;
            $user->save();

            $this->logAuditEvent('PROFILE_PHOTO_REMOVED', 'User', (string) $user->id);
        }

        return back()->with('success', 'Profile photo removed.');
    }

    /**
     * Deactivate or reactivate an employee record.
     */
    public function toggleEmployeeStatus(Request $request, int $id): RedirectResponse
    {
        $employee = DB::table('erp_employees')->where('id', $id)->first();

        if (! $employee) {
            return back()->with('error', 'Employee record not found.');
        }

        if ((int) $employee->user_id === (int) $request->user()->id) {
            return back()->with('error', 'You cannot change your own employment status.');
        }

        $nowActive = ! $employee->is_active;

        DB::table('erp_employees')->where('id', $id)->update([
            'is_active' => $nowActive,
            'updated_at' => now(),
        ]);

        $this->logAuditEvent(
            $nowActive ? 'EMPLOYEE_REACTIVATED' : 'EMPLOYEE_DEACTIVATED',
            'Employee',
            $employee->employee_code,
            ['employee_id' => $employee->id]
        );

        return back()->with('success', $nowActive ? 'Employee reactivated successfully.' : 'Employee deactivated successfully.');
    }

    /**
     * Build the profile payload for the authenticated HR user.
     *
     * @return array<string, mixed>
     */
    private function profilePayload(): array
    {
        $user = auth()->user();

        $employee = DB::table('erp_employees')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_employees.zone_id')
            ->leftJoin('erp_depots', 'erp_depots.id', '=', 'erp_employees.depot_id')
            ->where('erp_employees.user_id', $user->id)
            ->first([
                'erp_employees.id',
                'erp_employees.employee_code',
                'erp_employees.department',
                'erp_employees.position',
                'erp_employees.is_active',
                'erp_employees.created_at',
                'erp_employees.updated_at',
                'erp_zones.name as zone_name',
                'erp_depots.name as depot_name',
                'erp_depots.code as depot_code',
            ]);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
            ],
            'employee' => $employee,
        ];
    }

    /**
     * Record an HR audit event.
     *
     * @param  array<string, mixed>  $payload
     */
    private function logAuditEvent(string $action, string $targetType, string $targetId, array $payload = []): void
    {
        DB::table('erp_audit_events')->insert([
            'user_id' => auth()->id(),
            'action' => $action,
            'module' => 'hr',
            'target_type' => $targetType,
            'target_id' => $targetId,
            'payload' => $payload ? json_encode($payload) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
