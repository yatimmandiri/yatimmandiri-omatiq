<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Models\Company\Student;
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
            return back()->withErrors(['phone' => $e->getMessage() ?: 'Gagal login guru. Silakan periksa kembali nomor HP Anda atau coba beberapa saat lagi.'])->withInput();
        }

        try {
            $profile = $this->penyaluran->me($token);
        } catch (\Throwable $e) {
            return back()->withErrors(['phone' => $e->getMessage() ?: 'Gagal mengambil data profil guru dari server Penyaluran.'])->withInput();
        }

        $teacherData = $profile['teacher'] ?? $profile['data']['teacher'] ?? $profile;
        $penyaluranId = $teacherData['id'] ?? $profile['id'] ?? null;
        $penyaluranCode = $teacherData['code'] ?? $profile['code'] ?? null;
        $penyaluranName = $teacherData['name'] ?? $profile['name'] ?? null;
        $penyaluranEmail = $teacherData['email'] ?? $profile['email'] ?? null;
        $guruBranch = $teacherData['kantor_name'] ?? $profile['kantor_name'] ?? $profile['sanggars'][0]['kantor_name'] ?? null;

        if (! $penyaluranId) {
            return back()->withErrors(['phone' => 'Data profil guru dari Penyaluran tidak lengkap. Silakan hubungi admin.'])->withInput();
        }

        // 1. Search for existing teacher candidates by priority:
        // Priority 1: penyaluran_code (unique official code)
        // Priority 2: penyaluran_id
        // Priority 3: phone (only matching same teacher name token)
        // Priority 4: official email
        $cleanPhone = preg_replace('/\D+/', '', $phone);
        $trimmed62 = preg_replace('/^62/', '', $cleanPhone);
        $firstNameToken = mb_strtolower(explode(' ', trim($penyaluranName ?? ''))[0] ?? '');

        $candidates = User::query()
            ->where(function ($q) use ($penyaluranId, $penyaluranCode, $cleanPhone, $trimmed62, $penyaluranEmail, $firstNameToken) {
                if ($penyaluranCode) {
                    $q->orWhere('penyaluran_code', $penyaluranCode);
                }
                if ($penyaluranId) {
                    $q->orWhere('penyaluran_id', $penyaluranId);
                }
                if ($cleanPhone) {
                    $q->orWhere(function ($phoneQ) use ($cleanPhone, $trimmed62, $firstNameToken) {
                        $phoneQ->where(function ($sq) use ($cleanPhone, $trimmed62) {
                            $sq->where('phone', $cleanPhone)
                                ->orWhere('phone', '0'.$trimmed62)
                                ->orWhere('phone', '62'.$trimmed62)
                                ->orWhere('phone', 'like', '%'.$trimmed62);
                        });
                        // Prevent matching a different teacher who shared this phone number
                        if ($firstNameToken !== '') {
                            $phoneQ->whereRaw('LOWER(name) LIKE ?', ['%'.$firstNameToken.'%']);
                        }
                    });
                }
                if (! empty($penyaluranEmail) && filter_var($penyaluranEmail, FILTER_VALIDATE_EMAIL)) {
                    $q->orWhere('email', strtolower($penyaluranEmail));
                }
            })
            ->withCount(['participants', 'students'])
            ->get();

        $user = null;
        if ($candidates->isNotEmpty()) {
            // Check if any candidate matching this teacher matches the provided password
            $matchingPasswordUser = $candidates->first(fn ($c) => Hash::check($password, $c->password));

            if ($matchingPasswordUser) {
                $user = $matchingPasswordUser;
            } else {
                // Otherwise pick candidate with highest weight (matching code/id, participants, completed profile, official email)
                $user = $candidates->sortByDesc(function ($c) use ($penyaluranCode, $penyaluranId) {
                    return (($penyaluranCode && $c->penyaluran_code === $penyaluranCode) ? 500 : 0)
                        + (($penyaluranId && $c->penyaluran_id == $penyaluranId) ? 200 : 0)
                        + ($c->participants_count * 100)
                        + ($c->students_count * 10)
                        + ($c->teacher_profile_completed_at ? 50 : 0)
                        + (! str_ends_with((string) $c->email, '@penyaluran.local') ? 20 : 0)
                        + ($c->id * 0.001);
                })->first();
            }

            // Consolidate data from other duplicate candidates to this primary user if needed
            $otherDuplicates = $candidates->where('id', '!=', $user->id);
            foreach ($otherDuplicates as $dup) {
                if ($dup->participants_count > 0) {
                    Participant::where('mentor_id', $dup->id)->update(['mentor_id' => $user->id]);
                }
                if ($dup->students_count > 0) {
                    Student::where('mentor_id', $dup->id)->update(['mentor_id' => $user->id]);
                }
                // Release unique keys from duplicate to avoid 1062 duplicate key violation
                if ($dup->penyaluran_id == $penyaluranId || ($penyaluranCode && $dup->penyaluran_code === $penyaluranCode)) {
                    $dup->forceFill([
                        'penyaluran_id' => null,
                        'penyaluran_code' => null,
                    ])->save();
                }
            }
        }

        // Ensure no other conflicting user in DB holds this penyaluran_id or penyaluran_code before updating
        if ($user) {
            if ($penyaluranId) {
                User::where('penyaluran_id', $penyaluranId)
                    ->where('id', '!=', $user->id)
                    ->update(['penyaluran_id' => null]);
            }
            if ($penyaluranCode) {
                User::where('penyaluran_code', $penyaluranCode)
                    ->where('id', '!=', $user->id)
                    ->update(['penyaluran_code' => null]);
            }
        }

        // 2. Email determination: If Penyaluran already has a real unique email, adopt it.
        if (! $user) {
            $initialEmail = 'guru'.$penyaluranId.'@penyaluran.local';
            $teacherProfileCompletedAt = null;

            if (! empty($penyaluranEmail) && filter_var($penyaluranEmail, FILTER_VALIDATE_EMAIL)) {
                if (! User::where('email', strtolower($penyaluranEmail))->exists()) {
                    $initialEmail = strtolower($penyaluranEmail);
                    $teacherProfileCompletedAt = now();
                }
            }

            $user = User::create([
                'name' => $penyaluranName ?? 'Guru '.$penyaluranId,
                'email' => $initialEmail,
                'phone' => $phone,
                'penyaluran_id' => $penyaluranId,
                'penyaluran_code' => $penyaluranCode,
                'password' => Hash::make('password'),
                'teacher_profile_completed_at' => $teacherProfileCompletedAt,
                'email_verified_at' => now(),
            ]);
        } else {
            // If existing user has placeholder email but Penyaluran now provides a real email
            if (str_ends_with((string) $user->email, '@penyaluran.local') && ! empty($penyaluranEmail) && filter_var($penyaluranEmail, FILTER_VALIDATE_EMAIL)) {
                if (! User::where('email', strtolower($penyaluranEmail))->where('id', '!=', $user->id)->exists()) {
                    $user->email = strtolower($penyaluranEmail);
                    $user->teacher_profile_completed_at = now();
                    $user->email_verified_at = now();
                }
            }
        }

        // 3. Sync profile metadata
        $user->forceFill([
            'name' => $penyaluranName ?? $user->name,
            'phone' => $phone,
            'branch' => $guruBranch ?? $user->branch,
            'penyaluran_id' => $penyaluranId,
            'penyaluran_code' => $penyaluranCode ?? $user->penyaluran_code,
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

        // Verify local password (default 'password' until guru updates via complete-profile/settings)
        if (! Hash::check($password, $user->password)) {
            $errorMessage = $user->needsTeacherProfileCompletion()
                ? 'Password salah. Untuk login pertama kali, gunakan password default "password".'
                : 'Password salah. Silakan periksa kembali password Anda atau hubungi admin.';

            return back()->withErrors(['password' => $errorMessage]);
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
        $request->session()->regenerate();
        $request->session()->put('penyaluran_token', $token);
        $request->session()->put('penyaluran_id', $penyaluranId);
        $request->session()->put('penyaluran_me', $profile);
        $request->session()->put('penyaluran_sanggars', $profile['sanggars'] ?? []);
        $request->session()->put('penyaluran_students', $profile['students'] ?? []);

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
                    ->withErrors(['email' => $e->getMessage() ?: 'Gagal memperbarui email di server Penyaluran. Silakan coba beberapa saat lagi.'])
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
        $token = $request->session()->get('penyaluran_token');
        $penyaluranId = $request->session()->get('penyaluran_id');
        $request->session()->forget('otp_user_id');
        $request->session()->regenerate();

        if ($token) {
            $request->session()->put('penyaluran_token', $token);
            if ($penyaluranId) {
                $request->session()->put('penyaluran_id', $penyaluranId);
            }
            try {
                $profile = app(PenyaluranService::class)->me($token);
                $request->session()->put('penyaluran_me', $profile);
                $request->session()->put('penyaluran_sanggars', $profile['sanggars'] ?? []);
                $request->session()->put('penyaluran_students', $profile['students'] ?? []);
            } catch (\Throwable $e) {
            }
        }

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
        $request->session()->forget([
            'penyaluran_token',
            'penyaluran_id',
            'penyaluran_me',
            'penyaluran_sanggars',
            'penyaluran_students',
            'otp_user_id',
        ]);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('teacher.login');
    }
}
