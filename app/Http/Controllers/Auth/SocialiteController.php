<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\Social;
use App\Models\Core\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    use LogActivity;

    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function redirectGuru(string $provider)
    {
        $redirect = config('services.google.redirect_guru') ?? config('services.google.redirect');

        return Socialite::driver($provider)
            ->redirectUrl($redirect)
            ->redirect();
    }

    public function callbackGuru(string $provider)
    {
        $redirect = config('services.google.redirect_guru') ?? config('services.google.redirect');
        $response = Socialite::driver($provider)->redirectUrl($redirect)->user();

        if (! $response->getEmail() || ! ($response->user['email_verified'] ?? true)) {
            return redirect()->route('guru.login')->withErrors(['email' => 'Email Google belum terverifikasi.']);
        }

        $email = strtolower($response->getEmail());
        $providerId = $response->getId();

        // Already linked?
        if ($social = Social::where('provider', $provider)->where('provider_id', $providerId)->first()) {
            Auth::login($social->user);
            $this->logSuccess('login-user', "Login Guru Google: {$social->user->name}", ['user_id' => $social->user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        $user = User::where('email', $email)->first();

        if ($user && $user->hasRole('Teacher') && ! $user->needsTeacherProfileCompletion()) {
            $user->socials()->updateOrCreate(
                ['provider' => $provider],
                ['provider_id' => $providerId, 'provider_token' => $response->token, 'provider_refresh_token' => $response->refreshToken]
            );
            Auth::login($user);
            $this->logSuccess('login-user', "Login Guru Google: {$user->name}", ['user_id' => $user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        if ($user && str_ends_with($user->email, '@penyaluran.local')) {
            return redirect()->route('guru.login')->withErrors(['email' => 'Lengkapi profil guru via HP dulu sebelum Google login.']);
        }

        return redirect()->route('guru.login')->withErrors(['email' => 'Email Google belum terdaftar sebagai guru. Hubungi admin Penyaluran.']);
    }

    public function callback(string $provider)
    {
        $response = Socialite::driver($provider)->user();

        if (! $response->getEmail() || ! ($response->user['email_verified'] ?? true)) {
            return redirect()->route('login')->withErrors(['email' => 'Email Google belum terverifikasi.']);
        }

        $email = strtolower($response->getEmail());
        $providerId = $response->getId();

        if ($social = Social::where('provider', $provider)->where('provider_id', $providerId)->first()) {
            Auth::login($social->user);
            $social->user->load('roles');
            $this->logSuccess('login-user', "Login User: {$social->user->name}", ['user_id' => $social->user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        $user = User::where('email', $email)->first();

        // Peserta yang sudah daftar
        if ($user && $user->hasRole('Participant')) {
            $user->socials()->updateOrCreate(
                ['provider' => $provider],
                ['provider_id' => $providerId, 'provider_token' => $response->token, 'provider_refresh_token' => $response->refreshToken]
            );
            Auth::login($user);
            $this->logSuccess('login-user', "Login Peserta Google: {$user->name}", ['user_id' => $user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        // Admin only
        if ($user && $user->hasRole('Administrators')) {
            $user->socials()->updateOrCreate(
                ['provider' => $provider],
                ['provider_id' => $providerId, 'provider_token' => $response->token, 'provider_refresh_token' => $response->refreshToken]
            );
            Auth::login($user);
            $this->logSuccess('login-user', "Login Admin Google: {$user->name}", ['user_id' => $user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        if (! $user) {
            $user = User::create([
                'name' => $response->getName() ?? $response->getNickname() ?? explode('@', $email)[0],
                'email' => $email,
                'password' => Hash::make(Str::random(16)),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('Participant');
            $user->socials()->updateOrCreate(
                ['provider' => $provider],
                ['provider_id' => $providerId, 'provider_token' => $response->token, 'provider_refresh_token' => $response->refreshToken]
            );
            Auth::login($user);
            $this->logSuccess('login-user', "Register Peserta Google: {$user->name}", ['user_id' => $user->id]);

            return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
        }

        // Existing user without Participant/Administrators/Teacher -> auto Participant (jwb 1)
        $user->assignRole('Participant');
        $user->socials()->updateOrCreate(
            ['provider' => $provider],
            ['provider_id' => $providerId, 'provider_token' => $response->token, 'provider_refresh_token' => $response->refreshToken]
        );
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }
        Auth::login($user);
        $this->logSuccess('login-user', "Login Peserta Google (auto Participant): {$user->name}", ['user_id' => $user->id]);

        return redirect()->intended(route('admin.dashboard'))->with('success', 'You are logged in!');
    }
}
