<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CommodityController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $commodityId = DB::table('erp_commodities')->insertGetId([
                ...$data,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'commodities',
                'target_type' => 'erp_commodity',
                'target_id' => (string) $commodityId,
                'payload' => json_encode(['sku' => $data['sku']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Commodity created.');
    }

    public function update(Request $request, int $commodity): RedirectResponse
    {
        $data = $this->validatedData($request, $commodity);

        DB::transaction(function () use ($data, $request, $commodity): void {
            abort_if(DB::table('erp_commodities')->where('id', $commodity)->doesntExist(), 404);

            $now = now();
            DB::table('erp_commodities')->where('id', $commodity)->update([
                ...$data,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'commodities',
                'target_type' => 'erp_commodity',
                'target_id' => (string) $commodity,
                'payload' => json_encode(['sku' => $data['sku']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Commodity updated.');
    }

    public function destroy(Request $request, int $commodity): RedirectResponse
    {
        DB::transaction(function () use ($request, $commodity): void {
            $record = DB::table('erp_commodities')->where('id', $commodity)->first();
            abort_if($record === null, 404);

            $isInUse = DB::table('erp_farmer_quotas')->where('commodity_id', $commodity)->exists()
                || DB::table('erp_stock_batches')->where('commodity_id', $commodity)->exists()
                || DB::table('erp_stock_levels')->where('commodity_id', $commodity)->exists()
                || DB::table('erp_trade_contracts')->where('commodity_id', $commodity)->exists();

            if ($isInUse) {
                throw ValidationException::withMessages([
                    'commodity' => 'This commodity is already used in stock, quotas, or trade contracts and cannot be deleted.',
                ]);
            }

            $now = now();
            DB::table('erp_commodities')->where('id', $commodity)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'commodities',
                'target_type' => 'erp_commodity',
                'target_id' => (string) $commodity,
                'payload' => json_encode(['sku' => $record->sku], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('sales-commodities')->with('success', 'Commodity deleted.');
    }

    /**
     * @return array{sku: string, name: string, category: string, grade: ?string, unit: string, is_hazardous: bool}
     */
    private function validatedData(Request $request, ?int $commodity = null): array
    {
        return $request->validate([
            'sku' => ['required', 'string', 'max:80', Rule::unique('erp_commodities', 'sku')->ignore($commodity)],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'grade' => ['nullable', 'string', 'max:100'],
            'unit' => ['required', 'string', 'max:30'],
            'is_hazardous' => ['required', 'boolean'],
        ]);
    }
}
