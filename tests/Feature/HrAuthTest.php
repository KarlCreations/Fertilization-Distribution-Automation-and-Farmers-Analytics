<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the hr login screen can be rendered by guests', function () {
    $this->get('/hr-login')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('auth/hr-login'));
});

test('an existing hr account can log in and reaches the hr dashboard', function () {
    User::factory()->create([
        'email' => 'hr@example.com',
        'role' => 'hr',
        'password' => 'password',
    ]);

    $response = $this->post('/login', [
        'email' => 'hr@example.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('hr-dashboard', absolute: false));
});

test('an hr employee can access hr pages', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr_employee']));

    $this->get('/hr-dashboard')->assertOk();
    $this->get('/hr-workforce')->assertOk();
    $this->get('/hr-login')->assertOk();
});

test('an hr employee cannot access other role dashboards', function () {
    $this->actingAs(User::factory()->create(['role' => 'hr_employee']));

    foreach ([
        '/dashboard',
        '/finance-dashboard',
        '/sales-dashboard',
        '/inventory-dashboard',
        '/farmer-management-dashboard',
        '/finance-impact',
        '/sales-commodities',
        '/inventory-warehouses',
        '/system-admin',
        '/system-settings',
    ] as $url) {
        $this->get($url)->assertForbidden();
    }
});
