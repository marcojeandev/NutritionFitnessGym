<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle($request, $next)
    {
        if (!auth('sanctum')->check() || !auth('sanctum')->user()->isStaff()) {
            abort(403, 'Admin access only.');
        }
        return $next($request);
    }
}
