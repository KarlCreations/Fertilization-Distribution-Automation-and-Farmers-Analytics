co<?php

use App\Models\SampleSale;
use App\Services\SampleSalesImportService;

test('sample sales import service imports csv records into sample_sales table', function () {
    $service = app(SampleSalesImportService::class);
    $csvPath = database_path('data/sales_data_sample.csv');

    $importedCount = $service->import($csvPath);

    expect($importedCount)->toBe(2823)
        ->and(SampleSale::count())->toBe(2823);

    $sale = SampleSale::where('order_number', 10107)
        ->where('order_line_number', 2)
        ->first();

    expect($sale)->not->toBeNull()
        ->and($sale->customer_name)->toBe('Land of Toys Inc.')
        ->and($sale->product_line)->toBe('Motorcycles')
        ->and($sale->quantity_ordered)->toBe(30)
        ->and((float) $sale->price_each)->toBe(95.70)
        ->and((float) $sale->sales)->toBe(2871.00)
        ->and($sale->status)->toBe('Shipped')
        ->and($sale->order_date)->not->toBeNull();
});

test('artisan sales:import-sample command executes successfully', function () {
    $this->artisan('sales:import-sample')
        ->expectsOutputToContain('Successfully imported 2823 sales records')
        ->assertSuccessful();

    expect(SampleSale::count())->toBe(2823);
});
