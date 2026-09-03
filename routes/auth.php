<?php

use App\Http\Controllers\Auth\GuruAuthController;
use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->as('auth.')->group(function () {
    Route::get('/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('redirect');
    Route::get('/{provider}/callback', [SocialiteController::class, 'callback'])->name('callback');
    Route::get('/guru/{provider}/redirect', [SocialiteController::class, 'redirectGuru'])->name('guru.redirect');
    Route::get('/guru/{provider}/callback', [SocialiteController::class, 'callbackGuru'])->name('guru.callback');
});

Route::middleware('guest')->group(function () {
    Route::get('guru/login', [GuruAuthController::class, 'create'])->name('guru.login');
    Route::post('guru/login', [GuruAuthController::class, 'store'])->name('guru.login.store')->middleware('throttle:5,1');
    Route::get('guru/verify-otp', [GuruAuthController::class, 'showOtpForm'])->name('guru.verify');
    Route::post('guru/verify-otp', [GuruAuthController::class, 'verify'])->name('guru.verify.store')->middleware('throttle:5,1');
    Route::post('guru/resend-otp', [GuruAuthController::class, 'resend'])->name('guru.resend')->middleware('throttle:3,1');
});
Route::middleware('auth')->group(function () {
    Route::get('guru/complete-profile', [GuruAuthController::class, 'completeProfile'])->name('guru.profile.edit');
    Route::put('guru/complete-profile', [GuruAuthController::class, 'updateProfile'])->name('guru.profile.update');
    Route::post('guru/logout', [GuruAuthController::class, 'destroy'])->name('guru.logout');
});
