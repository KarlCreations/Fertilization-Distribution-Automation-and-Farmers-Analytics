<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;

class FinanceSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        if (! in_array($request->user()->role, ['finance', 'finance_staff'], true)) {
            return Inertia::render('employee-settings');
        }

        return Inertia::render('employee-settings', [
            'financePreferences' => $request->user()->finance_notification_preferences ?? [
                'quota_updates' => true,
                'contract_updates' => true,
                'audit_updates' => true,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'quota_updates' => ['required', 'boolean'],
            'contract_updates' => ['required', 'boolean'],
            'audit_updates' => ['required', 'boolean'],
        ]);

        $request->user()->forceFill([
            'finance_notification_preferences' => $validated,
        ])->save();

        return back()->with('status', 'Finance notification preferences saved.');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(2048)],
        ]);
        $user = $request->user();
        $previousAvatar = $user->getRawOriginal('profile_photo_path');
        $avatarPath = $validated['avatar']->storePublicly('profile-photos', 'public');

        $user->forceFill([
            'avatar' => $avatarPath,
            'profile_photo_path' => $avatarPath,
        ])->save();

        if ($previousAvatar !== null && str_starts_with($previousAvatar, 'profile-photos/')) {
            Storage::disk('public')->delete($previousAvatar);
        }

        return back()->with('status', 'Profile picture updated.');
    }
}
