<?php

namespace App\Console\Commands;

use App\Services\SampleSalesImportService;
use Illuminate\Console\Command;

class ImportSampleSalesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:import-sample {--file= : Path to the CSV file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import sales data sample CSV into the sample_sales database table';

    /**
     * Execute the console command.
     */
    public function handle(SampleSalesImportService $importer): int
    {
        $filePath = (string) ($this->option('file') ?: database_path('data/sales_data_sample.csv'));

        if (! file_exists($filePath)) {
            $this->error("CSV file not found at: {$filePath}");

            return Command::FAILURE;
        }

        $this->info("Importing sales data from {$filePath}...");

        try {
            $count = $importer->import($filePath);
            $this->info("Successfully imported {$count} sales records into 'sample_sales' table.");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Import failed: {$e->getMessage()}");

            return Command::FAILURE;
        }
    }
}
