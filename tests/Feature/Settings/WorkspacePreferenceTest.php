<?php

use App\Models\User;

test('an inventory user can save an allowed default dashboard', function () {
    $user = User::factory()->create(['role' => 'inventory']);

    $response = $this
        ->actingAs($user)
        ->patch(route('workspace-preferences.update'), [
            'default_dashboard' => 'inventory-dashboard',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('employee-settings'));

    expect($user->refresh()->preferences['default_dashboard'])->toBe('inventory-dashboard');
});

test('an inventory user cannot choose inventory operations as the default dashboard', function () {
    $user = User::factory()->create([
        'role' => 'inventory',
        'preferences' => ['default_dashboard' => 'inventory-dashboard'],
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('employee-settings'))
        ->patch(route('workspace-preferences.update'), [
            'default_dashboard' => 'inventory-warehouses',
        ]);

    $response->assertSessionHasErrors('default_dashboard');

    expect($user->refresh()->preferences['default_dashboard'])->toBe('inventory-dashboard');
});

test('a user cannot save a dashboard outside their role', function () {
    $user = User::factory()->create([
        'role' => 'inventory',
        'preferences' => ['default_dashboard' => 'inventory-dashboard'],
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('employee-settings'))
        ->patch(route('workspace-preferences.update'), [
            'default_dashboard' => 'system-admin',
        ]);

    $response->assertSessionHasErrors('default_dashboard');

    expect($user->refresh()->preferences['default_dashboard'])->toBe('inventory-dashboard');
});

test('profile can be edited from the employee settings page', function () {
    $user = User::factory()->create(['role' => 'inventory']);

    $response = $this
        ->actingAs($user)
        ->patch(route('employee-settings.profile.update'), [
            'name' => 'Updated Inventory User',
            'email' => 'updated-inventory@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('employee-settings'));

    expect($user->refresh()->name)->toBe('Updated Inventory User');
    expect($user->email)->toBe('updated-inventory@example.com');
});

test('workspace preference updates require authentication', function () {
    $this->patch(route('workspace-preferences.update'), [
        'default_dashboard' => 'inventory-dashboard',
    ])->assertRedirect(route('login'));
});
