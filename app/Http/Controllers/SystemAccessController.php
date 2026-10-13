<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SystemAccessController extends Controller
{
    public function storeUser(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::exists('erp_roles', 'code')],
            'password' => ['required', 'string', 'min:8'],
        ]);

        DB::transaction(function () use ($data, $request): void {
            $now = now();
            $userId = DB::table('users')->insertGetId([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
                'password' => Hash::make($data['password']),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $this->syncRole($userId, $data['role'], $now);
            $this->recordAudit($request, 'created', 'system_users', $userId, ['email' => $data['email'], 'role' => $data['role']], $now);
        });

        return to_route('system-admin')->with('success', 'User account provisioned.');
    }

    public function updateUser(Request $request, int $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'role' => ['required', 'string', Rule::exists('erp_roles', 'code')],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if ($request->user()->id === $user && ! in_array($data['role'], ['executive', 'admin'], true)) {
            throw ValidationException::withMessages([
                'role' => 'Your own account must retain an administrator role.',
            ]);
        }

        DB::transaction(function () use ($data, $request, $user): void {
            abort_if(DB::table('users')->where('id', $user)->doesntExist(), 404);

            $now = now();
            $changes = [
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
                'updated_at' => $now,
            ];

            if (! empty($data['password'])) {
                $changes['password'] = Hash::make($data['password']);
            }

            DB::table('users')->where('id', $user)->update($changes);
            $this->syncRole($user, $data['role'], $now);
            $this->recordAudit($request, 'updated', 'system_users', $user, ['email' => $data['email'], 'role' => $data['role']], $now);
        });

        return to_route('system-admin')->with('success', 'User account updated.');
    }

    public function updateRole(Request $request, int $role): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($data, $request, $role): void {
            abort_if(DB::table('erp_roles')->where('id', $role)->doesntExist(), 404);

            $now = now();
            DB::table('erp_roles')->where('id', $role)->update($data);
            $this->recordAudit($request, 'updated', 'system_roles', $role, $data, $now);
        });

        return to_route('system-admin')->with('success', 'Role updated.');
    }

    private function syncRole(int $userId, string $roleCode, Carbon $now): void
    {
        $roleId = DB::table('erp_roles')->where('code', $roleCode)->value('id');
        DB::table('erp_user_roles')->where('user_id', $userId)->delete();
        DB::table('erp_user_roles')->insert([
            'user_id' => $userId,
            'role_id' => $roleId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function recordAudit(Request $request, string $action, string $module, int $targetId, array $payload, Carbon $now): void
    {
        DB::table('erp_audit_events')->insert([
            'user_id' => $request->user()->id,
            'action' => $action,
            'module' => $module,
            'target_type' => $module === 'system_users' ? 'user' : 'erp_role',
            'target_id' => (string) $targetId,
            'payload' => json_encode($payload, JSON_THROW_ON_ERROR),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
