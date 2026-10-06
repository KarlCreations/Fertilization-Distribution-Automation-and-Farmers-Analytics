<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SalesInventoryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SalesDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SalesInventoryService $salesInventory): void
    {
        $users = [
            ['name' => 'Sales Administrator', 'email' => 'admin@example.com', 'role' => 'admin', 'password' => 'Admin@12345'],
            ['name' => 'Sales Manager', 'email' => 'sales.manager@example.com', 'role' => 'sales', 'password' => 'Sales@12345'],
            ['name' => 'Sales Staff', 'email' => 'sales.staff@example.com', 'role' => 'sales_staff', 'password' => 'Sales@12345'],
        ];

        foreach ($users as $attributes) {
            User::query()->updateOrCreate(['email' => $attributes['email']], [
                'name' => $attributes['name'],
                'role' => $attributes['role'],
                'password' => Hash::make($attributes['password']),
                'email_verified_at' => now(),
            ]);
        }

        if (DB::table('erp_regions')->doesntExist()) {
            $this->call(ErpSampleDataSeeder::class);
        }

        $salesStaff = User::query()->where('email', 'sales.staff@example.com')->firstOrFail();
        $this->call(EmployeeSampleDataSeeder::class);

        $roleIds = DB::table('erp_roles')->pluck('id', 'code');

        foreach (User::query()->whereIn('role', ['admin', 'sales'])->get() as $user) {
            $roleCode = $user->role === 'admin' ? 'admin' : 'sales';

            DB::table('erp_user_roles')->updateOrInsert(
                ['user_id' => $user->id, 'role_id' => $roleIds[$roleCode]],
                ['created_at' => now(), 'updated_at' => now()],
            );
        }

        if (DB::table('erp_sales')->exists()) {
            $this->command?->info('Sales demo data already exists.');

            return;
        }

        $stockSources = DB::table('erp_stock_levels')
            ->join('erp_depots', 'erp_depots.id', '=', 'erp_stock_levels.depot_id')
            ->join('erp_zones', 'erp_zones.id', '=', 'erp_depots.zone_id')
            ->orderBy('erp_stock_levels.id')
            ->get([
                'erp_stock_levels.commodity_id',
                'erp_stock_levels.depot_id',
                'erp_zones.id as zone_id',
            ]);
        $farmerIds = DB::table('erp_farmers')->orderBy('id')->pluck('id');

        foreach (range(0, 19) as $index) {
            $stockSource = $stockSources[$index % $stockSources->count()];
            $quantity = 20 + (($index % 4) * 5);
            $unitPrice = 1200 + (($index % 5) * 75);
            $paymentStatus = match ($index % 3) {
                0 => 'paid',
                1 => 'partial',
                default => 'unpaid',
            };
            $total = $quantity * $unitPrice;

            $salesInventory->create([
                'sale_date' => now()->subDays($index * 2)->toDateString(),
                'farmer_id' => $farmerIds[$index % $farmerIds->count()],
                'commodity_id' => $stockSource->commodity_id,
                'depot_id' => $stockSource->depot_id,
                'zone_id' => $stockSource->zone_id,
                'distributor' => 'Provincial Fertilizer Depot',
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'amount_paid' => match ($paymentStatus) {
                    'paid' => $total,
                    'partial' => $total / 2,
                    default => 0,
                },
                'payment_status' => $paymentStatus,
            ], $salesStaff);
        }

        $this->command?->info('Sales dashboard demo data seeded.');
    }
}
