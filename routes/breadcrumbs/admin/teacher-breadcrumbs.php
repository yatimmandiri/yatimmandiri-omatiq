<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for(
    'admin.teacher.students.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Siswa', route('admin.teacher.students.index')),
);

Breadcrumbs::for(
    'admin.teacher.students.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.teacher.students.index')
        ->push('Daftarkan Siswa', route('admin.teacher.students.create')),
);

Breadcrumbs::for(
    'admin.teacher.students.show',
    fn (BreadcrumbTrail $trail, $participant) => $trail
        ->parent('admin.teacher.students.index')
        ->push($participant->full_name, route('admin.teacher.students.show', $participant)),
);

Breadcrumbs::for(
    'admin.teacher.students.edit',
    fn (BreadcrumbTrail $trail, $participant) => $trail
        ->parent('admin.teacher.students.show', $participant)
        ->push('Edit', route('admin.teacher.students.edit', $participant)),
);

Breadcrumbs::for(
    'admin.teacher.students.data',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.teacher.students.index')
        ->push('Siswa Data', route('admin.teacher.students.data')),
);
