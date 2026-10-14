<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DisbursementController extends Controller
{
    public function record(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'gt:0'],
        ]);

        $quantity = (float) $validated['quantity'];

        DB::transaction(function () use ($id, $quantity) {
            $quota = DB::table('erp_farmer_quotas')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            if (! $quota) {
                throw ValidationException::withMessages([
                    'quantity' => 'The allocation record could not be found.',
                ]);
            }

            $allocated = (float) $quota->allocated_qty;
            $disbursed = (float) ($quota->disbursed_qty ?? 0);
            $remaining = $allocated - $disbursed;

            if ($quantity > $remaining) {
                throw ValidationException::withMessages([
                    'quantity' => sprintf(
                        'You can only disburse up to %.2f MT for this allocation.',
                        max(0, $remaining)
                    ),
                ]);
            }

            DB::table('erp_disbursement_records')->insert([
                'farmer_quota_id' => $id,
                'quantity' => $quantity,
                'recorded_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('erp_farmer_quotas')
                ->where('id', $id)
                ->update([
                    'disbursed_qty' => $disbursed + $quantity,
                ]);
        });

        return back()->with(
            'success',
            'Disbursement recorded successfully.'
        );
    }

    public function history($id)
    {
        $quota = DB::table('erp_farmer_quotas as q')
            ->join('erp_farmers as f', 'f.id', '=', 'q.farmer_id')
            ->join('erp_commodities as c', 'c.id', '=', 'q.commodity_id')
            ->join('erp_subsidy_cycles as sc', 'sc.id', '=', 'q.cycle_id')
            ->where('q.id', $id)
            ->select(
                'q.id',
                'q.allocated_qty',
                'q.disbursed_qty',
                'f.full_name as farmer_name',
                'c.name as commodity_name',
                'sc.name as cycle_name'
            )
            ->first();

        if (! $quota) {
            return response()->json([
                'message' => 'Allocation record not found.',
            ], 404);
        }

        $records = DB::table('erp_disbursement_records as dr')
            ->leftJoin('users as u', 'u.id', '=', 'dr.recorded_by')
            ->where('dr.farmer_quota_id', $id)
            ->orderByDesc('dr.created_at')
            ->select(
                'dr.id',
                'dr.quantity',
                'dr.created_at',
                'u.name as recorded_by'
            )
            ->get();

        return response()->json([
            'quota' => $quota,
            'records' => $records,
        ]);
    }
}
