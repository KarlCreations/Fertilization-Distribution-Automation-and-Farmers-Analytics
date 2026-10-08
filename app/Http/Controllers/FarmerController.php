<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FarmerController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'national_id' => ['required', 'string', 'max:80', 'unique:erp_farmers,national_id'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
            'status' => ['required', Rule::in(['pending_verification', 'verified', 'suspended'])],
            'biometric_verified' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $farmerId = DB::table('erp_farmers')->insertGetId([
                ...$data,
                'registered_by' => $request->user()->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'farmers',
                'target_type' => 'erp_farmer',
                'target_id' => (string) $farmerId,
                'payload' => json_encode(['national_id' => $data['national_id']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer registered.');
    }

    public function update(Request $request, int $farmer): RedirectResponse
    {
        $data = $request->validate([
            'national_id' => ['required', 'string', 'max:80', Rule::unique('erp_farmers', 'national_id')->ignore($farmer)],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
            'status' => ['required', Rule::in(['pending_verification', 'verified', 'suspended'])],
            'biometric_verified' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $request, $farmer): void {
            $record = DB::table('erp_farmers')->where('id', $farmer)->first();
            abort_if($record === null, 404);

            $now = now();
            DB::table('erp_farmers')->where('id', $farmer)->update([...$data, 'updated_at' => $now]);
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'farmers',
                'target_type' => 'erp_farmer',
                'target_id' => (string) $farmer,
                'payload' => json_encode(['national_id' => $data['national_id']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer updated.');
    }

    public function destroy(Request $request, int $farmer): RedirectResponse
    {
        DB::transaction(function () use ($request, $farmer): void {
            $record = DB::table('erp_farmers')->where('id', $farmer)->first();
            abort_if($record === null, 404);

            $now = now();
            DB::table('erp_farmers')->where('id', $farmer)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'farmers',
                'target_type' => 'erp_farmer',
                'target_id' => (string) $farmer,
                'payload' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('farmer-registry')->with('success', 'Farmer deleted.');
    }
}
