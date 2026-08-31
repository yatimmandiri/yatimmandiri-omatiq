<?php

namespace App\Http\Controllers\Admin\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Services\PenyaluranService;
use App\Services\TeacherService;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TeacherStudentController extends Controller
{
    public function __construct(
        private readonly TeacherService $service,
        private readonly PenyaluranService $penyaluran,
    ) {}

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

        return Inertia::render('admin/teacher/students/list', [
            'sanggars' => collect($sanggars)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-', 'type' => $s['type'] ?? null])->values()->all(),
            'selected_sanggar_id' => $request->integer('sanggar_id') ?: null,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggarId = $request->integer('sanggar_id') ?: null;
        $studentsRaw = [];
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token, $sanggarId);
            } catch (\Throwable $e) {
                $studentsRaw = [];
            }
        }

        // Fallback for tests / local dev without penyaluran: use local Student where is_binaan
        if (empty($studentsRaw) && app()->environment('testing')) {
            $local = Student::query()
                ->where('mentor_id', Auth::id())
                ->where('is_binaan', true)
                ->get(['id as student_id', 'nik', 'full_name as name', 'school_name', 'grade as class'])
                ->map(fn ($s) => ['student_id' => $s->student_id, 'nik' => $s->nik, 'name' => $s->name, 'school_name' => $s->school_name, 'class' => $s->class, 'status' => true])
                ->all();
            $studentsRaw = $local;
        }

        // Determine event year from requested olimpiade or default to current year
        $eventYear = null;
        if ($request->filled('olimpiade_id')) {
            $eventYear = Olimpiade::find($request->integer('olimpiade_id'))?->event_year;
        }
        $options = $this->service->getFormOptionsFromApi($studentsRaw, $request->integer('student_id') ?: $request->integer('penyaluran_student_id') ?: null, $eventYear);

        $sanggarsRaw = [];
        if ($token) {
            try {
                $sanggarsRaw = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggarsRaw = [];
            }
        }
        $options['sanggars'] = collect($sanggarsRaw)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-', 'type' => $s['type'] ?? null])->values()->all();
        $options['selected_sanggar_id'] = $sanggarId;
        $options['provinces'] = Province::orderBy('name')->get(['id', 'name']);
        $options['regencies'] = Regency::orderBy('name')->get(['id', 'province_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'province_id' => $r->province_id, 'name' => $r->name])->values()->all();
        $options['districts'] = District::orderBy('name')->get(['id', 'regency_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'regency_id' => $r->regency_id, 'name' => $r->name])->values()->all();
        $options['villages'] = Village::orderBy('name')->limit(500)->get(['id', 'district_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'district_id' => $r->district_id, 'name' => $r->name])->values()->all();
        $options['branches'] = Cache::remember('branch_offices', 3600, fn () => json_decode(Storage::disk('local')->get('branch-offices.json'), true) ?? []);

        return Inertia::render('admin/teacher/students/create', $options);
    }

    public function store(StoreTeacherParticipantRequest $request)
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        $data = $request->validated();
        // Resolve sanggar name if id provided
        if (! empty($data['penyaluran_sanggar_id']) && empty($data['penyaluran_sanggar_name'])) {
            $tokenTmp = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
            if ($tokenTmp) {
                try {
                    $sanggarsTmp = $this->penyaluran->sanggars($tokenTmp);
                    $foundS = collect($sanggarsTmp)->firstWhere(fn (array $s) => (int) ($s['id'] ?? 0) === (int) $data['penyaluran_sanggar_id']);
                    if ($foundS) {
                        $data['penyaluran_sanggar_name'] = $foundS['name'] ?? null;
                    }
                } catch (\Throwable $e) {
                }
            }
        }
        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        $penyaluranStudent = null;
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token);
                $penyaluranStudent = collect($studentsRaw)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === (int) $data['penyaluran_student_id']);
            } catch (\Throwable $e) {
                $penyaluranStudent = null;
            }
        }
        // Fallback for tests
        if (! $penyaluranStudent) {
            $local = Student::find($data['penyaluran_student_id']);
            if ($local && $local->mentor_id === Auth::id() && $local->is_binaan) {
                $penyaluranStudent = ['student_id' => $local->id, 'name' => $local->full_name, 'nik' => $local->nik, 'school_name' => $local->school_name, 'class' => $local->grade, 'status' => true];
            }
        }

        if (! $penyaluranStudent) {
            return back()->withErrors(['penyaluran_student_id' => 'Binaan tidak ditemukan.']);
        }

        $participant = $this->service->registerStudent(Auth::user(), $data, $penyaluranStudent);

        $name = $participant->penyaluran_student_name ?? 'Unknown';

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
        $search = strtolower($request->string('globalSearch')->toString());

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        $studentsRaw = [];
        $sanggarMap = collect();
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token);
                $sanggarsTmp = $this->penyaluran->sanggars($token);
                $sanggarMap = collect($sanggarsTmp)->pluck('name', 'id');
            } catch (\Throwable $e) {
                $studentsRaw = [];
            }
        }

        // Fallback for tests / local without penyaluran
        if (empty($studentsRaw) && app()->environment('testing')) {
            $local = Student::query()
                ->where('mentor_id', Auth::id())
                ->where('is_binaan', true)
                ->get(['id as student_id', 'nik', 'full_name as name', 'school_name', 'grade as class'])
                ->map(fn ($s) => ['student_id' => $s->student_id, 'nik' => $s->nik, 'name' => $s->name, 'school_name' => $s->school_name, 'class' => $s->class, 'status' => true])
                ->all();
            $studentsRaw = $local;
        }

        // Map active participants by penyaluran_student_id + legacy student_id
        $activeMap = Participant::query()
            ->where('mentor_id', Auth::id())
            ->where(function ($q) {
                $q->whereNotNull('penyaluran_student_id')->orWhereNotNull('student_id');
            })
            ->with('olimpiade:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(function (Participant $p) {
                return (int) ($p->penyaluran_student_id ?? $p->student_id ?? 0);
            })
            ->map(fn ($group) => $group->first());

        // Pendaftaran: flat unique by NIK (binaan di >1 sanggar tampil 1x)
        $studentsRaw = collect($studentsRaw)->unique(fn (array $s) => $s['nik'] ?? $s['student_id'] ?? $s['id'] ?? null)->values()->all();

        $collection = collect($studentsRaw)
            ->map(function (array $s) use ($activeMap, $sanggarMap) {
                $id = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                $latest = $activeMap->get($id);
                $sanggarIds = $s['sanggar_ids'] ?? (isset($s['sanggar_id']) ? [$s['sanggar_id']] : []);
                $sanggarNames = collect($sanggarIds)->map(fn ($sid) => $sanggarMap[$sid] ?? $sid)->filter()->values()->all();
                if (empty($sanggarNames) && isset($s['sanggar_id']) && $s['sanggar_id']) {
                    $sanggarNames = [$sanggarMap[$s['sanggar_id']] ?? $s['sanggar_id']];
                }

                return [
                    'id' => $id,
                    'nik' => $s['nik'] ?? null,
                    'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                    'school_name' => $s['school_name'] ?? null,
                    'grade' => $s['class'] ?? $s['grade'] ?? null,
                    'sanggar_ids' => $sanggarIds,
                    'sanggar_names' => $sanggarNames,
                    'sanggar_terdaftar' => $latest?->penyaluran_sanggar_name,
                    'is_registered' => $latest !== null,
                    'participant_id' => $latest?->id,
                    'registration_status' => $latest?->status,
                    'registration_number' => $latest?->registration_number,
                    'olimpiade_name' => $latest?->olimpiade?->name,
                ];
            })
            ->when($search !== '', function ($c) use ($search) {
                return $c->filter(fn (array $item) => str_contains(strtolower($item['full_name'] ?? ''), $search)
                    || str_contains(strtolower($item['nik'] ?? ''), $search)
                    || str_contains(strtolower($item['school_name'] ?? ''), $search)
                    || str_contains(strtolower(implode(',', $item['sanggar_names'] ?? [])) ?? '', $search));
            })
            ->when($registration === 'registered', fn ($c) => $c->filter(fn (array $item) => $item['is_registered']))
            ->when($registration === 'unregistered', fn ($c) => $c->filter(fn (array $item) => ! $item['is_registered']))
            ->sortBy('full_name')
            ->values();

        // Manual pagination for in-memory collection
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
}
