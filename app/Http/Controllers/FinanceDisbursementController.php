<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinanceDisbursementController extends Controller
{
    public function store(Request $request, int $quotaId): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'decimal:0,2', 'gt:0'],
        ]);
        $quantity = (float) $validated['quantity'];

        DB::transaction(function () use ($request, $quotaId, $quantity): void {
            $quota = DB::table('erp_farmer_quotas')
                ->where('id', $quotaId)
                ->lockForUpdate()
                ->first();

            abort_if($quota === null, 404);

            $remaining = (float) $quota->allocated_qty - (float) $quota->disbursed_qty;

            if ($quantity > $remaining) {
                throw ValidationException::withMessages([
                    'quantity' => "The quantity cannot exceed the remaining allocation of {$remaining} MT.",
                ]);
            }

            DB::table('erp_farmer_quotas')
                ->where('id', $quotaId)
                ->increment('disbursed_qty', $quantity);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'disbursement.recorded',
                'module' => 'finance',
                'target_type' => 'erp_farmer_quota',
                'target_id' => (string) $quotaId,
                'payload' => json_encode(['quantity_mt' => $quantity], JSON_THROW_ON_ERROR),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('status', 'Disbursement recorded against the quota.');
    }
}
