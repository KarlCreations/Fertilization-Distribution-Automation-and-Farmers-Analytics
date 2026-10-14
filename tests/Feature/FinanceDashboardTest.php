<?php

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function createFinanceFixture(): array
{
    $now = now();
    $regionId = DB::table('erp_regions')->insertGetId([
        'code' => 'FIN-REGION',
        'name' => 'Finance Region',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    $zoneId = DB::table('erp_zones')->insertGetId([
        'region_id' => $regionId,
        'zone_no' => 1,
        'name' => 'Finance Zone',
    ]);
    $commodityId = DB::table('erp_commodities')->insertGetId([
        'sku' => 'FIN-FERT-001',
        'name' => 'Fertilizer',
        'category' => 'Fertilizer',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    $farmerId = DB::table('erp_farmers')->insertGetId([
        'national_id' => 'FIN-NID-001',
        'full_name' => 'Finance Test Farmer',
        'zone_id' => $zoneId,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    $cycleId = DB::table('erp_subsidy_cycles')->insertGetId([
        'name' => 'Finance Test Cycle',
        'fiscal_period' => '2026',
    ]);
    $quotaId = DB::table('erp_farmer_quotas')->insertGetId([
        'farmer_id' => $farmerId,
        'cycle_id' => $cycleId,
        'commodity_id' => $commodityId,
        'allocated_qty' => 10,
        'disbursed_qty' => 2,
    ]);
    DB::table('erp_trade_contracts')->insert([
        'contract_ref' => 'FIN-CONTRACT-001',
        'commodity_id' => $commodityId,
        'contract_type' => 'purchase',
        'status' => 'active',
        'volume_mt' => 2.5,
        'price_per_mt' => 100,
        'counterparty' => 'Finance Counterparty',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    return ['quotaId' => $quotaId];
}

test('finance pages display calculated figures and recorded ERP data', function () {
    createFinanceFixture();
    $financeUser = User::factory()->create(['role' => 'finance']);

    $this->actingAs($financeUser)
        ->get(route('finance-dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('role-dashboard')
            ->where('financeData.metrics.contractValue', 250)
            ->where('financeData.metrics.activeContracts', 1)
            ->where('financeData.metrics.allocatedMt', 10)
            ->where('financeData.metrics.disbursedMt', 2)
            ->where('financeData.metrics.remainingMt', 8)
            ->where('financeData.quotaLedger.0.farmer_name', 'Finance Test Farmer')
            ->where('financeData.tradeContracts.0.contract_ref', 'FIN-CONTRACT-001'));

    $this->get(route('finance-impact'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('finance-impact')
            ->where('metrics.contractValue', 250)
            ->where('metrics.remainingMt', 8));
});

test('finance staff can record an allocation-limited quota disbursement and audit it', function () {
    $fixture = createFinanceFixture();
    $financeUser = User::factory()->create(['role' => 'finance_staff']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $response = $this->actingAs($financeUser)
        ->from(route('finance-impact'))
        ->post(route('finance-disbursements.store', ['quotaId' => $fixture['quotaId']]), ['quantity' => '3.25']);

    $response->assertRedirect(route('finance-impact', absolute: false));
    $this->assertDatabaseHas('erp_farmer_quotas', [
        'id' => $fixture['quotaId'],
        'allocated_qty' => 10,
        'disbursed_qty' => 5.25,
    ]);
    $this->assertDatabaseHas('erp_audit_events', [
        'user_id' => $financeUser->id,
        'action' => 'disbursement.recorded',
        'module' => 'finance',
        'target_id' => (string) $fixture['quotaId'],
        'payload' => json_encode(['quantity_mt' => 3.25]),
    ]);
});

test('quota disbursements reject quantities exceeding the remaining allocation without changing records', function () {
    $fixture = createFinanceFixture();
    $financeUser = User::factory()->create(['role' => 'finance']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->actingAs($financeUser)
        ->from(route('finance-impact'))
        ->post(route('finance-disbursements.store', ['quotaId' => $fixture['quotaId']]), ['quantity' => '8.01'])
        ->assertSessionHasErrors('quantity');

    $this->assertDatabaseHas('erp_farmer_quotas', [
        'id' => $fixture['quotaId'],
        'disbursed_qty' => 2,
    ]);
    $this->assertDatabaseCount('erp_audit_events', 0);
});

test('non-finance users cannot record quota disbursements', function () {
    $fixture = createFinanceFixture();
    $user = User::factory()->create(['role' => 'sales']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->actingAs($user)
        ->post(route('finance-disbursements.store', ['quotaId' => $fixture['quotaId']]), ['quantity' => '1'])
        ->assertForbidden();

    $this->assertDatabaseHas('erp_farmer_quotas', [
        'id' => $fixture['quotaId'],
        'disbursed_qty' => 2,
    ]);
    $this->assertDatabaseCount('erp_audit_events', 0);
});

test('guests must authenticate before recording quota disbursements', function () {
    $fixture = createFinanceFixture();
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->post(route('finance-disbursements.store', ['quotaId' => $fixture['quotaId']]), ['quantity' => '1'])
        ->assertRedirect(route('login', absolute: false));

    $this->assertDatabaseHas('erp_farmer_quotas', [
        'id' => $fixture['quotaId'],
        'disbursed_qty' => 2,
    ]);
    $this->assertDatabaseCount('erp_audit_events', 0);
});
