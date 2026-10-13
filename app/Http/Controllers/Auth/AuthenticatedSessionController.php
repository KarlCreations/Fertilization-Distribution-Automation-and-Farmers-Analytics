<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
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
            'developmentAccounts' => app()->environment('local')
                ? collect($this->developmentAccounts())->map(fn (array $account, string $key): array => [
                    'key' => $key,
                    'label' => $account['label'],
                ])->values()
                : [],
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

    /**
     * Sign in to a seeded local development account.
     */
    public function developmentQuickLogin(Request $request): RedirectResponse
    {
        abort_unless(app()->environment('local'), 404);

        $validated = $request->validate([
            'account' => ['required', 'string', 'in:finance,executive,inventory,sales,hr,subsidy,field_operations'],
        ]);
        $account = $this->developmentAccounts()[$validated['account']];

        $user = User::firstOrCreate(
            ['email' => $account['email']],
            [
                'name' => $account['name'],
                'role' => $account['role'],
                'password' => Str::random(64),
                'email_verified_at' => now(),
            ],
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return redirect($this->dashboardRouteFor($request));
    }

    /**
     * @return array<string, array{label: string, name: string, email: string, role: string}>
     */
    private function developmentAccounts(): array
    {
        return [
            'finance' => ['label' => 'Finance dashboard', 'name' => 'Finance Staff', 'email' => 'finance.staff@example.com', 'role' => 'finance'],
            'executive' => ['label' => 'Executive overview', 'name' => 'Executive', 'email' => 'test@example.com', 'role' => 'executive'],
            'inventory' => ['label' => 'Inventory staff', 'name' => 'Inventory Staff', 'email' => 'inventory.staff@example.com', 'role' => 'inventory'],
            'sales' => ['label' => 'Sales staff', 'name' => 'Sales Staff', 'email' => 'sales.staff@example.com', 'role' => 'sales'],
            'hr' => ['label' => 'HR employee', 'name' => 'HR Employee', 'email' => 'hr.employee@example.com', 'role' => 'hr'],
            'subsidy' => ['label' => 'Subsidy staff', 'name' => 'Subsidy Staff', 'email' => 'subsidy.staff@example.com', 'role' => 'subsidy'],
            'field_operations' => ['label' => 'Field operations', 'name' => 'Field Operations Staff', 'email' => 'field.operations@example.com', 'role' => 'field_operations'],
        ];
    }

    private function dashboardRouteFor(Request $request): string
    {
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
