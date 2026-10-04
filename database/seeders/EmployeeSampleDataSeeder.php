<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $assignments = [
            'executive' => ['department' => 'Executive Office', 'position' => 'Operations Director', 'zone' => 1, 'depot' => 1],
            'inventory' => ['department' => 'Inventory & Warehouses', 'position' => 'Inventory Staff', 'zone' => 2, 'depot' => 2],
            'sales' => ['department' => 'Sales & Commodities', 'position' => 'Sales Staff', 'zone' => 3, 'depot' => 3],
            'finance' => ['department' => 'Finance & Impact', 'position' => 'Finance Staff', 'zone' => 4, 'depot' => 4],
            'hr' => ['department' => 'HR & Workforce', 'position' => 'HR Employee', 'zone' => 5, 'depot' => 5],
            'subsidy' => ['department' => 'Farmer Subsidies', 'position' => 'Subsidy Staff', 'zone' => 6, 'depot' => 6],
            'field_operations' => ['department' => 'Field Operations', 'position' => 'Field Operations Staff', 'zone' => 7, 'depot' => 7],
        ];

        foreach (DB::table('users')->whereIn('role', array_keys($assignments))->get() as $user) {
            $assignment = $assignments[$user->role];
            $zoneId = DB::table('erp_zones')->where('zone_no', $assignment['zone'])->value('id');
            $depotId = DB::table('erp_depots')->where('code', sprintf('DEP-%02d', $assignment['depot']))->value('id');

            DB::table('erp_employees')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'employee_code' => sprintf('DEV-EMP-%03d', $user->id),
                    'department' => $assignment['department'],
                    'position' => $assignment['position'],
                    'zone_id' => $zoneId,
                    'depot_id' => $depotId,
                    'is_active' => true,
                    'updated_at' => $now,
                    'created_at' => $now,
                ],
            );
        }

        $this->command?->info('Employee sample data seeded without modifying existing users.');
    }
}
