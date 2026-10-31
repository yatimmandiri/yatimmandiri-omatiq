<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        if (! $this->migrator->exists('site.registration_national_open')) {
            $this->migrator->add('site.registration_national_open', true);
        }
    }
};
