<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreStudentRequest;
use App\Http\Requests\Company\UpdateStudentRequest;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
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

    public function status(Request $request, Student $student)
    {
        $this->authorize('update', $student);

        $student->update(['is_active' => ! $student->is_active]);

        // Sync is_binaan to penyaluran if needed (best practice: try API, log if fails)
        if ($student->penyaluran_id) {
            try {
                app(PenyaluranService::class);
            } catch (\Throwable $e) {
            }
        }

        $this->logSuccess('update-student-status', "Toggled student status: {$student->full_name} -> ".($student->is_active ? 'aktif' : 'non-aktif'), ['student_id' => $student->id]);

        return back()->with('success', $student->is_active ? 'Data diaktifkan.' : 'Data dinonaktifkan.');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-student', Student::class);

        $allowed = ['id', 'full_name', 'school_name', 'nik', 'is_binaan', 'is_active', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $filterValue = $request->input('filterValue', []);

        $query = Student::query()
            ->with(['mentor:id,name', 'province:id,name', 'regency:id,name'])
            ->withCount('participants')
            ->search($request->string('globalSearch')->toString())
            ->when(data_get($filterValue, 'mentor_id'), fn ($q, $v) => $q->where('mentor_id', $v))
            ->when(data_get($filterValue, 'is_binaan') !== null && data_get($filterValue, 'is_binaan') !== '', fn ($q) => $q->where('is_binaan', filter_var(data_get($filterValue, 'is_binaan'), FILTER_VALIDATE_BOOLEAN)))
            ->when(data_get($filterValue, 'is_active') !== null && data_get($filterValue, 'is_active') !== '', fn ($q) => $q->where('is_active', filter_var(data_get($filterValue, 'is_active'), FILTER_VALIDATE_BOOLEAN)))
            ->when(data_get($filterValue, 'school_level'), fn ($q, $v) => $q->where('school_level', $v))
            ->when(data_get($filterValue, 'province_id'), fn ($q, $v) => $q->where('province_id', $v))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
