<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class WorkspaceDashboardData
{
    /**
     * @return array{metrics: list<array{label: string, value: int|float|string}>, records: list<array{name: string, detail: string, status: string, value: int|float|string}>}
     */
    public function forRole(string $role): array
    {
        return match ($role) {
            'subsidy' => [
                'roleCharts' => [
                    'categoryTitle' => 'Farmer verification status',
                    'activityTitle' => 'Quota disbursement by zone',
                    'activityUnit' => 'MT',
                    'categoryBreakdown' => DB::table('erp_farmers')
                        ->selectRaw("COALESCE(status, 'unclassified') as label, COUNT(*) as value")
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get()
                        ->map(fn (object $item): array => ['label' => str_replace('_', ' ', $item->label), 'value' => (float) $item->value])
                        ->all(),
                    'activityBreakdown' => DB::table('erp_farmer_quotas')
                        ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
                        ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                        ->selectRaw("COALESCE(erp_zones.name, 'Unassigned') as label, SUM(erp_farmer_quotas.disbursed_qty) as value")
                        ->groupBy('erp_zones.id', 'erp_zones.name')
                        ->orderByDesc('value')
                        ->limit(6)
                        ->get()
                        ->map(fn (object $item): array => ['label' => $item->label, 'value' => (float) $item->value])
                        ->all(),
                ],
                'metrics' => [
                    ['label' => 'Registered farmers', 'value' => DB::table('erp_farmers')->count()],
                    ['label' => 'Verification queue', 'value' => DB::table('erp_farmers')->where('status', 'pending_verification')->count()],
                    ['label' => 'Active quota records', 'value' => DB::table('erp_farmer_quotas')->count()],
                    ['label' => 'Fertilizer disbursed', 'value' => DB::table('erp_farmer_quotas')->sum('disbursed_qty').' MT'],
                ],
                'records' => DB::table('erp_farmers')
                    ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                    ->latest('erp_farmers.id')
                    ->limit(8)
                    ->get([
                        'erp_farmers.full_name as name',
                        'erp_farmers.national_id as detail',
                        'erp_farmers.status',
                        'erp_zones.name as zone_name',
                    ])
                    ->map(fn (object $farmer): array => [
                        'name' => $farmer->name,
                        'detail' => $farmer->detail.' · '.($farmer->zone_name ?? 'No zone'),
                        'status' => str_replace('_', ' ', $farmer->status),
                        'value' => $farmer->status,
                    ])
                    ->all(),
            ],
            'inventory' => [
                'inventoryCharts' => [
                    'monthlyInventoryActivity' => $this->monthlyInventoryActivity(),
                    'statusBreakdown' => DB::table('erp_stock_levels')
                        ->selectRaw("COALESCE(status, 'unclassified') as status, COUNT(*) as count")
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get()
                        ->map(fn (object $status): array => [
                            'status' => $status->status,
                            'count' => (int) $status->count,
                        ])
                        ->all(),
                    'commodityOnHand' => DB::table('erp_stock_levels')
                        ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                        ->groupBy('erp_commodities.id', 'erp_commodities.name')
                        ->selectRaw('erp_commodities.name as name, SUM(erp_stock_levels.on_hand_qty) as quantity')
                        ->orderByDesc('quantity')
                        ->limit(6)
                        ->get()
                        ->map(fn (object $stock): array => [
                            'name' => $stock->name,
                            'quantity' => (float) $stock->quantity,
                        ])
                        ->all(),
                    'depotUtilization' => DB::table('erp_depots')
                        ->leftJoin('erp_stock_levels', 'erp_stock_levels.depot_id', '=', 'erp_depots.id')
                        ->groupBy('erp_depots.id', 'erp_depots.name', 'erp_depots.capacity_mt')
                        ->selectRaw('erp_depots.name as name, COALESCE(SUM(erp_stock_levels.on_hand_qty), 0) as onHand, COALESCE(erp_depots.capacity_mt, 0) as capacity')
                        ->orderByDesc('onHand')
                        ->limit(6)
                        ->get()
                        ->map(function (object $depot): array {
                            $onHand = (float) $depot->onHand;
                            $capacity = (float) $depot->capacity;

                            return [
                                'name' => $depot->name,
                                'onHand' => $onHand,
                                'capacity' => $capacity,
                                'utilization' => $capacity > 0 ? round(($onHand * 100) / $capacity, 1) : null,
                            ];
                        })
                        ->all(),
                    'replenishmentWatchlist' => DB::table('erp_stock_levels')
                        ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                        ->join('erp_depots', 'erp_depots.id', '=', 'erp_stock_levels.depot_id')
                        ->where(function ($query): void {
                            $query->whereIn('erp_stock_levels.status', ['out_of_stock', 'reorder_due'])
                                ->orWhere('erp_stock_levels.runway_days', '<=', 30);
                        })
                        ->orderByRaw("CASE erp_stock_levels.status WHEN 'out_of_stock' THEN 0 WHEN 'reorder_due' THEN 1 ELSE 2 END")
                        ->orderBy('erp_stock_levels.runway_days')
                        ->limit(5)
                        ->get([
                            'erp_commodities.name as name',
                            'erp_depots.name as depot',
                            'erp_stock_levels.status',
                            'erp_stock_levels.runway_days as runwayDays',
                            'erp_stock_levels.on_hand_qty as onHand',
                        ])
                        ->map(fn (object $stock): array => [
                            'name' => $stock->name,
                            'depot' => $stock->depot,
                            'status' => $stock->status ?? 'available',
                            'runwayDays' => $stock->runwayDays === null ? null : (int) $stock->runwayDays,
                            'onHand' => (float) $stock->onHand,
                        ])
                        ->all(),
                ],
                'metrics' => [
                    ['label' => 'Stock on hand', 'value' => DB::table('erp_stock_levels')->sum('on_hand_qty').' MT'],
                    ['label' => 'Depots', 'value' => DB::table('erp_depots')->count()],
                    ['label' => 'Reorder alerts', 'value' => DB::table('erp_stock_levels')->where('status', 'reorder_due')->count()],
                    ['label' => 'Stock batches', 'value' => DB::table('erp_stock_batches')->count()],
                ],
                'records' => DB::table('erp_stock_levels')
                    ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                    ->join('erp_depots', 'erp_depots.id', '=', 'erp_stock_levels.depot_id')
                    ->join('erp_stock_batches', 'erp_stock_batches.id', '=', 'erp_stock_levels.batch_id')
                    ->latest('erp_stock_levels.id')
                    ->limit(8)
                    ->get([
                        'erp_commodities.name as name',
                        'erp_stock_batches.lot_no as detail',
                        'erp_stock_levels.status',
                        'erp_stock_levels.on_hand_qty as value',
                        'erp_depots.name as depot_name',
                    ])
                    ->map(fn (object $stock): array => [
                        'name' => $stock->name,
                        'detail' => $stock->detail.' · '.$stock->depot_name,
                        'status' => $stock->status ?? 'available',
                        'value' => $stock->value.' MT',
                    ])
                    ->all(),
            ],
            'sales' => [
                'roleCharts' => [
                    'categoryTitle' => 'Contract pipeline',
                    'activityTitle' => 'Trade volume by commodity',
                    'activityUnit' => 'MT',
                    'categoryBreakdown' => DB::table('erp_trade_contracts')
                        ->selectRaw("COALESCE(status, 'unclassified') as label, COUNT(*) as value")
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get()
                        ->map(fn (object $item): array => ['label' => str_replace('_', ' ', $item->label), 'value' => (float) $item->value])
                        ->all(),
                    'activityBreakdown' => DB::table('erp_trade_contracts')
                        ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                        ->selectRaw('erp_commodities.name as label, SUM(erp_trade_contracts.volume_mt) as value')
                        ->groupBy('erp_commodities.id', 'erp_commodities.name')
                        ->orderByDesc('value')
                        ->limit(6)
                        ->get()
                        ->map(fn (object $item): array => ['label' => $item->label, 'value' => (float) $item->value])
                        ->all(),
                ],
                'metrics' => [
                    ['label' => 'Trade contracts', 'value' => DB::table('erp_trade_contracts')->count()],
                    ['label' => 'Active contracts', 'value' => DB::table('erp_trade_contracts')->where('status', 'active')->count()],
                    ['label' => 'Contract volume', 'value' => DB::table('erp_trade_contracts')->sum('volume_mt').' MT'],
                    ['label' => 'Trade value', 'value' => DB::table('erp_trade_contracts')->selectRaw('COALESCE(SUM(volume_mt * price_per_mt), 0) AS total')->value('total')],
                ],
                'records' => DB::table('erp_trade_contracts')
                    ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                    ->latest('erp_trade_contracts.id')
                    ->limit(8)
                    ->get([
                        'erp_trade_contracts.contract_ref as name',
                        'erp_trade_contracts.counterparty as detail',
                        'erp_trade_contracts.status',
                        'erp_trade_contracts.volume_mt as value',
                        'erp_commodities.name as commodity_name',
                    ])
                    ->map(fn (object $contract): array => [
                        'name' => $contract->name,
                        'detail' => ($contract->detail ?? 'No counterparty').' · '.$contract->commodity_name,
                        'status' => $contract->status,
                        'value' => ($contract->value ?? 0).' MT',
                    ])
                    ->all(),
            ],
            'finance' => [
                'roleCharts' => [
                    'categoryTitle' => 'Contract mix',
                    'activityTitle' => 'Committed value by commodity',
                    'activityUnit' => '$',
                    'categoryBreakdown' => DB::table('erp_trade_contracts')
                        ->selectRaw("COALESCE(status, 'unclassified') as label, COUNT(*) as value")
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get()
                        ->map(fn (object $item): array => ['label' => str_replace('_', ' ', $item->label), 'value' => (float) $item->value])
                        ->all(),
                    'activityBreakdown' => DB::table('erp_trade_contracts')
                        ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                        ->selectRaw('erp_commodities.name as label, SUM(erp_trade_contracts.volume_mt * erp_trade_contracts.price_per_mt) as value')
                        ->groupBy('erp_commodities.id', 'erp_commodities.name')
                        ->orderByDesc('value')
                        ->limit(6)
                        ->get()
                        ->map(fn (object $item): array => ['label' => $item->label, 'value' => (float) $item->value])
                        ->all(),
                ],
                'metrics' => [
                    ['label' => 'Committed trade value', 'value' => DB::table('erp_trade_contracts')->selectRaw('COALESCE(SUM(volume_mt * price_per_mt), 0) AS total')->value('total')],
                    ['label' => 'Fertilizer allocated', 'value' => DB::table('erp_farmer_quotas')->sum('allocated_qty').' MT'],
                    ['label' => 'Fertilizer disbursed', 'value' => DB::table('erp_farmer_quotas')->sum('disbursed_qty').' MT'],
                    ['label' => 'Trade contracts', 'value' => DB::table('erp_trade_contracts')->count()],
                ],
                'records' => DB::table('erp_trade_contracts')
                    ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                    ->latest('erp_trade_contracts.id')
                    ->limit(8)
                    ->get([
                        'erp_trade_contracts.contract_ref as name',
                        'erp_trade_contracts.counterparty as detail',
                        'erp_trade_contracts.status',
                        'erp_trade_contracts.volume_mt as value',
                        'erp_commodities.name as commodity_name',
                    ])
                    ->map(fn (object $contract): array => [
                        'name' => $contract->name,
                        'detail' => ($contract->detail ?? 'No counterparty').' · '.$contract->commodity_name,
                        'status' => $contract->status,
                        'value' => ($contract->value ?? 0).' MT',
                    ])
                    ->all(),
            ],
            'hr' => [
                'roleCharts' => [
                    'categoryTitle' => 'Workforce status',
                    'activityTitle' => 'Employees by department',
                    'activityUnit' => 'staff',
                    'categoryBreakdown' => DB::table('erp_employees')
                        ->selectRaw("CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END as label, COUNT(*) as value")
                        ->groupBy('is_active')
                        ->orderBy('is_active')
                        ->get()
                        ->map(fn (object $item): array => ['label' => $item->label, 'value' => (float) $item->value])
                        ->all(),
                    'activityBreakdown' => DB::table('erp_employees')
                        ->selectRaw("COALESCE(department, 'Unassigned') as label, COUNT(*) as value")
                        ->groupBy('department')
                        ->orderByDesc('value')
                        ->limit(6)
                        ->get()
                        ->map(fn (object $item): array => ['label' => $item->label, 'value' => (float) $item->value])
                        ->all(),
                ],
                'metrics' => [
                    ['label' => 'Active workforce', 'value' => DB::table('erp_employees')->where('is_active', true)->count()],
                    ['label' => 'Total employees', 'value' => DB::table('erp_employees')->count()],
                    ['label' => 'Field assignments', 'value' => DB::table('erp_employees')->whereNotNull('zone_id')->count()],
                    ['label' => 'HR audit events', 'value' => DB::table('erp_audit_events')->where('module', 'hr')->count()],
                ],
                'records' => DB::table('erp_employees')
                    ->join('users', 'users.id', '=', 'erp_employees.user_id')
                    ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_employees.zone_id')
                    ->latest('erp_employees.id')
                    ->limit(8)
                    ->get([
                        'users.name',
                        'erp_employees.employee_code as detail',
                        'erp_employees.is_active',
                        'erp_employees.position',
                        'erp_zones.name as zone_name',
                    ])
                    ->map(fn (object $employee): array => [
                        'name' => $employee->name,
                        'detail' => $employee->detail.' · '.($employee->zone_name ?? 'No zone assigned'),
                        'status' => $employee->is_active ? 'active' : 'inactive',
                        'value' => $employee->position ?? 'Position unassigned',
                    ])
                    ->all(),
            ],
            default => [
                'metrics' => [],
                'records' => [],
            ],
        };
    }

    /**
     * @return list<array{month: string, label: string, transfers: float, reconciliationVariance: float}>
     */
    private function monthlyInventoryActivity(): array
    {
        $months = [];
        $firstMonth = now()->startOfMonth()->subMonths(5);

        foreach (range(0, 5) as $monthOffset) {
            $month = $firstMonth->copy()->addMonths($monthOffset);
            $monthKey = $month->format('Y-m');

            $months[$monthKey] = [
                'month' => $monthKey,
                'label' => $month->format("M 'y"),
                'transfers' => 0.0,
                'reconciliationVariance' => 0.0,
            ];
        }

        DB::table('erp_audit_events')
            ->where('module', 'inventory')
            ->whereIn('action', ['transferred', 'reconciled'])
            ->where('created_at', '>=', $firstMonth->toDateTimeString())
            ->orderBy('id')
            ->chunkById(500, function ($events) use (&$months): void {
                foreach ($events as $event) {
                    $monthKey = Carbon::parse($event->created_at)->format('Y-m');

                    if (! isset($months[$monthKey])) {
                        continue;
                    }

                    $payload = json_decode($event->payload ?? '{}', true, 512, JSON_THROW_ON_ERROR);

                    if ($event->action === 'transferred') {
                        $months[$monthKey]['transfers'] += (float) ($payload['quantity'] ?? 0);
                    } else {
                        $months[$monthKey]['reconciliationVariance'] += (float) ($payload['variance_qty'] ?? 0);
                    }
                }
            });

        return array_values($months);
    }
}
