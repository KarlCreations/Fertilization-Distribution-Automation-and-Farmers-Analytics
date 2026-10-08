<?php

namespace App\Http\Controllers;

use App\Services\WorkspaceNotificationFeed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markRead(Request $request, WorkspaceNotificationFeed $notificationFeed, int $event): RedirectResponse
    {
        $notificationFeed->markRead($request->user(), $event);

        return back();
    }

    public function markAllRead(Request $request, WorkspaceNotificationFeed $notificationFeed): RedirectResponse
    {
        $notificationFeed->markAllRead($request->user());

        return back();
    }
}
