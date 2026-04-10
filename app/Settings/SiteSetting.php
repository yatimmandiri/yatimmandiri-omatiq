<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class SiteSetting extends Settings
{
    public string $site_name;
    public string $site_description;
    public ?string $logo;
    public ?string $favicon;
    public ?string $email;
    public ?string $phone;
    public ?string $address;
    public ?string $facebook;
    public ?string $twitter;
    public ?string $instagram;
    public ?string $youtube;
    public ?string $tiktok;
    public ?string $whatsapp;

    public bool $maintenance_mode;

    public static function group(): string
    {
        return 'Site';
    }
}
