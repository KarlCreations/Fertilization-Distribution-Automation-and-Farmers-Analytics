<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:executive,admin,operations_director')->name('dashboard');

    Route::get('farmer-management-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'subsidy']);
    })->middleware('role:subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-management-dashboard');

    Route::get('employee-settings', function () {
        return Inertia::render('employee-settings');
    })->middleware('role:inventory,inventory_staff,sales,sales_staff,finance,finance_staff,hr,hr_employee,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('employee-settings');

    Route::get('inventory-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'inventory']);
    })->middleware('role:inventory,inventory_staff')->name('inventory-dashboard');

    Route::get('sales-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'sales']);
    })->middleware('role:sales,sales_staff')->name('sales-dashboard');

    Route::get('finance-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'finance']);
    })->middleware('role:finance,finance_staff')->name('finance-dashboard');

    Route::get('hr-dashboard', function () {
        return Inertia::render('role-dashboard', ['role' => 'hr']);
    })->middleware('role:hr,hr_employee')->name('hr-dashboard');

    Route::get('farmer-registry', function () {
        return Inertia::render('farmer-registry');
    })->middleware('role:executive,admin,operations_director,subsidy,subsidy_staff,field_operations,field_operations_staff')->name('farmer-registry');

    Route::get('inventory-warehouses', function () {
        return Inertia::render('inventory-warehouses');
    })->middleware('role:executive,admin,operations_director,inventory,inventory_staff,subsidy,subsidy_staff,field_operations,field_operations_staff,sales,sales_staff')->name('inventory-warehouses');

    Route::get('finance-impact', function () {
        return Inertia::render('finance-impact');
    })->middleware('role:executive,admin,operations_director,finance,finance_staff')->name('finance-impact');

    Route::get('sales-commodities', function () {
        return Inertia::render('sales-commodities');
    })->middleware('role:executive,admin,operations_director,sales,sales_staff')->name('sales-commodities');

    Route::get('hr-workforce', function () {
        return Inertia::render('hr-workforce');
    })->middleware('role:executive,admin,operations_director,hr,hr_employee')->name('hr-workforce');

    Route::get('system-admin', function () {
        return Inertia::render('system-admin');
    })->middleware('role:executive,admin,operations_director')->name('system-admin');

    Route::get('system-settings', function () {
        return Inertia::render('system-settings');
    })->middleware('role:executive,admin,operations_director')->name('system-settings');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
