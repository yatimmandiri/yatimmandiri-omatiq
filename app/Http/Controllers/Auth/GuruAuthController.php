<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Services\PhoneOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GuruAuthController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function create(): Response
    {
        return Inertia::render('auth/guru-login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'min:10', 'max:20'],
        ]);

        $phone = preg_replace('/\D+/', '', (string) $request->input('phone'));

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

        $email = $profile['email'] ?? null;
        if (! $email) {
            $email = 'guru'.$penyaluranId.'@penyaluran.local';
        }

        $user = User::updateOrCreate(
            ['penyaluran_id' => $penyaluranId],
            [
                'name' => $profile['name'] ?? 'Guru '.$penyaluranId,
                'email' => $email,
                'phone' => $phone,
                'penyaluran_token' => $token,
                'password' => Hash::make(Str::random(32)),
            ],
        );

        // Ensure token is stored (Hidden) and email verified for Teacher bypass
        $user->forceFill(['penyaluran_token' => $token])->save();
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        if (! $user->hasRole('Teacher')) {
            $user->assignRole('Teacher');
        }

        // OTP scaffold: disabled for now (otp_enabled=false) → direct login
        // When enabled, generate OTP and redirect to verify page instead of login
        if (config('services.penyaluran.otp_enabled')) {
            app(PhoneOtpService::class)->generate($user);
            $request->session()->put('otp_user_id', $user->id);
            $request->session()->put('penyaluran_token', $token);
            $request->session()->put('penyaluran_id', $penyaluranId);

            return redirect()->route('guru.verify');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->put('penyaluran_token', $token);
        $request->session()->put('penyaluran_id', $penyaluranId);
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function verifyForm(Request $request): Response
    {
        $userId = $request->session()->get('otp_user_id');
        if (! $userId) {
            return redirect()->route('guru.login');
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
            return redirect()->route('guru.login')->withErrors(['otp' => 'Sesi OTP tidak ditemukan. Silakan login ulang.']);
        }

        $service = app(PhoneOtpService::class);
        if (! $service->verify($user, $request->input('otp'))) {
            return back()->withErrors(['otp' => 'Kode OTP salah atau sudah kadaluarsa.']);
        }

        Auth::login($user, true);
        $request->session()->forget('otp_user_id');
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function resend(Request $request)
    {
        $userId = $request->session()->get('otp_user_id');
        $user = $userId ? User::find($userId) : null;
        if (! $user) {
            return redirect()->route('guru.login');
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

        return redirect()->route('login');
    }
}
