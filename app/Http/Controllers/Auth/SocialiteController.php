<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    use LogActivity;

    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        $response = Socialite::driver($provider)->user();

        $email = $response->getEmail();

        $user = User::firstOrCreate(
            [
                'email' => $email,
            ],
            [
                'name' => $response->getNickname() ?? $response->getName(),
                'password' => Hash::make(Str::random(8)),
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

        $user->load('roles');

        if ($user) {
            $this->logSuccess('login-user', "Login User: {$user->name}", [
                'user_id' => $user->id,
            ]);
        } else {
            $this->logError('login-user', "Failed to log    in user: {$user->name}", [
                'user_id' => $user->id,
            ]);
        }

        return redirect()->intended(route('admin.dashboard', absolute: false))->with('success', 'You are logged in!');
    }
}
