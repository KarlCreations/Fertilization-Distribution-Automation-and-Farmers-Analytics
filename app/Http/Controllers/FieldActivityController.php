<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FieldActivityController extends Controller
{
    public function index()
    {
        $activities = DB::table('erp_field_activities')
            ->join(
                'erp_farmers',
                'erp_farmers.id',
                '=',
                'erp_field_activities.farmer_id'
            )
            ->leftJoin(
                'erp_zones',
                'erp_zones.id',
                '=',
                'erp_field_activities.zone_id'
            )
            ->leftJoin(
                'erp_employees',
                'erp_employees.id',
                '=',
                'erp_field_activities.assigned_employee_id'
            )
            ->leftJoin(
                'users',
                'users.id',
                '=',
                'erp_employees.user_id'
            )
            ->orderByDesc('erp_field_activities.created_at')
            ->get([
                'erp_field_activities.id',
                'erp_field_activities.farmer_id',
                'erp_farmers.full_name as farmer_name',
                'erp_farmers.national_id',
                'erp_zones.name as zone_name',
                'erp_field_activities.assigned_employee_id',
                'users.name as assigned_employee_name',
                'erp_field_activities.activity_type',
                'erp_field_activities.scheduled_at',
                'erp_field_activities.status',
                'erp_field_activities.inspection_notes',
                'erp_field_activities.result',
                'erp_field_activities.completed_at',
            ]);

        $farmers = DB::table('erp_farmers')
            ->orderBy('full_name')
            ->get(['id', 'full_name', 'national_id', 'zone_id']);

        $employees = DB::table('erp_employees')
            ->join('users', 'users.id', '=', 'erp_employees.user_id')
            ->where('erp_employees.is_active', true)
            ->orderBy('users.name')
            ->get([
                'erp_employees.id',
                'users.name',
                'erp_employees.zone_id',
            ]);

        return Inertia::render('field-activities', [
            'activities' => $activities,
            'farmers' => $farmers,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => [
                'required',
                'integer',
                Rule::exists('erp_farmers', 'id'),
            ],
            'zone_id' => [
                'nullable',
                'integer',
                Rule::exists('erp_zones', 'id'),
            ],
            'assigned_employee_id' => [
                'nullable',
                'integer',
                Rule::exists('erp_employees', 'id')
                    ->where('is_active', true),
            ],
            'activity_type' => [
                'required',
                Rule::in(['farmer_verification', 'farm_inspection', 'field_visit']),
            ],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        if (empty($validated['zone_id'])) {
            $validated['zone_id'] = DB::table('erp_farmers')
                ->where('id', $validated['farmer_id'])
                ->value('zone_id');
        }

        DB::table('erp_field_activities')->insert([
            'farmer_id' => $validated['farmer_id'],
            'zone_id' => $validated['zone_id'] ?? null,
            'assigned_employee_id' => $validated['assigned_employee_id'] ?? null,
            'activity_type' => $validated['activity_type'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Field activity scheduled successfully.');
    }

    public function update(Request $request, int $activity)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['pending', 'in_progress', 'completed', 'cancelled']),
            ],
            'inspection_notes' => ['nullable', 'string', 'max:5000'],
            'result' => ['nullable', 'string', 'max:5000'],
        ]);

        $existingActivity = DB::table('erp_field_activities')
            ->where('id', $activity)
            ->first();

        if (! $existingActivity) {
            abort(404, 'Field activity not found.');
        }

        DB::table('erp_field_activities')
            ->where('id', $activity)
            ->update([
                'status' => $validated['status'],
                'inspection_notes' => $validated['inspection_notes'] ?? null,
                'result' => $validated['result'] ?? null,
                'completed_at' => $validated['status'] === 'completed'
                    ? ($existingActivity->completed_at ?? now())
                    : null,
                'updated_at' => now(),
            ]);

        return redirect()
            ->back()
            ->with('success', 'Field activity updated successfully.');
    }
}
