<?php

namespace App\Http\Controllers;

use App\Services\StockLevelStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WeighbridgeSlipController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slip_number' => ['required', 'string', 'max:100', 'unique:erp_weighbridge_slips,slip_number'],
            'direction' => ['required', 'string', 'in:inbound,outbound'],
            'stock_level_id' => ['required', 'integer', 'exists:erp_stock_levels,id'],
            'truck_plate' => ['required', 'string', 'max:50'],
            'gross_weight' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
            'tare_weight' => ['required', 'numeric', 'min:0', 'decimal:0,2', 'lt:gross_weight'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ], [
            'tare_weight.lt' => 'Tare weight must be less than gross weight.',
        ]);

        $grossWeight = (float) $data['gross_weight'];
        $tareWeight = (float) $data['tare_weight'];

        $netWeight = round($grossWeight - $tareWeight, 2);

        DB::transaction(function () use ($data, $grossWeight, $tareWeight, $netWeight, $request): void {
            $stock = DB::table('erp_stock_levels')
                ->where('id', $data['stock_level_id'])
                ->lockForUpdate()
                ->first();

            if ($stock === null) {
                throw ValidationException::withMessages([
                    'stock_level_id' => 'The selected stock record is no longer available.',
                ]);
            }

            $depot = DB::table('erp_depots')
                ->where('id', $stock->depot_id)
                ->lockForUpdate()
                ->first();

            if ($depot === null) {
                throw ValidationException::withMessages([
                    'stock_level_id' => 'The selected depot is no longer available.',
                ]);
            }

            $previousQuantity = (float) $stock->on_hand_qty;
            $nextQuantity = $data['direction'] === 'inbound'
                ? $previousQuantity + $netWeight
                : $previousQuantity - $netWeight;

            if ($nextQuantity < 0) {
                throw ValidationException::withMessages([
                    'gross_weight' => 'Net outbound weight cannot exceed the stock available at this depot.',
                ]);
            }

            if ($data['direction'] === 'inbound') {
                if ($stock->capacity_qty !== null && $nextQuantity > (float) $stock->capacity_qty) {
                    throw ValidationException::withMessages([
                        'gross_weight' => 'The net inbound weight would exceed this stock record capacity.',
                    ]);
                }

                $depotQuantity = (float) DB::table('erp_stock_levels')
                    ->where('depot_id', $depot->id)
                    ->sum('on_hand_qty');

                if ($depot->capacity_mt !== null && $depotQuantity + $netWeight > (float) $depot->capacity_mt) {
                    throw ValidationException::withMessages([
                        'gross_weight' => 'The net inbound weight would exceed the depot capacity.',
                    ]);
                }
            }

            $now = now();
            $updatedQuantity = round($nextQuantity, 2);

            DB::table('erp_stock_levels')->where('id', $stock->id)->update([
                'on_hand_qty' => $updatedQuantity,
                'status' => StockLevelStatus::for($updatedQuantity, $stock->reorder_point),
                'updated_at' => $now,
            ]);

            $details = DB::table('erp_commodities')
                ->join('erp_stock_batches', 'erp_stock_batches.commodity_id', '=', 'erp_commodities.id')
                ->where('erp_commodities.id', $stock->commodity_id)
                ->where('erp_stock_batches.id', $stock->batch_id)
                ->first([
                    'erp_commodities.name as commodity_name',
                    'erp_stock_batches.lot_no',
                ]);

            if ($details === null) {
                throw ValidationException::withMessages([
                    'stock_level_id' => 'The selected stock record details are no longer available.',
                ]);
            }

            $slipId = DB::table('erp_weighbridge_slips')->insertGetId([
                'slip_number' => $data['slip_number'],
                'direction' => $data['direction'],
                'stock_level_id' => $stock->id,
                'commodity_name' => $details->commodity_name,
                'depot_name' => $depot->name,
                'lot_no' => $details->lot_no,
                'truck_plate' => $data['truck_plate'],
                'gross_weight' => $grossWeight,
                'tare_weight' => $tareWeight,
                'net_weight' => $netWeight,
                'notes' => $data['notes'] ?? null,
                'recorded_by' => $request->user()->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'weighed',
                'module' => 'inventory',
                'target_type' => 'erp_weighbridge_slip',
                'target_id' => (string) $slipId,
                'payload' => json_encode([
                    'slip_number' => $data['slip_number'],
                    'direction' => $data['direction'],
                    'truck_plate' => $data['truck_plate'],
                    'net_weight' => $netWeight,
                    'previous_qty' => $previousQuantity,
                    'on_hand_qty' => $updatedQuantity,
                    'commodity_name' => $details->commodity_name,
                    'depot_name' => $depot->name,
                ], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('inventory-warehouses')->with('success', 'Weighbridge slip recorded and inventory updated.');
    }
}
