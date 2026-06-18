<?php

use App\Models\Company\Category;
use App\Models\Company\Program;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('home.index', function (BreadcrumbTrail $trail) {
    $trail->push('Home', route('home.index'));
});

Breadcrumbs::for('home.about', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Tentang Kami', route('home.about'));
});

Breadcrumbs::for('home.programs', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Program', route('home.programs'));
});

Breadcrumbs::for('home.programs.data', function (BreadcrumbTrail $trail, $slug) {
    $trail->parent('home.programs')->push('Detail Olimpiade', route('home.programs.data', $slug));
});

Breadcrumbs::for('home.berita', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Berita', route('home.berita'));
});

Breadcrumbs::for('home.berita.show', function (BreadcrumbTrail $trail, $slug) {
    $trail->parent('home.berita')->push('Detail Berita', route('home.berita.show', $slug));
});

Breadcrumbs::for('home.sponsorship', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Sponsorship', route('home.sponsorship'));
});

Breadcrumbs::for('home.contact', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Kontak', route('home.contact'));
});
