<?php

namespace App\Http\Controllers\Teacher;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DataPesertaController extends Controller
{
    use LogActivity, UploadFiles;

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

        return Inertia::render('teacher/data-peserta/list', [
            'filterOptions' => [
                'olimpiades' => $olimpiades,
                'eventYears' => $eventYears,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', Participant::class);

        $settings = app(SiteSettings::class);

        if (! $settings->registration_binaan_open) {
            abort(403, 'Pendaftaran binaan sedang ditutup.');
        }

        $studentId = $request->integer('student_id') ?: $request->integer('penyaluran_student_id') ?: null;
        if (! $studentId) {
            return redirect()
                ->route('teacher.data-binaan.index')
                ->with('info', 'Silakan pilih santri yang ingin didaftarkan terlebih dahulu.');
        }

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggarId = $request->integer('sanggar_id') ?: null;
        $studentsRaw = [];
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token, $sanggarId);
                $studentsRaw = collect($studentsRaw)
                    ->filter(fn (array $s) => filter_var($s['status'] ?? true, FILTER_VALIDATE_BOOLEAN))
                    ->values()
                    ->all();
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

        $targetStudent = collect($studentsRaw)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === $studentId);

        if (! $targetStudent && $token) {
            try {
                $allStudentsRaw = $this->penyaluran->students($token, null);
                $targetStudent = collect($allStudentsRaw)
                    ->filter(fn (array $s) => filter_var($s['status'] ?? true, FILTER_VALIDATE_BOOLEAN))
                    ->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === $studentId);
            } catch (\Throwable $e) {
            }
        }

        if (! $targetStudent) {
            return redirect()
                ->route('teacher.data-binaan.index')
                ->with('error', 'Santri tidak ditemukan di data Penyaluran Anda.');
        }

        // Determine event year from requested olimpiade or default to current year
        $eventYear = null;
        if ($request->filled('olimpiade_id')) {
            $eventYear = Olimpiade::find($request->integer('olimpiade_id'))?->event_year;
        }
        $eventYear ??= (int) date('Y');

        // Check if student is already actively registered
        $targetNik = trim((string) ($targetStudent['nik'] ?? ''));
        if ($targetNik !== '' && $targetNik !== '-' && Student::hasActiveRegistrationFor($targetNik, $eventYear)) {
            return redirect()
                ->route('teacher.data-binaan.index')
                ->with('error', 'Santri ini sudah terdaftar pada OMATIQ '.$eventYear.'.');
        }

        $options = $this->service->getFormOptionsFromApi([$targetStudent], $studentId, $eventYear);

        $sanggarsRaw = [];
        if ($token) {
            try {
                $sanggarsRaw = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggarsRaw = [];
            }
        }
        $options['sanggars'] = collect($sanggarsRaw)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-', 'type' => $s['type'] ?? null])->values()->all();
        $options['selected_sanggar_id'] = $sanggarId ?? $targetStudent['sanggar_id'] ?? null;
        $options['student'] = [
            'id' => $targetStudent['student_id'] ?? $targetStudent['id'] ?? null,
            'student_id' => $targetStudent['student_id'] ?? $targetStudent['id'] ?? null,
            'full_name' => $targetStudent['name'] ?? $targetStudent['full_name'] ?? '-',
            'name' => $targetStudent['name'] ?? $targetStudent['full_name'] ?? '-',
            'nik' => $targetStudent['nik'] ?? null,
            'nis' => $targetStudent['nis'] ?? null,
            'school_name' => $targetStudent['school_name'] ?? null,
            'school_level' => $targetStudent['school_level'] ?? null,
            'grade' => $targetStudent['class'] ?? $targetStudent['grade'] ?? null,
            'birth_date' => $targetStudent['birth_date'] ?? null,
            'address' => $targetStudent['address'] ?? null,
            'guardian_name' => $targetStudent['guardian_name'] ?? null,
            'guardian_phone' => $targetStudent['guardian_phone'] ?? null,
            'sanggar_id' => $targetStudent['sanggar_id'] ?? null,
            'sanggar_name' => $targetStudent['sanggar_name'] ?? null,
            'kantor_name' => $targetStudent['kantor_name'] ?? null,
        ];

        return Inertia::render('teacher/data-peserta/create', $options);
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
                if (! $penyaluranStudent) {
                    $allStudentsRaw = $this->penyaluran->students($token, null);
                    $penyaluranStudent = collect($allStudentsRaw)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === (int) $data['penyaluran_student_id']);
                }
            } catch (\Throwable $e) {
                $penyaluranStudent = null;
            }
        }
        // Fallback for tests
        if (! $penyaluranStudent && app()->environment('testing')) {
            $local = Student::find($data['penyaluran_student_id']);
            if ($local && $local->mentor_id === Auth::id() && $local->is_binaan) {
                $penyaluranStudent = ['student_id' => $local->penyaluran_id ?? $local->id, 'name' => $local->full_name, 'nik' => $local->nik, 'school_name' => $local->school_name, 'class' => $local->grade, 'status' => true];
            }
        }

        if (! $penyaluranStudent) {
            return back()->withErrors(['penyaluran_student_id' => 'Binaan tidak ditemukan.']);
        }

        if (! filter_var($penyaluranStudent['status'] ?? true, FILTER_VALIDATE_BOOLEAN)) {
            return back()->withErrors([
                'penyaluran_student_id' => 'Santri binaan ini sudah tidak aktif / lulus di Penyaluran.',
            ])->withInput();
        }

        $studentNik = trim((string) ($penyaluranStudent['nik'] ?? ''));
        if ($studentNik === '' || $studentNik === '-' || strlen($studentNik) < 10) {
            return back()->withErrors([
                'penyaluran_student_id' => 'Santri binaan belum memiliki NIK yang valid di Penyaluran. Silakan hubungi Admin untuk melengkapi data NIK santri terlebih dahulu sebelum mendaftarkan ke OMATIQ.',
            ])->withInput();
        }

        $olimpiade = Olimpiade::findOrFail($data['olimpiade_id']);
        $eventYear = $olimpiade->event_year ?? (int) date('Y');

        if (Student::hasActiveRegistrationFor($studentNik, $eventYear)) {
            return back()->withErrors([
                'penyaluran_student_id' => "Santri ini sudah terdaftar pada OMATIQ {$eventYear}.",
            ])->withInput();
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
            ->route('teacher.data-peserta.index')
            ->with('success', "Binaan {$name} berhasil didaftarkan.");
    }

    public function show(Participant $participant)
    {
        $this->authorize('view', $participant);

        $p = $this->service->getStudentById(Auth::user(), $participant->id);

        return Inertia::render('teacher/data-peserta/show', [
            'participant' => $this->participantPayload($p),
        ]);
    }

    public function destroy(Participant $participant)
    {
        $this->authorize('delete', $participant);

        $name = $participant->student?->full_name ?? $participant->user?->name ?? 'Unknown';

        DB::transaction(function () use ($participant) {
            if ($participant->payment_proof_path) {
                $this->deleteFile($participant->payment_proof_path);
            }

            $participant->delete();
        });

        $this->logSuccess('delete-participant', "Guru membatalkan pendaftaran peserta: {$name}", [
            'participant_id' => $participant->id,
            'mentor_id' => Auth::id(),
        ]);

        return redirect()
            ->route('teacher.data-peserta.index')
            ->with('success', "Pendaftaran {$name} berhasil dibatalkan.");
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
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $userId = Auth::id();
        $query = Participant::query()
            ->where(function ($q) use ($userId) {
                $q->where('mentor_id', $userId)
                    ->orWhereHas('student', fn ($sq) => $sq->where('mentor_id', $userId));
            })
            ->with([
                'olimpiade:id,name,event_year',
                'student:id,full_name,nik,nis,school_name,school_level,grade,gender,regency_id,penyaluran_id,parent_phone',
                'student.regency:id,name',
            ])
            ->search($request->string('globalSearch')->toString());

        $status = data_get($filterValue, 'status');
        $olimpiadeId = data_get($filterValue, 'olimpiade_id');
        $eventYear = data_get($filterValue, 'event_year');

        $query
            ->when(filled($status) && $status !== 'all', fn ($q) => $q->where('status', $status))
            ->when(filled($olimpiadeId) && $olimpiadeId !== 'all', fn ($q) => $q->where('olimpiade_id', $olimpiadeId))
            ->when(filled($eventYear) && $eventYear !== 'all', fn ($q) => $q->where('event_year', $eventYear))
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
        $payload['payment_proof_url'] = $participant->payment_proof_url;
        $payload['branch'] = $participant->branch;
        $payload['kantor_name'] = $participant->branch ?? $participant->penyaluran_sanggar_name;

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
