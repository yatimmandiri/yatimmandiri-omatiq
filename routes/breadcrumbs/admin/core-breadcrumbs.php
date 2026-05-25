<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Dashboard (root)
Breadcrumbs::for('admin.dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Admin', route('admin.dashboard'));
});

// Users
Breadcrumbs::for(
    'admin.core.users.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Users', route('admin.core.users.index'))
);

Breadcrumbs::for(
    'admin.core.users.create',
    fn($trail) =>
    $trail->parent('admin.core.users.index')->push('Create', route('admin.core.users.create'))
);

Breadcrumbs::for(
    'admin.core.users.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.users.index')->push($item->name, route('admin.core.users.show', $item))
);

Breadcrumbs::for(
    'admin.core.users.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.users.show', $item)->push('Edit', route('admin.core.users.edit', $item))
);

Breadcrumbs::for(
    'admin.core.users.data',
    fn($trail) =>
    $trail->parent('admin.core.users.index')->push('Users Data', route('admin.core.users.data'))
);

// Permissions
Breadcrumbs::for(
    'admin.core.permissions.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Permissions', route('admin.core.permissions.index'))
);

Breadcrumbs::for(
    'admin.core.permissions.create',
    fn($trail) =>
    $trail->parent('admin.core.permissions.index')->push('Create', route('admin.core.permissions.create'))
);

Breadcrumbs::for(
    'admin.core.permissions.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.permissions.index')->push($item->name, route('admin.core.permissions.show', $item))
);

Breadcrumbs::for(
    'admin.core.permissions.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.permissions.show', $item)->push('Edit', route('admin.core.permissions.edit', $item))
);

Breadcrumbs::for(
    'admin.core.permissions.data',
    fn($trail) =>
    $trail->parent('admin.core.permissions.index')->push('Permissions Data', route('admin.core.permissions.data'))
);

// Roles
Breadcrumbs::for(
    'admin.core.roles.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Roles', route('admin.core.roles.index'))
);

Breadcrumbs::for(
    'admin.core.roles.create',
    fn($trail) =>
    $trail->parent('admin.core.roles.index')->push('Create', route('admin.core.roles.create'))
);

Breadcrumbs::for(
    'admin.core.roles.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.roles.index')->push($item->name, route('admin.core.roles.show', $item))
);

Breadcrumbs::for(
    'admin.core.roles.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.roles.show', $item)->push('Edit', route('admin.core.roles.edit', $item))
);

Breadcrumbs::for(
    'admin.core.roles.data',
    fn($trail) =>
    $trail->parent('admin.core.roles.index')->push('Roles Data', route('admin.core.roles.data'))
);


// Provinces
Breadcrumbs::for(
    'admin.core.regions.provinces.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Provinces', route('admin.core.regions.provinces.index'))
);

Breadcrumbs::for(
    'admin.core.regions.provinces.create',
    fn($trail) =>
    $trail->parent('admin.core.regions.provinces.index')->push('Create', route('admin.core.regions.provinces.create'))
);

Breadcrumbs::for(
    'admin.core.regions.provinces.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.provinces.index')->push($item->name, route('admin.core.regions.provinces.show', $item))
);

Breadcrumbs::for(
    'admin.core.regions.provinces.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.provinces.show', $item)->push('Edit', route('admin.core.regions.provinces.edit', $item))
);

Breadcrumbs::for(
    'admin.core.regions.provinces.data',
    fn($trail) =>
    $trail->parent('admin.core.regions.provinces.index')->push('Province Data', route('admin.core.regions.provinces.data'))
);

// Regencies
Breadcrumbs::for(
    'admin.core.regions.regencies.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Regencies', route('admin.core.regions.regencies.index'))
);

Breadcrumbs::for(
    'admin.core.regions.regencies.create',
    fn($trail) =>
    $trail->parent('admin.core.regions.regencies.index')->push('Create', route('admin.core.regions.regencies.create'))
);

Breadcrumbs::for(
    'admin.core.regions.regencies.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.regencies.index')->push($item->name, route('admin.core.regions.regencies.show', $item))
);

Breadcrumbs::for(
    'admin.core.regions.regencies.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.regencies.show', $item)->push('Edit', route('admin.core.regions.regencies.edit', $item))
);

Breadcrumbs::for(
    'admin.core.regions.regencies.data',
    fn($trail) =>
    $trail->parent('admin.core.regions.regencies.index')->push('Regencies Data', route('admin.core.regions.regencies.data'))
);

// Districts
Breadcrumbs::for(
    'admin.core.regions.districts.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Districts', route('admin.core.regions.districts.index'))
);

Breadcrumbs::for(
    'admin.core.regions.districts.create',
    fn($trail) =>
    $trail->parent('admin.core.regions.districts.index')->push('Create', route('admin.core.regions.districts.create'))
);

Breadcrumbs::for(
    'admin.core.regions.districts.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.districts.index')->push($item->name, route('admin.core.regions.districts.show', $item))
);

Breadcrumbs::for(
    'admin.core.regions.districts.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.districts.show', $item)->push('Edit', route('admin.core.regions.districts.edit', $item))
);

Breadcrumbs::for(
    'admin.core.regions.districts.data',
    fn($trail) =>
    $trail->parent('admin.core.regions.districts.index')->push('District Data', route('admin.core.regions.districts.data'))
);

// Villages
Breadcrumbs::for(
    'admin.core.regions.villages.index',
    fn($trail) =>
    $trail->parent('admin.dashboard')->push('Villages', route('admin.core.regions.villages.index'))
);

Breadcrumbs::for(
    'admin.core.regions.villages.create',
    fn($trail) =>
    $trail->parent('admin.core.regions.villages.index')->push('Create', route('admin.core.regions.villages.create'))
);

Breadcrumbs::for(
    'admin.core.regions.villages.show',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.villages.index')->push($item->name, route('admin.core.regions.villages.show', $item))
);

Breadcrumbs::for(
    'admin.core.regions.villages.edit',
    fn($trail, $item) =>
    $trail->parent('admin.core.regions.villages.show', $item)->push('Edit', route('admin.core.regions.villages.edit', $item))
);

Breadcrumbs::for(
    'admin.core.regions.villages.data',
    fn($trail) =>
    $trail->parent('admin.core.regions.villages.index')->push('Village Data', route('admin.core.regions.villages.data'))
);

// Log Activity
Breadcrumbs::for('admin.logs.activities.index', function (BreadcrumbTrail $trail) {
    $trail->push('Logs Activities', route('admin.logs.activities.index'));
});

Breadcrumbs::for(
    'admin.logs.activities.data',
    fn($trail) =>
    $trail->parent('admin.logs.activities.index')->push('Logs Activities Data', route('admin.logs.activities.data'))
);
