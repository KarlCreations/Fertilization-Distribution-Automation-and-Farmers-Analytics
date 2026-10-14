<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FinanceDashboardData
{
    /**
     * Return financial measures and the most recent ERP records used by both finance pages.
     *
     * @return array{
     *     metrics: array{contractValue: float, activeContracts: int, allocatedMt: float, disbursedMt: float, remainingMt: float},
     *     quotaLedger: Collection,
     *     tradeContracts: Collection,
     *     financeAuditEvents: Collection
     * }
     */
    public function snapshot(): array
    {
        $quotaTotals = DB::table('erp_farmer_quotas')
            ->selectRaw('COALESCE(SUM(allocated_qty), 0) AS allocated_mt')
            ->selectRaw('COALESCE(SUM(disbursed_qty), 0) AS disbursed_mt')
            ->first();

        $tradeTotals = DB::table('erp_trade_contracts')
            ->selectRaw('COALESCE(SUM(COALESCE(volume_mt, 0) * COALESCE(price_per_mt, 0)), 0) AS contract_value')
            ->selectRaw("COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_contracts")
            ->first();

        $allocatedMt = (float) $quotaTotals->allocated_mt;
        $disbursedMt = (float) $quotaTotals->disbursed_mt;

        return [
            'metrics' => [
                'contractValue' => (float) $tradeTotals->contract_value,
                'activeContracts' => (int) $tradeTotals->active_contracts,
                'allocatedMt' => $allocatedMt,
                'disbursedMt' => $disbursedMt,
                'remainingMt' => $allocatedMt - $disbursedMt,
            ],
            'quotaLedger' => DB::table('erp_farmer_quotas')
                ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_farmer_quotas.commodity_id')
                ->join('erp_subsidy_cycles', 'erp_subsidy_cycles.id', '=', 'erp_farmer_quotas.cycle_id')
                ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                ->orderByDesc('erp_farmer_quotas.id')
                ->limit(100)
                ->get([
                    'erp_farmer_quotas.id',
                    'erp_farmers.full_name AS farmer_name',
                    'erp_commodities.name AS commodity_name',
                    'erp_subsidy_cycles.name AS cycle_name',
                    'erp_subsidy_cycles.fiscal_period',
                    'erp_zones.name AS zone_name',
                    'erp_farmer_quotas.allocated_qty',
                    'erp_farmer_quotas.disbursed_qty',
                ]),
            'tradeContracts' => DB::table('erp_trade_contracts')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                ->orderByDesc('erp_trade_contracts.id')
                ->limit(100)
                ->get([
                    'erp_trade_contracts.id',
                    'erp_trade_contracts.contract_ref',
                    'erp_trade_contracts.contract_type',
                    'erp_trade_contracts.status',
                    'erp_trade_contracts.volume_mt',
                    'erp_trade_contracts.price_per_mt',
                    'erp_trade_contracts.counterparty',
                    'erp_commodities.name AS commodity_name',
                ])
                ->map(fn (object $contract): object => (object) [
                    ...((array) $contract),
                    'contract_value' => (float) ($contract->volume_mt ?? 0) * (float) ($contract->price_per_mt ?? 0),
                ]),
            'financeAuditEvents' => DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->where('erp_audit_events.module', 'finance')
                ->orderByDesc('erp_audit_events.id')
                ->limit(100)
                ->get([
                    'erp_audit_events.id',
                    'erp_audit_events.action',
                    'erp_audit_events.target_type',
                    'erp_audit_events.target_id',
                    'erp_audit_events.payload',
                    'erp_audit_events.created_at',
                    'users.name AS user_name',
                ]),
        ];
    }
}
