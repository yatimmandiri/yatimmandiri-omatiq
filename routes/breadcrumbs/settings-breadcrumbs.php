<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('admin.settings.site.edit', function (BreadcrumbTrail $trail) {
    $trail->push('Site Settings', route('admin.settings.site.edit'));
});

Breadcrumbs::for('admin.profile.edit', function (BreadcrumbTrail $trail) {
    $trail->push('Profile Settings', route('admin.profile.edit'));
});

Breadcrumbs::for('admin.security.edit', function (BreadcrumbTrail $trail) {
    $trail->push('Profile Settings', route('admin.security.edit'));
});

Breadcrumbs::for('admin.appearance.edit', function (BreadcrumbTrail $trail) {
    $trail->push('Profile Settings', route('admin.appearance.edit'));
});
