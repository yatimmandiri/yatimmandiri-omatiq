<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Dashboard Teacher (root)
Breadcrumbs::for('teacher.dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('teacher.dashboard'));
});

Breadcrumbs::for('teacher.index', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('teacher.index'));
});

// Biodata
Breadcrumbs::for('teacher.biodata.edit', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.dashboard')->push('Biodata Guru', route('teacher.biodata.edit'));
});

// Data Peserta
Breadcrumbs::for('teacher.data-peserta.index', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.dashboard')->push('Data Peserta', route('teacher.data-peserta.index'));
});

Breadcrumbs::for('teacher.data-peserta.create', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.data-peserta.index')->push('Daftarkan Binaan', route('teacher.data-peserta.create'));
});

Breadcrumbs::for('teacher.data-peserta.show', function (BreadcrumbTrail $trail, $participant) {
    $trail->parent('teacher.data-peserta.index')
        ->push($participant->full_name ?? $participant->student?->full_name ?? 'Detail', route('teacher.data-peserta.show', $participant));
});

Breadcrumbs::for('teacher.data-peserta.data', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.data-peserta.index')->push('Data', route('teacher.data-peserta.data'));
});

// Data Binaan
Breadcrumbs::for('teacher.data-binaan.index', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.dashboard')->push('Data Binaan', route('teacher.data-binaan.index'));
});

Breadcrumbs::for('teacher.data-binaan.create', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.data-binaan.index')->push('Tambah Binaan', route('teacher.data-binaan.create'));
});

Breadcrumbs::for('teacher.data-binaan.show', function (BreadcrumbTrail $trail, $binaan) {
    $trail->parent('teacher.data-binaan.index')
        ->push($binaan->full_name ?? (is_array($binaan) ? ($binaan['full_name'] ?? $binaan['name'] ?? 'Detail') : 'Detail'), route('teacher.data-binaan.show', $binaan));
});

Breadcrumbs::for('teacher.data-binaan.edit', function (BreadcrumbTrail $trail, $binaan) {
    $trail->parent('teacher.data-binaan.show', $binaan)->push('Edit', route('teacher.data-binaan.edit', $binaan));
});

Breadcrumbs::for('teacher.data-binaan.data', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.data-binaan.index')->push('Data', route('teacher.data-binaan.data'));
});

// Data Sanggar
Breadcrumbs::for('teacher.data-sanggar.index', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.dashboard')->push('Data Sanggar', route('teacher.data-sanggar.index'));
});

Breadcrumbs::for('teacher.data-sanggar.show', function (BreadcrumbTrail $trail, $sanggar) {
    $trail->parent('teacher.data-sanggar.index')
        ->push($sanggar['name'] ?? 'Detail', route('teacher.data-sanggar.show', $sanggar));
});

Breadcrumbs::for('teacher.data-sanggar.data', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.data-sanggar.index')->push('Data', route('teacher.data-sanggar.data'));
});

// Absensi
Breadcrumbs::for('teacher.absensi.index', function (BreadcrumbTrail $trail) {
    $trail->parent('teacher.dashboard')->push('Absensi', route('teacher.absensi.index'));
});
