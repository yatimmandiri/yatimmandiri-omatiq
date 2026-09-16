<?php

namespace App\Http\Middleware;

use App\Services\PenyaluranService;
use App\Settings\SiteSettings;
use Closure;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

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
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin/*')) {
            config(['inertia.ssr.enabled' => false]);
        }

        // Simpan roles SEBELUM controller logout (agar cookie terbawa di request logout)
        $rolesBefore = null;
        if (Auth::check()) {
            try {
                $rolesBefore = Auth::user()->getRoleNames()->toArray();
            } catch (\Throwable $e) {
                $rolesBefore = null;
            }
        }

        $response = parent::handle($request, $next);

        // Simpan roles ke cookie untuk LogoutResponse generik bisa redirect sesuai role
        // Gunakan rolesBefore (sebelum logout) jika ada, fallback ke Auth::check() setelah (untuk request biasa)
        $rolesToStore = $rolesBefore;
        if ($rolesToStore === null && Auth::check()) {
            try {
                $rolesToStore = Auth::user()->getRoleNames()->toArray();
            } catch (\Throwable $e) {
                $rolesToStore = null;
            }
        }

        if (is_array($rolesToStore) && count($rolesToStore) > 0) {
            $response->headers->setCookie(
                cookie()->make('last_roles', json_encode($rolesToStore), 60 * 24 * 7, null, null, false, false)
            );
        }

        return $response;
    }

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
                'error' => $request->session()->get('error'),
            ],
            'settings' => [
                'site_name' => $settings->site_name,
                'site_description' => $settings->site_description,
                'logo' => $settings->logo ? asset('storage/'.$settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/'.$settings->favicon) : null,
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
                'registration_public_open' => $settings->registration_public_open,
                'registration_binaan_open' => $settings->registration_binaan_open,
            ],
            'breadcrumbs' => $request->isMethod('get') && $request->route() && $request->route()->getName()
                ? (function () use ($request) {
                    try {
                        return Breadcrumbs::generate(
                            $request->route()->getName(),
                            ...array_values($request->route()->parameters())
                        );
                    } catch (\Throwable $e) {
                        return [];
                    }
                })()
                : [],
            'sidebarSanggars' => (function () use ($request) {
                $user = $request->user();
                if (! $user || ! $user->hasRole('Teacher')) {
                    return [];
                }
                $token = $request->session()->get('penyaluran_token') ?? $user->penyaluran_token;
                if (! $token) {
                    return [];
                }
                try {
                    return app(PenyaluranService::class)->sanggars($token);
                } catch (\Throwable $e) {
                    return [];
                }
            })(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
