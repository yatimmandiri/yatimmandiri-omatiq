<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('home.index', function (BreadcrumbTrail $trail) {
    $trail->push('Home', route('home.index'));
});

Breadcrumbs::for('home.about', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Tentang Kami', route('home.about'));
});

Breadcrumbs::for('home.olimpiade', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Olimpiade', route('home.olimpiade'));
});

Breadcrumbs::for('home.olimpiade.show', function (BreadcrumbTrail $trail, $slug) {
    $trail->parent('home.olimpiade')->push('Detail Olimpiade', route('home.olimpiade.show', $slug));
});

Breadcrumbs::for('home.news', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('News', route('home.news'));
});

Breadcrumbs::for('home.news.show', function (BreadcrumbTrail $trail, $slug) {
    $trail->parent('home.news')->push('Detail News', route('home.news.show', $slug));
});

Breadcrumbs::for('home.sponsorship', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Sponsorship', route('home.sponsorship'));
});

Breadcrumbs::for('home.contact', function (BreadcrumbTrail $trail) {
    $trail->parent('home.index')->push('Kontak', route('home.contact'));
});
