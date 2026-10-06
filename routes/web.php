<?php

use App\Services\PowerBiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

use App\Http\Controllers\HrAuthController;
use App\Http\Controllers\HrController;

Route::get('hr-login', [HrAuthController::class, 'create'])->name('hr-login');

Route::middleware(['auth'])->group(function () {
    Route::get('power-bi/embed-config', function (PowerBiService $powerBi): JsonResponse {
        try {
            return response()->json($powerBi->embedConfiguration());
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }
    })->middleware('role:executive,admin,operations_director,inventory,inventory_staff,sales,sales_staff,finance,finance_staff,hr,hr_employee,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('power-bi.embed-config');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'overviewMetrics' => [
                'registeredFarmers' => DB::table('erp_farmers')->count(),
                'inventoryOnHand' => DB::table('erp_stock_levels')->sum('on_hand_qty'),
                'distributionActivity' => DB::table('erp_farmer_quotas')->sum('disbursed_qty'),
                'tradeValue' => DB::table('erp_trade_contracts')->selectRaw('COALESCE(SUM(volume_mt * price_per_mt), 0) AS total')->value('total'),
            ],
            'quotaLedger' => DB::table('erp_farmer_quotas')
                ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_farmer_quotas.commodity_id')
                ->join('erp_subsidy_cycles', 'erp_subsidy_cycles.id', '=', 'erp_farmer_quotas.cycle_id')
                ->orderByDesc('erp_farmer_quotas.id')
                ->limit(8)
                ->get([
                    'erp_farmer_quotas.id',
                    'erp_farmers.full_name as farmer_name',
                    'erp_commodities.name as commodity_name',
                    'erp_subsidy_cycles.name as cycle_name',
                    'erp_farmer_quotas.allocated_qty',
                    'erp_farmer_quotas.disbursed_qty',
                ]),
        ]);
    })->middleware('role:executive,admin,operations_director')->name('dashboard');

    Route::get('farmer-management-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'subsidy']);
    })->middleware('role:subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-management-dashboard');

    Route::get('employee-settings', [HrController::class, 'settings'])
        ->middleware('role:inventory,inventory_staff,sales,sales_staff,finance,finance_staff,hr,hr_employee,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('employee-settings');

    Route::post('hr/settings', [HrController::class, 'updateSettings'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.settings.update');

    Route::get('inventory-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'inventory']);
    })->middleware('role:inventory,inventory_staff')->name('inventory-dashboard');

    Route::get('sales-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'sales']);
    })->middleware('role:sales,sales_staff')->name('sales-dashboard');

    Route::get('finance-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'finance']);
    })->middleware('role:finance,finance_staff')->name('finance-dashboard');

    Route::get('hr-dashboard', [HrController::class, 'dashboard'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-dashboard');

    Route::get('farmer-registry', function () {
        return Inertia::render('farmer-registry', [
            'registryMetrics' => [
                'registeredFarmers' => DB::table('erp_farmers')->count(),
                'quotaDisbursed' => DB::table('erp_farmer_quotas')->sum('disbursed_qty'),
                'activeQuotaRecords' => DB::table('erp_farmer_quotas')->count(),
                'quotaAllocated' => DB::table('erp_farmer_quotas')->sum('allocated_qty'),
            ],
            'quotaLedger' => DB::table('erp_farmer_quotas')
                ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_farmer_quotas.commodity_id')
                ->join('erp_subsidy_cycles', 'erp_subsidy_cycles.id', '=', 'erp_farmer_quotas.cycle_id')
                ->orderByDesc('erp_farmer_quotas.id')
                ->limit(8)
                ->get([
                    'erp_farmer_quotas.id',
                    'erp_farmers.full_name as farmer_name',
                    'erp_farmers.national_id',
                    'erp_commodities.name as commodity_name',
                    'erp_subsidy_cycles.name as cycle_name',
                    'erp_farmer_quotas.allocated_qty',
                    'erp_farmer_quotas.disbursed_qty',
                ]),
        ]);
    })->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-registry');

    Route::get('inventory-warehouses', function () {
        return Inertia::render('inventory-warehouses');
    })->middleware('role:executive,admin,operations_director,inventory,inventory_staff,subsidy,subsidy_staff,field_operations,field_operations_staff,sales,sales_staff')->name('inventory-warehouses');

    Route::get('finance-impact', function () {
        return Inertia::render('finance-impact');
    })->middleware('role:executive,admin,operations_director,finance,finance_staff')->name('finance-impact');

    Route::get('sales-commodities', function () {
        return Inertia::render('sales-commodities');
    })->middleware('role:executive,admin,operations_director,sales,sales_staff')->name('sales-commodities');

    Route::get('hr-workforce', [HrController::class, 'workforce'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr-workforce');

    Route::post('hr/employees', [HrController::class, 'storeEmployee'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.employees.store');

    Route::post('hr/employees/{id}/update', [HrController::class, 'updateEmployee'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.employees.update');

    Route::post('hr/shifts', [HrController::class, 'storeShift'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.shifts.store');

    Route::post('hr/staffing-actions', [HrController::class, 'storeStaffingAction'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.staffing-actions.store');

    Route::post('hr/employees/{id}/toggle-active', [HrController::class, 'toggleEmployeeStatus'])
        ->middleware('role:executive,admin,operations_director,hr,hr_employee')
        ->name('hr.employees.toggle');

    Route::get('hr-profile', [HrController::class, 'profile'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-profile');

    Route::patch('hr-profile', [HrController::class, 'updateProfile'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-profile.update');

    Route::put('hr-profile/password', [HrController::class, 'updatePassword'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-profile.password');

    Route::post('hr-profile/photo', [HrController::class, 'updateProfilePhoto'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-profile.photo');

    Route::delete('hr-profile/photo', [HrController::class, 'removeProfilePhoto'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-profile.photo.destroy');

    Route::get('hr-settings', [HrController::class, 'hrSettings'])
        ->middleware('role:hr,hr_employee')
        ->name('hr-settings');

    Route::get('system-admin', function () {
        return Inertia::render('system-admin');
    })->middleware('role:executive,admin,operations_director')->name('system-admin');

    Route::get('system-settings', function () {
        return Inertia::render('system-settings');
    })->middleware('role:executive,admin,operations_director')->name('system-settings');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
