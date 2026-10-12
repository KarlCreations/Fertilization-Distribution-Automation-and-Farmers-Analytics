<?php

use App\Models\User;
use App\Services\WorkspaceNotificationFeed;
use Database\Seeders\ErpSampleDataSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

it('records manual silo readings without changing inventory and shares them with notifications', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $user = User::factory()->create(['role' => 'inventory']);
    $this->actingAs($user);
    $stock = DB::table('erp_stock_levels')->first();
    $quantityBefore = (float) $stock->on_hand_qty;

    $this->post(route('silo-sensor-readings.store'), [
        'stock_level_id' => $stock->id,
        'sensor_code' => 'SILO-01-TEMP',
        'level_percent' => '72.50',
        'temperature_c' => '24.25',
        'moisture_percent' => '11.80',
        'status' => 'warning',
    ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_silo_sensor_readings', [
        'stock_level_id' => $stock->id,
        'sensor_code' => 'SILO-01-TEMP',
        'level_percent' => 72.5,
        'status' => 'warning',
        'recorded_by' => $user->id,
    ]);
    expect((float) DB::table('erp_stock_levels')->where('id', $stock->id)->value('on_hand_qty'))->toBe($quantityBefore);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'sensor_recorded',
        'module' => 'inventory',
        'target_type' => 'erp_silo_sensor_reading',
    ]);

    $this->get(route('inventory-warehouses'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('inventoryMetrics.sensorReadingCount', 1)
            ->where('recentSensorReadings.0.sensor_code', 'SILO-01-TEMP'));

    $notification = app(WorkspaceNotificationFeed::class)->forUser($user);
    expect($notification['items'][0]['title'])->toBe('Inventory sensor reading recorded')
        ->and($notification['items'][0]['description'])->toContain('72.5% silo fill');
});

it('records an inbound weighbridge slip and reflects stock changes across inventory dashboards', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $user = User::factory()->create(['role' => 'inventory']);
    $this->actingAs($user);
    $stock = DB::table('erp_stock_levels')->first();

    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), [
            'slip_number' => 'WB-2026-001',
            'direction' => 'inbound',
            'stock_level_id' => $stock->id,
            'truck_plate' => 'ABC-123',
            'gross_weight' => '700.00',
            'tare_weight' => '200.00',
        ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_weighbridge_slips', [
        'slip_number' => 'WB-2026-001',
        'net_weight' => 500,
        'recorded_by' => $user->id,
    ]);
    $this->assertDatabaseHas('erp_stock_levels', [
        'id' => $stock->id,
        'on_hand_qty' => 1000,
    ]);
    $this->assertDatabaseHas('erp_audit_events', [
        'action' => 'weighed',
        'module' => 'inventory',
        'target_type' => 'erp_weighbridge_slip',
    ]);

    $this->get(route('inventory-warehouses'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('inventoryMetrics.weighbridgeSlipCount', 1)
            ->where('recentWeighbridgeSlips.0.slip_number', 'WB-2026-001'));

    $this->actingAs(User::factory()->create(['role' => 'executive']))
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('overviewMetrics.inventoryOnHand', 6625));

    $this->actingAs($user)
        ->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('inventoryCharts.monthlyInventoryActivity.5.weighbridgeInbound', 500)
            ->where('inventoryCharts.monthlyInventoryActivity.5.weighbridgeOutbound', 0));

    $notification = app(WorkspaceNotificationFeed::class)->forUser($user);
    expect($notification['items'][0]['title'])->toBe('Inventory weighbridge slip recorded')
        ->and($notification['items'][0]['description'])->toContain('500 MT received');
});

it('deducts outbound weighbridge net weight from available stock', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $stock = DB::table('erp_stock_levels')->first();

    $this->post(route('weighbridge-slips.store'), [
        'slip_number' => 'WB-OUT-001',
        'direction' => 'outbound',
        'stock_level_id' => $stock->id,
        'truck_plate' => 'XYZ-987',
        'gross_weight' => '80.00',
        'tare_weight' => '20.00',
    ])->assertRedirect(route('inventory-warehouses'));

    $this->assertDatabaseHas('erp_weighbridge_slips', [
        'slip_number' => 'WB-OUT-001',
        'net_weight' => 60,
    ]);
    $this->assertDatabaseHas('erp_stock_levels', [
        'id' => $stock->id,
        'on_hand_qty' => 440,
    ]);

    $this->get(route('inventory-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('inventoryCharts.monthlyInventoryActivity.5.weighbridgeOutbound', 60));
});

it('rejects weighbridge slips that would exceed stock or depot capacity', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $stock = DB::table('erp_stock_levels')->first();

    DB::table('erp_stock_levels')->where('id', $stock->id)->update(['capacity_qty' => 510]);
    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), [
            'slip_number' => 'WB-STOCK-CAP-001',
            'direction' => 'inbound',
            'stock_level_id' => $stock->id,
            'truck_plate' => 'CAP-001',
            'gross_weight' => '520.00',
            'tare_weight' => '500.00',
        ])
        ->assertSessionHasErrors(['gross_weight' => 'The net inbound weight would exceed this stock record capacity.']);

    DB::table('erp_stock_levels')->where('id', $stock->id)->update(['capacity_qty' => 5000]);
    DB::table('erp_depots')->where('id', $stock->depot_id)->update(['capacity_mt' => 510]);
    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), [
            'slip_number' => 'WB-DEPOT-CAP-001',
            'direction' => 'inbound',
            'stock_level_id' => $stock->id,
            'truck_plate' => 'CAP-002',
            'gross_weight' => '520.00',
            'tare_weight' => '500.00',
        ])
        ->assertSessionHasErrors(['gross_weight' => 'The net inbound weight would exceed the depot capacity.']);

    $this->assertDatabaseMissing('erp_weighbridge_slips', ['slip_number' => 'WB-STOCK-CAP-001']);
    $this->assertDatabaseMissing('erp_weighbridge_slips', ['slip_number' => 'WB-DEPOT-CAP-001']);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 500]);
});

it('rejects a tare weight that is not less than gross weight', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $stock = DB::table('erp_stock_levels')->first();
    $this->actingAs(User::factory()->create(['role' => 'inventory']));

    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), [
            'slip_number' => 'WB-INVALID-001',
            'direction' => 'outbound',
            'stock_level_id' => $stock->id,
            'truck_plate' => 'BAD-001',
            'gross_weight' => '200.00',
            'tare_weight' => '200.00',
        ])->assertSessionHasErrors(['tare_weight' => 'Tare weight must be less than gross weight.']);

    $this->assertDatabaseCount('erp_weighbridge_slips', 0);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 500]);
});

it('prevents outbound weighbridge slips from reducing stock below zero', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $stock = DB::table('erp_stock_levels')->first();

    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), [
            'slip_number' => 'WB-OVERDRAW-001',
            'direction' => 'outbound',
            'stock_level_id' => $stock->id,
            'truck_plate' => 'OVER-001',
            'gross_weight' => '701.00',
            'tare_weight' => '200.00',
        ])
        ->assertSessionHasErrors(['gross_weight' => 'Net outbound weight cannot exceed the stock available at this depot.']);

    $this->assertDatabaseMissing('erp_weighbridge_slips', ['slip_number' => 'WB-OVERDRAW-001']);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 500]);
    $this->assertDatabaseCount('erp_audit_events', 0);
});

it('rejects duplicate weighbridge slip numbers without applying stock twice', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $this->actingAs(User::factory()->create(['role' => 'inventory']));
    $stock = DB::table('erp_stock_levels')->first();

    $payload = [
        'slip_number' => 'WB-DUPLICATE-001',
        'direction' => 'inbound',
        'stock_level_id' => $stock->id,
        'truck_plate' => 'DUP-001',
        'gross_weight' => '520.00',
        'tare_weight' => '500.00',
    ];
    $this->post(route('weighbridge-slips.store'), $payload)->assertRedirect(route('inventory-warehouses'));
    $this->from(route('inventory-warehouses'))
        ->post(route('weighbridge-slips.store'), $payload)
        ->assertSessionHasErrors('slip_number');

    $this->assertDatabaseCount('erp_weighbridge_slips', 1);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 520]);
});

it('restricts sensor and weighbridge entry to inventory-authorized roles', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $stock = DB::table('erp_stock_levels')->first();
    $this->actingAs(User::factory()->create(['role' => 'sales']));

    $this->post(route('silo-sensor-readings.store'), [])->assertForbidden();
    $this->post(route('weighbridge-slips.store'), [
        'slip_number' => 'WB-FORBIDDEN-001',
        'direction' => 'inbound',
        'stock_level_id' => $stock->id,
        'truck_plate' => 'NO-ACCESS',
        'gross_weight' => '20',
        'tare_weight' => '10',
    ])->assertForbidden();

    $this->assertDatabaseCount('erp_silo_sensor_readings', 0);
    $this->assertDatabaseCount('erp_weighbridge_slips', 0);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 500]);
});

it('rejects invalid sensor ranges and requires an authenticated user', function () {
    $this->seed(ErpSampleDataSeeder::class);
    $stock = DB::table('erp_stock_levels')->first();

    $this->post(route('silo-sensor-readings.store'), [])->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create(['role' => 'inventory']))
        ->from(route('inventory-warehouses'))
        ->post(route('silo-sensor-readings.store'), [
            'stock_level_id' => $stock->id,
            'sensor_code' => 'SILO-RANGE-001',
            'level_percent' => '101',
            'temperature_c' => '22',
            'moisture_percent' => '10',
            'status' => 'normal',
        ])
        ->assertSessionHasErrors('level_percent');

    $this->assertDatabaseCount('erp_silo_sensor_readings', 0);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $stock->id, 'on_hand_qty' => 500]);
});
