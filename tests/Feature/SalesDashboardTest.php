<?php

use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function createSalesContext(): array
{
    $regionId = DB::table('erp_regions')->insertGetId([
        'code' => 'REG-TEST-'.fake()->unique()->numerify('###'),
        'name' => 'Test Region',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $zoneId = DB::table('erp_zones')->insertGetId([
        'region_id' => $regionId,
        'zone_no' => 1,
        'name' => 'Test Sales Area',
        'zone_group' => 'Test Group',
    ]);
    $depotId = DB::table('erp_depots')->insertGetId([
        'zone_id' => $zoneId,
        'code' => 'DEP-TEST-'.fake()->unique()->numerify('###'),
        'name' => 'Test Depot',
        'facility_type' => 'warehouse',
        'capacity_mt' => 1000,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $commodityId = DB::table('erp_commodities')->insertGetId([
        'sku' => 'FERT-TEST-'.fake()->unique()->numerify('###'),
        'name' => 'Test Urea',
        'category' => 'fertilizer',
        'grade' => 'Urea',
        'unit' => 'kg',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $farmerId = DB::table('erp_farmers')->insertGetId([
        'national_id' => 'FARMER-TEST-'.fake()->unique()->numerify('###'),
        'full_name' => 'Maria Santos',
        'zone_id' => $zoneId,
        'status' => 'verified',
        'biometric_verified' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $batchId = DB::table('erp_stock_batches')->insertGetId([
        'lot_no' => 'LOT-TEST-'.fake()->unique()->numerify('###'),
        'commodity_id' => $commodityId,
        'supplier_name' => 'Test Supplier',
        'received_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $stockLevelId = DB::table('erp_stock_levels')->insertGetId([
        'depot_id' => $depotId,
        'batch_id' => $batchId,
        'commodity_id' => $commodityId,
        'on_hand_qty' => 100,
        'capacity_qty' => 1000,
        'reorder_point' => 20,
        'status' => 'optimal',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return compact('zoneId', 'depotId', 'commodityId', 'farmerId', 'stockLevelId');
}

function salePayload(array $context, array $overrides = []): array
{
    return [...[
        'sale_date' => now()->toDateString(),
        'farmer_id' => $context['farmerId'],
        'commodity_id' => $context['commodityId'],
        'depot_id' => $context['depotId'],
        'zone_id' => $context['zoneId'],
        'distributor' => 'Test Distributor',
        'quantity' => 25,
        'unit_price' => 1200,
        'amount_paid' => 30000,
        'payment_status' => 'paid',
    ], ...$overrides];
}

test('sales staff can record a sale and inventory is reduced', function () {
    $context = createSalesContext();
    $salesStaff = User::factory()->create(['role' => 'sales_staff']);

    $this->actingAs($salesStaff)
        ->from(route('sales-dashboard'))
        ->post(route('sales.store'), salePayload($context))
        ->assertRedirect(route('sales-dashboard'));

    $this->assertDatabaseHas('erp_sales', [
        'farmer_id' => $context['farmerId'],
        'commodity_id' => $context['commodityId'],
        'quantity' => 25,
        'total' => 30000,
        'amount_paid' => 30000,
        'created_by' => $salesStaff->id,
    ]);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $context['stockLevelId'], 'on_hand_qty' => 75]);
    $this->assertDatabaseCount('erp_sale_stock_allocations', 1);
    $this->assertDatabaseHas('erp_audit_events', ['module' => 'sales', 'action' => 'sale.created']);
});

test('sales cannot exceed available inventory', function () {
    $context = createSalesContext();
    $salesStaff = User::factory()->create(['role' => 'sales_staff']);

    $this->actingAs($salesStaff)
        ->from(route('sales-dashboard'))
        ->post(route('sales.store'), salePayload($context, ['quantity' => 101, 'amount_paid' => 121200]))
        ->assertRedirect(route('sales-dashboard'))
        ->assertSessionHasErrors(['quantity' => 'Only 100.00 units are available in the selected depot. Reduce the quantity or choose another depot.']);

    $this->assertDatabaseCount('erp_sales', 0);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $context['stockLevelId'], 'on_hand_qty' => 100]);
});

test('sales staff cannot update a sale recorded by another staff member', function () {
    $context = createSalesContext();
    $owner = User::factory()->create(['role' => 'sales_staff']);
    $otherStaff = User::factory()->create(['role' => 'sales_staff']);
    $sale = Sale::create([...salePayload($context), 'total' => 30000, 'created_by' => $owner->id]);

    $this->actingAs($otherStaff)
        ->put(route('sales.update', $sale), salePayload($context))
        ->assertForbidden();
});

test('editing a sale reconciles the previous stock allocation before applying the new quantity', function () {
    $context = createSalesContext();
    $salesStaff = User::factory()->create(['role' => 'sales_staff']);

    $this->actingAs($salesStaff)->post(route('sales.store'), salePayload($context));
    $sale = Sale::query()->firstOrFail();

    $this->actingAs($salesStaff)
        ->from(route('sales-dashboard'))
        ->put(route('sales.update', $sale), salePayload($context, ['quantity' => 40, 'amount_paid' => 48000]))
        ->assertRedirect(route('sales-dashboard'));

    $this->assertDatabaseHas('erp_sales', ['id' => $sale->id, 'quantity' => 40, 'total' => 48000]);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $context['stockLevelId'], 'on_hand_qty' => 60]);
    $this->assertDatabaseHas('erp_sale_stock_allocations', ['sale_id' => $sale->id, 'quantity' => 40]);
});

test('administrators can open the sales dashboard', function () {
    $administrator = User::factory()->create(['role' => 'admin']);

    $this->actingAs($administrator)
        ->get(route('sales-dashboard'))
        ->assertOk();
});

test('deleting a sale restores the allocated stock', function () {
    $context = createSalesContext();
    $salesStaff = User::factory()->create(['role' => 'sales_staff']);

    $this->actingAs($salesStaff)->post(route('sales.store'), salePayload($context));
    $sale = Sale::query()->firstOrFail();

    $this->actingAs($salesStaff)
        ->from(route('sales-dashboard'))
        ->delete(route('sales.destroy', $sale))
        ->assertRedirect(route('sales-dashboard'));

    $this->assertSoftDeleted('erp_sales', ['id' => $sale->id]);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $context['stockLevelId'], 'on_hand_qty' => 100]);
});

test('restoring a deleted sale re-applies its original inventory allocation', function () {
    $context = createSalesContext();
    $salesStaff = User::factory()->create(['role' => 'sales_staff']);

    $this->actingAs($salesStaff)->post(route('sales.store'), salePayload($context));
    $sale = Sale::query()->firstOrFail();
    $this->actingAs($salesStaff)->delete(route('sales.destroy', $sale));

    $this->actingAs($salesStaff)
        ->from(route('sales-dashboard'))
        ->post(route('sales.restore', $sale->id))
        ->assertRedirect(route('sales-dashboard'));

    $this->assertDatabaseHas('erp_sales', ['id' => $sale->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('erp_stock_levels', ['id' => $context['stockLevelId'], 'on_hand_qty' => 75]);
});
