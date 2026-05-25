<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Dashboard Admin (root)
Breadcrumbs::for(
    'admin.index',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.dashboard')->push('Dashboard', route('admin.index'))
);

require __DIR__ . '/admin/core-breadcrumbs.php';
