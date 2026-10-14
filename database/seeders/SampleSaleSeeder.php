<?php

namespace Database\Seeders;

use App\Services\SampleSalesImportService;
use Illuminate\Database\Seeder;

class SampleSaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SampleSalesImportService $importer): void
    {
        $csvPath = database_path('data/sales_data_sample.csv');

        if (! file_exists($csvPath)) {
            $this->command?->warn("Sales sample CSV file not found at: {$csvPath}");

            return;
        }

        $count = $importer->import($csvPath);

        $this->command?->info("Seeded {$count} sample sales records into database.");
    }
}
