<?php

namespace App\Http\Controllers\Admin\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
use App\Services\TeacherService;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DataPesertaController extends Controller
{
    public function __construct(
        private readonly TeacherService $service,
        private readonly PenyaluranService $penyaluran,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Participant::class);

        $userId = Auth::id();

        $olimpiades = Olimpiade::query()
            ->ordered()
            ->get(['id', 'name', 'event_year'])
            ->map(fn (Olimpiade $o) => [
                'value' => (string) $o->id,
                'label' => trim($o->name.' '.($o->event_year ? "({$o->event_year})" : '')),
            ]);

        $eventYears = collect([
            ...Participant::query()
                ->where('mentor_id', $userId)
                ->where('registration_type', 'teacher')
                ->whereNotNull('event_year')
                ->distinct()
                ->pluck('event_year')
                ->all(),
            ...Olimpiade::query()
                ->whereNotNull('event_year')
                ->distinct()
                ->pluck('event_year')
                ->all(),
        ])
            ->filter()
            ->unique()
            ->sortDesc()
            ->values()
            ->map(fn ($y) => ['value' => (string) $y, 'label' => (string) $y]);

        return Inertia::render('admin/guru/data-peserta/list', [
            'filterOptions' => [
                'olimpiades' => $olimpiades,
                'eventYears' => $eventYears,
            ],
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

        return Inertia::render('admin/guru/data-peserta/create', $options);
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
                $studentsRaw = $this->penyaluran->students($token, $data['penyaluran_sanggar_id'] ?? null);
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

        if (empty($data['penyaluran_sanggar_id']) && ! empty($penyaluranStudent['sanggar_id'])) {
            $data['penyaluran_sanggar_id'] = $penyaluranStudent['sanggar_id'];
        }

        if (empty($data['penyaluran_sanggar_name']) && ! empty($penyaluranStudent['sanggar_name'])) {
            $data['penyaluran_sanggar_name'] = $penyaluranStudent['sanggar_name'];
        }

        $participant = $this->service->registerStudent(Auth::user(), $data, $penyaluranStudent);

        $name = $participant->student?->full_name ?? 'Unknown';

        return redirect()
            ->route('admin.guru.data-peserta.index')
            ->with('success', "Binaan {$name} berhasil didaftarkan.");
    }

    public function show(Participant $participant)
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/guru/data-peserta/show', [
            'participant' => $this->service->getStudentById(Auth::user(), $participant->id),
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $allowed = ['id', 'registration_number', 'status', 'created_at', 'updated_at', 'event_year'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $filterValue = $request->input('filterValue', []);

        $query = Participant::query()
            ->where('mentor_id', Auth::id())
            ->where('registration_type', 'teacher')
            ->with([
                'olimpiade:id,name,event_year',
                'student:id,full_name,nik,nis,school_name,school_level,grade,gender,regency_id,penyaluran_id,parent_phone',
                'student.regency:id,name',
            ])
            ->search($request->string('globalSearch')->toString())
            ->when(data_get($filterValue, 'status'), fn ($q, $v) => $q->where('status', $v))
            ->when(data_get($filterValue, 'olimpiade_id'), fn ($q, $v) => $q->where('olimpiade_id', $v))
            ->when(data_get($filterValue, 'event_year'), fn ($q, $v) => $q->where('event_year', $v))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);
        $data->through(fn (Participant $p) => $this->participantPayload($p));

        return response()->json($data);
    }

    private function participantPayload(Participant $participant): array
    {
        $payload = $participant->toArray();

        if ($participant->relationLoaded('student') && $participant->student) {
            $payload['student'] = [
                ...$participant->student->toArray(),
                'photo_url' => $participant->student->photo_url,
                'student_card_url' => $participant->student->student_card_url,
            ];
            if ($participant->student->relationLoaded('regency') && $participant->student->regency) {
                $payload['student']['regency'] = $participant->student->regency->toArray();
            }
        }

        if ($participant->relationLoaded('olimpiade') && $participant->olimpiade) {
            $payload['olimpiade'] = $participant->olimpiade->toArray();
        }

        return $payload;
    }
}
