<?php

namespace App\Providers;

use App\Models\Company\Participant;
use App\Observers\ParticipantObserver;
use App\Settings\SiteSettings;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => Password::min(8),
        );

        View::composer('*', function ($view) {
            $settings = app(SiteSettings::class);

            $view->with('settings', [
                'site_name' => $settings->site_name,
                'site_description' => $settings->site_description,
                'logo' => $settings->logo ? asset('storage/'.$settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/'.$settings->favicon) : null,
            ]);
        });

        RateLimiter::for('sheets', fn () => Limit::perMinute(60)->by('sheets'));

        Participant::observe(ParticipantObserver::class);
    }
}
