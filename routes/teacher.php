<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Company\ParticipantCardController;
use App\Http\Controllers\Teacher\AbsensiController;
use App\Http\Controllers\Teacher\BinaanController;
use App\Http\Controllers\Teacher\BiodataController;
use App\Http\Controllers\Teacher\DataPesertaController;
use App\Http\Controllers\Teacher\SanggarController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Teacher Routes — /teacher/*
|--------------------------------------------------------------------------
| Portal khusus guru: Dashboard, Biodata, Data Peserta, Data Binaan,
| Data Sanggar, dan Absensi.
| Guard: auth + verified (bypass for Teacher) + teacher.profile.completed + role:Teacher
*/

Route::prefix('teacher')->as('teacher.')->middleware(['auth', 'verified', 'teacher.profile.completed', 'role:Teacher'])->group(function () {
    Route::redirect('/', '/teacher/dashboard')->name('index');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Biodata guru — kelengkapan & update
    Route::get('biodata', [BiodataController::class, 'edit'])->name('biodata.edit');
    Route::put('biodata', [BiodataController::class, 'update'])->name('biodata.update');

    // Data Peserta (Pendaftaran Binaan ke Olimpiade oleh Guru)
    Route::get('data-peserta/{participant}/card', [ParticipantCardController::class, 'print'])->name('data-peserta.card');
    Route::get('data-peserta/data', [DataPesertaController::class, 'getData'])->name('data-peserta.data');
    Route::resource('data-peserta', DataPesertaController::class)
        ->parameters(['data-peserta' => 'participant'])
        ->only(['index', 'create', 'store', 'show', 'destroy']);

    // Data Binaan (Roster Santri Binaan Penyaluran)
    Route::get('data-binaan/data', [BinaanController::class, 'getData'])->name('data-binaan.data');
    Route::resource('data-binaan', BinaanController::class)
        ->parameters(['data-binaan' => 'binaan']);

    // Data Sanggar (Daftar Sanggar Penyaluran)
    Route::get('data-sanggar/data', [SanggarController::class, 'getData'])->name('data-sanggar.data');
    Route::get('data-sanggar/{sanggar}', [SanggarController::class, 'show'])->name('data-sanggar.show');
    Route::get('data-sanggar', [SanggarController::class, 'index'])->name('data-sanggar.index');

    // Sync Penyaluran Data
    Route::post('sync-penyaluran', [BinaanController::class, 'syncPenyaluran'])->name('sync-penyaluran');

    // Absensi
    Route::get('absensi', [AbsensiController::class, 'index'])->name('absensi.index');
});
