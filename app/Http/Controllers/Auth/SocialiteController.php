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
        // Simpan halaman asal login agar jika gagal/belum terdaftar bisa redirect kembali ke form yang sama
        $referer = $request->headers->get('referer');
        if ($referer && (str_contains($referer, '/admin') || str_contains($referer, '/teacher') || str_contains($referer, '/student') || str_contains($referer, '/login'))) {
            $request->session()->put('oauth_origin_url', $referer);
        }

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
        $originUrl = $request->session()->pull('oauth_origin_url', route('login'));

        if ($email === '') {
            return redirect()->to($originUrl)
                ->with('error', 'Akun Google tidak memiliki alamat email.')
                ->withErrors(['email' => 'Akun Google tidak memiliki alamat email.']);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $errorMessage = "Akun dengan email {$email} belum terdaftar. Silakan daftarkan akun Anda terlebih dahulu saat periode pendaftaran dibuka.";

            return redirect()->to($originUrl)
                ->with('error', $errorMessage)
                ->withErrors(['email' => $errorMessage]);
        }

        // Khusus Guru: Cek apakah guru sudah menyelesaikan registrasi profil awal
        if ($user->hasRole('Teacher') && $user->needsTeacherProfileCompletion()) {
            $guruError = "Akun guru {$email} belum melengkapi profil. Silakan login pertama kali menggunakan No. HP & password/OTP.";

            return redirect()->route('teacher.login')
                ->with('error', $guruError)
                ->withErrors(['email' => $guruError]);
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

        if ($user->hasRole('Teacher') && $user->penyaluran_token) {
            $request->session()->put('penyaluran_token', $user->penyaluran_token);
            if ($user->penyaluran_id) {
                $request->session()->put('penyaluran_id', $user->penyaluran_id);
            }
        }

        $this->logSuccess('login-user-google', "Login via Google: {$user->email}", [
            'user_id' => $user->id,
            'provider' => $provider,
        ]);

        if ($user->hasRole('Teacher')) {
            return redirect()->intended(route('teacher.dashboard', absolute: false));
        }

        if ($user->hasRole('Participant') || $user->hasRole('Student')) {
            return redirect()->intended(route('student.dashboard', absolute: false));
        }

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }
}
