<?php

use App\Http\Controllers\Auth\GuruAuthController;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
| Socialite OAuth (guest) + Guru phone-auth (Penyaluran).
| Fortify (login/register/password/2FA/email-verify) diregistrasi
| otomatis oleh FortifyServiceProvider — tidak didefinisikan di sini.
*/

// ---------------------------------------------------------------------
// Socialite OAuth — prefix auth/*
// ---------------------------------------------------------------------
Route::prefix('auth')->as('auth.')->group(function () {
    Route::get('/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('redirect');
    Route::get('/{provider}/callback', [SocialiteController::class, 'callback'])->name('callback');
});

// ---------------------------------------------------------------------
// Guru Auth — prefix guru/*
// ---------------------------------------------------------------------
Route::prefix('guru')->group(function () {
    // Guest — login + OTP (throttled) + Google OAuth (hanya Teacher completed)
    Route::middleware('guest')->group(function () {
        // Login Google Guru — bind ke email real (bukan @penyaluran.local placeholder)
        Route::get('google/redirect', [GuruAuthController::class, 'redirectToGoogle'])->name('guru.google.redirect');
        Route::get('google/callback', [GuruAuthController::class, 'handleGoogleCallback'])->name('guru.google.callback');

        Route::get('login', [GuruAuthController::class, 'create'])->name('guru.login');
        Route::post('login', [GuruAuthController::class, 'store'])->name('guru.login.store')->middleware('throttle:5,1');

        // OTP scaffold (aktif saat PENYALURAN_OTP_ENABLED=true)
        Route::get('verify-otp', [GuruAuthController::class, 'showOtpForm'])->name('guru.verify');
        Route::post('verify-otp', [GuruAuthController::class, 'verify'])->name('guru.verify.store')->middleware('throttle:5,1');
        Route::post('resend-otp', [GuruAuthController::class, 'resend'])->name('guru.resend')->middleware('throttle:3,1');
    });

    // Auth — complete-profile wajib Teacher incomplete + logout
    Route::middleware('auth')->group(function () {
        Route::get('complete-profile', [GuruAuthController::class, 'completeProfile'])->name('guru.profile.edit');
        Route::put('complete-profile', [GuruAuthController::class, 'updateProfile'])->name('guru.profile.update');
        Route::post('logout', [GuruAuthController::class, 'destroy'])->name('guru.logout');
    });
});
