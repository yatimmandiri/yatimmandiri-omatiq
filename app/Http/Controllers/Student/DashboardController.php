<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\Views\DashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Student dashboard boleh untuk Participant / Users yang punya participant
        // Admin/Teacher yang salah masuk ke /student/dashboard akan di-403
        if ($user && ($user->hasRole('Administrators') || $user->hasRole('Teacher'))) {
            abort(403, 'Akun Admin/Guru tidak dapat mengakses dashboard Student.');
        }

        $config = DashboardService::handle($user);

        return Inertia::render('student/dashboard', $config['data'] ?? []);
    }
}
