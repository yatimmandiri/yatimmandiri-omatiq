<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Services\Views\DashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Pastikan hanya Teacher yang bisa akses guru/dashboard
        if (! $user || ! $user->hasRole('Teacher')) {
            abort(403, 'Hanya Guru yang dapat mengakses dashboard ini.');
        }

        $config = DashboardService::handle($user);

        return Inertia::render('guru/dashboard', $config['data'] ?? []);
    }
}
