<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): SymfonyResponse
    {
        $status = $request->session()->get('status');

        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $response = Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $status,
        ])->toResponse($request);

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect($this->dashboardRouteFor($request));
    }

    private function dashboardRouteFor(Request $request): string
    {
        $user = $request->user();
        $allowedDashboards = match ($user?->role) {
            'subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff' => ['farmer-management-dashboard', 'farmer-registry'],
            'inventory', 'inventory_staff' => ['inventory-dashboard'],
            'sales', 'sales_staff' => ['sales-dashboard', 'sales-commodities'],
            'finance', 'finance_staff' => ['finance-dashboard', 'finance-impact'],
            'hr', 'hr_employee' => ['hr-dashboard', 'hr-workforce'],
            default => [],
        };
        $preferredDashboard = data_get($user?->preferences, 'default_dashboard');

        if (is_string($preferredDashboard) && in_array($preferredDashboard, $allowedDashboards, true)) {
            return route($preferredDashboard, absolute: false);
        }

        return match ($request->user()?->role) {
            'subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff' => route('farmer-management-dashboard', absolute: false),
            'inventory', 'inventory_staff' => route('inventory-dashboard', absolute: false),
            'sales', 'sales_staff' => route('sales-dashboard', absolute: false),
            'finance', 'finance_staff' => route('finance-dashboard', absolute: false),
            'hr', 'hr_employee' => route('hr-dashboard', absolute: false),
            default => route('dashboard', absolute: false),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
