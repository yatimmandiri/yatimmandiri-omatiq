<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\GuruAuthController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Auth\StudentAuthController;
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
// Admin Auth — prefix admin/*  (login admin terpisah)
// ---------------------------------------------------------------------
Route::prefix('admin')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [AdminAuthController::class, 'create'])->name('admin.login');
        Route::post('login', [AdminAuthController::class, 'store'])->name('admin.login.store')->middleware('throttle:5,1');
    });
    Route::middleware('auth')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'destroy'])->name('admin.logout');
    });
});

// ---------------------------------------------------------------------
// Guru Auth — prefix guru/*
// ---------------------------------------------------------------------
Route::prefix('guru')->group(function () {
    // Guest — login + OTP (throttled) + Google OAuth (single GOOGLE_REDIRECT_URI, diarahkan sesuai role)
    Route::middleware('guest')->group(function () {
        // Login Google Guru — set intent guru lalu redirect ke GOOGLE_REDIRECT_URI tunggal (/auth/google/callback)
        // Callback ditangani terpusat di SocialiteController@callback dengan branch role
        Route::get('google/redirect', [GuruAuthController::class, 'redirectToGoogle'])->name('guru.google.redirect');

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

// ---------------------------------------------------------------------
// Student Auth — prefix student/*
// ---------------------------------------------------------------------
Route::prefix('student')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [StudentAuthController::class, 'create'])->name('student.login');
        Route::post('login', [StudentAuthController::class, 'store'])->name('student.login.store')->middleware('throttle:5,1');
    });
    Route::middleware('auth')->group(function () {
        Route::post('logout', [StudentAuthController::class, 'destroy'])->name('student.logout');
    });
});
