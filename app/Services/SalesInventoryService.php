<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\SaleStockAllocation;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesInventoryService
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes, User $user): Sale
    {
        return DB::transaction(function () use ($attributes, $user): Sale {
            $sale = Sale::create([
                ...$this->saleAttributes($attributes),
                'created_by' => $user->id,
            ]);

            $this->allocateStock($sale);
            $this->recordAuditEvent($user, 'created', $sale);

            return $sale;
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Sale $sale, array $attributes, User $user): Sale
    {
        return DB::transaction(function () use ($sale, $attributes, $user): Sale {
            $lockedSale = Sale::query()->lockForUpdate()->findOrFail($sale->id);

            $this->returnStock($lockedSale, forgetAllocations: true);
            $lockedSale->update($this->saleAttributes($attributes));
            $this->allocateStock($lockedSale);
            $this->recordAuditEvent($user, 'updated', $lockedSale);

            return $lockedSale->refresh();
        });
    }

    public function delete(Sale $sale, User $user): void
    {
        DB::transaction(function () use ($sale, $user): void {
            $lockedSale = Sale::query()->lockForUpdate()->findOrFail($sale->id);

            $this->returnStock($lockedSale, forgetAllocations: false);
            $lockedSale->delete();
            $this->recordAuditEvent($user, 'deleted', $lockedSale);
        });
    }

    public function restore(Sale $sale, User $user): void
    {
        DB::transaction(function () use ($sale, $user): void {
            $lockedSale = Sale::onlyTrashed()->lockForUpdate()->findOrFail($sale->id);
            $allocations = $lockedSale->allocations()->lockForUpdate()->get();

            foreach ($allocations as $allocation) {
                $stockLevel = DB::table('erp_stock_levels')
                    ->where('id', $allocation->stock_level_id)
                    ->lockForUpdate()
                    ->first(['id', 'on_hand_qty']);

                if ($stockLevel === null || (float) $stockLevel->on_hand_qty < (float) $allocation->quantity) {
                    throw ValidationException::withMessages([
                        'restore' => 'This sale cannot be restored because its original stock has already been used by another sale.',
                    ]);
                }
            }

            foreach ($allocations as $allocation) {
                DB::table('erp_stock_levels')
                    ->where('id', $allocation->stock_level_id)
                    ->decrement('on_hand_qty', (float) $allocation->quantity, ['updated_at' => now()]);
            }

            $lockedSale->restore();
            $this->recordAuditEvent($user, 'restored', $lockedSale);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function saleAttributes(array $attributes): array
    {
        $quantity = round((float) $attributes['quantity'], 2);
        $unitPrice = round((float) $attributes['unit_price'], 2);
        $total = round($quantity * $unitPrice, 2);
        $paymentStatus = (string) $attributes['payment_status'];
        $amountPaid = match ($paymentStatus) {
            'paid' => $total,
            'unpaid' => 0.0,
            default => round((float) $attributes['amount_paid'], 2),
        };

        return [
            ...Arr::only($attributes, ['sale_date', 'farmer_id', 'commodity_id', 'depot_id', 'zone_id', 'distributor', 'payment_status']),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => $total,
            'amount_paid' => $amountPaid,
        ];
    }

    private function allocateStock(Sale $sale): void
    {
        $stockLevels = DB::table('erp_stock_levels')
            ->where('commodity_id', $sale->commodity_id)
            ->where('depot_id', $sale->depot_id)
            ->orderBy('id')
            ->lockForUpdate()
            ->get(['id', 'on_hand_qty']);

        $availableQuantity = $stockLevels->sum(fn (object $stockLevel): float => (float) $stockLevel->on_hand_qty);
        $remainingQuantity = (float) $sale->quantity;

        if ($availableQuantity + 0.00001 < $remainingQuantity) {
            throw ValidationException::withMessages([
                'quantity' => sprintf(
                    'Only %s units are available in the selected depot. Reduce the quantity or choose another depot.',
                    number_format($availableQuantity, 2),
                ),
            ]);
        }

        foreach ($stockLevels as $stockLevel) {
            if ($remainingQuantity <= 0) {
                break;
            }

            $allocatedQuantity = min($remainingQuantity, (float) $stockLevel->on_hand_qty);

            if ($allocatedQuantity <= 0) {
                continue;
            }

            $updated = DB::table('erp_stock_levels')
                ->where('id', $stockLevel->id)
                ->where('on_hand_qty', '>=', $allocatedQuantity)
                ->decrement('on_hand_qty', $allocatedQuantity, ['updated_at' => now()]);

            if ($updated !== 1) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stock changed while this sale was being saved. Review the available stock and try again.',
                ]);
            }

            SaleStockAllocation::create([
                'sale_id' => $sale->id,
                'stock_level_id' => $stockLevel->id,
                'quantity' => $allocatedQuantity,
            ]);

            $remainingQuantity = round($remainingQuantity - $allocatedQuantity, 2);
        }
    }

    private function returnStock(Sale $sale, bool $forgetAllocations): void
    {
        $allocations = $sale->allocations()->lockForUpdate()->get();

        foreach ($allocations as $allocation) {
            $stockLevel = DB::table('erp_stock_levels')
                ->where('id', $allocation->stock_level_id)
                ->lockForUpdate()
                ->first(['id']);

            if ($stockLevel === null) {
                throw ValidationException::withMessages([
                    'quantity' => 'This sale references stock that no longer exists and cannot be changed safely.',
                ]);
            }

            DB::table('erp_stock_levels')
                ->where('id', $allocation->stock_level_id)
                ->increment('on_hand_qty', (float) $allocation->quantity, ['updated_at' => now()]);
        }

        if ($forgetAllocations) {
            $sale->allocations()->delete();
        }
    }

    private function recordAuditEvent(User $user, string $action, Sale $sale): void
    {
        DB::table('erp_audit_events')->insert([
            'user_id' => $user->id,
            'action' => "sale.{$action}",
            'module' => 'sales',
            'target_type' => Sale::class,
            'target_id' => (string) $sale->id,
            'payload' => json_encode([
                'sale_date' => $sale->sale_date?->toDateString(),
                'total' => $sale->total,
                'payment_status' => $sale->payment_status,
            ], JSON_THROW_ON_ERROR),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
