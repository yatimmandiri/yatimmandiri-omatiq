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

Breadcrumbs::for('two-factor.login', function (BreadcrumbTrail $trail) {
    $trail->parent('login')->push('Two-Factor Authentication', route('two-factor.login'));
});

Breadcrumbs::for('password.request', function (BreadcrumbTrail $trail) {
    $trail->push('Forgot Password', route('password.request'));
});

Breadcrumbs::for('password.reset', function (BreadcrumbTrail $trail, string $token) {
    $trail->parent('password.request')->push('Reset Password', route('password.reset', $token));
});

Breadcrumbs::for('password.confirm', function (BreadcrumbTrail $trail) {
    $trail->push('Confirm Password', route('password.confirm'));
});

Breadcrumbs::for('verification.notice', function (BreadcrumbTrail $trail) {
    $trail->push('Verify Email', route('verification.notice'));
});

Breadcrumbs::for('verification.verify', function (BreadcrumbTrail $trail, string $id, string $hash) {
    $trail->parent('verification.notice')->push('Verify Email', route('verification.verify', ['id' => $id, 'hash' => $hash]));
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

Breadcrumbs::for('guru.login', function (BreadcrumbTrail $trail) {
    $trail->push('Login Guru', route('guru.login'));
});
Breadcrumbs::for('guru.verify', function (BreadcrumbTrail $trail) {
    $trail->parent('guru.login')->push('Verifikasi OTP', route('guru.verify'));
});
