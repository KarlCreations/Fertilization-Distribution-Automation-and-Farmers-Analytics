<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $isUnassignedDevelopmentUser = $user !== null && $user->role === null && in_array('executive', $roles, true);

        abort_unless($user !== null && ($isUnassignedDevelopmentUser || in_array($user->role, $roles, true)), 403);

        return $next($request);
    }
}
