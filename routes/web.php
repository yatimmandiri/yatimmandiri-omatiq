<?php

use App\Http\Controllers\Home\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/programs', [PageController::class, 'programs'])->name('programs.index');
Route::get('/programs/{slug}', [PageController::class, 'programShow'])->name('programs.show');
Route::get('/news', [PageController::class, 'news'])->name('news.index');
Route::get('/news/{slug}', [PageController::class, 'newsShow'])->name('news.show');
Route::get('/berita', [PageController::class, 'berita'])->name('berita.index');
Route::get('/berita/{slug}', [PageController::class, 'beritaShow'])->name('berita.show');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
