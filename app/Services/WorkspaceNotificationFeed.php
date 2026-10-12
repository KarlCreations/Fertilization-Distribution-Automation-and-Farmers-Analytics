<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkspaceNotificationFeed
{
    private const ADMIN_ROLES = ['executive', 'admin', 'operations_director'];

    /**
     * @return array{unreadCount: int, items: list<array{id: int, title: string, description: string, href: string, createdAt: string, isRead: bool}>}
     */
    public function forUser(?User $user): array
    {
        if ($user === null) {
            return ['unreadCount' => 0, 'items' => []];
        }

        $unreadCount = $this->visibleEvents($user)
            ->leftJoin('erp_notification_reads', function ($join) use ($user): void {
                $join->on('erp_notification_reads.audit_event_id', '=', 'erp_audit_events.id')
                    ->where('erp_notification_reads.user_id', '=', $user->id);
            })
            ->whereNull('erp_notification_reads.audit_event_id')
            ->count();

        $items = $this->visibleEvents($user)
            ->leftJoin('erp_notification_reads', function ($join) use ($user): void {
                $join->on('erp_notification_reads.audit_event_id', '=', 'erp_audit_events.id')
                    ->where('erp_notification_reads.user_id', '=', $user->id);
            })
            ->orderByDesc('erp_audit_events.id')
            ->limit(12)
            ->get([
                'erp_audit_events.id',
                'erp_audit_events.action',
                'erp_audit_events.module',
                'erp_audit_events.target_id',
                'erp_audit_events.payload',
                'erp_audit_events.created_at',
                'erp_notification_reads.audit_event_id as read_event_id',
            ])
            ->map(fn (object $event): array => [
                'id' => (int) $event->id,
                'title' => $this->title($event->module, $event->action),
                'description' => $this->description($event->module, $event->target_id, $event->action, $event->payload),
                'href' => $this->destination($user, $event->module),
                'createdAt' => (string) $event->created_at,
                'isRead' => $event->read_event_id !== null,
            ])
            ->all();

        return ['unreadCount' => $unreadCount, 'items' => $items];
    }

    public function markRead(User $user, int $eventId): void
    {
        $event = $this->visibleEvents($user)->where('erp_audit_events.id', $eventId)->first();

        if ($event === null) {
            throw new NotFoundHttpException;
        }

        DB::table('erp_notification_reads')->insertOrIgnore([
            'user_id' => $user->id,
            'audit_event_id' => $eventId,
            'read_at' => now(),
        ]);
    }

    public function markAllRead(User $user): void
    {
        $readAt = now();

        $this->visibleEvents($user)
            ->select('erp_audit_events.id')
            ->chunkById(500, function (Collection $events) use ($user, $readAt): void {
                DB::table('erp_notification_reads')->insertOrIgnore(
                    $events->map(fn (object $event): array => [
                        'user_id' => $user->id,
                        'audit_event_id' => $event->id,
                        'read_at' => $readAt,
                    ])->all(),
                );
            }, 'erp_audit_events.id', 'id');
    }

    private function visibleEvents(User $user): Builder
    {
        $modules = $this->modulesForRole($user->role);
        $query = DB::table('erp_audit_events');

        if ($modules !== null) {
            $query->whereIn('erp_audit_events.module', $modules);
        }

        return $query;
    }

    /**
     * @return list<string>|null
     */
    private function modulesForRole(?string $role): ?array
    {
        if ($role === null || in_array($role, self::ADMIN_ROLES, true)) {
            return null;
        }

        return match ($role) {
            'subsidy', 'subsidy_staff', 'field_operations', 'field_operations_staff' => ['farmers', 'subsidy'],
            'inventory', 'inventory_staff' => ['inventory'],
            'sales', 'sales_staff' => ['sales', 'commodities'],
            'finance', 'finance_staff' => ['finance', 'sales', 'subsidy'],
            'hr', 'hr_employee' => ['hr'],
            default => [],
        };
    }

    private function title(?string $module, string $action): string
    {
        $moduleName = match ($module) {
            'farmers' => 'Farmer registry',
            'subsidy' => 'Subsidy quota',
            'inventory' => 'Inventory',
            'sales' => 'Trade contract',
            'commodities' => 'Commodity catalog',
            'hr' => 'Workforce',
            'system_users' => 'User account',
            'system_roles' => 'System role',
            default => 'Workspace',
        };

        $actionName = match ($action) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'deleted',
            'transferred' => 'stock transferred',
            'reconciled' => 'stock reconciled',
            default => 'changed',
        };

        return "{$moduleName} {$actionName}";
    }

    private function description(?string $module, ?string $targetId, string $action, ?string $payload): string
    {
        $details = json_decode($payload ?? '', true);

        if ($module === 'inventory' && $action === 'transferred' && is_array($details)) {
            return sprintf(
                '%s MT moved from depot #%s to depot #%s.',
                $details['quantity'] ?? '0',
                $details['source_depot_id'] ?? '—',
                $details['destination_depot_id'] ?? '—',
            );
        }

        if ($module === 'inventory' && $action === 'reconciled' && is_array($details)) {
            return sprintf(
                'Count adjusted from %s MT to %s MT.',
                $details['previous_qty'] ?? '0',
                $details['counted_qty'] ?? '0',
            );
        }

        $record = $targetId === null ? 'A record' : "Record #{$targetId}";

        return "{$record} in ".str_replace('_', ' ', $module ?? 'workspace').'.';
    }

    private function destination(User $user, ?string $module): string
    {
        $isAdministrator = $user->role === null || in_array($user->role, self::ADMIN_ROLES, true);
        $routeName = match ($module) {
            'farmers', 'subsidy' => $isAdministrator ? 'farmer-registry' : 'farmer-management-dashboard',
            'inventory' => $isAdministrator ? 'inventory-warehouses' : 'inventory-dashboard',
            'sales', 'commodities' => $isAdministrator
                ? 'sales-commodities'
                : (in_array($user->role, ['finance', 'finance_staff'], true) ? 'finance-impact' : 'sales-dashboard'),
            'hr' => $isAdministrator ? 'hr-workforce' : 'hr-dashboard',
            'system_users', 'system_roles' => 'system-admin',
            default => 'dashboard',
        };

        return route($routeName);
    }
}
