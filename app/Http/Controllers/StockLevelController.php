<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StockLevelController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $this->ensureBatchMatchesCommodity($data['batch_id'], $data['commodity_id']);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $stockId = DB::table('erp_stock_levels')->insertGetId([
                ...$data,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'inventory',
                'target_type' => 'erp_stock_level',
                'target_id' => (string) $stockId,
                'payload' => json_encode(['batch_id' => $data['batch_id'], 'depot_id' => $data['depot_id']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('inventory-warehouses')->with('success', 'Stock level created.');
    }

    public function update(Request $request, int $stockLevel): RedirectResponse
    {
        $data = $this->validatedData($request, $stockLevel);
        $this->ensureBatchMatchesCommodity($data['batch_id'], $data['commodity_id']);

        DB::transaction(function () use ($data, $request, $stockLevel): void {
            abort_if(DB::table('erp_stock_levels')->where('id', $stockLevel)->doesntExist(), 404);

            $now = now();
            DB::table('erp_stock_levels')->where('id', $stockLevel)->update([...$data, 'updated_at' => $now]);
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'inventory',
                'target_type' => 'erp_stock_level',
                'target_id' => (string) $stockLevel,
                'payload' => json_encode(['batch_id' => $data['batch_id'], 'depot_id' => $data['depot_id']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('inventory-warehouses')->with('success', 'Stock level updated.');
    }

    public function destroy(Request $request, int $stockLevel): RedirectResponse
    {
        DB::transaction(function () use ($request, $stockLevel): void {
            abort_if(DB::table('erp_stock_levels')->where('id', $stockLevel)->doesntExist(), 404);

            $now = now();
            DB::table('erp_stock_levels')->where('id', $stockLevel)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'inventory',
                'target_type' => 'erp_stock_level',
                'target_id' => (string) $stockLevel,
                'payload' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('inventory-warehouses')->with('success', 'Stock level deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $stockLevel = null): array
    {
        return $request->validate([
            'depot_id' => ['required', 'integer', 'exists:erp_depots,id'],
            'batch_id' => [
                'required',
                'integer',
                Rule::exists('erp_stock_batches', 'id')->where('commodity_id', $request->input('commodity_id')),
                Rule::unique('erp_stock_levels', 'batch_id')
                    ->where('depot_id', $request->input('depot_id'))
                    ->ignore($stockLevel),
            ],
            'commodity_id' => ['required', 'integer', 'exists:erp_commodities,id'],
            'on_hand_qty' => ['required', 'numeric', 'min:0'],
            'capacity_qty' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
            'runway_days' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['optimal', 'reorder_due', 'out_of_stock'])],
        ]);
    }

    private function ensureBatchMatchesCommodity(int $batchId, int $commodityId): void
    {
        if (! DB::table('erp_stock_batches')->where('id', $batchId)->where('commodity_id', $commodityId)->exists()) {
            throw ValidationException::withMessages([
                'batch_id' => 'Select a batch that belongs to the selected commodity.',
            ]);
        }
    }
}
