<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Trait\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\Social;
use App\Models\Core\User;
use Illuminate\Http\Request;
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

        $user = User::where('email', $response->getEmail())->first();
        $name = $response->getNickname() ?? $response->getName();

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $response->getEmail(),
                'password' => Hash::make(Str::random(8)),
            ])->assignRole('Users');

            $user->socials()->create([
                'provider_id' => $response->getId(),
                'provider' => $provider,
                'provider_token' => $response->token,
                'provider_refresh_token' => $response->refreshToken
            ]);
        }

        $socials = Social::where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();

        if (!$socials) {
            $user->socials()->create([
                'provider_id' => $response->getId(),
                'provider' => $provider,
                'provider_token' => $response->token,
                'provider_refresh_token' => $response->refreshToken
            ]);
        }

        Auth::login($user);

        $user->refresh();
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
