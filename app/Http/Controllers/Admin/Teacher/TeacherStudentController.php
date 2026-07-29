<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherParticipantRequest;
use App\Http\Requests\Company\UpdateTeacherParticipantRequest;
use App\Models\Company\Participant;
use App\Services\TeacherService;
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

        return Inertia::render('admin/teacher/students/create', $this->service->getFormOptions());
    }

    public function store(StoreTeacherParticipantRequest $request)
    {
        $this->authorize('create', Participant::class);

        $data = $request->validated();
        $participant = $this->service->registerStudent(Auth::user(), $data);

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Siswa {$participant->full_name} berhasil didaftarkan.");
    }

    public function show(Participant $participant)
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/teacher/students/show', [
            'participant' => $participant->load(['olimpiade:id,name', 'province:id,name', 'regency:id,name']),
        ]);
    }

    public function edit(Participant $participant)
    {
        $this->authorize('update', $participant);

        return Inertia::render('admin/teacher/students/edit', [
            'participant' => $participant,
            ...$this->service->getFormOptions(),
        ]);
    }

    public function update(UpdateTeacherParticipantRequest $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $this->service->updateStudent(Auth::user(), $participant, $request->validated());

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Data siswa {$participant->full_name} berhasil diupdate.");
    }

    public function destroy(Participant $participant)
    {
        $this->authorize('delete', $participant);

        $name = $participant->full_name;
        $participant->delete();

        return redirect()
            ->route('admin.teacher.students.index')
            ->with('success', "Data siswa {$name} berhasil dihapus.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $query = Participant::query()
            ->with(['olimpiade:id,name', 'province:id,name', 'regency:id,name'])
            ->where('mentor_id', Auth::id())
            ->search($request->string('globalSearch')->toString())
            ->orderBy('created_at', 'desc');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }
}
