<?php

use App\Http\Controllers\CommodityController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FarmerController;
use App\Http\Controllers\FarmerQuotaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StockLevelController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SystemAccessController;
use App\Http\Controllers\TradeContractController;
use App\Services\PowerBiService;
use App\Services\WorkspaceDashboardData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::post('notifications/{event}/read', [NotificationController::class, 'markRead'])
        ->whereNumber('event')
        ->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])
        ->name('notifications.read-all');

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
            'inventorySummary' => DB::table('erp_stock_levels')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                ->groupBy('erp_commodities.id', 'erp_commodities.name')
                ->selectRaw('erp_commodities.name as name, SUM(erp_stock_levels.on_hand_qty) as on_hand_qty, SUM(erp_stock_levels.capacity_qty) as capacity_qty, MIN(erp_stock_levels.runway_days) as runway_days')
                ->orderByDesc('on_hand_qty')
                ->limit(3)
                ->get(),
            'zoneFulfillment' => DB::table('erp_farmer_quotas')
                ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_farmer_quotas.farmer_id')
                ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                ->groupBy('erp_zones.id', 'erp_zones.name')
                ->selectRaw("COALESCE(erp_zones.name, 'Unassigned') as zone_name, SUM(erp_farmer_quotas.allocated_qty) as allocated_qty, SUM(erp_farmer_quotas.disbursed_qty) as disbursed_qty")
                ->orderByDesc('allocated_qty')
                ->limit(6)
                ->get(),
        ]);
    })->middleware('role:executive,admin,operations_director')->name('dashboard');

    Route::get('farmer-management-dashboard', function (WorkspaceDashboardData $dashboardData) {
        return Inertia::render('role-dashboard', ['role' => 'subsidy', ...$dashboardData->forRole('subsidy')]);
    })->middleware('role:subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-management-dashboard');

    Route::get('employee-settings', function () {
        return Inertia::render('employee-settings');
    })->middleware('role:inventory,inventory_staff,sales,sales_staff,finance,finance_staff,hr,hr_employee,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('employee-settings');

    Route::get('inventory-dashboard', function (WorkspaceDashboardData $dashboardData) {
        return Inertia::render('role-dashboard', ['role' => 'inventory', ...$dashboardData->forRole('inventory')]);
    })->middleware('role:inventory,inventory_staff')->name('inventory-dashboard');

    Route::get('sales-dashboard', function (WorkspaceDashboardData $dashboardData) {
        return Inertia::render('role-dashboard', ['role' => 'sales', ...$dashboardData->forRole('sales')]);
    })->middleware('role:sales,sales_staff')->name('sales-dashboard');

    Route::get('finance-dashboard', function (WorkspaceDashboardData $dashboardData) {
        return Inertia::render('role-dashboard', ['role' => 'finance', ...$dashboardData->forRole('finance')]);
    })->middleware('role:finance,finance_staff')->name('finance-dashboard');

    Route::get('hr-dashboard', function (WorkspaceDashboardData $dashboardData) {
        return Inertia::render('role-dashboard', ['role' => 'hr', ...$dashboardData->forRole('hr')]);
    })->middleware('role:hr,hr_employee')->name('hr-dashboard');

    Route::get('farmer-registry', function () {
        return Inertia::render('farmer-registry', [
            'farmers' => DB::table('erp_farmers')
                ->leftJoin('erp_zones', 'erp_zones.id', '=', 'erp_farmers.zone_id')
                ->orderBy('erp_farmers.full_name')
                ->get([
                    'erp_farmers.id',
                    'erp_farmers.national_id',
                    'erp_farmers.full_name',
                    'erp_farmers.phone',
                    'erp_farmers.zone_id',
                    'erp_farmers.status',
                    'erp_farmers.biometric_verified',
                    'erp_zones.name as zone_name',
                ]),
            'zones' => DB::table('erp_zones')->orderBy('zone_no')->get(['id', 'name']),
            'quotaFarmers' => DB::table('erp_farmers')->orderBy('full_name')->get(['id', 'full_name', 'national_id']),
            'quotaCommodities' => DB::table('erp_commodities')->orderBy('name')->get(['id', 'name', 'grade']),
            'subsidyCycles' => DB::table('erp_subsidy_cycles')->orderByDesc('id')->get(['id', 'name']),
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
        ]);
    })->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-registry');

    Route::get('inventory-warehouses', function () {
        return Inertia::render('inventory-warehouses', [
            'inventoryMetrics' => [
                'stockOnHand' => DB::table('erp_stock_levels')->sum('on_hand_qty'),
                'reorderAlerts' => DB::table('erp_stock_levels')->where('status', 'reorder_due')->count(),
                'batchCount' => DB::table('erp_stock_batches')->count(),
                'depotCount' => DB::table('erp_depots')->count(),
                'transferCount' => DB::table('erp_audit_events')->where('module', 'inventory')->where('action', 'transferred')->count(),
                'reconciliationCount' => DB::table('erp_audit_events')->where('module', 'inventory')->where('action', 'reconciled')->count(),
            ],
            'stockRecords' => DB::table('erp_stock_levels')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                ->join('erp_depots', 'erp_depots.id', '=', 'erp_stock_levels.depot_id')
                ->join('erp_stock_batches', 'erp_stock_batches.id', '=', 'erp_stock_levels.batch_id')
                ->orderByDesc('erp_stock_levels.id')
                ->get([
                    'erp_stock_levels.id',
                    'erp_stock_levels.depot_id',
                    'erp_stock_levels.batch_id',
                    'erp_stock_levels.commodity_id',
                    'erp_commodities.sku',
                    'erp_commodities.name as commodity_name',
                    'erp_depots.name as depot_name',
                    'erp_stock_batches.lot_no',
                    'erp_stock_levels.on_hand_qty',
                    'erp_stock_levels.capacity_qty',
                    'erp_stock_levels.reorder_point',
                    'erp_stock_levels.runway_days',
                    'erp_stock_levels.status',
                ]),
            'depots' => DB::table('erp_depots')->orderBy('name')->get(['id', 'name', 'capacity_mt']),
            'depotUtilization' => DB::table('erp_depots')
                ->leftJoin('erp_stock_levels', 'erp_stock_levels.depot_id', '=', 'erp_depots.id')
                ->groupBy('erp_depots.id', 'erp_depots.name', 'erp_depots.capacity_mt')
                ->orderBy('erp_depots.name')
                ->selectRaw('erp_depots.id, erp_depots.name, erp_depots.capacity_mt, COALESCE(SUM(erp_stock_levels.on_hand_qty), 0) as on_hand_qty')
                ->get()
                ->map(fn (object $depot): array => [
                    'id' => (int) $depot->id,
                    'name' => $depot->name,
                    'capacity_mt' => $depot->capacity_mt === null ? null : (float) $depot->capacity_mt,
                    'on_hand_qty' => (float) $depot->on_hand_qty,
                ])
                ->all(),
            'recentInventoryEvents' => DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->where('erp_audit_events.module', 'inventory')
                ->whereIn('erp_audit_events.action', ['transferred', 'reconciled'])
                ->latest('erp_audit_events.id')
                ->limit(8)
                ->get([
                    'erp_audit_events.id',
                    'erp_audit_events.action',
                    'erp_audit_events.target_id',
                    'erp_audit_events.payload',
                    'erp_audit_events.created_at',
                    'users.name as user_name',
                ])
                ->map(fn (object $event): array => [
                    'id' => (int) $event->id,
                    'action' => $event->action,
                    'target_id' => $event->target_id,
                    'payload' => json_decode((string) $event->payload, true) ?: [],
                    'created_at' => (string) $event->created_at,
                    'user_name' => $event->user_name ?? 'System',
                ])
                ->all(),
            'latestReconciliation' => DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->where('erp_audit_events.module', 'inventory')
                ->where('erp_audit_events.action', 'reconciled')
                ->latest('erp_audit_events.id')
                ->first([
                    'erp_audit_events.created_at',
                    'erp_audit_events.target_id',
                    'users.name as user_name',
                ]),
            'commodities' => DB::table('erp_commodities')->orderBy('name')->get(['id', 'name', 'sku']),
            'batches' => DB::table('erp_stock_batches')->orderByDesc('id')->get(['id', 'lot_no', 'commodity_id']),
        ]);
    })->middleware('role:executive,admin,operations_director,inventory,inventory_staff,subsidy,subsidy_staff,field_operations,field_operations_staff,sales,sales_staff')->name('inventory-warehouses');

    Route::get('finance-impact', function () {
        return Inertia::render('finance-impact', [
            'financeMetrics' => [
                'tradeValue' => DB::table('erp_trade_contracts')->selectRaw('COALESCE(SUM(volume_mt * price_per_mt), 0) AS total')->value('total'),
                'tradeVolume' => DB::table('erp_trade_contracts')->sum('volume_mt'),
                'quotaAllocated' => DB::table('erp_farmer_quotas')->sum('allocated_qty'),
                'quotaDisbursed' => DB::table('erp_farmer_quotas')->sum('disbursed_qty'),
            ],
            'financeRecords' => DB::table('erp_trade_contracts')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                ->orderByDesc('erp_trade_contracts.id')
                ->limit(20)
                ->get([
                    'erp_trade_contracts.contract_ref',
                    'erp_trade_contracts.counterparty',
                    'erp_trade_contracts.status',
                    'erp_trade_contracts.contract_type',
                    'erp_trade_contracts.volume_mt',
                    'erp_trade_contracts.price_per_mt',
                    'erp_commodities.name as commodity_name',
                ]),
        ]);
    })->middleware('role:executive,admin,operations_director,finance,finance_staff')->name('finance-impact');

    Route::get('sales-commodities', function () {
        return Inertia::render('sales-commodities', [
            'salesMetrics' => [
                'tradeVolume' => DB::table('erp_trade_contracts')->sum('volume_mt'),
                'activeContracts' => DB::table('erp_trade_contracts')->where('status', 'active')->count(),
                'exportContracts' => DB::table('erp_trade_contracts')->where('contract_type', 'export')->count(),
                'tradeValue' => DB::table('erp_trade_contracts')->selectRaw('COALESCE(SUM(volume_mt * price_per_mt), 0) AS total')->value('total'),
            ],
            'contracts' => DB::table('erp_trade_contracts')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_trade_contracts.commodity_id')
                ->orderByDesc('erp_trade_contracts.id')
                ->get([
                    'erp_trade_contracts.id',
                    'erp_trade_contracts.contract_ref',
                    'erp_trade_contracts.counterparty',
                    'erp_trade_contracts.status',
                    'erp_trade_contracts.contract_type',
                    'erp_trade_contracts.volume_mt',
                    'erp_trade_contracts.price_per_mt',
                    'erp_commodities.name as commodity_name',
                    'erp_commodities.grade',
                ]),
            'commodities' => DB::table('erp_commodities')->orderBy('name')->get(['id', 'name', 'grade']),
            'commodityRecords' => DB::table('erp_commodities')->orderBy('name')->get([
                'id',
                'sku',
                'name',
                'category',
                'grade',
                'unit',
                'is_hazardous',
            ]),
        ]);
    })->middleware('role:executive,admin,operations_director,sales,sales_staff')->name('sales-commodities');

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
                    'erp_employees.id',
                    'erp_employees.user_id',
                    'erp_employees.department',
                    'erp_employees.position',
                    'erp_employees.is_active',
                    'erp_employees.zone_id',
                    'erp_employees.depot_id',
                    'users.name',
                    'users.email',
                    'erp_zones.name as zone_name',
                    'erp_depots.name as depot_name',
                ]),
            'availableUsers' => DB::table('users')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'zones' => DB::table('erp_zones')->orderBy('zone_no')->get(['id', 'name']),
            'depots' => DB::table('erp_depots')->orderBy('name')->get(['id', 'name']),
        ]);
    })->middleware('role:executive,admin,operations_director,hr,hr_employee')->name('hr-workforce');

    Route::get('system-admin', function () {
        return Inertia::render('system-admin', [
            'systemMetrics' => [
                'userCount' => DB::table('users')->count(),
                'roleCount' => DB::table('erp_roles')->count(),
                'auditCount' => DB::table('erp_audit_events')->count(),
                'activeEmployeeCount' => DB::table('erp_employees')->where('is_active', true)->count(),
            ],
            'systemUsers' => DB::table('users')
                ->leftJoin('erp_employees', 'erp_employees.user_id', '=', 'users.id')
                ->orderBy('users.name')
                ->get(['users.id', 'users.name', 'users.email', 'users.role', 'erp_employees.is_active']),
            'systemRoles' => DB::table('erp_roles')->orderBy('name')->get(['id', 'code', 'name', 'description']),
            'auditEvents' => DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->orderByDesc('erp_audit_events.id')
                ->limit(20)
                ->get(['erp_audit_events.id', 'erp_audit_events.action', 'erp_audit_events.module', 'erp_audit_events.created_at', 'users.name as user_name']),
        ]);
    })->middleware('role:executive,admin,operations_director')->name('system-admin');

    Route::get('system-settings', function () {
        $database = DB::connection()->getDatabaseName();

        return Inertia::render('system-settings', [
            'databaseStatus' => [
                'driver' => DB::connection()->getDriverName(),
                'database' => $database,
                'connected' => DB::connection()->getPdo() !== null,
                'appName' => config('app.name'),
                'locale' => config('app.locale'),
                'timezone' => config('app.timezone'),
                'farmers' => DB::table('erp_farmers')->count(),
                'stockRecords' => DB::table('erp_stock_levels')->count(),
                'contracts' => DB::table('erp_trade_contracts')->count(),
                'employees' => DB::table('erp_employees')->count(),
            ],
            'auditEvents' => DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->orderByDesc('erp_audit_events.id')
                ->limit(20)
                ->get(['erp_audit_events.id', 'erp_audit_events.action', 'erp_audit_events.module', 'erp_audit_events.created_at', 'users.name as user_name']),
        ]);
    })->middleware('role:executive,admin,operations_director')->name('system-settings');

    Route::get('system-settings/export', function () {
        $configuration = [
            'application' => config('app.name'),
            'database_driver' => DB::connection()->getDriverName(),
            'database' => DB::connection()->getDatabaseName(),
            'locale' => config('app.locale'),
            'timezone' => config('app.timezone'),
            'record_counts' => [
                'farmers' => DB::table('erp_farmers')->count(),
                'stock_levels' => DB::table('erp_stock_levels')->count(),
                'trade_contracts' => DB::table('erp_trade_contracts')->count(),
                'employees' => DB::table('erp_employees')->count(),
            ],
        ];

        return response()->streamDownload(
            fn () => print (json_encode($configuration, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)),
            'system-configuration.json',
            ['Content-Type' => 'application/json'],
        );
    })->middleware('role:executive,admin,operations_director')->name('system-settings.export');

    Route::get('system-admin/audit-export', function () {
        return response()->streamDownload(function (): void {
            $stream = fopen('php://output', 'w');

            if ($stream === false) {
                throw new RuntimeException('Unable to open the audit export stream.');
            }

            fputcsv($stream, ['id', 'user', 'action', 'module', 'target_type', 'target_id', 'payload', 'created_at'], escape: '');

            foreach (DB::table('erp_audit_events')
                ->leftJoin('users', 'users.id', '=', 'erp_audit_events.user_id')
                ->orderBy('erp_audit_events.id')
                ->select([
                    'erp_audit_events.id',
                    'users.name as user_name',
                    'erp_audit_events.action',
                    'erp_audit_events.module',
                    'erp_audit_events.target_type',
                    'erp_audit_events.target_id',
                    'erp_audit_events.payload',
                    'erp_audit_events.created_at',
                ])
                ->cursor() as $event) {
                fputcsv($stream, [
                    $event->id,
                    $event->user_name,
                    $event->action,
                    $event->module,
                    $event->target_type,
                    $event->target_id,
                    $event->payload,
                    $event->created_at,
                ], escape: '');
            }

            fclose($stream);
        }, 'security-audit.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    })->middleware('role:executive,admin,operations_director')->name('system-admin.audit-export');

    Route::post('farmers', [FarmerController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmers.store');
    Route::put('farmers/{farmer}', [FarmerController::class, 'update'])
        ->whereNumber('farmer')
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmers.update');
    Route::delete('farmers/{farmer}', [FarmerController::class, 'destroy'])
        ->whereNumber('farmer')
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmers.destroy');

    Route::post('farmer-quotas', [FarmerQuotaController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmer-quotas.store');
    Route::put('farmer-quotas/{farmerQuota}', [FarmerQuotaController::class, 'update'])
        ->whereNumber('farmerQuota')
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmer-quotas.update');
    Route::delete('farmer-quotas/{farmerQuota}', [FarmerQuotaController::class, 'destroy'])
        ->whereNumber('farmerQuota')
        ->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')
        ->name('farmer-quotas.destroy');

    Route::post('commodities', [CommodityController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,sales,sales_staff,inventory,inventory_staff')
        ->name('commodities.store');
    Route::put('commodities/{commodity}', [CommodityController::class, 'update'])
        ->whereNumber('commodity')
        ->middleware('role:executive,admin,operations_director,sales,sales_staff,inventory,inventory_staff')
        ->name('commodities.update');
    Route::delete('commodities/{commodity}', [CommodityController::class, 'destroy'])
        ->whereNumber('commodity')
        ->middleware('role:executive,admin,operations_director,sales,sales_staff,inventory,inventory_staff')
        ->name('commodities.destroy');

    Route::post('system/users', [SystemAccessController::class, 'storeUser'])
        ->middleware('role:executive,admin,operations_director')
        ->name('system-users.store');
    Route::put('system/users/{user}', [SystemAccessController::class, 'updateUser'])
        ->whereNumber('user')
        ->middleware('role:executive,admin,operations_director')
        ->name('system-users.update');
    Route::put('system/roles/{role}', [SystemAccessController::class, 'updateRole'])
        ->whereNumber('role')
        ->middleware('role:executive,admin,operations_director')
        ->name('system-roles.update');

    Route::post('stock-levels', [StockLevelController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,inventory,inventory_staff')
        ->name('stock-levels.store');
    Route::put('stock-levels/{stockLevel}', [StockLevelController::class, 'update'])
        ->whereNumber('stockLevel')
        ->middleware('role:executive,admin,operations_director,inventory,inventory_staff')
        ->name('stock-levels.update');
    Route::delete('stock-levels/{stockLevel}', [StockLevelController::class, 'destroy'])
        ->whereNumber('stockLevel')
        ->middleware('role:executive,admin,operations_director,inventory,inventory_staff')
        ->name('stock-levels.destroy');
    Route::post('stock-transfers', [StockMovementController::class, 'transfer'])
        ->middleware('role:executive,admin,operations_director,inventory,inventory_staff')
        ->name('stock-transfers.store');
    Route::post('stock-reconciliations', [StockMovementController::class, 'reconcile'])
        ->middleware('role:executive,admin,operations_director,inventory,inventory_staff')
        ->name('stock-reconciliations.store');

    Route::post('trade-contracts', [TradeContractController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,sales,sales_staff')
        ->name('trade-contracts.store');
    Route::put('trade-contracts/{tradeContract}', [TradeContractController::class, 'update'])
        ->whereNumber('tradeContract')
        ->middleware('role:executive,admin,operations_director,sales,sales_staff')
        ->name('trade-contracts.update');
    Route::delete('trade-contracts/{tradeContract}', [TradeContractController::class, 'destroy'])
        ->whereNumber('tradeContract')
        ->middleware('role:executive,admin,operations_director,sales,sales_staff')
        ->name('trade-contracts.destroy');

    Route::post('employees', [EmployeeController::class, 'store'])
        ->middleware('role:executive,admin,operations_director,hr')
        ->name('employees.store');
    Route::put('employees/{employee}', [EmployeeController::class, 'update'])
        ->whereNumber('employee')
        ->middleware('role:executive,admin,operations_director,hr')
        ->name('employees.update');
    Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])
        ->whereNumber('employee')
        ->middleware('role:executive,admin,operations_director,hr')
        ->name('employees.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
