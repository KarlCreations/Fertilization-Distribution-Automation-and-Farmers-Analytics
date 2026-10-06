<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
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
        $totalShiftsToday = DB::table('erp_shifts')->whereDate('shift_date', now()->format('Y-m-d'))->count();

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
                    'attendanceActivity' => $totalShiftsToday > 0 ? round(($activeEmployees / max(1, $totalEmployees)) * 100, 1) : 96.4,
                    'openStaffingActions' => $openActionsCount,
                ],
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

        $employees = DB::table('erp_employees')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_employees.zone_id')
            ->leftJoin('erp_depots', 'erp_depots.id', '=', 'erp_employees.depot_id')
            ->orderBy('users.name')
            ->get([
                'erp_employees.id',
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

        $user = DB::table('users')->where('email', $validated['email'])->first();
        if (! $user) {
            $userId = DB::table('users')->insertGetId([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('password123'),
                'role' => 'hr_employee',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
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

        DB::table('erp_audit_events')->insert([
            'user_id' => auth()->id(),
            'action' => 'EMPLOYEE_ADDED',
            'module' => 'hr',
            'target_type' => 'Employee',
            'target_id' => $validated['employee_code'],
            'payload' => json_encode($validated),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

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

        DB::table('erp_audit_events')->insert([
            'user_id' => auth()->id(),
            'action' => 'EMPLOYEE_UPDATED',
            'module' => 'hr',
            'target_type' => 'Employee',
            'target_id' => (string) $id,
            'payload' => json_encode($validated),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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

        DB::table('erp_audit_events')->insert([
            'user_id' => auth()->id(),
            'action' => 'SHIFT_SCHEDULED',
            'module' => 'hr',
            'target_type' => 'Shift',
            'target_id' => (string) $validated['employee_id'],
            'payload' => json_encode($validated),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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
        return Inertia::render('hr-settings', [
            'profile' => $this->profilePayload(),
        ]);
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

    /**
     * Display HR & System Settings page.
     */
    public function settings(): Response
    {
        $settingsRaw = DB::table('hr_system_settings')->pluck('value', 'key')->toArray();

        return Inertia::render('employee-settings', [
            'settings' => $settingsRaw,
            'user' => [
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
                'role' => auth()->user()->role,
            ],
        ]);
    }

    /**
     * Save HR & System Settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->all();
        $now = now();

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            DB::table('hr_system_settings')->updateOrInsert(
                ['key' => (string) $key],
                ['value' => (string) $value, 'updated_at' => $now, 'created_at' => $now]
            );
        }

        DB::table('erp_audit_events')->insert([
            'user_id' => auth()->id(),
            'action' => 'HR_SETTINGS_UPDATED',
            'module' => 'hr',
            'target_type' => 'SystemSettings',
            'target_id' => 'HR_CONFIG',
            'payload' => json_encode($data),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return back()->with('success', 'HR & System Settings updated successfully.');
    }
}
