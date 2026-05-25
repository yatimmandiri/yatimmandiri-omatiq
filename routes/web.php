<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin/dashboard')->name('home');

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
