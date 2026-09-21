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
use Illuminate\Support\Facades\Auth;
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

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $isCabang ? $user->getBranchName() : null;

        return Inertia::render('admin/company/students/list', [
            'mentors' => $this->service->formOptions()['mentors'],
            'userBranch' => $userBranch,
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

        $user = Auth::user();
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $hasBranchParticipant = $student->participants()->where(function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->exists();
                $mentorBranch = $student->mentor?->getBranchName();

                if (! $hasBranchParticipant && (! $mentorBranch || stripos($mentorBranch, $branch) === false)) {
                    abort(403, 'Akses terbatas untuk santri binaan cabang Anda.');
                }
            }
        }

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

        $student = $this->service->resolveFromPenyaluran($student);

        return Inertia::render('admin/company/students/edit', [
            'student' => $student->load(['mentor:id,name,email,phone', 'province:id,name', 'regency:id,name', 'district:id,name', 'village:id,name']),
            ...$this->service->formOptions($student),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $this->authorize('update', $student);

        $payload = $this->service->payloadFromRequest($request, $student);

        if ($student->penyaluran_id) {
            try {
                $this->service->syncToPenyaluran($student, $payload);
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['nik' => 'Gagal memperbarui data santri di server Penyaluran: '.$e->getMessage()])
                    ->withInput();
            }
        }

        $oldData = $student->toArray();
        $student->update($payload);

        if (! empty($payload['nik'])) {
            $student->participants()->where('event_year', 2026)->update(['nik' => $payload['nik']]);
        }

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

        $newStatus = ! $student->is_active;

        if ($student->penyaluran_id) {
            try {
                $this->service->syncToPenyaluran($student, ['status' => $newStatus]);
            } catch (\Throwable $e) {
                return back()->with('error', 'Gagal memperbarui status santri di Penyaluran: '.$e->getMessage());
            }
        }

        $student->update(['is_active' => $newStatus]);

        $this->logSuccess('update-student-status', "Toggled student status: {$student->full_name} -> ".($student->is_active ? 'aktif' : 'non-aktif'), ['student_id' => $student->id]);

        return back()->with('success', $student->is_active ? 'Data diaktifkan.' : 'Data dinonaktifkan.');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-student', Student::class);

        $user = Auth::user();
        $allowed = ['id', 'full_name', 'school_name', 'nik', 'is_binaan', 'is_active', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $query = Student::query()
            ->with(['mentor:id,name', 'province:id,name', 'regency:id,name'])
            ->withCount('participants')
            ->search($request->string('globalSearch')->toString());

        // Cabang role strict scoping
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $query->where(function ($q) use ($branch) {
                    $q->whereHas('participants', function ($pq) use ($branch) {
                        $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    })->orWhereHas('mentor', function ($mq) use ($branch) {
                        $mq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    });
                });
            }
        } elseif ($user && $user->hasRole('Teacher')) {
            $query->where('mentor_id', $user->id);
        }

        $mentorId = data_get($filterValue, 'mentor_id');
        $isBinaan = data_get($filterValue, 'is_binaan');
        $isActive = data_get($filterValue, 'is_active');
        $schoolLevel = data_get($filterValue, 'school_level');
        $provinceId = data_get($filterValue, 'province_id');

        $query
            ->when(filled($mentorId) && $mentorId !== 'all', fn ($q) => $q->where('mentor_id', $mentorId))
            ->when($isBinaan !== null && $isBinaan !== '' && $isBinaan !== 'all', fn ($q) => $q->where('is_binaan', filter_var($isBinaan, FILTER_VALIDATE_BOOLEAN)))
            ->when($isActive !== null && $isActive !== '' && $isActive !== 'all', fn ($q) => $q->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN)))
            ->when(filled($schoolLevel) && $schoolLevel !== 'all', fn ($q) => $q->where('school_level', $schoolLevel))
            ->when(filled($provinceId) && $provinceId !== 'all', fn ($q) => $q->where('province_id', $provinceId))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
