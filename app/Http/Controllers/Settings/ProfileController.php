<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\PenyaluranService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail && ! $user->hasRole('Teacher'),
            'status' => $request->session()->get('status'),
            'isTeacher' => $user?->hasRole('Teacher') ?? false,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($user->hasRole('Teacher')) {
            $payload = [];
            if (isset($validated['name']) && $validated['name'] !== $user->name) {
                $payload['name'] = $validated['name'];
            }
            if (isset($validated['email']) && strtolower((string) $validated['email']) !== strtolower((string) $user->email)) {
                $payload['email'] = strtolower((string) $validated['email']);
            }

            if (! empty($payload)) {
                $token = $request->session()->get('penyaluran_token') ?? $user->penyaluran_token;

                if (! $token) {
                    if (! app()->environment('testing')) {
                        return back()
                            ->withErrors(['email' => 'Sesi Penyaluran tidak ditemukan. Silakan login ulang.'])
                            ->withInput();
                    }
                } else {
                    try {
                        $this->penyaluran->updateMe($token, $payload);
                    } catch (\Throwable $e) {
                        return back()
                            ->withErrors(['email' => 'Gagal memperbarui profil di server Penyaluran: '.$e->getMessage()])
                            ->withInput();
                    }
                }
            }
        }

        $user->fill($validated);

        if ($user->hasRole('Teacher')) {
            if ($user->isDirty('email')) {
                $user->email = strtolower((string) $validated['email']);
                $user->email_verified_at = now();
            }
        } else {
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }
        }

        $user->save();

        return to_route('admin.profile.edit')->with('success', 'Update Profile Successfully.');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasRole('Teacher')) {
            abort(403, 'Akun guru dikelola oleh Penyaluran dan tidak dapat dihapus secara mandiri.');
        }

        Auth::logout();

        $user->delete($user->id);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Delete Your Account Successfully.');
    }
}
