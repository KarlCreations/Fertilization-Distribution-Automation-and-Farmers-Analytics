<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_field_activities', function (Blueprint $table) {
            $table->id();

            // Farmer being visited or inspected
            $table->foreignId('farmer_id')
                ->constrained('erp_farmers')
                ->restrictOnDelete();

            // Zone where the activity takes place
            $table->foreignId('zone_id')
                ->nullable()
                ->constrained('erp_zones')
                ->nullOnDelete();

            // Assigned field personnel
            $table->foreignId('assigned_employee_id')
                ->nullable()
                ->constrained('erp_employees')
                ->nullOnDelete();

            $table->string('activity_type')
                ->default('farmer_verification');

            $table->dateTime('scheduled_at')->nullable();

            $table->string('status')->default('pending');

            $table->text('inspection_notes')->nullable();

            $table->text('result')->nullable();

            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_field_activities');
    }
};
