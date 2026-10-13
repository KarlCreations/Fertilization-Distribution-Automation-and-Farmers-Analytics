<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FinanceSummaryCommand extends Command
{
    protected $signature = 'finance:summary';

    protected $description = 'Display a summary of current ERP finance records';

    public function handle(): int
    {
        $quotaTotals = DB::table('erp_farmer_quotas')
            ->selectRaw('COALESCE(SUM(allocated_qty), 0) AS allocated_mt')
            ->selectRaw('COALESCE(SUM(disbursed_qty), 0) AS disbursed_mt')
            ->first();

        $contractTotals = DB::table('erp_trade_contracts')
            ->selectRaw('COALESCE(SUM(COALESCE(volume_mt, 0) * COALESCE(price_per_mt, 0)), 0) AS contract_value')
            ->selectRaw("COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_contracts")
            ->first();

        $this->table(
            ['Finance measure', 'Current value'],
            [
                ['Recorded trade value (currency unspecified)', number_format((float) $contractTotals->contract_value, 2)],
                ['Active contracts', number_format((int) $contractTotals->active_contracts)],
                ['Quota allocated', number_format((float) $quotaTotals->allocated_mt, 2).' MT'],
                ['Quota disbursed', number_format((float) $quotaTotals->disbursed_mt, 2).' MT'],
                ['Quota remaining', number_format((float) $quotaTotals->allocated_mt - (float) $quotaTotals->disbursed_mt, 2).' MT'],
            ],
        );

        return self::SUCCESS;
    }
}
