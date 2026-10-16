<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Period;
use App\Models\Company\Student;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Services\StudentService;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ParticipantController extends Controller
{
    use LogActivity, UploadFiles;

    public function __construct(
        protected StudentService $studentService,
        protected PenyaluranService $penyaluran
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        $periods = Period::ordered()->get(['id', 'name', 'year', 'is_active']);

        $eventYearsOptions = $periods->isNotEmpty()
            ? $periods->map(fn (Period $p) => [
                'value' => (string) $p->year,
                'label' => "{$p->name} ({$p->year})".($p->is_active ? ' • Aktif' : ''),
            ])
            : collect([
                ...Participant::query()->whereNotNull('event_year')->distinct()->pluck('event_year')->all(),
                ...Olimpiade::query()->whereNotNull('event_year')->distinct()->pluck('event_year')->all(),
            ])->filter()->unique()->sortDesc()->values()->map(fn ($year) => [
                'value' => (string) $year,
                'label' => (string) $year,
            ]);

        $settings = app(SiteSettings::class);

        $user = Auth::user();
        $isCabang = $user && $user->hasRole('Cabang');
        $userBranch = $isCabang ? $user->getBranchName() : null;

        $branchesQuery = Participant::query()
            ->whereNotNull('branch')
            ->where('branch', '<>', '')
            ->distinct();

        if ($isCabang && $userBranch) {
            $branchesQuery->where(function ($q) use ($userBranch) {
                $q->where('branch', $userBranch)
                    ->orWhere('branch', 'like', "%{$userBranch}%");
            });
        }

        return Inertia::render('admin/company/participant/list', [
            'userBranch' => $userBranch,
            'sheets' => $isCabang ? null : [
                'enabled' => $settings->sheets_sync_enabled,
                'spreadsheet_id' => $settings->sheets_spreadsheet_id,
                'sheet_name' => $settings->sheets_sheet_name ?? config('sheets.sheet_name'),
                'url' => $settings->sheets_spreadsheet_id ? 'https://docs.google.com/spreadsheets/d/'.$settings->sheets_spreadsheet_id : null,
            ],
            'filterOptions' => [
                'olimpiades' => Olimpiade::query()
                    ->ordered()
                    ->get(['id', 'name', 'event_year'])
                    ->map(fn (Olimpiade $olimpiade) => [
                        'value' => (string) $olimpiade->id,
                        'label' => trim($olimpiade->name.' '.($olimpiade->event_year ? "({$olimpiade->event_year})" : '')),
                    ]),
                'eventYears' => $eventYearsOptions,
                'branches' => ($isCabang || $userBranch)
                    ? []
                    : $branchesQuery
                        ->orderBy('branch')
                        ->limit(150)
                        ->pluck('branch')
                        ->map(fn (string $branch) => [
                            'value' => $branch,
                            'label' => $branch,
                        ]),
            ],
        ]);
    }

    public function show(Participant $participant): Response
    {
        $this->authorize('view', $participant);

        $participant->loadMissing(['student', 'olimpiade']);

        return Inertia::render('admin/company/participant/show', [
            'participant' => $this->participantPayload($participant),
        ]);
    }

    public function edit(Participant $participant): Response
    {
        $this->authorize('update', $participant);

        $user = Auth::user();
        if ($user && $user->hasRole('Keuangan') && ! $user->hasRole('Administrators')) {
            abort(403, 'Akun keuangan hanya memiliki akses untuk melihat detail dan mengubah status pembayaran.');
        }

        $participant->loadMissing(['student', 'olimpiade']);

        $data = $this->participantPayload($participant);

        $jsonBranches = Cache::remember('branch_offices', 3600, function () {
            if (Storage::disk('local')->exists('branch-offices.json')) {
                return json_decode(Storage::disk('local')->get('branch-offices.json'), true) ?? [];
            }

            return [];
        });

        $branches = collect($jsonBranches)->pluck('name')
            ->merge(User::whereNotNull('branch')->distinct()->pluck('branch'))
            ->merge(Participant::whereNotNull('branch')->distinct()->pluck('branch'))
            ->filter()
            ->map(fn ($b) => strtoupper(trim((string) $b)))
            ->unique()
            ->sort()
            ->values()
            ->map(fn ($name) => ['id' => $name, 'name' => $name]);

        $apiSanggars = [];
        try {
            $apiSanggars = $this->penyaluran->allSanggars();
        } catch (\Throwable $e) {
            $apiSanggars = [];
        }

        $apiSanggarsMapped = collect($apiSanggars)->map(fn ($s) => [
            'id' => (int) ($s['id'] ?? 0),
            'name' => trim((string) ($s['name'] ?? '')),
            'branch' => trim((string) ($s['kantor_name'] ?? $s['branch'] ?? '')),
        ])->filter(fn ($s) => ! empty($s['name']) && $s['name'] !== '-');

        // Resilient fallback: gather sanggars from database participants
        $dbSanggars = Participant::query()
            ->whereNotNull('penyaluran_sanggar_name')
            ->where('penyaluran_sanggar_name', '<>', '')
            ->selectRaw('penyaluran_sanggar_id as id, penyaluran_sanggar_name as name, branch')
            ->groupBy('penyaluran_sanggar_id', 'penyaluran_sanggar_name', 'branch')
            ->get()
            ->map(fn ($row) => [
                'id' => (int) ($row->id ?: crc32($row->name)),
                'name' => trim((string) $row->name),
                'branch' => trim((string) $row->branch),
            ])
            ->filter(fn ($s) => ! empty($s['name']) && $s['name'] !== '-');

        // Fetch participant mentor's live sanggars if available
        $mentorUser = $participant->mentor_id ? User::find($participant->mentor_id) : ($participant->student?->mentor_id ? User::find($participant->student->mentor_id) : null);
        $mentorLiveSanggars = [];
        if ($mentorUser && $mentorUser->penyaluran_token) {
            try {
                $mentorLiveSanggars = $this->penyaluran->sanggars($mentorUser->penyaluran_token);
            } catch (\Throwable $e) {
                $mentorLiveSanggars = [];
            }
        }

        $mentorMappedSanggars = collect($mentorLiveSanggars)->map(fn ($s) => [
            'id' => (int) ($s['id'] ?? $s['sanggar_id'] ?? 0),
            'name' => trim((string) ($s['name'] ?? $s['nama_sanggar'] ?? '')),
            'branch' => trim((string) ($s['kantor_name'] ?? $s['branch'] ?? $mentorUser?->branch ?? '')),
        ])->filter(fn ($s) => ! empty($s['name']));

        $sanggars = collect([...$mentorMappedSanggars, ...$apiSanggarsMapped, ...$dbSanggars])
            ->unique(fn ($s) => strtoupper($s['name']).'|'.strtoupper($s['branch']))
            ->values()
            ->all();

        $apiTeachers = [];
        try {
            $apiTeachers = $this->penyaluran->allTeachers();
        } catch (\Throwable $e) {
            $apiTeachers = [];
        }

        $apiTeachersByPhone = collect($apiTeachers)->filter(fn ($t) => ! empty($t['phone']))->keyBy(fn ($t) => trim(preg_replace('/[^0-9]/', '', (string) $t['phone'])));
        $apiTeachersByPenyaluranId = collect($apiTeachers)->filter(fn ($t) => ! empty($t['id']))->keyBy('id');

        $dbTeacherSanggars = Participant::query()
            ->whereNotNull('mentor_id')
            ->whereNotNull('penyaluran_sanggar_name')
            ->where('penyaluran_sanggar_name', '<>', '')
            ->selectRaw('mentor_id, penyaluran_sanggar_id as id, penyaluran_sanggar_name as name, branch')
            ->groupBy('mentor_id', 'penyaluran_sanggar_id', 'penyaluran_sanggar_name', 'branch')
            ->get()
            ->groupBy('mentor_id');

        $teachers = Role::where('name', 'Teacher')->where('guard_name', 'web')->exists()
            ? User::role('Teacher')->orderBy('name')->get(['id', 'name', 'phone', 'email', 'branch', 'penyaluran_id'])->map(function (User $u) use ($apiTeachersByPhone, $apiTeachersByPenyaluranId, $dbTeacherSanggars, $mentorUser, $mentorMappedSanggars) {
                $cleanPhone = $u->phone ? trim(preg_replace('/[^0-9]/', '', (string) $u->phone)) : null;
                $apiMatch = ($u->penyaluran_id && $apiTeachersByPenyaluranId->has($u->penyaluran_id))
                    ? $apiTeachersByPenyaluranId->get($u->penyaluran_id)
                    : ($cleanPhone && $apiTeachersByPhone->has($cleanPhone) ? $apiTeachersByPhone->get($cleanPhone) : null);

                $teacherSanggars = [];
                if ($mentorUser && $u->id === $mentorUser->id && $mentorMappedSanggars->isNotEmpty()) {
                    $teacherSanggars = $mentorMappedSanggars->values()->all();
                } elseif ($apiMatch && ! empty($apiMatch['sanggars'])) {
                    $teacherSanggars = collect($apiMatch['sanggars'])->map(fn ($s) => [
                        'id' => (int) ($s['id'] ?? $s['sanggar_id'] ?? 0),
                        'name' => trim((string) ($s['name'] ?? $s['nama_sanggar'] ?? '')),
                        'branch' => trim((string) ($s['kantor_name'] ?? $s['branch'] ?? $apiMatch['branch'] ?? $u->branch ?? '')),
                    ])->filter(fn ($s) => ! empty($s['name']))->values()->all();
                } elseif ($dbTeacherSanggars->has($u->id)) {
                    $teacherSanggars = $dbTeacherSanggars->get($u->id)->map(fn ($s) => [
                        'id' => (int) $s->id,
                        'name' => trim((string) $s->name),
                        'branch' => trim((string) ($s->branch ?? $u->branch ?? '')),
                    ])->filter(fn ($s) => ! empty($s['name']))->values()->all();
                }

                return [
                    'id' => $u->id,
                    'penyaluran_id' => $u->penyaluran_id,
                    'name' => $u->name,
                    'phone' => $u->phone,
                    'email' => $u->email,
                    'branch' => $u->branch ?? ($apiMatch['branch'] ?? null),
                    'sanggars' => $teacherSanggars,
                ];
            })->values()->all()
            : [];

        return Inertia::render('admin/company/participant/edit', [
            'participant' => $data,
            'olimpiades' => Olimpiade::active()->ordered()->get(['id', 'name']),
            'provinces' => Province::all(['id', 'name']),
            'regencies' => $participant->student?->province_id
                ? Regency::where('province_id', $participant->student->province_id)->orderBy('name')->get(['id', 'province_id', 'name'])
                : [],
            'districts' => $participant->student?->regency_id
                ? District::where('regency_id', $participant->student->regency_id)->orderBy('name')->get(['id', 'regency_id', 'name'])
                : [],
            'villages' => $participant->student?->district_id
                ? Village::where('district_id', $participant->student->district_id)->orderBy('name')->get(['id', 'district_id', 'name'])
                : [],
            'teachers' => $teachers,
            'branches' => $branches,
            'sanggars' => $sanggars,
        ]);
    }

    public function update(UpdateParticipantRequest $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $user = Auth::user();
        if ($user && $user->hasRole('Keuangan') && ! $user->hasRole('Administrators')) {
            abort(403, 'Akun keuangan hanya memiliki akses untuk melihat detail dan mengubah status pembayaran.');
        }

        $payload = $this->payload($request);
        $name = $participant->student?->full_name ?? $participant->user?->name ?? 'Unknown';

        $isBinaan = $participant->registration_type === 'teacher'
            || ! empty($participant->mentor_id)
            || ($participant->student && $participant->student->is_binaan)
            || ($participant->student && $participant->student->penyaluran_id);

        if (! $isBinaan) {
            $payload['penyaluran_sanggar_name'] = null;
            $payload['penyaluran_sanggar_id'] = null;
        } elseif ($request->has('penyaluran_sanggar_name')) {
            $sanggarName = trim((string) $request->input('penyaluran_sanggar_name')) ?: null;
            $payload['penyaluran_sanggar_name'] = $sanggarName;

            $sanggarId = $request->input('penyaluran_sanggar_id');
            if (empty($sanggarId) && $sanggarName) {
                $mentorUser = $request->filled('mentor_id') ? User::find($request->input('mentor_id')) : $participant->mentor;
                if ($mentorUser && $mentorUser->penyaluran_token) {
                    try {
                        $mSanggars = $this->penyaluran->sanggars($mentorUser->penyaluran_token);
                        $matched = collect($mSanggars)->first(fn ($s) => strcasecmp(trim((string) ($s['name'] ?? '')), $sanggarName) === 0);
                        if ($matched && ! empty($matched['id'])) {
                            $sanggarId = (int) $matched['id'];
                        }
                    } catch (\Throwable $e) {
                    }
                }

                if (empty($sanggarId)) {
                    $sanggarId = Participant::where('penyaluran_sanggar_name', $sanggarName)
                        ->whereNotNull('penyaluran_sanggar_id')
                        ->where('penyaluran_sanggar_id', '<>', 60)
                        ->value('penyaluran_sanggar_id');
                }
            }

            $payload['penyaluran_sanggar_id'] = $sanggarId ? (int) $sanggarId : null;
        }

        // Auto-verify if payment_status is paid and status was not explicitly set to rejected
        if (($payload['payment_status'] ?? null) === 'paid' && ($payload['status'] ?? null) === 'submitted') {
            $payload['status'] = 'verified';
        }

        DB::transaction(function () use ($request, $participant, &$payload) {
            $studentData = $this->studentPayload($request);

            if ($request->filled('mentor_id')) {
                $teacher = User::find($request->input('mentor_id'));
                if ($teacher) {
                    $studentData['mentor_id'] = $teacher->id;
                    $studentData['mentor_name'] = $teacher->name;
                    $studentData['mentor_phone'] = $teacher->phone ?? ($studentData['mentor_phone'] ?? null);
                    $payload['mentor_id'] = $teacher->id;
                    if (empty($payload['branch']) && $teacher->branch) {
                        $payload['branch'] = $teacher->branch;
                    }
                }
            } elseif ($request->has('mentor_name') || $request->has('mentor_phone')) {
                $studentData['mentor_name'] = $request->input('mentor_name');
                $studentData['mentor_phone'] = $request->input('mentor_phone');
            }

            if ($participant->student) {
                if ($participant->student->penyaluran_id) {
                    try {
                        $this->studentService->syncToPenyaluran($participant->student, $studentData);
                    } catch (\Throwable $e) {
                        Log::warning("Gagal sinkronisasi data santri ke Penyaluran saat update peserta {$participant->registration_number}: ".$e->getMessage());
                    }
                }
                $participant->student->update($studentData);
            } else {
                $studentData['is_binaan'] = false;
                $student = Student::create($studentData);
                $participant->student_id = $student->id;
                $payload['student_id'] = $student->id;
            }

            if ($request->hasFile('payment_proof')) {
                $payload['payment_proof_path'] = $this->uploadFile(
                    $participant->payment_proof_path,
                    $request->file('payment_proof'),
                    'participants/payment_proofs'
                );

                if ($participant->status === 'rejected' && ! $request->filled('status')) {
                    $payload['status'] = 'submitted';
                }
                if ($participant->payment_status === 'unpaid' && ! $request->filled('payment_status')) {
                    $payload['payment_status'] = 'waiting_confirmation';
                }
            }

            if ($request->hasFile('student_card') && $participant->student) {
                $studentCardPath = $this->uploadFile(
                    $participant->student->student_card_path,
                    $request->file('student_card'),
                    'students/student_cards'
                );
                $participant->student->update(['student_card_path' => $studentCardPath]);
            }

            $participant->update($payload);
        });

        $this->logSuccess('update-participant', "Updated participant: {$name}", [
            'participant_id' => $participant->id,
            'new_data' => $payload,
        ]);

        return redirect()
            ->route('admin.companies.participants.index')
            ->with('success', 'Participant Updated Successfully');
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

        $this->logSuccess('delete-participant', "Deleted participant: {$name}");

        return redirect()
            ->route('admin.companies.participants.index')
            ->with('success', 'Participant Deleted Successfully');
    }

    public function status(Request $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $user = Auth::user();
        if ($user && $user->hasRole('Keuangan') && ! $user->hasRole('Administrators')) {
            // Role Keuangan can only update payment_status
            $request->validate([
                'payment_status' => ['required', 'in:unpaid,waiting_confirmation,paid'],
            ]);

            $newPaymentStatus = $request->payment_status;
            $data = ['payment_status' => $newPaymentStatus];

            // Auto-sync status: jika lunas dan bukan rejected -> auto-verified
            if ($newPaymentStatus === 'paid' && $participant->status !== 'rejected') {
                $data['status'] = 'verified';
            } elseif (in_array($newPaymentStatus, ['unpaid', 'waiting_confirmation'], true) && $participant->status === 'verified' && $participant->registration_type !== 'teacher') {
                $data['status'] = 'submitted';
            }

            $participant->update($data);

            $this->logSuccess('update-participant-payment', "Keuangan updated payment status: {$participant->registration_number} -> {$newPaymentStatus}".(isset($data['status']) ? " (status: {$data['status']})" : ''), [
                'participant_id' => $participant->id,
                'payment_status' => $newPaymentStatus,
                'status' => $data['status'] ?? $participant->status,
            ]);

            return back()->with('success', 'Status Pembayaran berhasil diperbarui'.(isset($data['status']) && $data['status'] === 'verified' ? ' dan peserta otomatis Terverifikasi' : ''));
        }

        $request->validate([
            'status' => ['nullable', 'in:submitted,verified,rejected'],
            'payment_status' => ['nullable', 'in:unpaid,waiting_confirmation,paid'],
            'notes' => ['nullable', 'string'],
        ]);

        $data = array_filter($request->only(['status', 'payment_status', 'notes']), fn ($v) => ! is_null($v));

        // Auto-sync status jika payment_status diubah dan status pendaftaran tidak dispesifikasikan secara eksplisit
        if (isset($data['payment_status']) && ! isset($data['status'])) {
            if ($data['payment_status'] === 'paid' && $participant->status !== 'rejected') {
                $data['status'] = 'verified';
            } elseif (in_array($data['payment_status'], ['unpaid', 'waiting_confirmation'], true) && $participant->status === 'verified' && $participant->registration_type !== 'teacher') {
                $data['status'] = 'submitted';
            }
        }

        $participant->update($data);

        $this->logSuccess('update-participant-status', "Status updated: {$participant->registration_number}".(isset($data['status']) ? " status -> {$data['status']}" : '').(isset($data['payment_status']) ? " payment -> {$data['payment_status']}" : ''), [
            'participant_id' => $participant->id,
            'status' => $participant->status,
            'payment_status' => $participant->payment_status,
        ]);

        return back()->with('success', 'Status Peserta berhasil diperbarui');
    }

    public function paymentStatus(Request $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $request->validate([
            'payment_status' => ['required', 'in:unpaid,waiting_confirmation,paid'],
        ]);

        $newPaymentStatus = $request->payment_status;
        $data = ['payment_status' => $newPaymentStatus];

        if ($newPaymentStatus === 'paid' && $participant->status !== 'rejected') {
            $data['status'] = 'verified';
        } elseif (in_array($newPaymentStatus, ['unpaid', 'waiting_confirmation'], true) && $participant->status === 'verified' && $participant->registration_type !== 'teacher') {
            $data['status'] = 'submitted';
        }

        $participant->update($data);

        $this->logSuccess('update-participant-payment', "Updated payment status: {$participant->registration_number} -> {$newPaymentStatus}".(isset($data['status']) ? " (status: {$data['status']})" : ''), [
            'participant_id' => $participant->id,
            'payment_status' => $newPaymentStatus,
            'status' => $data['status'] ?? $participant->status,
        ]);

        return back()->with('success', 'Status Pembayaran berhasil diperbarui'.(isset($data['status']) && $data['status'] === 'verified' ? ' dan peserta otomatis Terverifikasi' : ''));
    }

    public function syncSheet(Request $request)
    {
        $this->authorize('syncSheet', Participant::class);

        $settings = app(SiteSettings::class);
        if (! $settings->sheets_sync_enabled || ! $settings->sheets_spreadsheet_id) {
            return back()->with('error', 'GSheet sync belum diaktifkan. Atur spreadsheet ID di Site Settings.');
        }

        Artisan::queue('sheets:sync', ['--chunk' => 200]);

        return back()->with('success', 'Sync ke Google Sheets dimulai. Cek GSheet dalam beberapa menit (queue).');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $user = Auth::user();
        $allowed = ['id', 'registration_number', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $query = Participant::query()
            ->with([
                'olimpiade:id,name',
                'student:id,full_name,nik,school_name,gender,province_id,regency_id',
                'student.regency:id,name',
            ])
            ->search($request->string('globalSearch')->toString());

        // Cabang role strict scoping
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $query->where(function ($q) use ($branch) {
                    $q->where('branch', $branch)
                        ->orWhere('branch', 'like', "%{$branch}%");
                });
            }
        } elseif ($user && $user->hasRole('Teacher')) {
            $query->where(function ($q) use ($user) {
                $q->where('mentor_id', $user->id)
                    ->orWhereHas('student', fn ($sq) => $sq->where('mentor_id', $user->id));
            });
        }

        $status = data_get($filterValue, 'status');
        $olimpiadeId = data_get($filterValue, 'olimpiade_id');
        $regType = data_get($filterValue, 'registration_type');
        $eventYear = data_get($filterValue, 'event_year');
        $payStatus = data_get($filterValue, 'payment_status');
        $branchFilter = data_get($filterValue, 'branch');

        $query
            ->when(filled($status) && $status !== 'all', fn ($q) => $q->where('status', $status))
            ->when(filled($olimpiadeId) && $olimpiadeId !== 'all', fn ($q) => $q->where('olimpiade_id', $olimpiadeId))
            ->when(filled($regType) && $regType !== 'all', fn ($q) => $q->where('registration_type', $regType))
            ->when(filled($eventYear) && $eventYear !== 'all', fn ($q) => $q->where('event_year', $eventYear))
            ->when(filled($payStatus) && $payStatus !== 'all', fn ($q) => $q->where('payment_status', $payStatus))
            ->when(filled($branchFilter) && $branchFilter !== 'all', fn ($q) => $q->where('branch', $branchFilter))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);
        $data->through(fn (Participant $p) => $this->participantPayload($p));

        return response()->json($data);
    }

    private function payload(UpdateParticipantRequest $request): array
    {
        $data = $request->safe()->except([
            'payment_proof',
            'full_name',
            'nickname',
            'gender',
            'birth_place',
            'birth_date',
            'school_name',
            'grade',
            'address',
            'province_id',
            'regency_id',
            'district_id',
            'village_id',
            'parent_phone',
            'nik',
            'student_card',
            'mentor_name',
            'mentor_phone',
        ]);

        if (array_key_exists('penyaluran_sanggar_name', $data) && $data['penyaluran_sanggar_name'] === null) {
            unset($data['penyaluran_sanggar_name']);
        }

        $data['has_joined_before'] = $request->boolean('has_joined_before');
        $data['data_truth_consent'] = $request->boolean('data_truth_consent');
        $data['documentation_consent'] = $request->boolean('documentation_consent');
        $data['rules_consent'] = $request->boolean('rules_consent');

        if (! $data['has_joined_before']) {
            $data['previous_year'] = null;
        }

        return $data;
    }

    private function studentPayload(UpdateParticipantRequest $request): array
    {
        return $request->safe()->only([
            'full_name', 'nickname', 'gender', 'birth_place', 'birth_date',
            'school_name', 'grade', 'address', 'province_id',
            'regency_id', 'district_id', 'village_id', 'parent_phone', 'nik', 'school_level', 'nis',
            'mentor_name', 'mentor_phone', 'mentor_id',
        ]);
    }

    private function studentFileMap(): array
    {
        return [
            'student_card' => 'student_card_path',
        ];
    }

    private function formOptions(): array
    {
        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name'])
                ->map(fn (Regency $regency) => [
                    'id' => $regency->id,
                    'province_id' => $regency->province_id,
                    'name' => $regency->name,
                ]),
        ];
    }

    private function participantPayload(Participant $participant): array
    {
        $payload = $participant->toArray();
        $payload['branch'] = $participant->branch;
        $payload['kantor_name'] = $participant->branch ?? $participant->penyaluran_sanggar_name;

        if ($participant->student) {
            $payload['student'] = [
                ...$participant->student->toArray(),
                'student_card_url' => $participant->student->student_card_url,
            ];
        }

        $payload['payment_proof_url'] = $participant->payment_proof_url;

        return $payload;
    }

    private function fileMap(): array
    {
        return [
            'payment_proof' => 'payment_proof_path',
        ];
    }
}
