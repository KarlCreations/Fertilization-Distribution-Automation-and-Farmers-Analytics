<?php

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Inertia\Testing\AssertableInertia as Assert;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('development quick access is available in the local environment', function () {
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn () => 'local');

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('developmentAccounts.0.label', 'Finance dashboard'));
    } finally {
        app()->detectEnvironment(fn () => $originalEnvironment);
    }
});

test('development quick access is hidden outside the local environment', function () {
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn () => 'production');

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('developmentAccounts', []));
    } finally {
        app()->detectEnvironment(fn () => $originalEnvironment);
    }
});

test('development quick access signs into the selected account and opens its dashboard', function () {
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn () => 'local');
        $this->withoutMiddleware(ValidateCsrfToken::class);

        $response = $this->post(route('login.development'), ['account' => 'finance']);
        $user = User::where('email', 'finance.staff@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('finance-dashboard', absolute: false));
        $this->assertModelExists($user);
    } finally {
        app()->detectEnvironment(fn () => $originalEnvironment);
    }
});

test('development quick access is unavailable outside the local environment', function () {
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn () => 'production');
        $this->withoutMiddleware(ValidateCsrfToken::class);

        $this->post(route('login.development'), ['account' => 'finance'])->assertNotFound();

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'finance.staff@example.com']);
    } finally {
        app()->detectEnvironment(fn () => $originalEnvironment);
    }
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('inventory users fall back to their role dashboard when their saved dashboard is unavailable', function () {
    $user = User::factory()->create([
        'role' => 'inventory',
        'preferences' => ['default_dashboard' => 'inventory-warehouses'],
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('inventory-dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
