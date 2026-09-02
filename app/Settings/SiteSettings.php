<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class SiteSettings extends Settings
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

    public bool $registration_public_open = true;

    public bool $registration_binaan_open = true;

    public bool $sheets_sync_enabled = false;

    public ?string $sheets_spreadsheet_id = null;

    public ?string $sheets_sheet_name = null;

    public static function group(): string
    {
        return 'site';
    }
}
