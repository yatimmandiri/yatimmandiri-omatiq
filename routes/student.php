<?php

use App\Http\Controllers\Student\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Routes — /student/*
|--------------------------------------------------------------------------
| Dashboard Student terpisah dari admin/dashboard.
| Guard: auth + verified + role:Participant (atau Users dengan participant)
| Login student ada di routes/auth.php (student/login)
*/

Route::prefix('student')->as('student.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
