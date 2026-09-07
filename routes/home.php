<?php

use App\Http\Controllers\Home\MainController;
use App\Http\Controllers\Home\ParticipantRegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — Home
|--------------------------------------------------------------------------
| Semua route publik tanpa middleware auth. Urutan: static pages dulu,
| lalu pendaftaran, lalu resource dinamis (/{slug}) di akhir agar
| tidak menelan route statis seperti /olimpiade.
*/

// Static & listing pages
Route::get('/', [MainController::class, 'index'])->name('home.index');
Route::get('/about', [MainController::class, 'about'])->name('home.about');
Route::get('/about/milestone', [MainController::class, 'milestone'])->name('home.milestone');
Route::get('/olimpiade', [MainController::class, 'olimpiade'])->name('home.olimpiade');
Route::get('/jadwal', [MainController::class, 'schedule'])->name('home.schedule');
Route::get('/berita', [MainController::class, 'news'])->name('home.news');
Route::get('/kontak', [MainController::class, 'contact'])->name('home.contact');

// Pendaftaran peserta umum
Route::get('/pendaftaran', [ParticipantRegistrationController::class, 'create'])->name('home.registration.create');
Route::post('/pendaftaran', [ParticipantRegistrationController::class, 'store'])->name('home.registration.store');
Route::get('/pendaftaran/sukses/{registrationNumber}', [ParticipantRegistrationController::class, 'success'])->name('home.registration.success');

// API kecil untuk cascading dropdown desa (dipakai form pendaftaran)
Route::get('/regions/villages', [ParticipantRegistrationController::class, 'villages'])->name('home.regions.villages');

// Detail dinamis — taruh paling akhir
Route::get('/olimpiade/{slug}', [MainController::class, 'olimpiadeShow'])->name('home.olimpiade.show');
Route::get('/berita/{slug}', [MainController::class, 'newsShow'])->name('home.news.show');
