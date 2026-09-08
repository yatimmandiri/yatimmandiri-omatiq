<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\Social;
use App\Models\Core\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    use LogActivity;

    public function redirect(Request $request, string $provider)
    {
        $redirectUrl = config('services.google.redirect');
        $driver = Socialite::driver($provider);
        if (method_exists($driver, 'redirectUrl') && $redirectUrl) {
            $driver->redirectUrl($redirectUrl);
        }

        return $driver->redirect();
    }

    public function callback(Request $request, string $provider)
    {
        $redirectUrl = config('services.google.redirect');
        $driver = Socialite::driver($provider);
        if (method_exists($driver, 'redirectUrl') && $redirectUrl) {
            $driver->redirectUrl($redirectUrl);
        }
        $socialUser = $driver->user();

        $email = strtolower(trim((string) $socialUser->getEmail()));
        $providerId = (string) $socialUser->getId();

        if ($email === '') {
            return redirect()->route('login')->withErrors([
                'email' => 'Akun Google tidak memiliki email.',
            ]);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'email' => 'Akun dengan email '.$email.' belum terdaftar.',
            ]);
        }

        Social::updateOrCreate(
            [
                'provider' => $provider,
                'provider_id' => $providerId,
            ],
            [
                'user_id' => $user->id,
            ]
        );

        Auth::login($user);
        $request->session()->regenerate();
        $user->load('roles');

        $this->logSuccess('login-user-google', "Login via Google: {$user->email}", [
            'user_id' => $user->id,
            'provider' => $provider,
        ]);

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    public function redirectGuru(Request $request, string $provider)
    {
        $redirectUrl = config('services.google.redirect_guru') ?? route('auth.guru.callback', ['provider' => $provider]);

        return Socialite::driver($provider)->redirectUrl($redirectUrl)->redirect();
    }

    public function callbackGuru(Request $request, string $provider)
    {
        $redirectUrl = config('services.google.redirect_guru') ?? route('auth.guru.callback', ['provider' => $provider]);
        $socialUser = Socialite::driver($provider)->redirectUrl($redirectUrl)->user();

        $email = strtolower(trim((string) $socialUser->getEmail()));
        $providerId = (string) $socialUser->getId();

        if ($email === '') {
            return redirect()->route('guru.login')->withErrors([
                'email' => 'Akun Google tidak memiliki email.',
            ]);
        }

        $teacher = User::where('email', $email)->first();

        if (! $teacher || ! $teacher->hasRole('Teacher')) {
            return redirect()->route('guru.login')->withErrors([
                'email' => 'Akun guru dengan email '.$email.' tidak ditemukan. Silakan login dengan nomor HP terlebih dahulu.',
            ]);
        }

        if ($teacher->needsTeacherProfileCompletion()) {
            return redirect()->route('guru.login')->withErrors([
                'email' => 'Akun guru '.$email.' belum melengkapi profil. Silakan login dengan nomor HP terlebih dahulu.',
            ]);
        }

        Social::updateOrCreate(
            [
                'provider' => $provider,
                'provider_id' => $providerId,
            ],
            [
                'user_id' => $teacher->id,
            ]
        );

        Auth::login($teacher);
        $request->session()->regenerate();

        if ($teacher->penyaluran_token) {
            $request->session()->put('penyaluran_token', $teacher->penyaluran_token);
            if ($teacher->penyaluran_id) {
                $request->session()->put('penyaluran_id', $teacher->penyaluran_id);
            }
        }

        $this->logSuccess('login-guru-google', "Login Guru via Google: {$teacher->email}", [
            'user_id' => $teacher->id,
            'provider' => $provider,
        ]);

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
