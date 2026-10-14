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
        Schema::create('sample_sales', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('order_number');
            $table->unsignedInteger('quantity_ordered');
            $table->decimal('price_each', 10, 2);
            $table->unsignedInteger('order_line_number');
            $table->decimal('sales', 12, 2);
            $table->dateTime('order_date');
            $table->string('status', 50);
            $table->unsignedTinyInteger('qtr_id');
            $table->unsignedTinyInteger('month_id');
            $table->unsignedSmallInteger('year_id');
            $table->string('product_line', 100);
            $table->decimal('msrp', 10, 2);
            $table->string('product_code', 50);
            $table->string('customer_name');
            $table->string('phone', 50)->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('territory', 50)->nullable();
            $table->string('contact_last_name', 100)->nullable();
            $table->string('contact_first_name', 100)->nullable();
            $table->string('deal_size', 50)->nullable();
            $table->timestamps();

            $table->unique(['order_number', 'order_line_number']);
            $table->index('order_date');
            $table->index('status');
            $table->index('product_line');
            $table->index('customer_name');
            $table->index('country');
            $table->index(['year_id', 'qtr_id', 'month_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sample_sales');
    }
};
