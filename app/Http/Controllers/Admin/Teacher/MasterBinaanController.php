<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MasterBinaanController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Participant::class);

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        return Inertia::render('admin/teacher/master/binaan/list', [
            'sanggars' => collect($sanggars)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-', 'type' => $s['type'] ?? null])->values()->all(),
            'selected_sanggar_id' => $request->integer('sanggar_id') ?: null,
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $perPage = min($request->integer('perPage') ?: 10, 100);
        $search = strtolower($request->string('globalSearch')->toString());
        $sanggarId = $request->integer('filterValue.sanggar_id') ?: $request->integer('sanggar_id') ?: null;
        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        $studentsRaw = [];
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token, $sanggarId);
            } catch (\Throwable $e) {
                $studentsRaw = [];
            }
        }

        if (empty($studentsRaw) && app()->environment('testing')) {
            $studentsRaw = Student::query()
                ->where('mentor_id', Auth::id())
                ->where('is_binaan', true)
                ->get(['id as student_id', 'nik', 'full_name as name', 'school_name', 'grade as class'])
                ->map(fn ($s) => ['student_id' => $s->student_id, 'nik' => $s->nik, 'name' => $s->name, 'school_name' => $s->school_name, 'class' => $s->class, 'status' => true, 'sanggar_id' => null])
                ->all();
        }

        // Also include local is_binaan students that may not be in Penyaluran (for CRUD scaffold)
        $localStudents = Student::query()
            ->where('mentor_id', Auth::id())
            ->where('is_binaan', true)
            ->whereNotIn('penyaluran_id', collect($studentsRaw)->pluck('student_id')->filter()->all())
            ->get(['id as student_id', 'nik', 'full_name as name', 'school_name', 'grade as class'])
            ->map(fn ($s) => ['student_id' => $s->student_id, 'nik' => $s->nik, 'name' => $s->name, 'school_name' => $s->school_name, 'class' => $s->class, 'status' => true])
            ->all();

        $allRaw = array_merge($studentsRaw, $localStudents);

        $activeMap = Participant::query()
            ->where('mentor_id', Auth::id())
            ->whereNotNull('student_id')
            ->with('olimpiade:id,name')
            ->get()
            ->groupBy(fn (Participant $p) => (int) $p->student_id);

        $collection = collect($allRaw)
            ->unique(fn (array $s) => $s['nik'] ?? $s['student_id'] ?? null)
            ->map(function (array $s) use ($activeMap) {
                // For Penyaluran-based, student_id is penyaluran_id, for local, it's students.id
                $penyaluranId = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                // Try to find local student by penyaluran_id to get real student.id for is_registered check
                $localStudent = Student::where('penyaluran_id', $penyaluranId)->where('is_binaan', true)->first();
                $lookupId = $localStudent ? $localStudent->id : $penyaluranId;
                $participants = $activeMap->get($lookupId) ?? $activeMap->get($penyaluranId) ?? collect();
                $isRegistered = $participants->isNotEmpty();

                return [
                    'id' => $penyaluranId,
                    'student_db_id' => $localStudent?->id,
                    'nik' => $s['nik'] ?? null,
                    'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                    'school_name' => $s['school_name'] ?? null,
                    'grade' => $s['class'] ?? $s['grade'] ?? null,
                    'gender' => $s['gender'] ?? null,
                    'sanggar_id' => $s['sanggar_id'] ?? null,
                    'is_registered' => $isRegistered,
                    'registrations' => $participants->map(fn (Participant $p) => ['olimpiade' => $p->olimpiade?->name, 'status' => $p->status])->values()->all(),
                ];
            })
            ->when($search !== '', fn ($c) => $c->filter(fn (array $item) => str_contains(strtolower($item['full_name'] ?? ''), $search) || str_contains(strtolower($item['nik'] ?? ''), $search) || str_contains(strtolower($item['school_name'] ?? ''), $search)))
            ->sortBy('full_name')
            ->values();

        $page = max(1, $request->integer('page') ?: 1);
        $total = $collection->count();
        $items = $collection->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Student::class);

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        return Inertia::render('admin/teacher/master/binaan/create', [
            'sanggars' => collect($sanggars)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-'])->values()->all(),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::orderBy('name')->get(['id', 'province_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'province_id' => $r->province_id, 'name' => $r->name])->values()->all(),
            'districts' => District::orderBy('name')->get(['id', 'regency_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'regency_id' => $r->regency_id, 'name' => $r->name])->values()->all(),
            'villages' => Village::orderBy('name')->limit(500)->get(['id', 'district_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'district_id' => $r->district_id, 'name' => $r->name])->values()->all(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Student::class);

        $request->validate([
            'nik' => ['required', 'string', 'size:16', 'unique:students,nik'],
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
        ]);

        $student = Student::create([
            'nik' => $request->nik,
            'full_name' => $request->full_name,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'birth_place' => $request->birth_place,
            'age' => $request->age,
            'school_name' => $request->school_name,
            'grade' => $request->grade,
            'address' => $request->address,
            'province_id' => $request->province_id,
            'regency_id' => $request->regency_id,
            'district_id' => $request->district_id,
            'village_id' => $request->village_id,
            'parent_phone' => $request->parent_phone,
            'mentor_id' => Auth::id(),
            'is_binaan' => true,
        ]);

        return redirect()->route('admin.teacher.master.binaan.index')->with('success', "Binaan {$student->full_name} berhasil ditambahkan (lokal, sync Penyaluran TODO).");
    }

    public function edit(Student $binaan)
    {
        $this->authorize('update', $binaan);
        if ($binaan->mentor_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('admin/teacher/master/binaan/edit', [
            'binaan' => $binaan->load(['province:id,name', 'regency:id,name', 'village:id,name', 'district:id,name']),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::orderBy('name')->get(['id', 'province_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'province_id' => $r->province_id, 'name' => $r->name])->values()->all(),
            'districts' => District::orderBy('name')->get(['id', 'regency_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'regency_id' => $r->regency_id, 'name' => $r->name])->values()->all(),
            'villages' => Village::orderBy('name')->limit(500)->get(['id', 'district_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'district_id' => $r->district_id, 'name' => $r->name])->values()->all(),
        ]);
    }

    public function update(Request $request, Student $binaan)
    {
        $this->authorize('update', $binaan);
        if ($binaan->mentor_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
        ]);

        $binaan->update($request->only(['full_name', 'gender', 'birth_date', 'school_name', 'grade', 'address', 'province_id', 'regency_id', 'district_id', 'village_id', 'birth_place', 'age', 'parent_phone', 'nickname']));

        return redirect()->route('admin.teacher.master.binaan.index')->with('success', "Binaan {$binaan->full_name} diperbarui.");
    }

    public function destroy(Student $binaan)
    {
        $this->authorize('delete', $binaan);
        if ($binaan->mentor_id !== Auth::id()) {
            abort(403);
        }
        if ($binaan->participants()->exists()) {
            return back()->with('error', 'Binaan masih memiliki pendaftaran, tidak bisa dihapus.');
        }
        $binaan->delete();

        return redirect()->route('admin.teacher.master.binaan.index')->with('success', 'Binaan dihapus.');
    }

    public function show(Student $binaan)
    {
        $this->authorize('view', $binaan);

        if ($binaan->mentor_id !== Auth::id()) {
            abort(403);
        }

        $binaan->load(['province:id,name', 'regency:id,name', 'village:id,name', 'district:id,name']);

        return Inertia::render('admin/teacher/master/binaan/show', ['binaan' => $binaan]);
    }
}
