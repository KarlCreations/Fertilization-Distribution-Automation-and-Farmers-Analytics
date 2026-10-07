<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceAndLeaveSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $employees = DB::table('erp_employees')->get();

        if ($employees->isEmpty()) {
            return;
        }

        // 1. Seed Attendance Records for the last 5 days
        DB::table('erp_attendance_records')->truncate();

        $statuses = ['present', 'present', 'present', 'late', 'on_leave', 'absent'];
        $times = [
            'present' => ['in' => '08:00 AM', 'out' => '05:00 PM'],
            'late' => ['in' => '09:15 AM', 'out' => '05:00 PM'],
            'absent' => ['in' => null, 'out' => null],
            'on_leave' => ['in' => null, 'out' => null],
        ];

        foreach ($employees as $idx => $emp) {
            for ($day = 0; $day < 5; $day++) {
                $date = now()->subDays($day)->format('Y-m-d');
                $status = $statuses[($idx + $day) % count($statuses)];
                $time = $times[$status];

                DB::table('erp_attendance_records')->insertOrIgnore([
                    'employee_id' => $emp->id,
                    'date' => $date,
                    'status' => $status,
                    'clock_in' => $time['in'],
                    'clock_out' => $time['out'],
                    'notes' => $status === 'late' ? 'Traffic delay reported' : ($status === 'on_leave' ? 'Approved leave' : null),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 2. Seed Leave Requests
        DB::table('erp_leave_requests')->truncate();

        $leaveTypes = ['annual', 'sick', 'emergency', 'parental'];
        $sampleRequests = [
            ['emp_offset' => 0, 'type' => 'annual', 'days_from' => 2, 'days_to' => 5, 'reason' => 'Annual family vacation leave request.', 'status' => 'pending'],
            ['emp_offset' => 1, 'type' => 'sick', 'days_from' => -1, 'days_to' => 1, 'reason' => 'Medical appointment and recovery.', 'status' => 'approved'],
            ['emp_offset' => 2, 'type' => 'emergency', 'days_from' => 3, 'days_to' => 4, 'reason' => 'Personal emergency leave.', 'status' => 'pending'],
            ['emp_offset' => 3, 'type' => 'annual', 'days_from' => -5, 'days_to' => -2, 'reason' => 'Approved personal time off.', 'status' => 'approved'],
            ['emp_offset' => 4, 'type' => 'sick', 'days_from' => 7, 'days_to' => 8, 'reason' => 'Scheduled dental surgery.', 'status' => 'pending'],
            ['emp_offset' => 5, 'type' => 'emergency', 'days_from' => -10, 'days_to' => -9, 'reason' => 'Urgent home maintenance.', 'status' => 'rejected'],
        ];

        foreach ($sampleRequests as $req) {
            $emp = $employees[$req['emp_offset'] % count($employees)] ?? $employees->first();
            DB::table('erp_leave_requests')->insert([
                'employee_id' => $emp->id,
                'leave_type' => $req['type'],
                'start_date' => now()->addDays($req['days_from'])->format('Y-m-d'),
                'end_date' => now()->addDays($req['days_to'])->format('Y-m-d'),
                'reason' => $req['reason'],
                'status' => $req['status'],
                'reviewed_by' => $req['status'] !== 'pending' ? 2 : null,
                'admin_notes' => $req['status'] === 'approved' ? 'Approved by HR Manager.' : ($req['status'] === 'rejected' ? 'Insufficient leave balance.' : null),
                'created_at' => $now->subHours(rand(2, 48)),
                'updated_at' => $now,
            ]);
        }

        // 3. Seed HR Notification Preferences for existing users
        foreach (DB::table('users')->pluck('id') as $uId) {
            DB::table('hr_notification_preferences')->updateOrInsert(
                ['user_id' => $uId],
                [
                    'leave_alerts' => true,
                    'attendance_alerts' => true,
                    'shift_alerts' => true,
                    'employee_updates' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
