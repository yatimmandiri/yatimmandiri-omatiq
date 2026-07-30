<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherParticipantRequest;
use App\Http\Requests\Company\UpdateTeacherParticipantRequest;
use App\Models\Company\Participant;
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

    public function create(): Response
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        return Inertia::render('admin/teacher/students/create', $this->service->getFormOptions());
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
            ->with('success', "Siswa {$name} berhasil didaftarkan.");
    }

    public function show(Participant $participant)
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/teacher/students/show', [
            'participant' => $participant->load(['olimpiade:id,name', 'student:id,full_name,school_name,grade,gender,photo_path,province_id,regency_id,parent_phone,nik,birth_place,birth_date,nickname,address,identity_card_path,family_card_path,education_level', 'student.province:id,name', 'student.regency:id,name']),
        ]);
    }

    public function edit(Participant $participant)
    {
        $this->authorize('update', $participant);

        return Inertia::render('admin/teacher/students/edit', [
            'participant' => $participant->load(['student:id,full_name,nickname,gender,birth_place,birth_date,age,school_name,grade,address,province_id,regency_id,parent_phone,nik,photo_path,identity_card_path,family_card_path,education_level', 'student.province:id,name', 'student.regency:id,name']),
            ...$this->service->getFormOptions(),
        ]);
    }

    public function update(UpdateTeacherParticipantRequest $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $this->service->updateStudent(Auth::user(), $participant, $request->validated());

        $name = $participant->fresh()->student?->full_name ?? 'Unknown';

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Data siswa {$name} berhasil diupdate.");
    }

    public function destroy(Participant $participant)
    {
        $this->authorize('delete', $participant);

        $name = $participant->student?->full_name ?? 'Unknown';
        $participant->delete();

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Data siswa {$name} berhasil dihapus.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $query = Participant::query()
            ->with(['olimpiade:id,name', 'student:id,full_name,school_name,gender'])
            ->where('mentor_id', Auth::id())
            ->search($request->string('globalSearch')->toString())
            ->orderBy('created_at', 'desc');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }
}
