<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SiloSensorReadingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'stock_level_id' => ['required', 'integer', 'exists:erp_stock_levels,id'],
            'sensor_code' => ['required', 'string', 'max:100'],
            'level_percent' => ['required', 'numeric', 'between:0,100', 'decimal:0,2'],
            'temperature_c' => ['required', 'numeric', 'between:-50,100', 'decimal:0,2'],
            'moisture_percent' => ['required', 'numeric', 'between:0,100', 'decimal:0,2'],
            'status' => ['required', 'string', Rule::in(['normal', 'warning', 'critical'])],
        ]);

        DB::transaction(function () use ($data, $request): void {
            $stock = DB::table('erp_stock_levels')
                ->join('erp_commodities', 'erp_commodities.id', '=', 'erp_stock_levels.commodity_id')
                ->join('erp_depots', 'erp_depots.id', '=', 'erp_stock_levels.depot_id')
                ->join('erp_stock_batches', 'erp_stock_batches.id', '=', 'erp_stock_levels.batch_id')
                ->where('erp_stock_levels.id', $data['stock_level_id'])
                ->first([
                    'erp_stock_levels.id',
                    'erp_commodities.name as commodity_name',
                    'erp_depots.name as depot_name',
                    'erp_stock_batches.lot_no',
                ]);

            abort_if($stock === null, 404);

            $now = now();
            $readingId = DB::table('erp_silo_sensor_readings')->insertGetId([
                'stock_level_id' => $stock->id,
                'commodity_name' => $stock->commodity_name,
                'depot_name' => $stock->depot_name,
                'lot_no' => $stock->lot_no,
                'sensor_code' => $data['sensor_code'],
                'level_percent' => $data['level_percent'],
                'temperature_c' => $data['temperature_c'],
                'moisture_percent' => $data['moisture_percent'],
                'status' => $data['status'],
                'recorded_by' => $request->user()->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('erp_audit_events')->insert([
                'user_id' => $request->user()->id,
                'action' => 'sensor_recorded',
                'module' => 'inventory',
                'target_type' => 'erp_silo_sensor_reading',
                'target_id' => (string) $readingId,
                'payload' => json_encode([
                    'sensor_code' => $data['sensor_code'],
                    'commodity_name' => $stock->commodity_name,
                    'depot_name' => $stock->depot_name,
                    'level_percent' => (float) $data['level_percent'],
                    'temperature_c' => (float) $data['temperature_c'],
                    'moisture_percent' => (float) $data['moisture_percent'],
                    'status' => $data['status'],
                ], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return to_route('inventory-warehouses')->with('success', 'Silo sensor reading recorded.');
    }
}
