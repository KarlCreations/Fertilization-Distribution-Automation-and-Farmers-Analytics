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
        Schema::create('erp_sales', function (Blueprint $table): void {
            $table->id();
            $table->date('sale_date');
            $table->foreignId('farmer_id')->constrained('erp_farmers');
            $table->foreignId('commodity_id')->constrained('erp_commodities');
            $table->foreignId('depot_id')->constrained('erp_depots');
            $table->foreignId('zone_id')->constrained('erp_zones');
            $table->string('distributor');
            $table->decimal('quantity', 14, 2);
            $table->decimal('unit_price', 14, 2);
            $table->decimal('total', 16, 2);
            $table->decimal('amount_paid', 16, 2)->default(0);
            $table->string('payment_status')->default('unpaid');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['sale_date', 'payment_status']);
            $table->index(['farmer_id', 'sale_date']);
            $table->index(['commodity_id', 'sale_date']);
            $table->index(['zone_id', 'sale_date']);
            $table->index(['created_by', 'sale_date']);
        });

        Schema::create('erp_sale_stock_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('sale_id')->constrained('erp_sales')->cascadeOnDelete();
            $table->foreignId('stock_level_id')->constrained('erp_stock_levels');
            $table->decimal('quantity', 14, 2);
            $table->timestamps();

            $table->unique(['sale_id', 'stock_level_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_sale_stock_allocations');
        Schema::dropIfExists('erp_sales');
    }
};
