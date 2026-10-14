<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TradeContractController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $contractId = DB::table('erp_trade_contracts')->insertGetId([
                ...$data,
                'created_by' => $request->user()->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'sales',
                'target_type' => 'erp_trade_contract',
                'target_id' => (string) $contractId,
                'payload' => json_encode(['contract_ref' => $data['contract_ref']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Trade contract created.');
    }

    public function update(Request $request, int $tradeContract): RedirectResponse
    {
        $data = $this->validatedData($request, $tradeContract);

        DB::transaction(function () use ($data, $request, $tradeContract): void {
            abort_if(DB::table('erp_trade_contracts')->where('id', $tradeContract)->doesntExist(), 404);

            $now = now();
            DB::table('erp_trade_contracts')->where('id', $tradeContract)->update([...$data, 'updated_at' => $now]);
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'sales',
                'target_type' => 'erp_trade_contract',
                'target_id' => (string) $tradeContract,
                'payload' => json_encode(['contract_ref' => $data['contract_ref']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Trade contract updated.');
    }

    public function destroy(Request $request, int $tradeContract): RedirectResponse
    {
        DB::transaction(function () use ($request, $tradeContract): void {
            abort_if(DB::table('erp_trade_contracts')->where('id', $tradeContract)->doesntExist(), 404);

            $now = now();
            DB::table('erp_trade_contracts')->where('id', $tradeContract)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'sales',
                'target_type' => 'erp_trade_contract',
                'target_id' => (string) $tradeContract,
                'payload' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Trade contract deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $tradeContract = null): array
    {
        $referenceRule = Rule::unique('erp_trade_contracts', 'contract_ref');

        if ($tradeContract !== null) {
            $referenceRule->ignore($tradeContract);
        }

        return $request->validate([
            'contract_ref' => ['required', 'string', 'max:100', $referenceRule],
            'commodity_id' => ['required', 'integer', 'exists:erp_commodities,id'],
            'contract_type' => ['required', Rule::in(['domestic', 'export'])],
            'status' => ['required', Rule::in(['draft', 'active', 'completed', 'cancelled'])],
            'volume_mt' => ['nullable', 'numeric', 'min:0'],
            'price_per_mt' => ['nullable', 'numeric', 'min:0'],
            'counterparty' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
