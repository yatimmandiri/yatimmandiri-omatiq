<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use Inertia\Inertia;
use Inertia\Response;

class AbsensiController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        return Inertia::render('teacher/absensi/index');
    }
}
