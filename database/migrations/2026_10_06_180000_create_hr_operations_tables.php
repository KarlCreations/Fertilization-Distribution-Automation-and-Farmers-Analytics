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
        Schema::create('erp_shifts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained('erp_employees')->cascadeOnDelete();
            $table->string('shift_type')->default('morning'); // morning, afternoon, night, field_duty
            $table->date('shift_date');
            $table->foreignId('zone_id')->nullable()->constrained('erp_zones');
            $table->foreignId('depot_id')->nullable()->constrained('erp_depots');
            $table->string('status')->default('scheduled'); // scheduled, active, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('erp_staffing_actions', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('action_type'); // dispatch, transfer, compliance_check, onboarding, leave
            $table->foreignId('employee_id')->nullable()->constrained('erp_employees')->nullOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained('erp_zones');
            $table->string('status')->default('open'); // open, in_progress, completed
            $table->foreignId('requested_by')->nullable()->constrained('users');
            $table->text('details')->nullable();
            $table->timestamps();
        });

        Schema::create('hr_system_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_system_settings');
        Schema::dropIfExists('erp_staffing_actions');
        Schema::dropIfExists('erp_shifts');
    }
};
