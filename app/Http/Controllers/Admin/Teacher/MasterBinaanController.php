<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MasterBinaanController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        return Inertia::render('admin/teacher/master/binaan/list');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $perPage = min($request->integer('perPage') ?: 10, 100);
        $search = strtolower($request->string('globalSearch')->toString());

        // Master Data Binaan: from students master where is_binaan true (only those already registered via guru or global)
        $query = Student::query()
            ->where('mentor_id', Auth::id())
            ->where('is_binaan', true)
            ->with(['province:id,name', 'regency:id,name'])
            ->search($search);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        $data->through(function (Student $student) {
            $latestParticipant = $student->participants()->latest()->first();

            return [
                'id' => $student->id,
                'nik' => $student->nik,
                'full_name' => $student->full_name,
                'school_name' => $student->school_name,
                'grade' => $student->grade,
                'gender' => $student->gender,
                'age' => $student->age,
                'is_registered' => $latestParticipant !== null,
                'registrations' => $latestParticipant ? [['olimpiade' => $latestParticipant->olimpiade?->name ?? '-', 'status' => $latestParticipant->status]] : [],
            ];
        });

        return response()->json($data);
    }

    public function show(Student $binaan)
    {
        $this->authorize('view', $binaan);

        $binaan->load(['province:id,name', 'regency:id,name', 'village:id,name', 'district:id,name']);

        return Inertia::render('admin/teacher/master/binaan/show', ['binaan' => $binaan]);
    }
}
