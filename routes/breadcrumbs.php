<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('home', function (BreadcrumbTrail $trail) {
    $trail->push('Home', route('home'));
});

Breadcrumbs::for('log-viewer.index', function (BreadcrumbTrail $trail) {
    $trail->push('Log Viewer', route('log-viewer.index'));
});

require __DIR__ . '/breadcrumbs/admin-breadcrumbs.php';
require __DIR__ . '/breadcrumbs/settings-breadcrumbs.php';
require __DIR__ . '/breadcrumbs/auth-breadcrumbs.php';
