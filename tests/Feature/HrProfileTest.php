<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

test('an hr user sees notification preferences and recent account security details', function () {
    $user = User::factory()->create([
        'role' => 'hr',
        'last_login_at' => '2026-10-08 09:30:00',
        'password_changed_at' => '2026-10-01 14:15:00',
    ]);

    $this
        ->actingAs($user)
        ->get('/hr-settings')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('hr-settings')
            ->where('notificationPreferences.leave_alerts', true)
            ->where('notificationPreferences.employee_updates', true)
            ->where('notificationPreferences.attendance_alerts', true)
            ->where('notificationPreferences.shift_alerts', true)
            ->where('security.lastPasswordChange', '2026-10-01T14:15:00+00:00')
            ->where('security.lastLogin', '2026-10-08T09:30:00+00:00')
            ->where('security.accountStatus', 'Active'));
});

test('an hr user can save individual notification preferences', function () {
    $user = User::factory()->create(['role' => 'hr']);

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->post('/hr/settings/notifications', [
            'leave_alerts' => false,
            'employee_updates' => true,
            'attendance_alerts' => false,
            'shift_alerts' => true,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/hr-settings');

    $this->assertDatabaseHas('hr_notification_preferences', [
        'user_id' => $user->id,
        'leave_alerts' => false,
        'employee_updates' => true,
        'attendance_alerts' => false,
        'shift_alerts' => true,
    ]);
});

test('guests are redirected to login when uploading a profile photo', function () {
    $this
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg'),
        ])
        ->assertRedirect(route('login'));
});

test('users without an hr role cannot upload a profile photo', function () {
    Storage::fake('public');

    $this
        ->actingAs(User::factory()->create(['role' => 'sales_staff']))
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg'),
        ])
        ->assertForbidden();
});

test('an hr user can upload a profile photo', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => 'hr']);

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/hr-settings');

    $user->refresh();

    expect($user->profile_photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($user->profile_photo_path);
    expect($user->avatar)->toBe('/storage/'.$user->profile_photo_path);

    $this
        ->actingAs($user)
        ->get('/hr-settings')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('hr-settings')
            ->where('profile.user.avatar', '/storage/'.$user->profile_photo_path));
});

test('uploading a new profile photo replaces the previous photo', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => 'hr']);

    $this
        ->actingAs($user)
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('first.jpg'),
        ]);

    $firstPath = $user->refresh()->profile_photo_path;

    $this
        ->actingAs($user)
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('second.jpg'),
        ]);

    $user->refresh();

    expect($user->profile_photo_path)->not->toBe($firstPath);

    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($user->profile_photo_path);
});

test('an hr user can remove their profile photo', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => 'hr']);

    $this
        ->actingAs($user)
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

    $path = $user->refresh()->profile_photo_path;

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->delete('/hr-profile/photo');

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/hr-settings');

    $user->refresh();

    expect($user->profile_photo_path)->toBeNull()
        ->and($user->avatar)->toBeNull();

    Storage::disk('public')->assertMissing($path);
});

test('an invalid profile photo is rejected', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => 'hr']);

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->post('/hr-profile/photo', [
            'profile_photo' => UploadedFile::fake()->create('document.txt', 12, 'text/plain'),
        ]);

    $response
        ->assertSessionHasErrors(['profile_photo' => 'Please upload a valid JPG or PNG image.'])
        ->assertRedirect('/hr-settings');

    expect($user->refresh()->profile_photo_path)->toBeNull();
});

test('an hr user can update their profile name', function () {
    $user = User::factory()->create([
        'role' => 'hr',
        'email' => 'hr.user@example.com',
    ]);

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->patch('/hr-profile', [
            'name' => 'Updated HR Name',
            'email' => 'hr.user@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/hr-settings');

    expect($user->refresh()->name)->toBe('Updated HR Name');
});

test('an hr user can change their password', function () {
    $user = User::factory()->create(['role' => 'hr']);
    $passwordChangedAt = now();
    $this->travelTo($passwordChangedAt);

    $response = $this
        ->actingAs($user)
        ->from('/hr-settings')
        ->put('/hr-profile/password', [
            'current_password' => 'password',
            'password' => 'NewSecret123!',
            'password_confirmation' => 'NewSecret123!',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/hr-settings');

    $this->assertCredentials([
        'email' => $user->email,
        'password' => 'NewSecret123!',
    ]);

    expect($user->refresh()->password_changed_at->toDateTimeString())
        ->toBe($passwordChangedAt->toDateTimeString());
});

test('an hr password change from account settings records the change time', function () {
    $user = User::factory()->create(['role' => 'hr']);
    $passwordChangedAt = now();
    $this->travelTo($passwordChangedAt);

    $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'NewSecret123!',
            'password_confirmation' => 'NewSecret123!',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/password');

    expect($user->refresh()->password_changed_at->toDateTimeString())
        ->toBe($passwordChangedAt->toDateTimeString());
});

test('a successful hr login records the last login time', function () {
    $user = User::factory()->create(['role' => 'hr']);
    $loginTime = now();
    $this->travelTo($loginTime);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('hr-dashboard', absolute: false));

    expect($user->refresh()->last_login_at->toDateTimeString())
        ->toBe($loginTime->toDateTimeString());
});
