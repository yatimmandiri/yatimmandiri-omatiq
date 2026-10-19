<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Student\ParticipantPaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Routes — /student/*
|--------------------------------------------------------------------------
| Dashboard & Fitur Peserta / Student.
| Guard: auth + verified
| Login student ada di routes/auth.php (student/login)
*/

Route::prefix('student')->as('student.')->middleware(['auth', 'verified'])->group(function () {
    Route::redirect('/', '/student/dashboard')->name('index');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('payment-proof', [ParticipantPaymentController::class, 'uploadProof'])->name('payment-proof');
});
