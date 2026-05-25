<?php

use App\Http\Controllers\Admin\Settings\SiteSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->prefix('admin')->as('admin.')->group(function () {
    Route::prefix('settings')->as('settings.')->group(function () {
        Route::get('site', [SiteSettingsController::class, 'edit'])->name('site.edit');
        Route::put('site', [SiteSettingsController::class, 'update'])->name('site.update');
    });

    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [SecurityController::class, 'edit'])->name('security.edit');
    Route::put('settings/password', [SecurityController::class, 'update'])->name('security.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');
});

// Route::middleware(['auth'])->group(function () {
//     Route::redirect('settings', '/settings/profile');

//     Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
// });

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

//     Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

//     Route::put('settings/password', [SecurityController::class, 'update'])
//         ->middleware('throttle:6,1')
//         ->name('user-password.update');

//     Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
// });
