<?php

use App\Services\PowerBiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\DisbursementController;
use App\Http\Controllers\FieldActivityController;


Route::redirect('/', '/login')->name('home');

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

        Route::get('subsidy-dashboard', function () {
            return Inertia::render('subsidy-dashboard', [
                'subsidyMetrics' => [
                    'registeredFarmers' => DB::table('erp_farmers')->count(),

                    'pendingVerification' => DB::table('erp_farmers')
                        ->where('status', 'pending_verification')
                        ->count(),

                    'verifiedFarmers' => DB::table('erp_farmers')
                        ->where('biometric_verified', true)
                        ->count(),

                    'totalAllocated' => DB::table('erp_farmer_quotas')
                        ->sum('allocated_qty'),

                    'totalDisbursed' => DB::table('erp_farmer_quotas')
                        ->sum('disbursed_qty'),

                    'activeCycles' => DB::table('erp_subsidy_cycles')
                        ->where('status', 'active')
                        ->count(),
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

                'zoneSummary' => DB::table('erp_farmers')
                    ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                    ->select(
                        'erp_zones.name as zone_name',
                        DB::raw('COUNT(erp_farmers.id) as farmer_count')
                    )
                    ->groupBy('erp_zones.id', 'erp_zones.name')
                    ->orderByDesc('farmer_count')
                    ->get(),

                    
                'verificationQueue' => DB::table('erp_farmers')
                    ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                    ->where('erp_farmers.status', 'pending_verification')
                    ->orderByDesc('erp_farmers.created_at')
                    ->limit(8)
                    ->get([
                        'erp_farmers.id',
                        'erp_farmers.full_name',
                        'erp_farmers.national_id',
                        'erp_farmers.created_at',
                        'erp_farmers.status',
                        'erp_zones.name as zone_name',
                    ]),

            ]);
        })->middleware('role:subsidy,subsidy_staff')->name('subsidy-dashboard');

            Route::get('employee-settings', function () {
                return Inertia::render('employee-settings');
            })->middleware('role:inventory,inventory_staff,sales,sales_staff,finance,finance_staff,hr,hr_employee,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('employee-settings');

            Route::get('inventory-dashboard', function () {
                return Inertia::render('role-dashboard', ['role' => 'inventory']);
            })->middleware('role:inventory,inventory_staff')->name('inventory-dashboard');

            Route::get('sales-dashboard', function () {
                return Inertia::render('role-dashboard', ['role' => 'sales']);
            })->middleware('role:sales,sales_staff')->name('sales-dashboard');

            Route::get('finance-dashboard', function () {
                return Inertia::render('role-dashboard', ['role' => 'finance']);
            })->middleware('role:finance,finance_staff')->name('finance-dashboard');

            Route::get('hr-dashboard', function () {
                return Inertia::render('role-dashboard', ['role' => 'hr']);
            })->middleware('role:hr,hr_employee')->name('hr-dashboard');

            Route::get('operations-dashboard', function () {
                return Inertia::render('role-dashboard', [
                    'role' => 'field_operations',
                    'metrics' => [
                        'pendingFarmVerification' => DB::table('erp_farmers')
                            ->where('status', 'pending_verification')
                            ->count(),
                    ],
                ]);
            })->middleware('role:field_operations,field_operations_staff')
            ->name('operations-dashboard');

            
            Route::middleware(['auth', 'role:subsidy,subsidy_staff'])->group(function () {
                Route::get('field-activities', [FieldActivityController::class, 'index'])
                    ->name('field-activities.index');

                Route::post('field-activities', [FieldActivityController::class, 'store'])
                    ->name('field-activities.store');

                Route::patch('field-activities/{activity}', [FieldActivityController::class, 'update'])
                    ->name('field-activities.update');
            });

            
            Route::get('farmer-registry', function () {
                return Inertia::render('farmer-registry', [
                    'registryMetrics' => [
                        'registeredFarmers' => DB::table('erp_farmers')->count(),

                        'pendingVerification' => DB::table('erp_farmers')
                            ->where('status', 'pending_verification')
                            ->count(),

                        'verifiedFarmers' => DB::table('erp_farmers')
                            ->where('biometric_verified', true)
                            ->count(),
                    ],

                    'farmers' => DB::table('erp_farmers')
                        ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                        ->orderByDesc('erp_farmers.id')
                        ->get([
                            'erp_farmers.id',
                            'erp_farmers.national_id',
                            'erp_farmers.full_name',
                            'erp_farmers.phone',
                            'erp_farmers.zone_id',
                            'erp_farmers.status',
                            'erp_farmers.biometric_verified',
                            'erp_farmers.created_at',
                            'erp_zones.name as zone_name',
                        ]),

                    'zones' => DB::table('erp_zones')
                        ->orderBy('name')
                        ->get([
                            'id',
                            'name',
                        ]),
                ]);
            })->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-registry');

Route::get('subsidy-allocations', function () {
    return Inertia::render('subsidy-allocations', [
        'allocations' => DB::table('erp_farmer_quotas')
            ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
            ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_farmer_quotas.commodity_id')
            ->join('erp_subsidy_cycles', 'erp_subsidy_cycles.id', '=', 'erp_farmer_quotas.cycle_id')
            ->orderByDesc('erp_farmer_quotas.id')
            ->get([
                'erp_farmer_quotas.id',
                'erp_farmer_quotas.farmer_id',
                'erp_farmer_quotas.cycle_id',
                'erp_farmer_quotas.commodity_id',
                'erp_farmers.full_name as farmer_name',
                'erp_farmers.national_id',
                'erp_commodities.name as commodity_name',
                'erp_subsidy_cycles.name as cycle_name',
                'erp_farmer_quotas.allocated_qty',
                'erp_farmer_quotas.disbursed_qty',
            ]),

        'farmers' => DB::table('erp_farmers')
            ->where('status', 'verified')
            ->orderBy('full_name')
            ->get([
                'id',
                'full_name',
                'national_id',
            ]),

        'commodities' => DB::table('erp_commodities')
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]),

        'cycles' => DB::table('erp_subsidy_cycles')
            ->orderByDesc('id')
            ->get([
                'id',
                'name',
                'status',
            ]),
    ]);
})->middleware('role:subsidy,subsidy_staff')->name('subsidy-allocations');


Route::post('subsidy-allocations', function (Request $request) {
    $validated = $request->validate([
        'farmer_id' => ['required', 'integer', 'exists:erp_farmers,id'],
        'commodity_id' => ['required', 'integer', 'exists:erp_commodities,id'],
        'cycle_id' => ['required', 'integer', 'exists:erp_subsidy_cycles,id'],
        'allocated_qty' => ['required', 'numeric', 'min:0.01'],
    ]);

    $farmer = DB::table('erp_farmers')
        ->where('id', $validated['farmer_id'])
        ->where('status', 'verified')
        ->first();

    if (!$farmer) {
        return back()->withErrors([
            'farmer_id' => 'Only verified farmers can receive subsidy allocations.',
        ]);
    }

    $cycle = DB::table('erp_subsidy_cycles')
        ->where('id', $validated['cycle_id'])
        ->where('status', 'active')
        ->first();

    if (!$cycle) {
        return back()->withErrors([
            'cycle_id' => 'Please select an active subsidy cycle.',
        ]);
    }

    $alreadyExists = DB::table('erp_farmer_quotas')
        ->where('farmer_id', $validated['farmer_id'])
        ->where('commodity_id', $validated['commodity_id'])
        ->where('cycle_id', $validated['cycle_id'])
        ->exists();

    if ($alreadyExists) {
        return back()->withErrors([
            'farmer_id' => 'This farmer already has an allocation for this commodity and subsidy cycle.',
        ]);
    }

    DB::table('erp_farmer_quotas')->insert([
        'farmer_id' => $validated['farmer_id'],
        'commodity_id' => $validated['commodity_id'],
        'cycle_id' => $validated['cycle_id'],
        'allocated_qty' => $validated['allocated_qty'],
        'disbursed_qty' => 0,
    ]);

    return redirect()
        ->route('subsidy-allocations')
        ->with('success', 'Subsidy allocation created successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('subsidy-allocations.store');


Route::put('subsidy-allocations/{id}', function (Request $request, int $id) {
    $validated = $request->validate([
        'farmer_id' => ['required', 'integer', 'exists:erp_farmers,id'],
        'commodity_id' => ['required', 'integer', 'exists:erp_commodities,id'],
        'cycle_id' => ['required', 'integer', 'exists:erp_subsidy_cycles,id'],
        'allocated_qty' => ['required', 'numeric', 'min:0.01'],
    ]);

    $allocation = DB::table('erp_farmer_quotas')
        ->where('id', $id)
        ->first();

    abort_if(!$allocation, 404, 'Allocation not found.');

    /*
     * Prevent duplicate farmer + commodity + cycle combinations.
     */
    $duplicateExists = DB::table('erp_farmer_quotas')
        ->where('farmer_id', $validated['farmer_id'])
        ->where('commodity_id', $validated['commodity_id'])
        ->where('cycle_id', $validated['cycle_id'])
        ->where('id', '!=', $id)
        ->exists();

    if ($duplicateExists) {
        return back()->withErrors([
            'farmer_id' =>
                'This farmer already has an allocation for the selected commodity and subsidy cycle.',
        ]);
    }

    /*
     * Do not allow the allocated quantity to become
     * lower than what has already been disbursed.
     */
    if (
        (float) $validated['allocated_qty'] <
        (float) $allocation->disbursed_qty
    ) {
        return back()->withErrors([
            'allocated_qty' =>
                'Allocated quantity cannot be lower than the amount already disbursed.',
        ]);
    }

    DB::table('erp_farmer_quotas')
        ->where('id', $id)
        ->update([
            'farmer_id' => $validated['farmer_id'],
            'commodity_id' => $validated['commodity_id'],
            'cycle_id' => $validated['cycle_id'],
            'allocated_qty' => $validated['allocated_qty'],
        ]);

    return redirect()
        ->route('subsidy-allocations')
        ->with('success', 'Subsidy allocation updated successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('subsidy-allocations.update');


Route::delete('subsidy-allocations/{id}', function (int $id) {
    $allocation = DB::table('erp_farmer_quotas')
        ->where('id', $id)
        ->first();

    abort_if(!$allocation, 404, 'Allocation not found.');

    if ((float) $allocation->disbursed_qty > 0) {
        return redirect()
            ->route('subsidy-allocations')
            ->withErrors([
                'allocation' => 'This allocation cannot be deleted because fertilizer has already been disbursed.',
            ]);
    }

    DB::table('erp_farmer_quotas')
        ->where('id', $id)
        ->delete();

    return redirect()
        ->route('subsidy-allocations')
        ->with('success', 'Subsidy allocation deleted successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('subsidy-allocations.destroy');


//disbursement records
Route::get('disbursement-records', function () {
    return Inertia::render('disbursement-records', [
        'allocations' => DB::table('erp_farmer_quotas')
            ->join(
                'erp_farmers',
                'erp_farmers.id',
                '=',
                'erp_farmer_quotas.farmer_id'
            )
            ->join(
                'erp_commodities',
                'erp_commodities.id',
                '=',
                'erp_farmer_quotas.commodity_id'
            )
            ->join(
                'erp_subsidy_cycles',
                'erp_subsidy_cycles.id',
                '=',
                'erp_farmer_quotas.cycle_id'
            )
            ->orderByDesc('erp_farmer_quotas.id')
            ->get([
                'erp_farmer_quotas.id',
                'erp_farmer_quotas.farmer_id',
                'erp_farmer_quotas.cycle_id',
                'erp_farmer_quotas.commodity_id',
                'erp_farmers.full_name as farmer_name',
                'erp_farmers.national_id',
                'erp_commodities.name as commodity_name',
                'erp_commodities.unit as commodity_unit',
                'erp_subsidy_cycles.name as cycle_name',
                'erp_farmer_quotas.allocated_qty',
                'erp_farmer_quotas.disbursed_qty',
            ]),
    ]);
})->middleware('role:subsidy,subsidy_staff')->name('disbursement-records');

Route::post(
    '/disbursement-records/{id}/record',
    [DisbursementController::class, 'record']
)->middleware('role:subsidy,subsidy_staff')
 ->name('disbursement-records.record');

Route::get(
    '/disbursement-records/{id}/history',
    [DisbursementController::class, 'history']
)->middleware('role:subsidy,subsidy_staff')
 ->name('disbursement-records.history');


    Route::post('farmer-registry', function (Request $request) {
    $validated = $request->validate([
        'national_id' => ['required', 'string', 'max:255', 'unique:erp_farmers,national_id'],
        'full_name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'string', 'max:50'],
        'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
    ]);

    DB::table('erp_farmers')->insert([
        'national_id' => $validated['national_id'],
        'full_name' => $validated['full_name'],
        'phone' => $validated['phone'] ?? null,
        'zone_id' => $validated['zone_id'] ?? null,
        'status' => 'pending_verification',
        'biometric_verified' => false,
        'registered_by' => $request->user()->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return redirect()
        ->route('farmer-registry')
        ->with('success', 'Farmer registered successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('farmer-registry.store');


Route::get('inventory-warehouses', function () {
        return Inertia::render('inventory-warehouses');
    })->middleware('role:executive,admin,operations_director,inventory,inventory_staff,subsidy,subsidy_staff,field_operations,field_operations_staff,sales,sales_staff')->name('inventory-warehouses');

    Route::get('finance-impact', function () {
        return Inertia::render('finance-impact');
    })->middleware('role:executive,admin,operations_director,finance,finance_staff')->name('finance-impact');

    Route::get('sales-commodities', function () {
        return Inertia::render('sales-commodities');
    })->middleware('role:executive,admin,operations_director,sales,sales_staff')->name('sales-commodities');

    Route::put('farmer-registry/{id}', function (Request $request, int $id) {
    $validated = $request->validate([
        'national_id' => [
            'required',
            'string',
            'max:255',
            'unique:erp_farmers,national_id,' . $id,
        ],
        'full_name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'string', 'max:50'],
        'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
    ]);

    $updated = DB::table('erp_farmers')
        ->where('id', $id)
        ->update([
            'national_id' => $validated['national_id'],
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'] ?? null,
            'zone_id' => $validated['zone_id'] ?? null,
            'updated_at' => now(),
        ]);

    abort_if($updated === 0, 404, 'Farmer not found.');

    return redirect()
        ->route('farmer-registry')
        ->with('success', 'Farmer information updated successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('farmer-registry.update');

Route::patch('farmer-registry/{id}/verify', function (int $id) {
    $updated = DB::table('erp_farmers')
        ->where('id', $id)
        ->update([
            'status' => 'verified',
            'biometric_verified' => true,
            'updated_at' => now(),
        ]);

    abort_if($updated === 0, 404, 'Farmer not found.');

    return redirect()
        ->route('farmer-registry')
        ->with('success', 'Farmer verified successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('farmer-registry.verify');

Route::delete('farmer-registry/{id}', function (int $id) {
    $farmerExists = DB::table('erp_farmers')
        ->where('id', $id)
        ->exists();

    abort_unless($farmerExists, 404, 'Farmer not found.');

    $hasQuotaRecords = DB::table('erp_farmer_quotas')
        ->where('farmer_id', $id)
        ->exists();

    if ($hasQuotaRecords) {
        return redirect()
            ->route('farmer-registry')
            ->withErrors([
                'farmer' => 'This farmer cannot be deleted because quota records already exist.',
            ]);
    }

    DB::table('erp_farmers')
        ->where('id', $id)
        ->delete();

    return redirect()
        ->route('farmer-registry')
        ->with('success', 'Farmer deleted successfully.');
})->middleware('role:subsidy,subsidy_staff')->name('farmer-registry.destroy');


    Route::get('hr-workforce', function () {
        return Inertia::render('hr-workforce', [
            'workforceMetrics' => [
                'activeWorkforce' => DB::table('erp_employees')->where('is_active', true)->count(),
                'workforceReadiness' => DB::table('erp_employees')->count(),
                'fieldDispatch' => DB::table('erp_employees')->whereNotNull('zone_id')->count(),
                'complianceRecords' => DB::table('erp_audit_events')->where('module', 'hr')->count(),
            ],
            'employees' => DB::table('erp_employees')
                ->join('users', 'users.id', '=', 'erp_employees.user_id')
                ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_employees.zone_id')
                ->leftJoin('erp_depots', 'erp_depots.id', '=', 'erp_employees.depot_id')
                ->orderBy('users.name')
                ->get([
                    'erp_employees.employee_code',
                    'erp_employees.department',
                    'erp_employees.position',
                    'erp_employees.is_active',
                    'users.name',
                    'users.email',
                    'erp_zones.name as zone_name',
                    'erp_depots.name as depot_name',
                ]),
        ]);
    })->middleware('role:executive,admin,operations_director,hr,hr_employee')->name('hr-workforce');

    Route::get('system-admin', function () {
        return Inertia::render('system-admin');
    })->middleware('role:executive,admin,operations_director')->name('system-admin');

    Route::get('system-settings', function () {
        return Inertia::render('system-settings');
    })->middleware('role:executive,admin,operations_director')->name('system-settings');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
