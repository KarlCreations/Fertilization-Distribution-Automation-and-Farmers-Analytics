<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function transfer(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'source_stock_level_id' => ['required', 'integer', 'exists:erp_stock_levels,id'],
            'destination_depot_id' => ['required', 'integer', 'exists:erp_depots,id'],
            'quantity' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
        ]);

        DB::transaction(function () use ($data, $request): void {
            $source = DB::table('erp_stock_levels')
                ->where('id', $data['source_stock_level_id'])
                ->lockForUpdate()
                ->first();

            if ($source === null) {
                throw ValidationException::withMessages(['source_stock_level_id' => 'The selected source stock is no longer available.']);
            }

            if ((int) $source->depot_id === (int) $data['destination_depot_id']) {
                throw ValidationException::withMessages(['destination_depot_id' => 'Choose a different destination depot.']);
            }

            $quantity = (float) $data['quantity'];
            $sourceQuantity = (float) $source->on_hand_qty;

            if ($quantity > $sourceQuantity) {
                throw ValidationException::withMessages(['quantity' => 'The transfer quantity cannot exceed the source depot stock.']);
            }

            $destination = DB::table('erp_depots')
                ->where('id', $data['destination_depot_id'])
                ->lockForUpdate()
                ->first();

            if ($destination === null) {
                throw ValidationException::withMessages(['destination_depot_id' => 'The selected destination depot is no longer available.']);
            }

            $destinationStock = DB::table('erp_stock_levels')
                ->where('depot_id', $destination->id)
                ->where('batch_id', $source->batch_id)
                ->lockForUpdate()
                ->first();
            $destinationQuantity = (float) ($destinationStock->on_hand_qty ?? 0);
            $nextDestinationQuantity = $destinationQuantity + $quantity;

            if ($destinationStock !== null && $destinationStock->capacity_qty !== null
                && $nextDestinationQuantity > (float) $destinationStock->capacity_qty) {
                throw ValidationException::withMessages(['quantity' => 'The transfer would exceed the destination stock capacity.']);
            }

            $depotQuantity = (float) DB::table('erp_stock_levels')
                ->where('depot_id', $destination->id)
                ->sum('on_hand_qty');

            if ($destination->capacity_mt !== null && $depotQuantity + $quantity > (float) $destination->capacity_mt) {
                throw ValidationException::withMessages(['quantity' => 'The transfer would exceed the destination depot capacity.']);
            }

            $now = now();
            $nextSourceQuantity = $sourceQuantity - $quantity;
            DB::table('erp_stock_levels')->where('id', $source->id)->update([
                'on_hand_qty' => $nextSourceQuantity,
                'status' => $this->statusFor($nextSourceQuantity, $source->reorder_point),
                'updated_at' => $now,
            ]);

            if ($destinationStock === null) {
                $destinationStockId = DB::table('erp_stock_levels')->insertGetId([
                    'depot_id' => $destination->id,
                    'batch_id' => $source->batch_id,
                    'commodity_id' => $source->commodity_id,
                    'on_hand_qty' => $nextDestinationQuantity,
                    'capacity_qty' => null,
                    'reorder_point' => $source->reorder_point,
                    'runway_days' => null,
                    'status' => $this->statusFor($nextDestinationQuantity, $source->reorder_point),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $destinationStockId = $destinationStock->id;
                DB::table('erp_stock_levels')->where('id', $destinationStockId)->update([
                    'on_hand_qty' => $nextDestinationQuantity,
                    'status' => $this->statusFor($nextDestinationQuantity, $destinationStock->reorder_point),
                    'updated_at' => $now,
                ]);
            }

            $this->audit($request, 'transferred', 'erp_stock_transfer', (string) $source->id, [
                'source_stock_level_id' => $source->id,
                'destination_stock_level_id' => $destinationStockId,
                'source_depot_id' => $source->depot_id,
                'destination_depot_id' => $destination->id,
                'batch_id' => $source->batch_id,
                'quantity' => $quantity,
            ], $now);
        });

        return to_route('inventory-warehouses')->with('success', 'Stock transfer completed.');
    }

    public function reconcile(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'stock_level_id' => ['required', 'integer', 'exists:erp_stock_levels,id'],
            'counted_qty' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($data, $request): void {
            $stock = DB::table('erp_stock_levels')
                ->where('id', $data['stock_level_id'])
                ->lockForUpdate()
                ->first();

            if ($stock === null) {
                throw ValidationException::withMessages(['stock_level_id' => 'The selected stock record is no longer available.']);
            }

            $previousQuantity = (float) $stock->on_hand_qty;
            $countedQuantity = (float) $data['counted_qty'];
            $now = now();

            DB::table('erp_stock_levels')->where('id', $stock->id)->update([
                'on_hand_qty' => $countedQuantity,
                'status' => $this->statusFor($countedQuantity, $stock->reorder_point),
                'updated_at' => $now,
            ]);

            $this->audit($request, 'reconciled', 'erp_stock_level', (string) $stock->id, [
                'previous_qty' => $previousQuantity,
                'counted_qty' => $countedQuantity,
                'variance_qty' => $countedQuantity - $previousQuantity,
                'reason' => $data['reason'] ?? null,
            ], $now);
        });

        return to_route('inventory-warehouses')->with('success', 'Inventory count reconciled.');
    }

    private function statusFor(float $quantity, mixed $reorderPoint): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        }

        if ($reorderPoint !== null && $quantity <= (float) $reorderPoint) {
            return 'reorder_due';
        }

        return 'optimal';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function audit(Request $request, string $action, string $targetType, string $targetId, array $payload, mixed $timestamp): void
    {
        DB::table('erp_audit_events')->insert([
            'user_id' => $request->user()->id,
            'action' => $action,
            'module' => 'inventory',
            'target_type' => $targetType,
            'target_id' => $targetId,
            'payload' => json_encode($payload, JSON_THROW_ON_ERROR),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }
}
