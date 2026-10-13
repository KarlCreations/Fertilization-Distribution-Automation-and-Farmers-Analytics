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
        Schema::create('erp_regions', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('erp_zones', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('region_id')->constrained('erp_regions')->cascadeOnDelete();
            $table->unsignedInteger('zone_no');
            $table->string('name');
            $table->string('zone_group')->nullable();
            $table->unique(['region_id', 'zone_no']);
        });

        Schema::create('erp_depots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('zone_id')->constrained('erp_zones');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('facility_type')->nullable();
            $table->decimal('capacity_mt', 14, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('erp_roles', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('description')->nullable();
        });

        Schema::create('erp_user_roles', function (Blueprint $table): void {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('erp_roles')->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained('erp_zones');
            $table->foreignId('depot_id')->nullable()->constrained('erp_depots');
            $table->timestamps();
            $table->primary(['user_id', 'role_id']);
        });

        Schema::create('erp_commodities', function (Blueprint $table): void {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('category');
            $table->string('grade')->nullable();
            $table->string('unit')->default('MT');
            $table->boolean('is_hazardous')->default(false);
            $table->timestamps();
        });

        Schema::create('erp_farmers', function (Blueprint $table): void {
            $table->id();
            $table->string('national_id')->unique();
            $table->string('full_name');
            $table->string('phone')->nullable();
            $table->foreignId('zone_id')->nullable()->constrained('erp_zones');
            $table->string('status')->default('pending_verification');
            $table->boolean('biometric_verified')->default(false);
            $table->foreignId('registered_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->index(['status', 'zone_id']);
        });

        Schema::create('erp_subsidy_cycles', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('fiscal_period')->nullable();
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->string('status')->default('planned');
        });

        Schema::create('erp_farmer_quotas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('farmer_id')->constrained('erp_farmers')->cascadeOnDelete();
            $table->foreignId('cycle_id')->constrained('erp_subsidy_cycles');
            $table->foreignId('commodity_id')->constrained('erp_commodities');
            $table->decimal('allocated_qty', 14, 2)->default(0);
            $table->decimal('disbursed_qty', 14, 2)->default(0);
            $table->unique(['farmer_id', 'cycle_id', 'commodity_id']);
        });

        Schema::create('erp_stock_batches', function (Blueprint $table): void {
            $table->id();
            $table->string('lot_no')->unique();
            $table->foreignId('commodity_id')->constrained('erp_commodities');
            $table->string('supplier_name')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->text('quality_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('erp_stock_levels', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('depot_id')->constrained('erp_depots');
            $table->foreignId('batch_id')->constrained('erp_stock_batches');
            $table->foreignId('commodity_id')->constrained('erp_commodities');
            $table->decimal('on_hand_qty', 14, 2)->default(0);
            $table->decimal('capacity_qty', 14, 2)->nullable();
            $table->decimal('reorder_point', 14, 2)->nullable();
            $table->unsignedInteger('runway_days')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
            $table->unique(['depot_id', 'batch_id']);
            $table->index(['depot_id', 'commodity_id']);
        });

        Schema::create('erp_trade_contracts', function (Blueprint $table): void {
            $table->id();
            $table->string('contract_ref')->unique();
            $table->foreignId('commodity_id')->constrained('erp_commodities');
            $table->string('contract_type');
            $table->string('status')->default('draft');
            $table->decimal('volume_mt', 14, 2)->nullable();
            $table->decimal('price_per_mt', 14, 2)->nullable();
            $table->string('counterparty')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('erp_employees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('employee_code')->unique();
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->foreignId('zone_id')->nullable()->constrained('erp_zones');
            $table->foreignId('depot_id')->nullable()->constrained('erp_depots');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('erp_audit_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('action');
            $table->string('module')->nullable();
            $table->string('target_type')->nullable();
            $table->string('target_id')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['module', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['erp_audit_events', 'erp_employees', 'erp_trade_contracts', 'erp_stock_levels', 'erp_stock_batches', 'erp_farmer_quotas', 'erp_subsidy_cycles', 'erp_farmers', 'erp_commodities', 'erp_user_roles', 'erp_roles', 'erp_depots', 'erp_zones', 'erp_regions'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
