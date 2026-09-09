<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('student.dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('student.dashboard'));
});

Breadcrumbs::for('student.index', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('student.index'));
});
