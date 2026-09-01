<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for(
    'admin.guru.data-peserta.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Peserta', route('admin.guru.data-peserta.index')),
);

Breadcrumbs::for(
    'admin.guru.data-peserta.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.guru.data-peserta.index')
        ->push('Daftarkan Binaan', route('admin.guru.data-peserta.create')),
);

Breadcrumbs::for(
    'admin.guru.data-peserta.show',
    fn (BreadcrumbTrail $trail, $participant) => $trail
        ->parent('admin.guru.data-peserta.index')
        ->push($participant->full_name ?? $participant->student?->full_name ?? 'Detail', route('admin.guru.data-peserta.show', $participant)),
);

Breadcrumbs::for(
    'admin.guru.data-peserta.data',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.guru.data-peserta.index')
        ->push('Data', route('admin.guru.data-peserta.data')),
);

Breadcrumbs::for(
    'admin.guru.data-binaan.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Binaan', route('admin.guru.data-binaan.index')),
);

Breadcrumbs::for(
    'admin.guru.data-binaan.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.guru.data-binaan.index')
        ->push('Tambah Binaan', route('admin.guru.data-binaan.create')),
);

Breadcrumbs::for(
    'admin.guru.data-binaan.show',
    fn (BreadcrumbTrail $trail, $binaan) => $trail
        ->parent('admin.guru.data-binaan.index')
        ->push($binaan->full_name, route('admin.guru.data-binaan.show', $binaan)),
);

Breadcrumbs::for(
    'admin.guru.data-binaan.edit',
    fn (BreadcrumbTrail $trail, $binaan) => $trail
        ->parent('admin.guru.data-binaan.show', $binaan)
        ->push('Edit', route('admin.guru.data-binaan.edit', $binaan)),
);

Breadcrumbs::for('admin.guru.data-binaan.data', fn (BreadcrumbTrail $trail) => $trail->parent('admin.guru.data-binaan.index')->push('Data', route('admin.guru.data-binaan.data')));

Breadcrumbs::for(
    'admin.guru.data-sanggar.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Data Sanggar', route('admin.guru.data-sanggar.index')),
);

Breadcrumbs::for(
    'admin.guru.data-sanggar.show',
    fn (BreadcrumbTrail $trail, $sanggar) => $trail
        ->parent('admin.guru.data-sanggar.index')
        ->push($sanggar['name'] ?? 'Detail', route('admin.guru.data-sanggar.show', $sanggar)),
);

Breadcrumbs::for('admin.guru.data-sanggar.data', fn (BreadcrumbTrail $trail) => $trail->parent('admin.guru.data-sanggar.index')->push('Data', route('admin.guru.data-sanggar.data')));

Breadcrumbs::for(
    'admin.guru.absensi.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Absensi', route('admin.guru.absensi.index')),
);
