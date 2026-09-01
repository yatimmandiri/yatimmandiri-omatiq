<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacherProfileCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user?->needsTeacherProfileCompletion()
            && ! $request->routeIs('guru.profile.*')
            && ! $request->routeIs('guru.logout')
        ) {
            return redirect()->route('guru.profile.edit');
        }

        return $next($request);
    }
}
