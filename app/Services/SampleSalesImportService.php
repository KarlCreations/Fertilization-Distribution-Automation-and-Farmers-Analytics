<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SampleSalesImportService
{
    /**
     * Import sales data sample from CSV file into the database.
     *
     * @return int Number of imported rows
     */
    public function import(string $csvPath): int
    {
        if (! file_exists($csvPath) || ! is_readable($csvPath)) {
            throw new InvalidArgumentException("CSV file not found or not readable at: {$csvPath}");
        }

        $handle = fopen($csvPath, 'r');

        if ($handle === false) {
            throw new InvalidArgumentException("Unable to open CSV file at: {$csvPath}");
        }

        $headerRow = fgetcsv($handle);

        if ($headerRow === false) {
            fclose($handle);
            throw new InvalidArgumentException("CSV file at {$csvPath} is empty.");
        }

        // Clean UTF-8 BOM if present and normalize headers
        $headerRow[0] = preg_replace('/^\x{EF}\x{BB}\x{BF}/u', '', $headerRow[0]);
        $headers = array_map(fn (string $h): string => trim($h), $headerRow);

        $now = now()->toDateTimeString();
        $batch = [];
        $totalImported = 0;
        $batchSize = 250;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) !== count($headers)) {
                    continue;
                }

                $raw = array_combine($headers, $row);
                $cleaned = $this->transformRow($raw, $now);

                $batch[] = $cleaned;

                if (count($batch) >= $batchSize) {
                    $this->upsertBatch($batch);
                    $totalImported += count($batch);
                    $batch = [];
                }
            }

            if (count($batch) > 0) {
                $this->upsertBatch($batch);
                $totalImported += count($batch);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);

            throw $e;
        }

        fclose($handle);

        return $totalImported;
    }

    /**
     * @param  array<string, string|null>  $raw
     * @return array<string, mixed>
     */
    private function transformRow(array $raw, string $timestamp): array
    {
        $sanitize = function (?string $value): ?string {
            if ($value === null) {
                return null;
            }

            $trimmed = trim($value);

            if ($trimmed === '') {
                return null;
            }

            if (! mb_check_encoding($trimmed, 'UTF-8')) {
                $trimmed = mb_convert_encoding($trimmed, 'UTF-8', 'ISO-8859-1');
            }

            return $trimmed;
        };

        $orderDate = $sanitize($raw['ORDERDATE'] ?? null);
        $formattedDate = $orderDate !== null
            ? Carbon::parse($orderDate)->format('Y-m-d H:i:s')
            : $timestamp;

        return [
            'order_number' => (int) ($raw['ORDERNUMBER'] ?? 0),
            'quantity_ordered' => (int) ($raw['QUANTITYORDERED'] ?? 0),
            'price_each' => round((float) ($raw['PRICEEACH'] ?? 0), 2),
            'order_line_number' => (int) ($raw['ORDERLINENUMBER'] ?? 0),
            'sales' => round((float) ($raw['SALES'] ?? 0), 2),
            'order_date' => $formattedDate,
            'status' => (string) $sanitize($raw['STATUS'] ?? 'Unknown'),
            'qtr_id' => (int) ($raw['QTR_ID'] ?? 0),
            'month_id' => (int) ($raw['MONTH_ID'] ?? 0),
            'year_id' => (int) ($raw['YEAR_ID'] ?? 0),
            'product_line' => (string) $sanitize($raw['PRODUCTLINE'] ?? 'Unknown'),
            'msrp' => round((float) ($raw['MSRP'] ?? 0), 2),
            'product_code' => (string) $sanitize($raw['PRODUCTCODE'] ?? ''),
            'customer_name' => (string) $sanitize($raw['CUSTOMERNAME'] ?? 'Unknown Customer'),
            'phone' => $sanitize($raw['PHONE'] ?? null),
            'address_line1' => $sanitize($raw['ADDRESSLINE1'] ?? null),
            'address_line2' => $sanitize($raw['ADDRESSLINE2'] ?? null),
            'city' => $sanitize($raw['CITY'] ?? null),
            'state' => $sanitize($raw['STATE'] ?? null),
            'postal_code' => $sanitize($raw['POSTALCODE'] ?? null),
            'country' => $sanitize($raw['COUNTRY'] ?? null),
            'territory' => $sanitize($raw['TERRITORY'] ?? null),
            'contact_last_name' => $sanitize($raw['CONTACTLASTNAME'] ?? null),
            'contact_first_name' => $sanitize($raw['CONTACTFIRSTNAME'] ?? null),
            'deal_size' => $sanitize($raw['DEALSIZE'] ?? null),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $batch
     */
    private function upsertBatch(array $batch): void
    {
        DB::table('sample_sales')->upsert(
            $batch,
            ['order_number', 'order_line_number'],
            [
                'quantity_ordered',
                'price_each',
                'sales',
                'order_date',
                'status',
                'qtr_id',
                'month_id',
                'year_id',
                'product_line',
                'msrp',
                'product_code',
                'customer_name',
                'phone',
                'address_line1',
                'address_line2',
                'city',
                'state',
                'postal_code',
                'country',
                'territory',
                'contact_last_name',
                'contact_first_name',
                'deal_size',
                'updated_at',
            ]
        );
    }
}
