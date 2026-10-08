<?php

use App\Models\User;
use Database\Seeders\ErpSampleDataSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('shows live SQLite data on the farmer management dashboard', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'subsidy']));

    $this->get(route('farmer-management-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('role-dashboard')
            ->where('role', 'subsidy')
            ->where('metrics.0.value', 10)
            ->has('records', 8)
            ->where('roleCharts.categoryTitle', 'Farmer verification status')
            ->has('roleCharts.categoryBreakdown')
            ->has('roleCharts.activityBreakdown'));

    $this->actingAs(User::factory()->create(['role' => 'executive']))
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('overviewMetrics.registeredFarmers', 10)
            ->has('inventorySummary', 3)
            ->has('zoneFulfillment'));

    $this->actingAs(User::factory()->create(['role' => 'inventory']))
        ->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('role-dashboard')
            ->where('role', 'inventory')
            ->where('inventoryCharts.statusBreakdown.0.status', 'optimal')
            ->where('inventoryCharts.statusBreakdown.0.count', 7)
            ->has('inventoryCharts.commodityOnHand', 6)
            ->has('inventoryCharts.depotUtilization', 6)
            ->where('inventoryCharts.depotUtilization.0.name', 'Operations Depot 10')
            ->where('inventoryCharts.depotUtilization.0.onHand', 725)
            ->where('inventoryCharts.depotUtilization.0.utilization', 7.3)
            ->has('inventoryCharts.replenishmentWatchlist', 5)
            ->where('inventoryCharts.replenishmentWatchlist.0.name', 'Fertilizer Product 1')
            ->where('inventoryCharts.replenishmentWatchlist.0.runwayDays', 20));

    $this->actingAs(User::factory()->create(['role' => 'sales']))
        ->get(route('sales-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'sales')
            ->where('roleCharts.categoryTitle', 'Contract pipeline')
            ->has('roleCharts.categoryBreakdown')
            ->has('roleCharts.activityBreakdown', 6));

    $this->actingAs(User::factory()->create(['role' => 'finance']))
        ->get(route('finance-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'finance')
            ->where('roleCharts.activityUnit', '$')
            ->has('roleCharts.activityBreakdown', 6));

    $this->actingAs(User::factory()->create(['role' => 'hr']))
        ->get(route('hr-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'hr')
            ->where('roleCharts.categoryTitle', 'Workforce status')
            ->has('roleCharts.categoryBreakdown')
            ->has('roleCharts.activityBreakdown'));

    $this->actingAs(User::factory()->create(['role' => 'inventory']))
        ->get(route('inventory-warehouses'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory-warehouses')
            ->has('depotUtilization', 10)
            ->where('depotUtilization.0.on_hand_qty', 500)
            ->has('recentInventoryEvents')
            ->where('latestReconciliation', null));
});

it('shows monthly inventory activity from recorded audit history', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->travelTo('2026-10-08 11:15:00');
    $this->actingAs(User::factory()->create(['role' => 'inventory']));

    DB::table('erp_audit_events')->insert([
        [
            'action' => 'transferred',
            'module' => 'inventory',
            'target_type' => 'erp_stock_transfer',
            'target_id' => '1',
            'payload' => json_encode(['quantity' => 125], JSON_THROW_ON_ERROR),
            'created_at' => '2026-10-02 10:00:00',
            'updated_at' => '2026-10-02 10:00:00',
        ],
        [
            'action' => 'reconciled',
            'module' => 'inventory',
            'target_type' => 'erp_stock_level',
            'target_id' => '1',
            'payload' => json_encode(['variance_qty' => -20], JSON_THROW_ON_ERROR),
            'created_at' => '2026-10-03 10:00:00',
            'updated_at' => '2026-10-03 10:00:00',
        ],
        [
            'action' => 'transferred',
            'module' => 'inventory',
            'target_type' => 'erp_stock_transfer',
            'target_id' => '2',
            'payload' => json_encode(['quantity' => 300], JSON_THROW_ON_ERROR),
            'created_at' => '2026-09-02 10:00:00',
            'updated_at' => '2026-09-02 10:00:00',
        ],
    ]);

    $this->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('role-dashboard')
            ->has('inventoryCharts.monthlyInventoryActivity', 6)
            ->where('inventoryCharts.monthlyInventoryActivity.4.month', '2026-09')
            ->where('inventoryCharts.monthlyInventoryActivity.4.transfers', 300)
            ->where('inventoryCharts.monthlyInventoryActivity.5.month', '2026-10')
            ->where('inventoryCharts.monthlyInventoryActivity.5.transfers', 125)
            ->where('inventoryCharts.monthlyInventoryActivity.5.reconciliationVariance', -20));
});

it('creates updates and deletes farmers in SQLite with audit records', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'subsidy']));
    $zoneId = DB::table('erp_zones')->value('id');

    $this->post(route('farmers.store'), [
        'national_id' => 'TEST-FARMER-001',
        'full_name' => 'Test Farmer',
        'phone' => '555-0101',
        'zone_id' => $zoneId,
        'status' => 'pending_verification',
        'biometric_verified' => false,
    ])->assertRedirect(route('farmer-registry'));

    $farmerId = DB::table('erp_farmers')->where('national_id', 'TEST-FARMER-001')->value('id');
    $this->assertDatabaseHas('erp_farmers', ['id' => $farmerId, 'full_name' => 'Test Farmer']);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'created',
        'module' => 'farmers',
        'target_type' => 'erp_farmer',
        'target_id' => (string) $farmerId,
    ]);

    $this->put(route('farmers.update', $farmerId), [
        'national_id' => 'TEST-FARMER-001',
        'full_name' => 'Updated Farmer',
        'phone' => '555-0102',
        'zone_id' => $zoneId,
        'status' => 'verified',
        'biometric_verified' => true,
    ])->assertRedirect(route('farmer-registry'));

    $this->assertDatabaseHas('erp_farmers', ['id' => $farmerId, 'full_name' => 'Updated Farmer', 'status' => 'verified']);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'updated',
        'module' => 'farmers',
        'target_type' => 'erp_farmer',
        'target_id' => (string) $farmerId,
    ]);

    $this->delete(route('farmers.destroy', $farmerId))->assertRedirect(route('farmer-registry'));
    $this->assertDatabaseMissing('erp_farmers', ['id' => $farmerId]);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'deleted',
        'module' => 'farmers',
        'target_type' => 'erp_farmer',
        'target_id' => (string) $farmerId,
    ]);
});

it('creates updates and deletes inventory stock levels in SQLite', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $commodityId = DB::table('erp_commodities')->value('id');
    $depotId = DB::table('erp_depots')->value('id');
    $batchId = DB::table('erp_stock_batches')->insertGetId([
        'lot_no' => 'TEST-STOCK-BATCH',
        'commodity_id' => $commodityId,
        'supplier_name' => 'Test supplier',
        'received_at' => now(),
        'quality_notes' => 'Feature test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->post(route('stock-levels.store'), [
        'depot_id' => $depotId,
        'batch_id' => $batchId,
        'commodity_id' => $commodityId,
        'on_hand_qty' => 100,
        'capacity_qty' => 200,
        'reorder_point' => 25,
        'runway_days' => 30,
        'status' => 'optimal',
    ])->assertRedirect(route('inventory-warehouses'));

    $stockId = DB::table('erp_stock_levels')->where('batch_id', $batchId)->value('id');
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stockId, 'on_hand_qty' => 100]);
    $this->assertDatabaseHas('erp_audit_events', ['action' => 'created', 'module' => 'inventory', 'target_id' => (string) $stockId]);

    $this->put(route('stock-levels.update', $stockId), [
        'depot_id' => $depotId,
        'batch_id' => $batchId,
        'commodity_id' => $commodityId,
        'on_hand_qty' => 80,
        'capacity_qty' => 200,
        'reorder_point' => 25,
        'runway_days' => 20,
        'status' => 'reorder_due',
    ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stockId, 'on_hand_qty' => 80, 'status' => 'reorder_due']);
    $this->delete(route('stock-levels.destroy', $stockId))->assertRedirect(route('inventory-warehouses'));
    $this->assertDatabaseMissing('erp_stock_levels', ['id' => $stockId]);
});

it('transfers inventory between depots without losing stock and records the movement', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $source = DB::table('erp_stock_levels')->orderBy('id')->first();
    $destinationDepotId = DB::table('erp_depots')->where('id', '!=', $source->depot_id)->value('id');
    $totalBefore = (float) DB::table('erp_stock_levels')->sum('on_hand_qty');

    $this->post(route('stock-transfers.store'), [
        'source_stock_level_id' => $source->id,
        'destination_depot_id' => $destinationDepotId,
        'quantity' => 25,
    ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_stock_levels', ['id' => $source->id, 'on_hand_qty' => (float) $source->on_hand_qty - 25]);
    $this->assertDatabaseHas('erp_stock_levels', [
        'depot_id' => $destinationDepotId,
        'batch_id' => $source->batch_id,
        'on_hand_qty' => 25,
    ]);
    expect((float) DB::table('erp_stock_levels')->sum('on_hand_qty'))->toBe($totalBefore);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'transferred',
        'module' => 'inventory',
        'target_type' => 'erp_stock_transfer',
    ]);
});

it('rejects inventory transfers that exceed available stock without changing either depot', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $source = DB::table('erp_stock_levels')->orderBy('id')->first();
    $destinationDepotId = DB::table('erp_depots')->where('id', '!=', $source->depot_id)->value('id');

    $this->from(route('inventory-warehouses'))
        ->post(route('stock-transfers.store'), [
            'source_stock_level_id' => $source->id,
            'destination_depot_id' => $destinationDepotId,
            'quantity' => (float) $source->on_hand_qty + 1,
        ])
        ->assertSessionHasErrors('quantity');

    $this->assertDatabaseHas('erp_stock_levels', ['id' => $source->id, 'on_hand_qty' => $source->on_hand_qty]);
    $this->assertDatabaseMissing('erp_stock_levels', ['depot_id' => $destinationDepotId, 'batch_id' => $source->batch_id]);
});

it('reconciles counted inventory quantities and records the variance', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $stock = DB::table('erp_stock_levels')->orderBy('id')->first();

    $this->post(route('stock-reconciliations.store'), [
        'stock_level_id' => $stock->id,
        'counted_qty' => 1000,
        'reason' => 'Physical count after depot inspection',
    ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 1000, 'status' => 'optimal']);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'reconciled',
        'module' => 'inventory',
        'target_type' => 'erp_stock_level',
        'target_id' => (string) $stock->id,
    ]);
});

it('creates updates and deletes trade contracts in SQLite', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'sales']));
    $commodityId = DB::table('erp_commodities')->value('id');

    $payload = [
        'contract_ref' => 'TEST-CONTRACT-001',
        'commodity_id' => $commodityId,
        'contract_type' => 'domestic',
        'status' => 'draft',
        'volume_mt' => 100,
        'price_per_mt' => 250,
        'counterparty' => 'Test buyer',
    ];

    $this->post(route('trade-contracts.store'), $payload)->assertRedirect(route('sales-commodities'));
    $contractId = DB::table('erp_trade_contracts')->where('contract_ref', 'TEST-CONTRACT-001')->value('id');
    $this->assertDatabaseHas('erp_trade_contracts', ['id' => $contractId, 'counterparty' => 'Test buyer']);
    $this->assertDatabaseHas('erp_audit_events', ['action' => 'created', 'module' => 'sales', 'target_id' => (string) $contractId]);

    $payload['status'] = 'active';
    $payload['volume_mt'] = 90;
    $this->put(route('trade-contracts.update', $contractId), $payload)->assertRedirect(route('sales-commodities'));
    $this->assertDatabaseHas('erp_trade_contracts', ['id' => $contractId, 'status' => 'active', 'volume_mt' => 90]);

    $this->delete(route('trade-contracts.destroy', $contractId))->assertRedirect(route('sales-commodities'));
    $this->assertDatabaseMissing('erp_trade_contracts', ['id' => $contractId]);
});

it('creates updates and deletes employee assignments in SQLite', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $manager = User::factory()->create(['role' => 'hr']);
    $employeeUser = User::factory()->create();
    $this->actingAs($manager);

    $payload = [
        'user_id' => $employeeUser->id,
        'employee_code' => 'TEST-EMP-001',
        'department' => 'Operations',
        'position' => 'Field coordinator',
        'zone_id' => DB::table('erp_zones')->value('id'),
        'depot_id' => DB::table('erp_depots')->value('id'),
        'is_active' => true,
    ];

    $this->post(route('employees.store'), $payload)->assertRedirect(route('hr-workforce'));
    $employeeId = DB::table('erp_employees')->where('employee_code', 'TEST-EMP-001')->value('id');
    $this->assertDatabaseHas('erp_employees', ['id' => $employeeId, 'position' => 'Field coordinator']);
    $this->assertDatabaseHas('erp_audit_events', ['action' => 'created', 'module' => 'hr', 'target_id' => (string) $employeeId]);

    $payload['position'] = 'Regional coordinator';
    $this->put(route('employees.update', $employeeId), $payload)->assertRedirect(route('hr-workforce'));
    $this->assertDatabaseHas('erp_employees', ['id' => $employeeId, 'position' => 'Regional coordinator']);

    $this->delete(route('employees.destroy', $employeeId))->assertRedirect(route('hr-workforce'));
    $this->assertDatabaseMissing('erp_employees', ['id' => $employeeId]);
});

it('creates updates and deletes farmer quotas while enforcing distribution limits', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'subsidy']));
    $farmerId = DB::table('erp_farmers')->orderBy('id')->value('id');
    $cycleId = DB::table('erp_subsidy_cycles')->value('id');
    $commodityId = DB::table('erp_commodities')->orderByDesc('id')->value('id');

    $payload = [
        'farmer_id' => $farmerId,
        'cycle_id' => $cycleId,
        'commodity_id' => $commodityId,
        'allocated_qty' => 80,
        'disbursed_qty' => 20,
    ];

    $this->post(route('farmer-quotas.store'), $payload)->assertRedirect(route('farmer-registry'));
    $quotaId = DB::table('erp_farmer_quotas')->where('farmer_id', $farmerId)->where('commodity_id', $commodityId)->value('id');
    $this->assertDatabaseHas('erp_farmer_quotas', ['id' => $quotaId, 'allocated_qty' => 80, 'disbursed_qty' => 20]);
    $this->assertDatabaseHas('erp_audit_events', ['action' => 'created', 'module' => 'subsidy', 'target_id' => (string) $quotaId]);

    $payload['allocated_qty'] = 120;
    $payload['disbursed_qty'] = 40;
    $this->put(route('farmer-quotas.update', $quotaId), $payload)->assertRedirect(route('farmer-registry'));
    $this->assertDatabaseHas('erp_farmer_quotas', ['id' => $quotaId, 'allocated_qty' => 120, 'disbursed_qty' => 40]);

    $payload['disbursed_qty'] = 121;
    $this->from(route('farmer-registry'))
        ->put(route('farmer-quotas.update', $quotaId), $payload)
        ->assertSessionHasErrors(['disbursed_qty' => 'Disbursed quantity cannot exceed the allocated quantity.']);
    $this->assertDatabaseHas('erp_farmer_quotas', ['id' => $quotaId, 'allocated_qty' => 120, 'disbursed_qty' => 40]);

    $this->delete(route('farmer-quotas.destroy', $quotaId))->assertRedirect(route('farmer-registry'));
    $this->assertDatabaseMissing('erp_farmer_quotas', ['id' => $quotaId]);
});

it('creates updates and safely deletes commodities in SQLite', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'sales']));
    $payload = [
        'sku' => 'TEST-COMMODITY-001',
        'name' => 'Test soil enhancer',
        'category' => 'fertilizer',
        'grade' => 'Organic',
        'unit' => 'MT',
        'is_hazardous' => false,
    ];

    $this->post(route('commodities.store'), $payload)->assertRedirect(route('sales-commodities'));
    $commodityId = DB::table('erp_commodities')->where('sku', 'TEST-COMMODITY-001')->value('id');
    $this->assertDatabaseHas('erp_commodities', ['id' => $commodityId, 'name' => 'Test soil enhancer']);
    $this->assertDatabaseHas('erp_audit_events', ['action' => 'created', 'module' => 'commodities', 'target_id' => (string) $commodityId]);

    $payload['name'] = 'Updated soil enhancer';
    $this->put(route('commodities.update', $commodityId), $payload)->assertRedirect(route('sales-commodities'));
    $this->assertDatabaseHas('erp_commodities', ['id' => $commodityId, 'name' => 'Updated soil enhancer']);

    $this->delete(route('commodities.destroy', $commodityId))->assertRedirect(route('sales-commodities'));
    $this->assertDatabaseMissing('erp_commodities', ['id' => $commodityId]);

    $usedCommodityId = DB::table('erp_commodities')->value('id');
    $this->from(route('sales-commodities'))
        ->delete(route('commodities.destroy', $usedCommodityId))
        ->assertSessionHasErrors(['commodity' => 'This commodity is already used in stock, quotas, or trade contracts and cannot be deleted.']);
    $this->assertDatabaseHas('erp_commodities', ['id' => $usedCommodityId]);
});

it('forbids users without a sales role from changing contracts', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'subsidy']));

    $this->post(route('trade-contracts.store'), [
        'contract_ref' => 'FORBIDDEN-CONTRACT',
        'commodity_id' => DB::table('erp_commodities')->value('id'),
        'contract_type' => 'domestic',
        'status' => 'draft',
        'volume_mt' => 10,
        'price_per_mt' => 5,
        'counterparty' => 'Not allowed',
    ])->assertForbidden();

    $this->assertDatabaseMissing('erp_trade_contracts', ['contract_ref' => 'FORBIDDEN-CONTRACT']);
});

it('rejects invalid trade contract quantities without writing data', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'sales']));

    $this->from(route('sales-commodities'))
        ->post(route('trade-contracts.store'), [
            'contract_ref' => 'INVALID-CONTRACT',
            'commodity_id' => DB::table('erp_commodities')->value('id'),
            'contract_type' => 'domestic',
            'status' => 'draft',
            'volume_mt' => -1,
            'price_per_mt' => 5,
            'counterparty' => 'Invalid quantity',
        ])
        ->assertSessionHasErrors(['volume_mt' => 'The volume mt field must be at least 0.']);

    $this->assertDatabaseMissing('erp_trade_contracts', ['contract_ref' => 'INVALID-CONTRACT']);
});

it('renders all primary workspace screens for their authorized roles', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $screens = [
        ['executive', 'dashboard', 'dashboard'],
        ['subsidy', 'farmer-management-dashboard', 'role-dashboard'],
        ['inventory', 'inventory-dashboard', 'role-dashboard'],
        ['sales', 'sales-dashboard', 'role-dashboard'],
        ['finance', 'finance-dashboard', 'role-dashboard'],
        ['hr', 'hr-dashboard', 'role-dashboard'],
        ['subsidy', 'farmer-registry', 'farmer-registry'],
        ['inventory', 'inventory-warehouses', 'inventory-warehouses'],
        ['sales', 'sales-commodities', 'sales-commodities'],
        ['finance', 'finance-impact', 'finance-impact'],
        ['hr', 'hr-workforce', 'hr-workforce'],
        ['executive', 'system-admin', 'system-admin'],
        ['executive', 'system-settings', 'system-settings'],
        ['inventory', 'employee-settings', 'employee-settings'],
    ];

    foreach ($screens as [$role, $routeName, $component]) {
        $this->actingAs(User::factory()->create(['role' => $role]))
            ->get(route($routeName))
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }
});

it('provisions and updates accounts while synchronizing the role assigned in SQLite', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'executive']));

    $this->post(route('system-users.store'), [
        'name' => 'Provisioned User',
        'email' => 'provisioned@example.test',
        'role' => 'sales',
        'password' => 'SecurePass123',
    ])->assertRedirect(route('system-admin'));

    $userId = DB::table('users')->where('email', 'provisioned@example.test')->value('id');
    expect(Hash::check('SecurePass123', DB::table('users')->where('id', $userId)->value('password')))->toBeTrue();
    $this->assertDatabaseHas('users', ['id' => $userId, 'role' => 'sales']);
    $this->assertDatabaseHas('erp_user_roles', [
        'user_id' => $userId,
        'role_id' => DB::table('erp_roles')->where('code', 'sales')->value('id'),
    ]);

    $this->put(route('system-users.update', $userId), [
        'name' => 'Updated User',
        'email' => 'updated-user@example.test',
        'role' => 'finance',
        'password' => '',
    ])->assertRedirect(route('system-admin'));

    $this->assertDatabaseHas('users', ['id' => $userId, 'name' => 'Updated User', 'email' => 'updated-user@example.test', 'role' => 'finance']);
    $this->assertDatabaseHas('erp_user_roles', [
        'user_id' => $userId,
        'role_id' => DB::table('erp_roles')->where('code', 'finance')->value('id'),
    ]);
    $this->assertDatabaseMissing('erp_user_roles', [
        'user_id' => $userId,
        'role_id' => DB::table('erp_roles')->where('code', 'sales')->value('id'),
    ]);
    $this->assertDatabaseHas('erp_audit_events', ['module' => 'system_users', 'target_id' => (string) $userId, 'action' => 'updated']);
});

it('updates role descriptions without changing access keys', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'executive']));
    $roleId = DB::table('erp_roles')->where('code', 'sales')->value('id');

    $this->put(route('system-roles.update', $roleId), [
        'name' => 'Commercial Sales',
        'description' => 'Updated sales role description.',
    ])->assertRedirect(route('system-admin'));
    $this->assertDatabaseHas('erp_roles', [
        'id' => $roleId,
        'code' => 'sales',
        'name' => 'Commercial Sales',
        'description' => 'Updated sales role description.',
    ]);
    $this->assertDatabaseHas('erp_audit_events', ['module' => 'system_roles', 'target_id' => (string) $roleId, 'action' => 'updated']);
});

it('prevents an administrator from removing their own administrator role', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $administrator = User::factory()->create(['role' => 'executive']);
    $this->actingAs($administrator);

    $this->from(route('system-admin'))
        ->put(route('system-users.update', $administrator->id), [
            'name' => $administrator->name,
            'email' => $administrator->email,
            'role' => 'inventory',
            'password' => '',
        ])
        ->assertSessionHasErrors(['role' => 'Your own account must retain an administrator role.']);

    $this->assertDatabaseHas('users', ['id' => $administrator->id, 'role' => 'executive']);
});

it('exports system configuration and security audit data for administrators', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'executive']));

    $this->get(route('system-settings.export'))->assertDownload('system-configuration.json');
    $this->get(route('system-admin.audit-export'))->assertDownload('security-audit.csv');
});

it('shares relevant unread activity notifications with the authorized workspace dashboard and persists read state per user', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $inventoryUser = User::factory()->create(['role' => 'inventory']);
    $otherInventoryUser = User::factory()->create(['role' => 'inventory']);
    $eventId = DB::table('erp_audit_events')->insertGetId([
        'user_id' => $inventoryUser->id,
        'action' => 'updated',
        'module' => 'inventory',
        'target_type' => 'erp_stock_level',
        'target_id' => '25',
        'payload' => json_encode(['batch_id' => 25], JSON_THROW_ON_ERROR),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($inventoryUser)
        ->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unreadCount', 1)
            ->where('notifications.items.0.title', 'Inventory updated')
            ->where('notifications.items.0.href', route('inventory-dashboard'))
            ->where('notifications.items.0.isRead', false));

    $this->post(route('notifications.read', $eventId))->assertRedirect();
    $this->assertDatabaseHas('erp_notification_reads', ['user_id' => $inventoryUser->id, 'audit_event_id' => $eventId]);
    $this->assertDatabaseMissing('erp_notification_reads', ['user_id' => $otherInventoryUser->id, 'audit_event_id' => $eventId]);

    $this->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unreadCount', 0)
            ->where('notifications.items.0.isRead', true));
});

it('hides notifications outside the signed-in role and prevents marking them read', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $eventId = DB::table('erp_audit_events')->insertGetId([
        'action' => 'created',
        'module' => 'inventory',
        'target_type' => 'erp_stock_level',
        'target_id' => '80',
        'payload' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $subsidyUser = User::factory()->create(['role' => 'subsidy']);
    $this->actingAs($subsidyUser);

    $this->get(route('farmer-management-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unreadCount', 0)
            ->has('notifications.items', 0));

    $this->post(route('notifications.read', $eventId))->assertNotFound();
    $this->assertDatabaseMissing('erp_notification_reads', ['user_id' => $subsidyUser->id, 'audit_event_id' => $eventId]);
});

it('marks only the signed-in user’s visible dashboard notifications as read in bulk', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $user = User::factory()->create(['role' => 'inventory']);
    $inventoryEventId = DB::table('erp_audit_events')->insertGetId([
        'action' => 'created',
        'module' => 'inventory',
        'target_type' => 'erp_stock_level',
        'target_id' => '101',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $salesEventId = DB::table('erp_audit_events')->insertGetId([
        'action' => 'created',
        'module' => 'sales',
        'target_type' => 'erp_trade_contract',
        'target_id' => '202',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $this->actingAs($user);

    $this->post(route('notifications.read-all'))->assertRedirect();

    $this->assertDatabaseHas('erp_notification_reads', ['user_id' => $user->id, 'audit_event_id' => $inventoryEventId]);
    $this->assertDatabaseMissing('erp_notification_reads', ['user_id' => $user->id, 'audit_event_id' => $salesEventId]);
});
