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
            && ! $request->routeIs('teacher.profile.*')
            && ! $request->routeIs('teacher.logout')
        ) {
            return redirect()->route('teacher.profile.edit');
        }

        return $next($request);
    }
}
