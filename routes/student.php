<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Routes — /student/*
|--------------------------------------------------------------------------
| Dashboard unified di /admin/dashboard (role-based).
| Login student ada di routes/auth.php (student/login)
| File ini dipertahankan untuk future student-specific routes.
| Dashboard legacy /student/dashboard di-redirect ke /admin/dashboard.
*/

Route::prefix('student')->as('student.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => redirect('/admin/dashboard', 301))->name('dashboard');
});
