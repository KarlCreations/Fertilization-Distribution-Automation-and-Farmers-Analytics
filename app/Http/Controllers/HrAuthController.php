<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HrAuthController extends Controller
{
    /**
     * Show the HR employee login page.
     */
    public function create(Request $request): Response
    {
        $status = $request->session()->get('status');

        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return Inertia::render('auth/hr-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $status,
        ]);
    }
}
