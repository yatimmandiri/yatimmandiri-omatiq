<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Jika sudah login, semua akses ke halaman guest (login) langsung ke dashboard terpadu.
     * Bukan ke home ("/") agar sesuai ketentuan: sudah login → dashboard.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                if ($user?->hasRole('Teacher')) {
                    return redirect()->route('teacher.dashboard');
                }
                if ($user?->hasRole('Participant')) {
                    return redirect()->route('student.dashboard');
                }

                return redirect()->route('admin.dashboard');
            }
        }

        return $next($request);
    }
}
