<?php

use App\Http\Controllers\Guru\BiodataController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Teacher Routes — /teacher/* (primary)
|--------------------------------------------------------------------------
| Biodata Teacher. Dashboard unified di /admin/dashboard (role-based).
| Guard: auth + verified (Teacher bypass via hasVerifiedEmail) + role:Teacher + teacher.profile.completed
| Login teacher ada di routes/auth.php (teacher/login)
*/

Route::prefix('teacher')->as('teacher.')->middleware(['auth', 'verified', 'teacher.profile.completed', 'role:Teacher'])->group(function () {
    // Biodata guru — kelengkapan & update (URL konsisten /teacher/biodata)
    Route::get('biodata', [BiodataController::class, 'edit'])->name('biodata.edit');
    Route::put('biodata', [BiodataController::class, 'update'])->name('biodata.update');
});
