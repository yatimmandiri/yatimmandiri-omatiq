<?php

use App\Http\Controllers\Home\MainController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'index'])->name('home.index');
Route::get('/about', [MainController::class, 'about'])->name('home.about');
Route::get('/olimpiade', [MainController::class, 'olimpiade'])->name('home.olimpiade');
Route::get('/olimpiade/{slug}', [MainController::class, 'olimpiadeShow'])->name('home.olimpiade.show');
Route::get('/berita', [MainController::class, 'news'])->name('home.news');
Route::get('/berita/{slug}', [MainController::class, 'newsShow'])->name('home.news.show');
Route::get('/kontak', [MainController::class, 'contact'])->name('home.contact');
