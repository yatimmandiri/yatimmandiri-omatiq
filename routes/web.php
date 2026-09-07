<?php

/*
|--------------------------------------------------------------------------
| Web Routes — entry point
|--------------------------------------------------------------------------
|
| File ini hanya me-require file route per-area (sesuai AGENTS.md):
|  - auth.php     → Socialite + Guru login/OTP/complete-profile
|  - settings.php → /settings/* (profile, security, appearance)
|  - admin.php    → /admin/* (dashboard, companies, guru, core)
|  - home.php     → public (/, about, olimpiade, pendaftaran, ...)
|
| bootstrap/app.php hanya mendaftarkan web.php; semua file lain
| di-load dari sini. Tambah route baru di file area yang sesuai.
|
*/

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/home.php';
