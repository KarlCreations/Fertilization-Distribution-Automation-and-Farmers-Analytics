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
        Schema::create('erp_disbursement_records', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('farmer_quota_id')
                ->constrained('erp_farmer_quotas')
                ->cascadeOnDelete();

            $table->decimal('quantity', 14, 2);

            $table->foreignId('recorded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('erp_disbursement_records');
    }
};
