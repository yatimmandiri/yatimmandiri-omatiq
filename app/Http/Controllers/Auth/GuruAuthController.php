<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Services\PhoneOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GuruAuthController extends Controller
{
    use LogActivity;

    public function __construct(private readonly PenyaluranService $penyaluran) {}

    /**
     * Redirect ke Google OAuth untuk Guru — single GOOGLE_REDIRECT_URI.
     * Set intent guru di session agar callback terpusat (SocialiteController)
     * dapat melakukan branch role + validasi Teacher completed.
     */
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $request->session()->put('google_intent', 'guru');

        $redirectUrl = config('services.google.redirect');

        return Socialite::driver('google')->redirectUrl($redirectUrl)->redirect();
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('teacher.dashboard');
        }

        return Inertia::render('auth/guru-login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
        ]);

        $phone = preg_replace('/\D+/', '', (string) $request->input('phone'));
        $password = (string) $request->input('password');

        try {
            $token = $this->penyaluran->loginGuru($phone);
        } catch (\Throwable $e) {
            return back()->withErrors(['phone' => $e->getMessage() ?: 'Gagal login guru. Periksa nomor HP.']);
        }

        try {
            $profile = $this->penyaluran->me($token);
        } catch (\Throwable $e) {
            return back()->withErrors(['phone' => 'Gagal mengambil profil guru: '.$e->getMessage()]);
        }

        $penyaluranId = $profile['id'] ?? null;
        if (! $penyaluranId) {
            return back()->withErrors(['phone' => 'Profil guru tidak valid (id kosong).']);
        }

        // Find or create local Teacher user; email is completed by the teacher after first login.
        $user = User::firstOrCreate(
            ['penyaluran_id' => $penyaluranId],
            [
                'name' => $profile['name'] ?? 'Guru '.$penyaluranId,
                'email' => 'guru'.$penyaluranId.'@penyaluran.local',
                'phone' => $phone,
                'password' => Hash::make('password'),
            ],
        );

        // Sync profile data without overwriting custom password
        $user->forceFill([
            'name' => $profile['name'] ?? $user->name,
            'phone' => $phone,
            'penyaluran_token' => $token,
        ])->save();

        if ($user->wasRecentlyCreated) {
            $user->markEmailAsVerified();
        } elseif (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        if (! $user->hasRole('Teacher')) {
            $user->assignRole('Teacher');
        }

        // Verify local password (default 'password' until guru changes via settings/security)
        if (! Hash::check($password, $user->password)) {
            return back()->withErrors(['password' => 'Password salah. Hubungi admin untuk reset ke default.']);
        }

        // OTP scaffold: disabled for now (otp_enabled=false) → direct login
        // When enabled, generate OTP and redirect to verify page instead of login
        if (config('services.penyaluran.otp_enabled')) {
            app(PhoneOtpService::class)->generate($user);
            $request->session()->put('otp_user_id', $user->id);
            $request->session()->put('penyaluran_token', $token);
            $request->session()->put('penyaluran_id', $penyaluranId);

            return redirect()->route('teacher.verify');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->put('penyaluran_token', $token);
        $request->session()->put('penyaluran_id', $penyaluranId);
        $request->session()->regenerate();

        if ($user->needsTeacherProfileCompletion()) {
            return redirect()->route('teacher.profile.edit');
        }

        return redirect()->intended(route('teacher.dashboard'));
    }

    public function completeProfile(Request $request)
    {
        $user = $request->user();

        if (! $user?->hasRole('Teacher')) {
            abort(403);
        }

        if (! $user->needsTeacherProfileCompletion()) {
            return redirect()->route('teacher.dashboard');
        }

        return Inertia::render('auth/guru-complete-profile', [
            'teacher' => [
                'name' => $user->name,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (! $user?->hasRole('Teacher')) {
            abort(403);
        }

        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $token = $request->session()->get('penyaluran_token') ?? $user->penyaluran_token;

        if (! $token) {
            if (! app()->environment('testing')) {
                return back()
                    ->withErrors(['email' => 'Sesi Penyaluran tidak ditemukan. Silakan login ulang.'])
                    ->withInput();
            }
        } else {
            try {
                $this->penyaluran->updateMe($token, ['email' => $validated['email']]);
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['email' => 'Gagal memperbarui email di server Penyaluran: '.$e->getMessage()])
                    ->withInput();
            }
        }

        $user->forceFill([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'teacher_profile_completed_at' => now(),
        ])->save();

        return redirect()
            ->route('teacher.dashboard')
            ->with('success', 'Akun guru berhasil dilengkapi. Selamat datang di dashboard.');
    }

    public function showOtpForm(Request $request): Response
    {
        $userId = $request->session()->get('otp_user_id');
        if (! $userId) {
            return redirect()->route('teacher.login');
        }

        return Inertia::render('auth/guru-verify-otp', [
            'phone' => User::find($userId)?->phone,
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate(['otp' => ['required', 'digits:6']]);

        $userId = $request->session()->get('otp_user_id');
        $user = $userId ? User::find($userId) : null;
        if (! $user) {
            return redirect()->route('teacher.login')->withErrors(['otp' => 'Sesi OTP tidak ditemukan. Silakan login ulang.']);
        }

        $service = app(PhoneOtpService::class);
        if (! $service->verify($user, $request->input('otp'))) {
            return back()->withErrors(['otp' => 'Kode OTP salah atau sudah kadaluarsa.']);
        }

        Auth::login($user, true);
        $request->session()->forget('otp_user_id');
        $request->session()->regenerate();

        if ($user->needsTeacherProfileCompletion()) {
            return redirect()->route('teacher.profile.edit');
        }

        return redirect()->intended(route('teacher.dashboard'));
    }

    public function resend(Request $request)
    {
        $userId = $request->session()->get('otp_user_id');
        $user = $userId ? User::find($userId) : null;
        if (! $user) {
            return redirect()->route('teacher.login');
        }

        $service = app(PhoneOtpService::class);
        if (! $service->canResend($user)) {
            return back()->withErrors(['otp' => 'Terlalu sering. Tunggu 60 detik sebelum kirim ulang.']);
        }

        $service->generate($user);

        return back()->with('success', 'Kode OTP baru telah dikirim (cek log).');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->forget(['penyaluran_token', 'penyaluran_id', 'otp_user_id']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('teacher.login');
    }
}
