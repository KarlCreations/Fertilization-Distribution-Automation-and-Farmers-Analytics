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
        Schema::create('erp_attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained('erp_employees')->cascadeOnDelete();
            $table->date('date');
            $table->string('status')->default('present'); // present, late, absent, on_leave
            $table->string('clock_in')->nullable();
            $table->string('clock_out')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'date']);
        });

        Schema::create('erp_leave_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained('erp_employees')->cascadeOnDelete();
            $table->string('leave_type')->default('annual'); // annual, sick, emergency, parental
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('hr_notification_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('leave_alerts')->default(true);
            $table->boolean('attendance_alerts')->default(true);
            $table->boolean('shift_alerts')->default(true);
            $table->boolean('employee_updates')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_notification_preferences');
        Schema::dropIfExists('erp_leave_requests');
        Schema::dropIfExists('erp_attendance_records');
    }
};
