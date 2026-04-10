<?php

use App\Http\Controllers\Auth\SocialiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::get('/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
    Route::get('/{provider}/callback', [SocialiteController::class, 'callback'])->name('google.callback');
});
