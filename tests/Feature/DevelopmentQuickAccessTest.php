<?php

use App\Models\User;
use Database\Seeders\DevelopmentQuickAccessSeeder;

it('signs in each development quick-access account and opens its dashboard', function (
    string $email,
    string $password,
    string $destination,
) {
    $this->seed(DevelopmentQuickAccessSeeder::class);

    $response = $this->post(route('login'), [
        'email' => $email,
        'password' => $password,
    ]);

    $response->assertRedirect(route($destination, absolute: false));
    $this->assertAuthenticatedAs(User::where('email', $email)->first());
})->with([
    'executive overview' => ['test@example.com', 'password', 'dashboard'],
    'inventory staff' => ['inventory.staff@example.com', 'Inventory@12345', 'inventory-dashboard'],
    'sales staff' => ['sales.staff@example.com', 'Sales@12345', 'sales-dashboard'],
    'finance staff' => ['finance.staff@example.com', 'Finance@12345', 'finance-dashboard'],
    'hr employee' => ['hr.employee@example.com', 'Hr@12345', 'hr-dashboard'],
    'subsidy staff' => ['subsidy.staff@example.com', 'Subsidy@12345', 'farmer-management-dashboard'],
    'field operations' => ['field.operations@example.com', 'FieldOps@12345', 'farmer-management-dashboard'],
]);
