<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;

test('attendance page validates the selected day and summarizes active employees from their records', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr']));

    $makeEmployee = function (string $name, string $code, bool $isActive = true): int {
        $user = User::factory()->create(['name' => $name]);

        return DB::table('erp_employees')->insertGetId([
            'user_id' => $user->id,
            'employee_code' => $code,
            'department' => 'HR & Workforce',
            'position' => 'Test employee',
            'is_active' => $isActive,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    };

    $selectedDate = '2026-10-07';
    $presentEmployeeId = $makeEmployee('Alice Present', 'EMP-DAY-001');
    $lateEmployeeId = $makeEmployee('Beth Late', 'EMP-DAY-002');
    $absentEmployeeId = $makeEmployee('Cora Absent', 'EMP-DAY-003');
    $leaveEmployeeId = $makeEmployee('Dana Leave', 'EMP-DAY-004');
    $restDayEmployeeId = $makeEmployee('Evan Rest', 'EMP-DAY-005');
    $inactiveEmployeeId = $makeEmployee('Finn Inactive', 'EMP-DAY-006', false);

    DB::table('erp_attendance_records')->insert([
        [
            'employee_id' => $presentEmployeeId,
            'date' => $selectedDate,
            'status' => 'late',
            'clock_in' => '7:55 AM',
            'clock_out' => '5:00 PM',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'employee_id' => $lateEmployeeId,
            'date' => $selectedDate,
            'status' => 'present',
            'clock_in' => '8:20 AM',
            'clock_out' => '5:00 PM',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'employee_id' => $absentEmployeeId,
            'date' => '2026-10-06',
            'status' => 'present',
            'clock_in' => '7:55 AM',
            'clock_out' => '5:00 PM',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'employee_id' => $leaveEmployeeId,
            'date' => $selectedDate,
            'status' => 'absent',
            'clock_in' => null,
            'clock_out' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'employee_id' => $inactiveEmployeeId,
            'date' => $selectedDate,
            'status' => 'present',
            'clock_in' => '7:55 AM',
            'clock_out' => '5:00 PM',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    DB::table('erp_shifts')->insert([
        'employee_id' => $absentEmployeeId,
        'shift_type' => 'morning',
        'shift_date' => $selectedDate,
        'status' => 'scheduled',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('erp_leave_requests')->insert([
        [
            'employee_id' => $leaveEmployeeId,
            'leave_type' => 'annual',
            'start_date' => '2026-10-06',
            'end_date' => '2026-10-08',
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'employee_id' => $presentEmployeeId,
            'leave_type' => 'sick',
            'start_date' => '2026-10-10',
            'end_date' => '2026-10-11',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $this->get(route('hr-attendance-leave', ['date' => $selectedDate]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('hr-attendance-leave')
            ->where('selectedDate', $selectedDate)
            ->where('summary.active_employees', 5)
            ->where('summary.present', 1)
            ->where('summary.late', 1)
            ->where('summary.absent', 1)
            ->where('summary.on_leave', 1)
            ->where('summary.rest_day', 1)
            ->where('summary.pending_leaves', 1)
            ->has('dailyAttendance', 5)
            ->where('dailyAttendance.0.status', 'present')
            ->where('dailyAttendance.0.clock_in', '7:55 AM')
            ->where('dailyAttendance.1.status', 'late')
            ->where('dailyAttendance.2.status', 'absent')
            ->where('dailyAttendance.3.status', 'on_leave')
            ->where('dailyAttendance.4.status', 'rest_day')
            ->has('attendanceRecords', 5)
        );

    $this->get(route('hr-attendance-leave', ['date' => 'not-a-date']))
        ->assertSessionHasErrors('date');
});

test('hr can save and update one attendance record per active employee and day', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr']));

    $makeEmployee = function (string $name, string $code): int {
        $user = User::factory()->create(['name' => $name]);

        return DB::table('erp_employees')->insertGetId([
            'user_id' => $user->id,
            'employee_code' => $code,
            'department' => 'HR & Workforce',
            'position' => 'Test employee',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    };

    $selectedDate = '2026-10-07';
    $presentEmployeeId = $makeEmployee('Present Employee', 'EMP-REC-001');
    $absentEmployeeId = $makeEmployee('Absent Employee', 'EMP-REC-002');
    $leaveEmployeeId = $makeEmployee('Leave Employee', 'EMP-REC-003');
    $restDayEmployeeId = $makeEmployee('Rest Employee', 'EMP-REC-004');

    DB::table('erp_leave_requests')->insert([
        'employee_id' => $leaveEmployeeId,
        'leave_type' => 'annual',
        'start_date' => $selectedDate,
        'end_date' => $selectedDate,
        'status' => 'approved',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $attendance = [
        ['employee_id' => $presentEmployeeId, 'status' => 'present', 'time_in' => '07:55', 'time_out' => '17:00'],
        ['employee_id' => $absentEmployeeId, 'status' => 'absent', 'time_in' => '', 'time_out' => ''],
        ['employee_id' => $leaveEmployeeId, 'status' => 'absent', 'time_in' => '', 'time_out' => ''],
        ['employee_id' => $restDayEmployeeId, 'status' => 'rest_day', 'time_in' => '', 'time_out' => ''],
    ];

    $this->post(route('hr.attendance.store'), [
        'date' => $selectedDate,
        'attendance' => $attendance,
    ])
        ->assertRedirect(route('hr-attendance-leave', ['date' => $selectedDate]))
        ->assertSessionHas('success', 'Daily attendance saved successfully.');

    $this->assertDatabaseCount('erp_attendance_records', 4);
    $this->assertDatabaseHas('erp_attendance_records', [
        'employee_id' => $presentEmployeeId,
        'date' => $selectedDate,
        'status' => 'present',
        'clock_in' => '07:55 AM',
        'clock_out' => '05:00 PM',
    ]);
    $this->assertDatabaseHas('erp_attendance_records', [
        'employee_id' => $leaveEmployeeId,
        'date' => $selectedDate,
        'status' => 'on_leave',
    ]);

    $attendance[0]['time_in'] = '08:20';
    $this->post(route('hr.attendance.store'), [
        'date' => $selectedDate,
        'attendance' => $attendance,
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseCount('erp_attendance_records', 4);
    $this->assertDatabaseHas('erp_attendance_records', [
        'employee_id' => $presentEmployeeId,
        'date' => $selectedDate,
        'status' => 'late',
        'clock_in' => '08:20 AM',
    ]);
});

test('attendance submission rejects duplicates incomplete employee lists and missing present times', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr']));

    $employees = collect(['EMP-VALID-001', 'EMP-VALID-002'])->map(function (string $code): int {
        $user = User::factory()->create();

        return DB::table('erp_employees')->insertGetId([
            'user_id' => $user->id,
            'employee_code' => $code,
            'department' => 'HR & Workforce',
            'position' => 'Test employee',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $this->from(route('hr-attendance-leave'))
        ->post(route('hr.attendance.store'), [
            'date' => '2026-10-07',
            'attendance' => [
                ['employee_id' => $employees[0], 'status' => 'present', 'time_in' => '', 'time_out' => ''],
                ['employee_id' => $employees[0], 'status' => 'absent', 'time_in' => '', 'time_out' => ''],
            ],
        ])
        ->assertRedirect(route('hr-attendance-leave'))
        ->assertSessionHasErrors(['attendance.0.employee_id', 'attendance.1.employee_id']);

    $this->from(route('hr-attendance-leave'))
        ->post(route('hr.attendance.store'), [
            'date' => '2026-10-07',
            'attendance' => [
                ['employee_id' => $employees[0], 'status' => 'present', 'time_in' => '', 'time_out' => ''],
                ['employee_id' => $employees[1], 'status' => 'absent', 'time_in' => '', 'time_out' => ''],
            ],
        ])
        ->assertRedirect(route('hr-attendance-leave'))
        ->assertSessionHasErrors('attendance.0.time_in');

    $this->from(route('hr-attendance-leave'))
        ->post(route('hr.attendance.store'), [
            'date' => '2026-10-07',
            'attendance' => [
                ['employee_id' => $employees[0], 'status' => 'present', 'time_in' => '08:00', 'time_out' => ''],
            ],
        ])
        ->assertRedirect(route('hr-attendance-leave'))
        ->assertSessionHasErrors('attendance');

    $this->assertDatabaseCount('erp_attendance_records', 0);
});

test('users without an hr role cannot record daily attendance', function () {
    $this->actingAs(User::factory()->create(['role' => 'sales_staff']))
        ->post(route('hr.attendance.store'), [
            'date' => '2026-10-07',
            'attendance' => [],
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('erp_attendance_records', 0);
});

test('hr dashboard attendance metrics are zero when there are no attendance records', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr']));

    $this->get(route('hr-dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('role-dashboard')
            ->where('dashboardData.metrics.attendanceSummary.present', 0)
            ->where('dashboardData.metrics.attendanceSummary.late', 0)
            ->where('dashboardData.metrics.attendanceSummary.absent', 0)
            ->where('dashboardData.metrics.attendanceSummary.onLeave', 0)
            ->where('dashboardData.metrics.attendanceSummary.restDay', 0)
            ->where('dashboardData.metrics.attendanceActivity', 0)
        );
});
