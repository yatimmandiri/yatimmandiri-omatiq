<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        if (! $this->migrator->exists('site.sheets_sync_enabled')) {
            $this->migrator->add('site.sheets_sync_enabled', false);
        }
        if (! $this->migrator->exists('site.sheets_spreadsheet_id')) {
            $this->migrator->add('site.sheets_spreadsheet_id', null);
        }
        if (! $this->migrator->exists('site.sheets_sheet_name')) {
            $this->migrator->add('site.sheets_sheet_name', null);
        }
    }
};
