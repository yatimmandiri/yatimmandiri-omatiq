<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for('auth.redirect', function (BreadcrumbTrail $trail) {
    $trail->push('Google Redirect', route('auth.redirect', ['provider' => 'google']));
});

Breadcrumbs::for('auth.callback', function (BreadcrumbTrail $trail) {
    $trail->push('Google Callback', route('auth.callback', ['provider' => 'google']));
});

Breadcrumbs::for('login', function (BreadcrumbTrail $trail) {
    $trail->push('Login', route('login'));
});

Breadcrumbs::for('register', function (BreadcrumbTrail $trail) {
    $trail->push('Register', route('register'));
});

Breadcrumbs::for('password.request', function (BreadcrumbTrail $trail) {
    $trail->push('Forgot Password', route('password.request'));
});

Breadcrumbs::for('verification.notice', function (BreadcrumbTrail $trail) {
    $trail->push('Verify Email', route('verification.notice'));
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
