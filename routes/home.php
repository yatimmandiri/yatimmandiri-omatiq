<?php

use App\Http\Controllers\Admin\Company\EventCommitteeController;
use App\Http\Controllers\Admin\Company\NationalChaperoneController;
use App\Http\Controllers\Company\ParticipantCardController;
use App\Http\Controllers\Home\GuestRsvpController;
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
Route::post('/pendaftaran/check-nik', [ParticipantRegistrationController::class, 'checkNik'])->name('home.registration.check-nik');
Route::get('/pendaftaran/sukses/{registrationNumber}', [ParticipantRegistrationController::class, 'success'])->name('home.registration.success');
Route::get('/pendaftaran/kartu/{registrationNumber}', [ParticipantCardController::class, 'print'])->name('home.registration.card');
Route::get('/pendamping/kartu/{identifier}', [NationalChaperoneController::class, 'publicPrintCard'])->name('home.chaperone.card');
Route::get('/panitia/kartu/{identifier}', [EventCommitteeController::class, 'publicPrintCard'])->name('home.committee.card');
// Universal QR Gate (Context-Aware: Tamu belum login -> RSVP, Verifikator login -> Terminal Gate)
Route::get('/verifikasi/{registrationNumber?}', [ParticipantRegistrationController::class, 'verify'])->name('home.registration.verify');

// Terminal Verifikasi & Akses Gate OMATIQ (Khusus Administrator & Verifikator)
Route::middleware(['auth'])->group(function () {
    Route::get('/verifikasi/pendamping/{code?}', [ParticipantRegistrationController::class, 'verifyChaperone'])->name('home.chaperone.verify');
    Route::get('/verifikasi/panitia/{code?}', [ParticipantRegistrationController::class, 'verifyCommittee'])->name('home.committee.verify');
    Route::get('/verifikasi/tamu/{code?}', [ParticipantRegistrationController::class, 'verifyGuest'])->name('home.guest.verify');
    Route::get('/pendaftaran/verifikasi/{registrationNumber?}', [ParticipantRegistrationController::class, 'verify'])->name('home.registration.verify.alias');

    // Operasional Konsumsi & Reset Kehadiran Tamu VIP
    Route::post('/verifikasi/consumption/redeem', [ParticipantRegistrationController::class, 'redeemConsumption'])->name('home.verification.consumption.redeem');
    Route::post('/verifikasi/consumption/redeem-chaperone-students', [ParticipantRegistrationController::class, 'redeemChaperoneStudents'])->name('home.verification.consumption.redeem-chaperone-students');
    Route::post('/verifikasi/consumption/reset', [ParticipantRegistrationController::class, 'resetConsumption'])->name('home.verification.consumption.reset');
    Route::post('/verifikasi/checkin/reset', [ParticipantRegistrationController::class, 'resetCheckIn'])->name('home.verification.checkin.reset');
    Route::post('/verifikasi/guest/{guest}/reset-checkin', [ParticipantRegistrationController::class, 'resetGuestCheckIn'])->name('home.verification.guest.reset');

    // Operasional Logistik Serah Terima Pack & Kaos (Hari 1)
    Route::post('/verifikasi/pack/handover', [ParticipantRegistrationController::class, 'handoverPack'])->name('home.verification.pack.handover');
    Route::post('/verifikasi/pack/reset', [ParticipantRegistrationController::class, 'resetPack'])->name('home.verification.pack.reset');
});

// Konfirmasi Kehadiran & VIP E-Pass Tamu Undangan
Route::get('/undangan/{identifier}/konfirmasi', [GuestRsvpController::class, 'show'])->name('home.guest.rsvp');
Route::post('/undangan/{identifier}/konfirmasi', [GuestRsvpController::class, 'confirm'])->name('home.guest.rsvp.confirm');

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
