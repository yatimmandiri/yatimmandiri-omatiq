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
        // Coba baca dari cookie last_roles yang diset tiap request, fallback ke referer
        $role = null;
        $cookieRoles = $request->cookie('last_roles');
        if ($cookieRoles) {
            try {
                $decoded = json_decode($cookieRoles, true);
                if (is_array($decoded)) {
                    if (in_array('Teacher', $decoded, true)) {
                        $role = 'Teacher';
                    } elseif (in_array('Administrators', $decoded, true) || in_array('Cabang', $decoded, true)) {
                        $role = 'Administrators';
                    } elseif (in_array('Participant', $decoded, true)) {
                        $role = 'Participant';
                    }
                }
            } catch (\Throwable $e) {
            }
        }

        if (! $role) {
            $referer = (string) $request->headers->get('referer');
            $path = parse_url($referer, PHP_URL_PATH) ?? '';

            // Pastikan pengecekan /admin dilakukan sebelum pattern lain agar path seperti /admin/companies/teachers tidak salah terdeteksi
            if (str_starts_with($path, '/admin') || str_contains($referer, '/admin')) {
                $role = 'Administrators';
            } elseif (str_starts_with($path, '/teacher') || str_starts_with($path, '/guru') || str_contains($referer, 'teacher.login')) {
                $role = 'Teacher';
            } elseif (str_starts_with($path, '/student') || str_contains($referer, 'student.login')) {
                $role = 'Participant';
            }
        }

        if ($role === 'Teacher') {
            return redirect(route('teacher.login'));
        }
        if ($role === 'Administrators') {
            return redirect(route('login'));
        }
        if ($role === 'Participant') {
            return redirect(route('student.login'));
        }

        return redirect(route('login'));
    }
}
