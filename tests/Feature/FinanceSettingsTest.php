<?php

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function financeProfileImage(string $name): UploadedFile
{
    $content = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==');

    return UploadedFile::fake()->createWithContent($name, $content)->mimeType('image/png');
}

test('finance users receive their personal settings and finance notification preferences', function () {
    $user = User::factory()->create(['role' => 'finance']);

    $this->actingAs($user)
        ->get(route('employee-settings'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('employee-settings')
            ->where('financePreferences.quota_updates', true)
            ->where('financePreferences.contract_updates', true)
            ->where('financePreferences.audit_updates', true));
});

test('finance users can save personal finance notification preferences', function () {
    $user = User::factory()->create(['role' => 'finance_staff']);
    $this->withoutMiddleware(ValidateCsrfToken::class);
    $preferences = [
        'quota_updates' => false,
        'contract_updates' => true,
        'audit_updates' => false,
    ];

    $this->actingAs($user)
        ->from(route('employee-settings'))
        ->patch(route('finance-settings.update'), $preferences)
        ->assertRedirect(route('employee-settings', absolute: false));

    expect($user->refresh()->finance_notification_preferences)->toBe($preferences);
});

test('finance preferences reject invalid settings and non-finance users are forbidden', function () {
    $financeUser = User::factory()->create(['role' => 'finance']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->actingAs($financeUser)
        ->from(route('employee-settings'))
        ->patch(route('finance-settings.update'), [
            'quota_updates' => false,
            'contract_updates' => true,
            'audit_updates' => 'enabled',
        ])
        ->assertSessionHasErrors('audit_updates');

    expect($financeUser->refresh()->finance_notification_preferences)->toBeNull();

    $salesUser = User::factory()->create(['role' => 'sales']);

    $this->actingAs($salesUser)
        ->patch(route('finance-settings.update'), [
            'quota_updates' => false,
            'contract_updates' => true,
            'audit_updates' => false,
        ])
        ->assertForbidden();
});

test('finance users can upload a profile picture and replace the previous picture', function () {
    Storage::fake('public');
    $user = User::factory()->create(['role' => 'finance']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->actingAs($user)
        ->from(route('employee-settings'))
        ->post(route('finance-settings.avatar'), ['avatar' => financeProfileImage('first.png')])
        ->assertRedirect(route('employee-settings', absolute: false));

    $previousPath = $user->refresh()->getRawOriginal('avatar');
    expect($previousPath)->toStartWith('profile-photos/');
    Storage::disk('public')->assertExists($previousPath);
    expect($user->avatar)->toBe(Storage::disk('public')->url($previousPath));

    $this->get(route('employee-settings'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.avatar', Storage::disk('public')->url($previousPath)));

    $this->from(route('employee-settings'))
        ->post(route('finance-settings.avatar'), ['avatar' => financeProfileImage('second.png')])
        ->assertRedirect(route('employee-settings', absolute: false));

    $newPath = $user->refresh()->getRawOriginal('avatar');
    expect($newPath)->not->toBe($previousPath);
    Storage::disk('public')->assertMissing($previousPath);
    Storage::disk('public')->assertExists($newPath);
});

test('profile pictures reject unsupported files and non-finance users', function () {
    Storage::fake('public');
    $financeUser = User::factory()->create(['role' => 'finance']);
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $this->actingAs($financeUser)
        ->from(route('employee-settings'))
        ->post(route('finance-settings.avatar'), ['avatar' => UploadedFile::fake()->create('document.pdf', 20, 'application/pdf')])
        ->assertSessionHasErrors('avatar');

    expect($financeUser->refresh()->getRawOriginal('avatar'))->toBeNull();
    Storage::disk('public')->assertDirectoryEmpty('profile-photos');

    $salesUser = User::factory()->create(['role' => 'sales']);

    $this->actingAs($salesUser)
        ->post(route('finance-settings.avatar'), ['avatar' => financeProfileImage('blocked.png')])
        ->assertForbidden();
});
