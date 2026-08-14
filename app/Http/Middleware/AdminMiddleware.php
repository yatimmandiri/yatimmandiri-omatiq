<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (Auth::check() && $user->hasRole('Users') && ! $user->hasRole('Participant') && ! $user->hasRole('Teacher')) {
            abort(403, 'User does not have the right roles.');
        }

        return $next($request);
    }
}
