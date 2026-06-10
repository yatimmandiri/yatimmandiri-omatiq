<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('home/index'))->name('home.index');
Route::get('/about', fn () => Inertia::render('home/about/index'))->name('home.about');
Route::get('/programs', fn () => Inertia::render('home/programs/index'))->name('programs.index');
Route::get('/programs/{slug}', fn (string $slug) => Inertia::render('home/programs/show', [
    'slug' => $slug,
]))->name('programs.show');
Route::get('/news', fn () => Inertia::render('home/news/index'))->name('news.index');
Route::get('/news/{slug}', fn (string $slug) => Inertia::render('home/news/show', [
    'slug' => $slug,
]))->name('news.show');
Route::get('/berita', fn () => Inertia::render('home/berita/index'))->name('berita.index');
Route::get('/berita/{slug}', fn (string $slug) => Inertia::render('home/berita/show', [
    'slug' => $slug,
]))->name('berita.show');
Route::get('/contact', fn () => Inertia::render('home/contact'))->name('contact');

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
