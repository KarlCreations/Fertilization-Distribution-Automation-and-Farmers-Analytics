<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class HrOperationsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // 1. Ensure zones & depots exist
        $zones = DB::table('erp_zones')->get();
        if ($zones->isEmpty()) {
            $regionId = DB::table('erp_regions')->insertGetId(['code' => 'REG-NORTH', 'name' => 'Northern Operations', 'created_at' => $now, 'updated_at' => $now]);
            for ($i = 1; $i <= 5; $i++) {
                $zoneId = DB::table('erp_zones')->insertGetId([
                    'region_id' => $regionId,
                    'zone_no' => $i,
                    'name' => "Operational Zone {$i}",
                    'zone_group' => $i % 2 === 0 ? 'River Delta' : 'Highlands',
                ]);
                DB::table('erp_depots')->insert([
                    'zone_id' => $zoneId,
                    'code' => sprintf('DEP-%02d', $i),
                    'name' => "Operations Depot {$i}",
                    'facility_type' => 'warehouse',
                    'capacity_mt' => 5000,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
            $zones = DB::table('erp_zones')->get();
        }

        $depots = DB::table('erp_depots')->get();

        // 2. Seed realistic Employees
        $sampleEmployees = [
            ['name' => 'Sarah Jenkins', 'email' => 's.jenkins@erp.org', 'role' => 'hr', 'dept' => 'HR & Workforce', 'pos' => 'Senior HR Specialist', 'code' => 'EMP-HR-001', 'active' => true],
            ['name' => 'Marcus Vance', 'email' => 'm.vance@erp.org', 'role' => 'field_operations', 'dept' => 'Field Operations', 'pos' => 'Field Supervisor', 'code' => 'EMP-FLD-002', 'active' => true],
            ['name' => 'Elena Rostova', 'email' => 'e.rostova@erp.org', 'role' => 'inventory', 'dept' => 'Inventory & Logistics', 'pos' => 'Depot Manager', 'code' => 'EMP-INV-003', 'active' => true],
            ['name' => 'David Chen', 'email' => 'd.chen@erp.org', 'role' => 'field_operations', 'dept' => 'Field Operations', 'pos' => 'Field Inspection Officer', 'code' => 'EMP-FLD-004', 'active' => true],
            ['name' => 'Amara Okafor', 'email' => 'a.okafor@erp.org', 'role' => 'subsidy', 'dept' => 'Farmer Subsidies', 'pos' => 'Subsidy Compliance Officer', 'code' => 'EMP-SUB-005', 'active' => true],
            ['name' => 'Robert Martinez', 'email' => 'r.martinez@erp.org', 'role' => 'sales', 'dept' => 'Sales & Trade', 'pos' => 'Regional Logistics Officer', 'code' => 'EMP-SLS-006', 'active' => true],
            ['name' => 'Hannah Abbott', 'email' => 'h.abbott@erp.org', 'role' => 'hr_employee', 'dept' => 'HR & Workforce', 'pos' => 'Payroll & Benefits Analyst', 'code' => 'EMP-HR-007', 'active' => true],
            ['name' => 'Lucas Scott', 'email' => 'l.scott@erp.org', 'role' => 'field_operations', 'dept' => 'Field Operations', 'pos' => 'Field Logistics Coordinator', 'code' => 'EMP-FLD-008', 'active' => false],
        ];

        foreach ($sampleEmployees as $idx => $emp) {
            $user = DB::table('users')->where('email', $emp['email'])->first();
            if (! $user) {
                $userId = DB::table('users')->insertGetId([
                    'name' => $emp['name'],
                    'email' => $emp['email'],
                    'password' => Hash::make('password'),
                    'role' => $emp['role'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $userId = $user->id;
            }

            $zoneId = $zones[$idx % count($zones)]->id ?? null;
            $depotId = $depots[$idx % count($depots)]->id ?? null;

            DB::table('erp_employees')->updateOrInsert(
                ['employee_code' => $emp['code']],
                [
                    'user_id' => $userId,
                    'department' => $emp['dept'],
                    'position' => $emp['pos'],
                    'zone_id' => $zoneId,
                    'depot_id' => $depotId,
                    'is_active' => $emp['active'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        // 3. Seed Shifts
        $employeeIds = DB::table('erp_employees')->pluck('id');
        if ($employeeIds->isNotEmpty()) {
            DB::table('erp_shifts')->truncate();
            $shiftTypes = ['morning', 'afternoon', 'night', 'field_duty'];
            $statuses = ['scheduled', 'active', 'completed'];

            foreach ($employeeIds as $index => $empId) {
                DB::table('erp_shifts')->insert([
                    'employee_id' => $empId,
                    'shift_type' => $shiftTypes[$index % count($shiftTypes)],
                    'shift_date' => now()->addDays(($index % 5) - 2)->format('Y-m-d'),
                    'zone_id' => $zones[$index % count($zones)]->id ?? null,
                    'depot_id' => $depots[$index % count($depots)]->id ?? null,
                    'status' => $statuses[$index % count($statuses)],
                    'notes' => 'Regular operational assignment for field & depot management.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 4. Seed Staffing Actions
        DB::table('erp_staffing_actions')->truncate();
        $staffingActions = [
            ['title' => 'Dispatch 4 Field Officers to Zone 1 Delta', 'action_type' => 'dispatch', 'status' => 'in_progress', 'details' => 'Urgent deployment for seasonal fertilizer allocation audit.'],
            ['title' => 'Transfer Depot Specialist to Depot 3', 'action_type' => 'transfer', 'status' => 'open', 'details' => 'Reassignment required to support increased inbound commodity volume.'],
            ['title' => 'Quarterly HR Compliance Audit', 'action_type' => 'compliance_check', 'status' => 'completed', 'details' => 'Safety certifications and worker identity checks verified.'],
            ['title' => 'Onboarding 2 Field Technicians', 'action_type' => 'onboarding', 'status' => 'in_progress', 'details' => 'Equipment issuance and zone orientation in progress.'],
        ];

        foreach ($staffingActions as $action) {
            DB::table('erp_staffing_actions')->insert([
                'title' => $action['title'],
                'action_type' => $action['action_type'],
                'status' => $action['status'],
                'details' => $action['details'],
                'requested_by' => 2, // HR Employee user ID
                'created_at' => $now->subHours(rand(1, 48)),
                'updated_at' => $now,
            ]);
        }

        // 5. Seed HR Audit Events
        DB::table('erp_audit_events')->where('module', 'hr')->delete();
        $auditLogs = [
            ['action' => 'EMPLOYEE_ROSTER_UPDATED', 'target_type' => 'Employee', 'target_id' => 'EMP-FLD-002', 'payload' => json_encode(['changed' => 'zone_assignment', 'to' => 'Operational Zone 1'])],
            ['action' => 'SHIFT_SCHEDULE_CREATED', 'target_type' => 'Shift', 'target_id' => 'SHF-104', 'payload' => json_encode(['shift' => 'field_duty', 'zone' => 'Operational Zone 3'])],
            ['action' => 'COMPLIANCE_VERIFIED', 'target_type' => 'Audit', 'target_id' => 'CMP-2026-09', 'payload' => json_encode(['score' => '100%', 'status' => 'passed'])],
            ['action' => 'STAFFING_ACTION_OPENED', 'target_type' => 'StaffingAction', 'target_id' => 'STF-001', 'payload' => json_encode(['title' => 'Dispatch 4 Field Officers'])],
        ];

        foreach ($auditLogs as $log) {
            DB::table('erp_audit_events')->insert([
                'user_id' => 2,
                'action' => $log['action'],
                'module' => 'hr',
                'target_type' => $log['target_type'],
                'target_id' => $log['target_id'],
                'payload' => $log['payload'],
                'created_at' => $now->subMinutes(rand(10, 300)),
                'updated_at' => $now,
            ]);
        }

        // 6. Seed HR System Settings
        $defaultSettings = [
            'hr_system_name' => 'ERP HR Operations & Workforce Suite',
            'auto_employee_code' => 'true',
            'default_shift_hours' => '8',
            'probation_period_days' => '90',
            'biometric_verification_required' => 'true',
            'task_alerts_enabled' => 'true',
            'shift_reminders_enabled' => 'true',
            'email_summaries_enabled' => 'true',
            'compliance_alerts_enabled' => 'true',
            'default_landing_page' => 'hr-dashboard',
            'session_timeout_minutes' => '30',
            'hr_contact_email' => 'hr-admin@erp.org',
            'display_name' => 'HR Operations Team',
        ];

        foreach ($defaultSettings as $key => $val) {
            DB::table('hr_system_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $val, 'created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}
