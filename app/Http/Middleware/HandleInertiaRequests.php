<?php

namespace App\Http\Middleware;

use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Diglactic\Breadcrumbs\Breadcrumbs;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(SiteSettings::class);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user()
                    ? [
                        ...$request->user()->only(['id', 'name', 'email']),
                        'roles' => $request->user()->roles->pluck('name')->values(),
                        'permissions' => $request->user()->getAllPermissions()->pluck('name')->values(),
                    ]
                    : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'settings' => [
                'site_name' => $settings->site_name,
                'site_description' => $settings->site_description,
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/' . $settings->favicon) : null,
                'email' => $settings->email,
                'phone' => $settings->phone,
                'address' => $settings->address,
                'social' => [
                    'facebook' => $settings->facebook,
                    'twitter' => $settings->twitter,
                    'instagram' => $settings->instagram,
                    'youtube' => $settings->youtube,
                    'tiktok' => $settings->tiktok,
                    'whatsapp' => $settings->whatsapp,
                ],
                'maintenance_mode' => $settings->maintenance_mode,
            ],
            'breadcrumbs' => $request->isMethod('get') && $request->route()
                ? Breadcrumbs::generate(
                    $request->route()->getName(),
                    ...array_values($request->route()->parameters())
                )
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
