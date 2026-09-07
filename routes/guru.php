<?php

use App\Http\Controllers\Guru\BiodataController;
use App\Http\Controllers\Guru\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Guru Routes — /guru/*
|--------------------------------------------------------------------------
| Dashboard Guru terpisah dari admin/dashboard.
| Guard: auth + verified (Teacher bypass via hasVerifiedEmail) + role:Teacher + guru.profile.completed
| Login guru ada di routes/auth.php (guru/login)
*/

Route::prefix('guru')->as('guru.')->middleware(['auth', 'verified', 'guru.profile.completed', 'role:Teacher'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Biodata guru — kelengkapan & update
    Route::get('biodata', [BiodataController::class, 'edit'])->name('biodata.edit');
    Route::put('biodata', [BiodataController::class, 'update'])->name('biodata.update');
});
