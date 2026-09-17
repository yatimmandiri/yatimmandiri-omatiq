<?php

namespace App\Http\Middleware;

use App\Settings\SiteSettings;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $settings = app(SiteSettings::class);
            $enabled = (bool) ($settings->maintenance_mode ?? false);
        } catch (\Throwable $e) {
            $enabled = false;
        }

        if (! $enabled) {
            return $next($request);
        }

        // Bypass for admin, settings, health, storage and local testing
        if (
            $request->is('admin/*') ||
            $request->is('admin/settings/*') ||
            $request->is('up') ||
            $request->is('storage/*') ||
            in_array($request->ip(), ['127.0.0.1', '::1'], true) ||
            $request->getHost() === '127.0.0.1' ||
            app()->environment('testing')
        ) {
            return $next($request);
        }

        // Only block public home/* pages when maintenance is on
        // Keep admin and local accessible for testing/sync
        if (! $request->is('/') && ! $request->is('pendaftaran*') && ! $request->is('olimpiade*') && ! $request->is('jadwal*') && ! $request->is('berita*') && ! $request->is('kontak*') && ! $request->is('about*')) {
            // For other public pages, still allow? Minimal: block home and pendaftaran as requested
            // To block all public home/*, uncomment:
            // if (! $request->is('home/*')) return $next($request);
        }

        // Prefer home maintenance for public
        if ($request->is('/') || $request->is('pendaftaran*') || $request->is('olimpiade*') || $request->is('about*') || $request->is('jadwal*') || $request->is('berita*') || $request->is('kontak*')) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('maintenance/index', [
                    'site_name' => config('app.name'),
                ])->toResponse($request)->setStatusCode(503)->header('Retry-After', 60);
            }

            return response()->view('errors.503', ['site_name' => config('app.name')], 503)->header('Retry-After', 60);
        }

        return $next($request);
    }
}
