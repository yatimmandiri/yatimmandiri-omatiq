<?php

use App\Http\Controllers\Welcome\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('welcome'); // ← kasih nama di sini

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
