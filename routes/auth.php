<?php

use App\Http\Controllers\Auth\GuruAuthController;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->as('auth.')->group(function () {
    Route::get('/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('redirect');
    Route::get('/{provider}/callback', [SocialiteController::class, 'callback'])->name('callback');
});

Route::prefix('guru')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [GuruAuthController::class, 'create'])->name('guru.login');
        Route::post('login', [GuruAuthController::class, 'store'])->name('guru.login.store')->middleware('throttle:5,1');
        Route::get('verify-otp', [GuruAuthController::class, 'showOtpForm'])->name('guru.verify');
        Route::post('verify-otp', [GuruAuthController::class, 'verify'])->name('guru.verify.store')->middleware('throttle:5,1');
        Route::post('resend-otp', [GuruAuthController::class, 'resend'])->name('guru.resend')->middleware('throttle:3,1');
    });

    Route::middleware('auth')->group(function () {
        Route::get('complete-profile', [GuruAuthController::class, 'completeProfile'])->name('guru.profile.edit');
        Route::put('complete-profile', [GuruAuthController::class, 'updateProfile'])->name('guru.profile.update');
        Route::post('logout', [GuruAuthController::class, 'destroy'])->name('guru.logout');
    });
});
