<?php

use App\Models\User;
use Database\Seeders\DevelopmentQuickAccessSeeder;
use Inertia\Testing\AssertableInertia;

it('shares development quick-access accounts on the login page in the local environment', function () {
    $this->app['env'] = 'local';

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/login')
            ->where('demoAccounts', [
                ['label' => 'Executive', 'email' => 'test@example.com', 'password' => 'password'],
                ['label' => 'Inventory Staff', 'email' => 'inventory.staff@example.com', 'password' => 'Inventory@12345'],
                ['label' => 'Sales Staff', 'email' => 'sales.staff@example.com', 'password' => 'Sales@12345'],
                ['label' => 'Finance Staff', 'email' => 'finance.staff@example.com', 'password' => 'Finance@12345'],
                ['label' => 'HR Employee', 'email' => 'hr.employee@example.com', 'password' => 'Hr@12345'],
                ['label' => 'Subsidy Staff', 'email' => 'subsidy.staff@example.com', 'password' => 'Subsidy@12345'],
                ['label' => 'Field Operations', 'email' => 'field.operations@example.com', 'password' => 'FieldOps@12345'],
            ]));
});

it('does not share development quick-access accounts on the login page outside the local environment', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/login')
            ->where('demoAccounts', []));
});

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
