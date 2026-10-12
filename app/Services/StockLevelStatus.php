<?php

namespace App\Services;

class StockLevelStatus
{
    public static function for(float $quantity, mixed $reorderPoint): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        }

        if ($reorderPoint !== null && $quantity <= (float) $reorderPoint) {
            return 'reorder_due';
        }

        return 'optimal';
    }
}
