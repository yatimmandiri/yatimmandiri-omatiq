<?php

use App\Http\Controllers\Admin\Settings\SiteSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Settings Routes — /settings/*
|--------------------------------------------------------------------------
| Nama route memakai prefix `admin.` (as('admin.')) tanpa prefix URL,
| jadi URL tetap /settings/profile (nama admin.profile.edit) — sesuai
| konvensi AGENTS.md. Semua butuh auth + teacher.profile.completed;
| sebagian butuh verified.
*/

Route::middleware(['auth', 'teacher.profile.completed'])->as('admin.')->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Tiptap editor uploads (dipakai di SiteSettings & konten lain)
    Route::post('upload-image', [SiteSettingsController::class, 'editorUploadFile'])->name('uploadfiles');
    Route::post('delete-image', [SiteSettingsController::class, 'editorDeleteFile'])->name('deletefiles');

    // Profile — tanpa verified (agar user bisa melengkapi)
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Verified-only
    Route::middleware('verified')->group(function () {
        Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');
        Route::put('settings/password', [SecurityController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');

        Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    });
});
