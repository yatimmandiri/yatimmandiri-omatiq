<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreStudentRequest;
use App\Http\Requests\Company\UpdateStudentRequest;
use App\Models\Company\Student;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    use LogActivity, UploadFiles;

    public function __construct(
        private readonly StudentService $service,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Student::class);

        return Inertia::render('admin/company/students/list', [
            'mentors' => $this->service->formOptions()['mentors'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        return Inertia::render('admin/company/students/create', $this->service->formOptions());
    }

    public function store(StoreStudentRequest $request)
    {
        $this->authorize('create', Student::class);

        $student = Student::create($this->service->payloadFromRequest($request));

        $this->logSuccess('create-student', "Created student: {$student->full_name}", [
            'student_id' => $student->id,
            'new_data' => $student->toArray(),
        ]);

        return redirect()->route('admin.companies.students.index')->with('success', "Binaan {$student->full_name} berhasil ditambahkan.");
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['mentor:id,name,email', 'province:id,name', 'regency:id,name']);

        return Inertia::render('admin/company/students/show', [
            'student' => $this->service->showPayload($student),
            'participants' => $student->participants()
                ->with(['olimpiade:id,name,category'])
                ->orderByDesc('created_at')
                ->get(['id', 'olimpiade_id', 'registration_number', 'status', 'payment_status', 'created_at']),
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        return Inertia::render('admin/company/students/edit', [
            'student' => $student,
            ...$this->service->formOptions(),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $this->authorize('update', $student);

        $oldData = $student->toArray();
        $student->update($this->service->payloadFromRequest($request, $student));

        $this->logSuccess('update-student', "Updated student: {$student->full_name}", [
            'student_id' => $student->id,
            'old_data' => $oldData,
            'new_data' => $student->fresh()->toArray(),
        ]);

        return redirect()->route('admin.companies.students.index')->with('success', "Data binaan {$student->full_name} berhasil diupdate.");
    }

    public function destroy(Student $student)
    {
        $this->authorize('delete', $student);

        if ($student->participants()->exists()) {
            return redirect()->route('admin.companies.students.index')->with('error', "Binaan {$student->full_name} memiliki data peserta dan tidak dapat dihapus.");
        }

        $name = $student->full_name;
        foreach (['photo_path', 'identity_card_path', 'family_card_path'] as $column) {
            $this->deleteFile($student->{$column});
        }

        $student->delete();
        $this->logSuccess('delete-student', "Deleted student: {$name}", ['student_id' => $student->id]);

        return redirect()->route('admin.companies.students.index')->with('success', "Binaan {$name} berhasil dihapus.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-student', Student::class);

        $allowed = ['id', 'full_name', 'school_name', 'nik', 'is_binaan', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $query = Student::query()
            ->where('is_binaan', true)
            ->with(['mentor:id,name', 'province:id,name', 'regency:id,name'])
            ->withCount('participants')
            ->search($request->string('globalSearch')->toString())
            ->when($request->input('filterValue.mentor_id'), fn ($query, $id) => $query->where('mentor_id', $id))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $request->integer('perPage')
            ? $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }
}
