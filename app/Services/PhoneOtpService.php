<?php

namespace App\Services;

use App\Models\Core\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PhoneOtpService
{
    public int $expiryMinutes = 5;

    public int $maxAttempts = 5;

    public int $lockoutMinutes = 15;

    public int $resendCooldownSeconds = 60;

    public int $maxResendsPerHour = 3;

    public function generate(User $user): string
    {
        $otp = (string) random_int(100000, 999999);

        $user->forceFill([
            'phone_otp' => Hash::make($otp),
            'phone_otp_expires_at' => now()->addMinutes($this->expiryMinutes),
            'phone_otp_attempts' => 0,
            'phone_otp_last_sent_at' => now(),
        ])->save();

        // Scaffold: log only, WA integration later
        Log::info('[PhoneOtpService] OTP generated', [
            'user_id' => $user->id,
            'phone' => $user->phone,
            'otp' => $otp, // remove when WA enabled
            'expires_at' => $user->phone_otp_expires_at,
        ]);

        // TODO: integrate WhatsApp API (Fonnte/Wablas) here
        // Http::post(config('services.whatsapp.url'), ['phone'=>$user->phone,'message'=>"Kode OTP OMATIQ: $otp"]);

        return $otp;
    }

    public function verify(User $user, string $otp): bool
    {
        if (! $user->phone_otp || ! $user->phone_otp_expires_at) {
            return false;
        }

        if (now()->greaterThan($user->phone_otp_expires_at)) {
            return false;
        }

        if ($user->phone_otp_attempts >= $this->maxAttempts) {
            // lockout check: if last attempt was within lockout window
            if ($user->phone_otp_last_sent_at && $user->phone_otp_last_sent_at->diffInMinutes(now()) < $this->lockoutMinutes) {
                return false;
            }
            // reset after lockout
            $user->forceFill(['phone_otp_attempts' => 0])->save();
        }

        $user->forceFill(['phone_otp_attempts' => $user->phone_otp_attempts + 1])->save();

        if (! Hash::check($otp, $user->phone_otp)) {
            return false;
        }

        $user->markPhoneAsVerified();

        return true;
    }

    public function canResend(User $user): bool
    {
        if (! $user->phone_otp_last_sent_at) {
            return true;
        }

        if ($user->phone_otp_last_sent_at->diffInSeconds(now()) < $this->resendCooldownSeconds) {
            return false;
        }

        // Simple hourly limit via attempts + last_sent
        // For scaffold, allow 3 per hour — count via cache or just allow if cooldown passed
        return true;
    }
}
