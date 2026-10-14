<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FarmerQuotaController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $quotaId = DB::table('erp_farmer_quotas')->insertGetId($data);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'subsidy',
                'target_type' => 'erp_farmer_quota',
                'target_id' => (string) $quotaId,
                'payload' => json_encode($data, JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer quota saved.');
    }

    public function update(Request $request, int $farmerQuota): RedirectResponse
    {
        $data = $this->validatedData($request, $farmerQuota);

        DB::transaction(function () use ($data, $request, $farmerQuota): void {
            abort_if(DB::table('erp_farmer_quotas')->where('id', $farmerQuota)->doesntExist(), 404);

            $now = now();
            DB::table('erp_farmer_quotas')->where('id', $farmerQuota)->update($data);
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'subsidy',
                'target_type' => 'erp_farmer_quota',
                'target_id' => (string) $farmerQuota,
                'payload' => json_encode($data, JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer quota updated.');
    }

    public function destroy(Request $request, int $farmerQuota): RedirectResponse
    {
        DB::transaction(function () use ($request, $farmerQuota): void {
            abort_if(DB::table('erp_farmer_quotas')->where('id', $farmerQuota)->doesntExist(), 404);

            $now = now();
            DB::table('erp_farmer_quotas')->where('id', $farmerQuota)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'subsidy',
                'target_type' => 'erp_farmer_quota',
                'target_id' => (string) $farmerQuota,
                'payload' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer quota deleted.');
    }

    /**
     * @return array{farmer_id: int, cycle_id: int, commodity_id: int, allocated_qty: int|float, disbursed_qty: int|float}
     */
    private function validatedData(Request $request, ?int $farmerQuota = null): array
    {
        $data = $request->validate([
            'farmer_id' => ['required', 'integer', 'exists:erp_farmers,id'],
            'cycle_id' => ['required', 'integer', 'exists:erp_subsidy_cycles,id'],
            'commodity_id' => ['required', 'integer', 'exists:erp_commodities,id'],
            'allocated_qty' => ['required', 'numeric', 'min:0'],
            'disbursed_qty' => ['required', 'numeric', 'min:0'],
        ]);

        if ((float) $data['disbursed_qty'] > (float) $data['allocated_qty']) {
            throw ValidationException::withMessages([
                'disbursed_qty' => 'Disbursed quantity cannot exceed the allocated quantity.',
            ]);
        }

        $uniqueRule = Rule::unique('erp_farmer_quotas', 'farmer_id')
            ->where('cycle_id', $data['cycle_id'])
            ->where('commodity_id', $data['commodity_id']);

        if ($farmerQuota !== null) {
            $uniqueRule->ignore($farmerQuota);
        }

        $request->validate(['farmer_id' => [$uniqueRule]]);

        return $data;
    }
}
