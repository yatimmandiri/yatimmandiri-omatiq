<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentAuthController extends Controller
{
    use LogActivity;

    public function create(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('auth/student-login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            return back()->withErrors(['email' => 'Email atau password salah.']);
        }

        $request->session()->regenerate();

        $user = $request->user();

        // Student dashboard: boleh Participant (peserta umum) atau User binaan yang punya Student terhubung
        // Untuk sekarang cek role Participant; fallback cek hasParticipant()
        $isStudent = $user->hasRole('Participant') || $user->hasRole('Student') || $user->participant()->exists();

        if (! $isStudent && ! $user->hasRole('Users')) {
            // Jika bukan participant/users, tetap tolak jika admin/teacher coba login via student portal
            if ($user->hasRole('Administrators') || $user->hasRole('Teacher')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors(['email' => 'Akun Anda bukan Student. Gunakan login sesuai role.']);
            }
        }

        // Jika role masih Users tapi belum punya participant, izinkan masuk (akan lihat empty state)
        $this->logSuccess('login-student', "Login Student: {$user->email}", ['user_id' => $user->id]);

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('student.login');
    }
}
