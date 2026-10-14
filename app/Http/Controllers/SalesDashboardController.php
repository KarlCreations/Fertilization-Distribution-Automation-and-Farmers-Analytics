<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Sale;
use App\Services\SalesInventoryService;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesDashboardController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        Gate::authorize('viewAny', Sale::class);

        $filters = $this->validatedFilters($request);
        $salesQuery = $this->filteredSalesQuery($request, $filters);
        $summary = (clone $salesQuery)
            ->selectRaw('COALESCE(SUM(erp_sales.total), 0) as total_sales')
            ->selectRaw('COALESCE(SUM(erp_sales.quantity), 0) as total_volume')
            ->selectRaw('COUNT(erp_sales.id) as transactions')
            ->selectRaw('COALESCE(SUM(erp_sales.total - erp_sales.amount_paid), 0) as outstanding_payments')
            ->first();

        $sortColumns = [
            'sale_date' => 'erp_sales.sale_date',
            'farmer' => 'erp_farmers.full_name',
            'fertilizer' => 'erp_commodities.name',
            'quantity' => 'erp_sales.quantity',
            'total' => 'erp_sales.total',
            'payment_status' => 'erp_sales.payment_status',
            'area' => 'erp_zones.name',
        ];
        $sortColumn = $sortColumns[$filters['sort']] ?? $sortColumns['sale_date'];

        $sales = $salesQuery
            ->select([
                'erp_sales.id',
                'erp_sales.sale_date',
                'erp_sales.farmer_id',
                'erp_sales.commodity_id',
                'erp_sales.depot_id',
                'erp_sales.zone_id',
                'erp_sales.distributor',
                'erp_sales.quantity',
                'erp_sales.unit_price',
                'erp_sales.total',
                'erp_sales.amount_paid',
                'erp_sales.payment_status',
                'erp_sales.created_by',
                'erp_farmers.full_name as farmer_name',
                'erp_farmers.national_id as farmer_reference',
                'erp_commodities.name as commodity_name',
                'erp_commodities.grade as commodity_grade',
                'erp_commodities.unit as commodity_unit',
                'erp_depots.name as depot_name',
                'erp_zones.name as zone_name',
            ])
            ->orderBy($sortColumn, $filters['direction'])
            ->orderByDesc('erp_sales.id')
            ->paginate($filters['per_page'])
            ->withQueryString()
            ->through(function (object $sale) use ($request): array {
                return [
                    ...((array) $sale),
                    'outstanding_amount' => round((float) $sale->total - (float) $sale->amount_paid, 2),
                    'can_edit' => $request->user()->hasSalesAdministrationAccess() || (int) $sale->created_by === $request->user()->id,
                ];
            });

        return Inertia::render('sales-dashboard', [
            'sales' => $sales,
            'filters' => $filters,
            'metrics' => [
                'totalSales' => (float) $summary->total_sales,
                'totalVolume' => (float) $summary->total_volume,
                'transactions' => (int) $summary->transactions,
                'outstandingPayments' => (float) $summary->outstanding_payments,
            ],
            'charts' => $this->chartData($request, $filters),
            'options' => [
                'farmers' => DB::table('erp_farmers')->orderBy('full_name')->get(['id', 'full_name', 'national_id', 'zone_id']),
                'commodities' => DB::table('erp_commodities')->orderBy('name')->get(['id', 'name', 'grade', 'unit']),
                'depots' => DB::table('erp_depots')->orderBy('name')->get(['id', 'name', 'code', 'zone_id']),
                'zones' => DB::table('erp_zones')->orderBy('zone_no')->get(['id', 'name', 'zone_no']),
                'stockAvailability' => DB::table('erp_stock_levels')
                    ->selectRaw('commodity_id, depot_id, SUM(on_hand_qty) as available_quantity')
                    ->groupBy('commodity_id', 'depot_id')
                    ->get(),
            ],
            'permissions' => [
                'canManageAll' => $request->user()->hasSalesAdministrationAccess(),
            ],
            'lastUpdated' => now()->toIso8601String(),
        ]);
    }

    public function store(StoreSaleRequest $request, SalesInventoryService $salesInventory): RedirectResponse
    {
        $sale = $salesInventory->create($request->validated(), $request->user());

        return back()->with('success', "Sale #{$sale->id} was recorded and inventory was updated.");
    }

    public function update(UpdateSaleRequest $request, Sale $sale, SalesInventoryService $salesInventory): RedirectResponse
    {
        $salesInventory->update($sale, $request->validated(), $request->user());

        return back()->with('success', "Sale #{$sale->id} was updated and inventory was reconciled.");
    }

    public function destroy(Request $request, Sale $sale, SalesInventoryService $salesInventory): RedirectResponse
    {
        Gate::authorize('delete', $sale);
        $salesInventory->delete($sale, $request->user());

        return back()
            ->with('success', "Sale #{$sale->id} was deleted. You can undo this while the confirmation is visible.")
            ->with('undoSaleId', $sale->id);
    }

    public function restore(Request $request, int $sale, SalesInventoryService $salesInventory): RedirectResponse
    {
        $deletedSale = Sale::onlyTrashed()->findOrFail($sale);
        Gate::authorize('restore', $deletedSale);
        $salesInventory->restore($deletedSale, $request->user());

        return back()->with('success', "Sale #{$deletedSale->id} was restored and inventory was updated.");
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        Gate::authorize('export', Sale::class);

        $filters = $this->validatedFilters($request);
        $sales = $this->filteredSalesQuery($request, $filters)
            ->select([
                'erp_sales.id',
                'erp_sales.sale_date',
                'erp_farmers.full_name as farmer_name',
                'erp_commodities.name as commodity_name',
                'erp_commodities.unit as commodity_unit',
                'erp_sales.quantity',
                'erp_sales.unit_price',
                'erp_sales.total',
                'erp_sales.amount_paid',
                'erp_sales.payment_status',
                'erp_sales.distributor',
                'erp_zones.name as area_name',
                'erp_depots.name as depot_name',
            ])
            ->orderByDesc('erp_sales.sale_date')
            ->orderByDesc('erp_sales.id')
            ->cursor();

        return response()->streamDownload(function () use ($sales): void {
            $output = fopen('php://output', 'w');

            fputcsv($output, ['Sale #', 'Date', 'Farmer', 'Fertilizer', 'Unit', 'Quantity', 'Unit price', 'Total', 'Amount received', 'Outstanding', 'Payment status', 'Distributor', 'Area', 'Depot']);

            foreach ($sales as $sale) {
                fputcsv($output, [
                    $sale->id,
                    $sale->sale_date,
                    $sale->farmer_name,
                    $sale->commodity_name,
                    $sale->commodity_unit,
                    $sale->quantity,
                    $sale->unit_price,
                    $sale->total,
                    $sale->amount_paid,
                    (float) $sale->total - (float) $sale->amount_paid,
                    $sale->payment_status,
                    $sale->distributor,
                    $sale->area_name,
                    $sale->depot_name,
                ]);
            }

            fclose($output);
        }, 'sales-export-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{search: string, start_date: string|null, end_date: string|null, commodity_id: int|null, farmer_id: int|null, payment_status: string|null, zone_id: int|null, sort: string, direction: string, per_page: int}
     */
    private function validatedFilters(Request $request): array
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'commodity_id' => ['nullable', 'integer', 'exists:erp_commodities,id'],
            'farmer_id' => ['nullable', 'integer', 'exists:erp_farmers,id'],
            'payment_status' => ['nullable', 'in:paid,partial,unpaid'],
            'zone_id' => ['nullable', 'integer', 'exists:erp_zones,id'],
            'sort' => ['nullable', 'in:sale_date,farmer,fertilizer,quantity,total,payment_status,area'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'in:10,25,50'],
        ]);

        return [
            'search' => trim((string) ($validated['search'] ?? '')),
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'commodity_id' => isset($validated['commodity_id']) ? (int) $validated['commodity_id'] : null,
            'farmer_id' => isset($validated['farmer_id']) ? (int) $validated['farmer_id'] : null,
            'payment_status' => $validated['payment_status'] ?? null,
            'zone_id' => isset($validated['zone_id']) ? (int) $validated['zone_id'] : null,
            'sort' => $validated['sort'] ?? 'sale_date',
            'direction' => $validated['direction'] ?? 'desc',
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function filteredSalesQuery(Request $request, array $filters): Builder
    {
        $query = DB::table('erp_sales')
            ->join('erp_farmers', 'erp_farmers.id', '=', 'erp_sales.farmer_id')
            ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_sales.commodity_id')
            ->join('erp_depots', 'erp_depots.id', '=', 'erp_sales.depot_id')
            ->join('erp_zones', 'erp_zones.id', '=', 'erp_sales.zone_id')
            ->whereNull('erp_sales.deleted_at');

        if (! $request->user()->hasSalesAdministrationAccess()) {
            $query->where('erp_sales.created_by', $request->user()->id);
        }

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($search): void {
                $query
                    ->where('erp_farmers.full_name', 'like', $search)
                    ->orWhere('erp_farmers.national_id', 'like', $search)
                    ->orWhere('erp_commodities.name', 'like', $search)
                    ->orWhere('erp_sales.distributor', 'like', $search)
                    ->orWhere('erp_zones.name', 'like', $search);
            });
        }

        foreach (['commodity_id', 'farmer_id', 'payment_status', 'zone_id'] as $filter) {
            if ($filters[$filter] !== null) {
                $column = match ($filter) {
                    'commodity_id' => 'erp_sales.commodity_id',
                    'farmer_id' => 'erp_sales.farmer_id',
                    'payment_status' => 'erp_sales.payment_status',
                    'zone_id' => 'erp_sales.zone_id',
                };

                $query->where($column, $filters[$filter]);
            }
        }

        if ($filters['start_date'] !== null) {
            $query->whereDate('erp_sales.sale_date', '>=', $filters['start_date']);
        }

        if ($filters['end_date'] !== null) {
            $query->whereDate('erp_sales.sale_date', '<=', $filters['end_date']);
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    private function chartData(Request $request, array $filters): array
    {
        $timeQuery = $this->filteredSalesQuery($request, $filters);

        if ($filters['start_date'] === null && $filters['end_date'] === null) {
            $timeQuery->whereDate('erp_sales.sale_date', '>=', now()->subDays(29)->toDateString());
        }

        return [
            'salesOverTime' => $timeQuery
                ->selectRaw('erp_sales.sale_date as label, COALESCE(SUM(erp_sales.total), 0) as value')
                ->groupBy('erp_sales.sale_date')
                ->orderBy('erp_sales.sale_date')
                ->limit(31)
                ->get(),
            'byFertilizer' => $this->filteredSalesQuery($request, $filters)
                ->selectRaw('erp_commodities.name as label, COALESCE(SUM(erp_sales.total), 0) as value')
                ->groupBy('erp_commodities.id', 'erp_commodities.name')
                ->orderByDesc('value')
                ->limit(6)
                ->get(),
            'topFarmers' => $this->filteredSalesQuery($request, $filters)
                ->selectRaw('erp_farmers.full_name as label, COALESCE(SUM(erp_sales.total), 0) as value')
                ->groupBy('erp_farmers.id', 'erp_farmers.full_name')
                ->orderByDesc('value')
                ->limit(5)
                ->get(),
            'byArea' => $this->filteredSalesQuery($request, $filters)
                ->selectRaw('erp_zones.name as label, COALESCE(SUM(erp_sales.total), 0) as value')
                ->groupBy('erp_zones.id', 'erp_zones.name')
                ->orderByDesc('value')
                ->limit(6)
                ->get(),
        ];
    }
}
