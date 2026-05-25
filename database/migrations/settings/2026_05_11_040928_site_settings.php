<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('site.site_name', 'Yatim Mandiri');
        $this->migrator->add('site.site_description', 'Yatim Mandiri Website');
        $this->migrator->add('site.logo', null);
        $this->migrator->add('site.favicon', null);
        $this->migrator->add('site.address', 'Jalan Raya Jambangan 135-137, Surabaya, Jawa Timur, Indonesia');
        $this->migrator->add('site.phone', '(031) 8283 488');
        $this->migrator->add('site.email', 'info@yatimmandiri.org');
        $this->migrator->add('site.facebook', 'yatimmandiri');
        $this->migrator->add('site.instagram', 'yatimmandiri');
        $this->migrator->add('site.twitter', 'yatimmandiri');
        $this->migrator->add('site.youtube', 'yatimmandiri');
        $this->migrator->add('site.whatsapp', '0811 1343 577');
        $this->migrator->add('site.tiktok', 'yatimmandiri');
        $this->migrator->add('site.maintenance_mode', false);
    }
};
