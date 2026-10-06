<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;

test('guests are redirected to the login page from the hr workforce page', function () {
    $this->get('/hr-workforce')->assertRedirect('/login');
});

test('users without an hr role cannot open the hr workforce page', function () {
    $this->actingAs(User::factory()->create(['role' => 'inventory']));

    $this->get('/hr-workforce')->assertForbidden();
});

test('hr employees see workforce metrics computed from real database data', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr_employee']));

    $regionId = DB::table('erp_regions')->insertGetId([
        'code' => 'REG-TEST',
        'name' => 'Test Region',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $zoneId = DB::table('erp_zones')->insertGetId([
        'region_id' => $regionId,
        'zone_no' => 1,
        'name' => 'Test Zone',
    ]);

    $employees = [
        ['role' => 'field_operations', 'is_active' => true, 'zone_id' => $zoneId],
        ['role' => 'inventory', 'is_active' => true, 'zone_id' => null],
        ['role' => 'sales', 'is_active' => false, 'zone_id' => null],
    ];

    foreach ($employees as $index => $employee) {
        DB::table('erp_employees')->insert([
            'user_id' => User::factory()->create(['role' => $employee['role']])->id,
            'employee_code' => sprintf('EMP-TEST-%03d', $index + 1),
            'department' => 'HR & Workforce',
            'position' => 'Test Specialist',
            'zone_id' => $employee['zone_id'],
            'is_active' => $employee['is_active'],
        ]);
    }

    DB::table('erp_audit_events')->insert([
        [
            'action' => 'EMPLOYEE_ADDED',
            'module' => 'hr',
            'target_type' => 'Employee',
            'target_id' => 'EMP-TEST-001',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'action' => 'COMPLIANCE_VERIFIED',
            'module' => 'hr',
            'target_type' => 'Audit',
            'target_id' => 'CMP-001',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'action' => 'STOCK_ADJUSTED',
            'module' => 'inventory',
            'target_type' => 'StockLevel',
            'target_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $this->get('/hr-workforce')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('hr-workforce')
            ->where('workforceMetrics.activeWorkforce', 2)
            ->where('workforceMetrics.totalWorkforce', 3)
            ->where('workforceMetrics.fieldDispatch', 1)
            ->where('workforceMetrics.workforceReadiness', 33.3)
            ->where('workforceMetrics.complianceRecords', 2)
            ->has('employees', 3)
            ->has('zones', 1)
            ->has('timelineEvents', 2)
        );
});
