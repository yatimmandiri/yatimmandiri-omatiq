<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('admin.settings.site.edit', function (BreadcrumbTrail $trail) {
    $trail->push('Site Settings', route('admin.settings.site.edit'));
});
