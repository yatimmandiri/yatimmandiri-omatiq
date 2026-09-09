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
    // GET login boleh diakses guest maupun auth — controller yang redirect ke dashboard jika sudah login (bukan ke home)
    Route::get('login', [AdminAuthController::class, 'create'])->name('admin.login');
    Route::middleware('guest')->group(function () {
        Route::post('login', [AdminAuthController::class, 'store'])->name('admin.login.store')->middleware('throttle:5,1');
    });
    Route::middleware('auth')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'destroy'])->name('admin.logout');
    });
});

// ---------------------------------------------------------------------
// Teacher Auth — prefix teacher/*
// ---------------------------------------------------------------------

Route::prefix('teacher')->group(function () {
    Route::get('login', [GuruAuthController::class, 'create'])->name('teacher.login');

    Route::middleware('guest')->group(function () {
        Route::get('google/redirect', [GuruAuthController::class, 'redirectToGoogle'])->name('teacher.google.redirect');
        Route::post('login', [GuruAuthController::class, 'store'])->name('teacher.login.store')->middleware('throttle:5,1');
        Route::get('verify-otp', [GuruAuthController::class, 'showOtpForm'])->name('teacher.verify');
        Route::post('verify-otp', [GuruAuthController::class, 'verify'])->name('teacher.verify.store')->middleware('throttle:5,1');
        Route::post('resend-otp', [GuruAuthController::class, 'resend'])->name('teacher.resend')->middleware('throttle:3,1');
    });

    Route::middleware('auth')->group(function () {
        Route::get('complete-profile', [GuruAuthController::class, 'completeProfile'])->name('teacher.profile.edit');
        Route::put('complete-profile', [GuruAuthController::class, 'updateProfile'])->name('teacher.profile.update');
        Route::post('logout', [GuruAuthController::class, 'destroy'])->name('teacher.logout');
    });
});

// ---------------------------------------------------------------------
// Student Auth — prefix student/*
// ---------------------------------------------------------------------
Route::prefix('student')->group(function () {
    // GET login boleh diakses guest maupun auth — controller yang redirect ke dashboard jika sudah login (bukan ke home)
    Route::get('login', [StudentAuthController::class, 'create'])->name('student.login');
    Route::middleware('guest')->group(function () {
        Route::post('login', [StudentAuthController::class, 'store'])->name('student.login.store')->middleware('throttle:5,1');
    });
    Route::middleware('auth')->group(function () {
        Route::post('logout', [StudentAuthController::class, 'destroy'])->name('student.logout');
    });
});
