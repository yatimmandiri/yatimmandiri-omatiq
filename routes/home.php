<?php

use App\Http\Controllers\Company\ParticipantCardController;
use App\Http\Controllers\Home\MainController;
use App\Http\Controllers\Home\ParticipantRegistrationController;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Regency;
use Illuminate\Http\Request;
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
Route::get('/pendaftaran/kartu/{registrationNumber}', [ParticipantCardController::class, 'print'])->name('home.registration.card');

// API kecil untuk cascading dropdown wilayah (dipakai pendaftaran & biodata guru)
Route::get('/regions/regencies', function (Request $request) {
    $request->validate(['province_id' => ['required', 'exists:provinces,id']]);

    return response()->json(['data' => Regency::where('province_id', $request->province_id)->orderBy('name')->get(['id', 'province_id', 'name'])]);
})->name('home.regions.regencies');
Route::get('/regions/districts', function (Request $request) {
    $request->validate(['regency_id' => ['required', 'exists:regencies,id']]);

    return response()->json(['data' => District::where('regency_id', $request->regency_id)->orderBy('name')->get(['id', 'regency_id', 'name'])]);
})->name('home.regions.districts');
Route::get('/regions/villages', [ParticipantRegistrationController::class, 'villages'])->name('home.regions.villages');

// Detail dinamis — taruh paling akhir
Route::get('/olimpiade/{slug}', [MainController::class, 'olimpiadeShow'])->name('home.olimpiade.show');
Route::get('/berita/{slug}', [MainController::class, 'newsShow'])->name('home.news.show');
