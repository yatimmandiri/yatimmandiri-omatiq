<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Users Index
Breadcrumbs::for(
    'admin.core.users.index',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.dashboard')->push('Users', route('admin.core.users.index'))
);

// Users Create
Breadcrumbs::for(
    'admin.core.users.create',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.users.index')->push('Create', route('admin.core.users.create'))
);

// Users Show
Breadcrumbs::for(
    'admin.core.users.show',
    fn(BreadcrumbTrail $trail, $user) =>
    $trail->parent('admin.core.users.index')->push($user->name, route('admin.core.users.show', $user))
);

// Users Edit
Breadcrumbs::for(
    'admin.core.users.edit',
    fn(BreadcrumbTrail $trail, $user) =>
    $trail->parent('admin.core.admin.core.users.show', $user)->push('Edit', route('admin.core.users.edit', $user))
);

// Users Data
Breadcrumbs::for(
    'admin.core.users.data',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.users.index')->push('Users Data', route('admin.core.users.data'))
);

// Roles Index
Breadcrumbs::for(
    'admin.core.roles.index',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.admin.dashboard')->push('Roles', route('admin.core.roles.index'))
);

// Roles Create
Breadcrumbs::for(
    'admin.core.roles.create',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.roles.index')->push('Create', route('admin.core.roles.create'))
);

// Roles Show
Breadcrumbs::for(
    'admin.core.roles.show',
    fn(BreadcrumbTrail $trail, $roles) =>
    $trail->parent('admin.core.roles.index')->push($roles->name, route('admin.core.roles.show', $roles))
);

// Roles Edit
Breadcrumbs::for(
    'admin.core.roles.edit',
    fn(BreadcrumbTrail $trail, $roles) =>
    $trail->parent('admin.core.roles.show', $roles)->push('Edit', route('admin.core.roles.edit', $roles))
);

// Roles Data
Breadcrumbs::for(
    'admin.core.roles.data',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.roles.index')->push('roles Data', route('admin.core.roles.data'))
);

// Permissions Index
Breadcrumbs::for(
    'admin.core.permissions.index',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.dashboard')->push('Permissions', route('admin.core.permissions.index'))
);

// Permissions Create
Breadcrumbs::for(
    'admin.core.permissions.create',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.permissions.index')->push('Create', route('admin.core.permissions.create'))
);

// Permissions Show
Breadcrumbs::for(
    'admin.core.permissions.show',
    fn(BreadcrumbTrail $trail, $permission) =>
    $trail->parent('admin.core.permissions.index')->push($permission->name, route('admin.core.permissions.show', $permission))
);

// Permissions Edit
Breadcrumbs::for(
    'admin.core.permissions.edit',
    fn(BreadcrumbTrail $trail, $permission) =>
    $trail->parent('admin.core.permissions.show', $permission)->push('Edit', route('admin.core.permissions.edit', $permission))
);

// Permissions Data
Breadcrumbs::for(
    'admin.core.permissions.data',
    fn(BreadcrumbTrail $trail) =>
    $trail->parent('admin.core.permissions.index')->push('Permissions Data', route('admin.core.permissions.data'))
);

// Admin (root)
Breadcrumbs::for('admin.index', function (BreadcrumbTrail $trail) {
    $trail->push('Admin', route('admin.index'));
});

// Dashboard (root)
Breadcrumbs::for('admin.dashboard', function (BreadcrumbTrail $trail) {
    $trail->push('Dashboard', route('admin.dashboard'));
});
