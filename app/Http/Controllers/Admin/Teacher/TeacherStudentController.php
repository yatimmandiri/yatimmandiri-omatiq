<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherParticipantRequest;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\TeacherService;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeacherStudentController extends Controller
{
    public function __construct(
        private readonly TeacherService $service,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        return Inertia::render('admin/teacher/students/list');
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        return Inertia::render(
            'admin/teacher/students/create',
            $this->service->getFormOptions(Auth::user(), $request->integer('student_id')),
        );
    }

    public function store(StoreTeacherParticipantRequest $request)
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        $data = $request->validated();
        $participant = $this->service->registerStudent(Auth::user(), $data);

        $name = $participant->student?->full_name ?? 'Unknown';

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Binaan {$name} berhasil didaftarkan.");
    }

    public function show(Participant $participant)
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/teacher/students/show', [
            'participant' => $this->service->getStudentById(Auth::user(), $participant->id),
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $registration = $request->input('filterValue.registration');

        return response()->json(
            Student::query()
                ->where('mentor_id', Auth::id())
                ->where('is_binaan', true)
                ->with(['participants' => fn ($query) => $query->orderByDesc('created_at')])
                ->with('participants.olimpiade:id,name')
                ->search($request->string('globalSearch')->toString())
                ->when($registration === 'registered', fn ($query) => $query->has('participants'))
                ->when($registration === 'unregistered', fn ($query) => $query->doesntHave('participants'))
                ->orderBy('full_name')
                ->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null)
                ->through(fn (Student $student) => $this->studentPayload($student)),
        );
    }

    private function studentPayload(Student $student): array
    {
        $latest = $student->participants->first();

        return [
            'id' => $student->id,
            'nik' => $student->nik,
            'full_name' => $student->full_name,
            'school_name' => $student->school_name,
            'grade' => $student->grade,
            'is_registered' => $latest !== null,
            'participant_id' => $latest?->id,
            'registration_status' => $latest?->status,
            'registration_number' => $latest?->registration_number,
            'olimpiade_name' => $latest?->olimpiade?->name,
        ];
    }
}
