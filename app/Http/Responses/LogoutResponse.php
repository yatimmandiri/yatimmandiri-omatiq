<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Laravel\Fortify\Fortify;

class LogoutResponse implements LogoutResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        // Role-based redirect for generic /logout (Fortify)
        // Coba baca dari cookie last_role yang diset tiap request, fallback ke referer
        $role = null;
        $cookieRoles = $request->cookie('last_roles');
        if ($cookieRoles) {
            try {
                $decoded = json_decode($cookieRoles, true);
                if (is_array($decoded)) {
                    if (in_array('Teacher', $decoded, true)) $role = 'Teacher';
                    elseif (in_array('Administrators', $decoded, true)) $role = 'Administrators';
                    elseif (in_array('Participant', $decoded, true)) $role = 'Participant';
                }
            } catch (\Throwable $e) {}
        }

        if (! $role) {
            $referer = (string) $request->headers->get('referer');
            // Jika dari halaman guru/teacher, anggap Teacher
            if (str_contains($referer, 'teacher') || str_contains($referer, 'guru') || str_contains($referer, 'biodata')) {
                $role = 'Teacher';
            } elseif (str_contains($referer, '/admin')) {
                // admin area → kemungkinan Administrators, cek fallback
                $role = 'Administrators';
            } elseif (str_contains($referer, 'student')) {
                $role = 'Participant';
            }
        }

        if ($role === 'Teacher') {
            return redirect(route('teacher.login'));
        }
        if ($role === 'Administrators') {
            return redirect(route('admin.login'));
        }
        if ($role === 'Participant') {
            return redirect(route('student.login'));
        }

        return redirect(Fortify::redirects('logout', '/'));
    }
}
