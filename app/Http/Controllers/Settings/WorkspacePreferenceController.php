<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WorkspacePreferenceController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $allowedDashboards = match ($request->user()->role) {
            'inventory', 'inventory_staff' => ['inventory-dashboard'],
            'sales', 'sales_staff' => ['sales-dashboard', 'sales-commodities'],
            'finance', 'finance_staff' => ['finance-dashboard', 'finance-impact'],
            'hr', 'hr_employee' => ['hr-dashboard', 'hr-workforce'],
            'subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff' => ['farmer-management-dashboard', 'farmer-registry'],
            default => [],
        };

        $validated = $request->validate([
            'default_dashboard' => ['required', 'string', Rule::in($allowedDashboards)],
        ]);

        $user = $request->user();
        $user->preferences = array_merge($user->preferences ?? [], $validated);
        $user->save();

        return to_route('employee-settings')->with('success', 'Workspace preferences saved.');
    }
}
