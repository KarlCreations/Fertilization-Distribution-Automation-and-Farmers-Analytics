<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('farmer-registry', function () {
        return Inertia::render('farmer-registry');
    })->name('farmer-registry');

    Route::get('inventory-warehouses', function () {
        return Inertia::render('inventory-warehouses');
    })->name('inventory-warehouses');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
