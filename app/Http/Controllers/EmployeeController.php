<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $employeeId = DB::table('erp_employees')->insertGetId([
                ...$data,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'module' => 'hr',
                'target_type' => 'erp_employee',
                'target_id' => (string) $employeeId,
                'payload' => json_encode(['employee_code' => $data['employee_code']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('hr-workforce')->with('success', 'Employee added.');
    }

    public function update(Request $request, int $employee): RedirectResponse
    {
        $data = $this->validatedData($request, $employee);

        DB::transaction(function () use ($data, $request, $employee): void {
            abort_if(DB::table('erp_employees')->where('id', $employee)->doesntExist(), 404);

            $now = now();
            DB::table('erp_employees')->where('id', $employee)->update([...$data, 'updated_at' => $now]);
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'module' => 'hr',
                'target_type' => 'erp_employee',
                'target_id' => (string) $employee,
                'payload' => json_encode(['employee_code' => $data['employee_code']], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('hr-workforce')->with('success', 'Employee updated.');
    }

    public function destroy(Request $request, int $employee): RedirectResponse
    {
        DB::transaction(function () use ($request, $employee): void {
            abort_if(DB::table('erp_employees')->where('id', $employee)->doesntExist(), 404);

            $now = now();
            DB::table('erp_employees')->where('id', $employee)->delete();
            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'module' => 'hr',
                'target_type' => 'erp_employee',
                'target_id' => (string) $employee,
                'payload' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('hr-workforce')->with('success', 'Employee deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?int $employee = null): array
    {
        $userRule = Rule::unique('erp_employees', 'user_id');
        $codeRule = Rule::unique('erp_employees', 'employee_code');

        if ($employee !== null) {
            $userRule->ignore($employee);
            $codeRule->ignore($employee);
        }

        return $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id', $userRule],
            'employee_code' => ['required', 'string', 'max:80', $codeRule],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
            'depot_id' => ['nullable', 'integer', Rule::exists('erp_depots', 'id')],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
