<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return redirect('login');
        }

        $userRole = $request->user()->role;
        
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access'
        ], 403);
    }
} 