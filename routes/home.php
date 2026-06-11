<?php

use App\Http\Controllers\Home\MainController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'index'])->name('home.index');
Route::get('/about', [MainController::class, 'about'])->name('home.about');
Route::get('/programs', [MainController::class, 'programs'])->name('home.programs');
Route::get('/programs/{slug}', [MainController::class, 'programShow'])->name('home.programs.data');
Route::get('/berita', [MainController::class, 'news'])->name('home.berita');
Route::get('/berita/{slug}', [MainController::class, 'newsShow'])->name('home.berita.show');
Route::get('/kontak', [MainController::class, 'contact'])->name('home.contact');
