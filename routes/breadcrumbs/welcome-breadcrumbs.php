<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Welcome (root)
Breadcrumbs::for('welcome', function (BreadcrumbTrail $trail) {
    $trail->push('Welcome', route('welcome'));
});
