<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('erp_silo_sensor_readings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('stock_level_id')->nullable()->constrained('erp_stock_levels')->nullOnDelete();
            $table->string('commodity_name');
            $table->string('depot_name');
            $table->string('lot_no');
            $table->string('sensor_code', 100);
            $table->decimal('level_percent', 5, 2);
            $table->decimal('temperature_c', 6, 2);
            $table->decimal('moisture_percent', 5, 2);
            $table->string('status', 20);
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['stock_level_id', 'id']);
        });

        Schema::create('erp_weighbridge_slips', function (Blueprint $table): void {
            $table->id();
            $table->string('slip_number', 100)->unique();
            $table->string('direction', 10);
            $table->foreignId('stock_level_id')->nullable()->constrained('erp_stock_levels')->nullOnDelete();
            $table->string('commodity_name');
            $table->string('depot_name');
            $table->string('lot_no');
            $table->string('truck_plate', 50);
            $table->decimal('gross_weight', 14, 2);
            $table->decimal('tare_weight', 14, 2);
            $table->decimal('net_weight', 14, 2);
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['direction', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_weighbridge_slips');
        Schema::dropIfExists('erp_silo_sensor_readings');
    }
};
