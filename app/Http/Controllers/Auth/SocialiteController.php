<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    use LogActivity;

    public function redirect(Request $request, string $provider)
    {
        // Simpan intent jika ada (?intent=guru|admin|student) untuk membantu callback tentukan pesan error
        // Guru flow sudah set session('google_intent')=guru via GuruAuthController, jadi jangan timpa jika sudah ada
        if ($request->has('intent')) {
            $request->session()->put('google_intent', $request->query('intent'));
        } elseif (! $request->session()->has('google_intent')) {
            $request->session()->forget('google_intent');
        }

        $redirectUrl = config('services.google.redirect');

        return Socialite::driver($provider)->redirectUrl($redirectUrl)->redirect();
    }

    public function callback(Request $request, string $provider)
    {
        $redirectUrl = config('services.google.redirect');
        $response = Socialite::driver($provider)->redirectUrl($redirectUrl)->user();

        $email = strtolower(trim((string) $response->getEmail()));
        $intent = $request->session()->pull('google_intent'); // guru | null

        if ($email === '') {
            return redirect()->route($intent === 'guru' ? 'guru.login' : 'login')->withErrors([
                'email' => 'Akun Google tidak memiliki email.',
            ]);
        }

        $existingUser = User::where('email', $email)->first();

        // Jika intent guru tapi email belum terdaftar sebagai Teacher completed → tolak, jangan auto-create Users
        if ($intent === 'guru' && ! $existingUser) {
            return redirect()->route('guru.login')->withErrors([
                'phone' => 'Akun guru dengan email '.$email.' tidak ditemukan. Silakan login dengan nomor HP terlebih dahulu dan lengkapi profil.',
            ]);
        }

        if ($existingUser && $existingUser->hasRole('Teacher')) {
            // Teacher yang belum complete-profile tidak boleh login via Google (harus pakai HP dulu)
            if ($existingUser->needsTeacherProfileCompletion()) {
                return redirect()->route('guru.login')->withErrors([
                    'phone' => 'Akun guru '.$email.' belum melengkapi profil. Silakan login dengan nomor HP terlebih dahulu.',
                ]);
            }
            // Teacher completed → lanjut sebagai guru (akan di-handle di bawah sebagai $user)
        }

        $user = User::firstOrCreate(
            [
                'email' => $email,
            ],
            [
                'name' => $response->getNickname() ?? $response->getName() ?? 'User',
                'password' => Hash::make(Str::random(16)),
            ]
        );

        if ($user->wasRecentlyCreated) {
            $user->assignRole('Users');
        }

        $user->socials()->updateOrCreate(
            [
                'provider' => $provider,
            ],
            [
                'provider_id' => $response->getId(),
                'provider_token' => $response->token,
                'provider_refresh_token' => $response->refreshToken,
            ]
        );

        Auth::login($user);
        $request->session()->regenerate();
        $user->load('roles');

        // Restore penyaluran session untuk Teacher
        if ($user->hasRole('Teacher') && $user->penyaluran_token) {
            $request->session()->put('penyaluran_token', $user->penyaluran_token);
            if ($user->penyaluran_id) {
                $request->session()->put('penyaluran_id', $user->penyaluran_id);
            }
        }

        if ($user->needsTeacherProfileCompletion()) {
            $this->logSuccess('login-user-google', "Login User via Google (needs complete): {$user->email}", ['user_id' => $user->id]);

            return redirect()->route('guru.profile.edit');
        }

        $this->logSuccess('login-user', "Login User via Google: {$user->email}", [
            'user_id' => $user->id,
            'provider' => $provider,
        ]);

        // Role-based redirect — single GOOGLE_REDIRECT_URI bercabang sesuai role
        if ($user->hasRole('Administrators')) {
            return redirect()->intended(route('admin.dashboard', absolute: false))->with('success', 'Berhasil masuk sebagai Admin via Google.');
        }

        if ($user->hasRole('Teacher')) {
            return redirect()->intended(route('guru.dashboard', absolute: false))->with('success', 'Berhasil masuk sebagai Guru via Google.');
        }

        if ($user->hasRole('Participant')) {
            return redirect()->intended(route('student.dashboard', absolute: false))->with('success', 'Berhasil masuk sebagai Student via Google.');
        }

        // Default Users → home
        return redirect()->intended(route('home.index', absolute: false))->with('success', 'You are logged in!');
    }
}
