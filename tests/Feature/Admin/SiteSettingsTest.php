<?php

use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);
});

test('admin can update whatsapp settings with multiple contacts json', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $contacts = [
        ['name' => 'CS Pendaftaran', 'number' => '081234567890'],
        ['name' => 'Bantuan Teknis', 'number' => '081198765432'],
    ];

    $response = $this->actingAs($admin)->put(route('admin.settings.site.update'), [
        'site_name' => 'OMATIQ 2026',
        'site_description' => 'Website Resmi Olimpiade OMATIQ',
        'whatsapp' => json_encode($contacts),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $settings = app(SiteSettings::class);
    expect($settings->whatsapp)->toBe(json_encode($contacts));
});

test('site settings shares parsed whatsapp contacts to inertia props', function () {
    $settings = app(SiteSettings::class);
    $contacts = [
        ['name' => 'CS Pendaftaran', 'number' => '081234567890'],
    ];
    $settings->whatsapp = json_encode($contacts);
    $settings->save();

    $response = $this->get(route('home.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('settings.social.whatsapp')
        ->where('settings.social.whatsapp', json_encode($contacts))
    );
});
