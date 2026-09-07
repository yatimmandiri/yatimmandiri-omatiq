<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for(
    'admin.data-peserta.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Peserta', route('admin.data-peserta.index')),
);

Breadcrumbs::for(
    'admin.data-peserta.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.data-peserta.index')
        ->push('Daftarkan Binaan', route('admin.data-peserta.create')),
);

Breadcrumbs::for(
    'admin.data-peserta.show',
    fn (BreadcrumbTrail $trail, $participant) => $trail
        ->parent('admin.data-peserta.index')
        ->push($participant->full_name ?? $participant->student?->full_name ?? 'Detail', route('admin.data-peserta.show', $participant)),
);

Breadcrumbs::for(
    'admin.data-peserta.data',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.data-peserta.index')
        ->push('Data', route('admin.data-peserta.data')),
);

Breadcrumbs::for(
    'admin.data-binaan.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Binaan', route('admin.data-binaan.index')),
);

Breadcrumbs::for(
    'admin.data-binaan.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.data-binaan.index')
        ->push('Tambah Binaan', route('admin.data-binaan.create')),
);

Breadcrumbs::for(
    'admin.data-binaan.show',
    fn (BreadcrumbTrail $trail, $binaan) => $trail
        ->parent('admin.data-binaan.index')
        ->push($binaan->full_name, route('admin.data-binaan.show', $binaan)),
);

Breadcrumbs::for(
    'admin.data-binaan.edit',
    fn (BreadcrumbTrail $trail, $binaan) => $trail
        ->parent('admin.data-binaan.show', $binaan)
        ->push('Edit', route('admin.data-binaan.edit', $binaan)),
);

Breadcrumbs::for('admin.data-binaan.data', fn (BreadcrumbTrail $trail) => $trail->parent('admin.data-binaan.index')->push('Data', route('admin.data-binaan.data')));

Breadcrumbs::for(
    'admin.data-sanggar.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Sanggar', route('admin.data-sanggar.index')),
);

Breadcrumbs::for(
    'admin.data-sanggar.show',
    fn (BreadcrumbTrail $trail, $sanggar) => $trail
        ->parent('admin.data-sanggar.index')
        ->push($sanggar['name'] ?? 'Detail', route('admin.data-sanggar.show', $sanggar)),
);

Breadcrumbs::for('admin.data-sanggar.data', fn (BreadcrumbTrail $trail) => $trail->parent('admin.data-sanggar.index')->push('Data', route('admin.data-sanggar.data')));

Breadcrumbs::for(
    'admin.absensi.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Absensi', route('admin.absensi.index')),
);

// Legacy aliases: admin.guru.* → redirect to admin.* (keep for backward compat)
Breadcrumbs::for('admin.guru.data-peserta.index', fn (BreadcrumbTrail $trail) => $trail->parent('admin.dashboard')->push('Data Peserta', route('admin.data-peserta.index')));
Breadcrumbs::for('admin.guru.data-peserta.create', fn (BreadcrumbTrail $trail) => $trail->parent('admin.data-peserta.index')->push('Daftarkan Binaan', route('admin.data-peserta.create')));
Breadcrumbs::for('admin.guru.data-binaan.index', fn (BreadcrumbTrail $trail) => $trail->parent('admin.dashboard')->push('Data Binaan', route('admin.data-binaan.index')));
Breadcrumbs::for('admin.guru.data-sanggar.index', fn (BreadcrumbTrail $trail) => $trail->parent('admin.dashboard')->push('Data Sanggar', route('admin.data-sanggar.index')));
Breadcrumbs::for('admin.guru.absensi.index', fn (BreadcrumbTrail $trail) => $trail->parent('admin.dashboard')->push('Absensi', route('admin.absensi.index')));
