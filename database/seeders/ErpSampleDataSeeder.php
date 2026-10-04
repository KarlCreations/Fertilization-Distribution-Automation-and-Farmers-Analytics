<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ErpSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $roleIds = [];

        foreach ([
            ['executive', 'Executive'], ['admin', 'System Administrator'], ['inventory', 'Inventory Staff'],
            ['sales', 'Sales Staff'], ['finance', 'Finance Staff'], ['hr', 'HR Employee'],
            ['subsidy', 'Subsidy Staff'], ['field_operations', 'Field Operations Staff'],
        ] as [$code, $name]) {
            $roleIds[$code] = DB::table('erp_roles')->insertGetId(['code' => $code, 'name' => $name]);
        }

        $regionId = DB::table('erp_regions')->insertGetId(['code' => 'REG-NORTH', 'name' => 'Northern Operations']);
        $zoneIds = [];
        $depotIds = [];
        for ($index = 1; $index <= 10; $index++) {
            $zoneIds[] = DB::table('erp_zones')->insertGetId(['region_id' => $regionId, 'zone_no' => $index, 'name' => "Operational Zone {$index}", 'zone_group' => $index % 2 === 0 ? 'River Delta' : 'Highlands']);
            $depotIds[] = DB::table('erp_depots')->insertGetId(['zone_id' => $zoneIds[$index - 1], 'code' => sprintf('DEP-%02d', $index), 'name' => "Operations Depot {$index}", 'facility_type' => 'warehouse', 'capacity_mt' => 10000, 'created_at' => $now, 'updated_at' => $now]);
        }

        $commodityIds = [];
        $farmerIds = [];
        for ($index = 1; $index <= 10; $index++) {
            $commodityIds[] = DB::table('erp_commodities')->insertGetId(['sku' => sprintf('FERT-%03d', $index), 'name' => "Fertilizer Product {$index}", 'category' => 'fertilizer', 'grade' => $index % 2 === 0 ? 'DAP' : 'Urea', 'unit' => 'MT', 'created_at' => $now, 'updated_at' => $now]);
            $farmerIds[] = DB::table('erp_farmers')->insertGetId(['national_id' => sprintf('DEV-FARMER-%03d', $index), 'full_name' => "Sample Farmer {$index}", 'phone' => sprintf('+66000000%03d', $index), 'zone_id' => $zoneIds[$index - 1], 'status' => $index % 3 === 0 ? 'pending_verification' : 'verified', 'biometric_verified' => $index % 3 !== 0, 'created_at' => $now, 'updated_at' => $now]);
        }

        $cycleId = DB::table('erp_subsidy_cycles')->insertGetId(['name' => 'Development Subsidy Cycle', 'fiscal_period' => 'DEV-2026', 'starts_on' => '2026-01-01', 'ends_on' => '2026-12-31', 'status' => 'active']);

        foreach (range(0, 9) as $index) {
            DB::table('erp_farmer_quotas')->insert(['farmer_id' => $farmerIds[$index], 'cycle_id' => $cycleId, 'commodity_id' => $commodityIds[$index], 'allocated_qty' => 100 + ($index * 10), 'disbursed_qty' => $index % 2 === 0 ? 40 : 0]);
            $batchId = DB::table('erp_stock_batches')->insertGetId(['lot_no' => sprintf('DEV-LOT-%03d', $index + 1), 'commodity_id' => $commodityIds[$index], 'supplier_name' => 'Sample Supplier '.($index + 1), 'received_at' => $now, 'quality_notes' => 'Development sample record', 'created_at' => $now, 'updated_at' => $now]);
            DB::table('erp_stock_levels')->insert(['depot_id' => $depotIds[$index], 'batch_id' => $batchId, 'commodity_id' => $commodityIds[$index], 'on_hand_qty' => 500 + ($index * 25), 'capacity_qty' => 5000, 'reorder_point' => 750, 'runway_days' => 20 + $index, 'status' => $index % 4 === 0 ? 'reorder_due' : 'optimal', 'created_at' => $now, 'updated_at' => $now]);
            DB::table('erp_trade_contracts')->insert(['contract_ref' => sprintf('DEV-CONTRACT-%03d', $index + 1), 'commodity_id' => $commodityIds[$index], 'contract_type' => $index % 2 === 0 ? 'domestic' : 'export', 'status' => $index % 3 === 0 ? 'draft' : 'active', 'volume_mt' => 250 + ($index * 20), 'price_per_mt' => 300, 'counterparty' => 'Sample Counterparty '.($index + 1), 'created_at' => $now, 'updated_at' => $now]);
        }

        foreach (DB::table('users')->whereNotNull('role')->get() as $user) {
            if (isset($roleIds[$user->role])) {
                DB::table('erp_user_roles')->updateOrInsert(['user_id' => $user->id, 'role_id' => $roleIds[$user->role]], ['created_at' => $now, 'updated_at' => $now]);
            }
        }

        $this->command?->info('ERP sample data seeded without modifying existing users.');
    }
}
