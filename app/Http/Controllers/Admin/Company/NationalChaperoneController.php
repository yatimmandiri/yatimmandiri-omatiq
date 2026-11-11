<?php

namespace App\Http\Controllers\Admin\Company;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Teacher\BiodataController;
use App\Http\Requests\Company\StoreNationalChaperoneRequest;
use App\Http\Requests\Company\UpdateNationalChaperoneRequest;
use App\Models\Company\NationalChaperone;
use App\Models\Company\Participant;
use App\Models\Core\Region\Province;
use App\Models\Core\User;
use App\Services\BarcodeService;
use App\Services\PenyaluranService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class NationalChaperoneController extends Controller
{
    public function __construct(
        protected PenyaluranService $penyaluran,
        protected BarcodeService $barcodeService,
    ) {}

    private function resolveBranch(?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        $rawBranch = $user->getBranchName() ?? $user->branch;
        if (filled($rawBranch)) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $rawBranch));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        if ($user->hasRole('Cabang')) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $user->name));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        return null;
    }

    public function index(): Response
    {
        $this->authorize('viewAny', NationalChaperone::class);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');
        $branch = $this->resolveBranch($user);

        $query = NationalChaperone::query();
        if ($isCabang) {
            $query->forBranch($branch, $user->kantor_id);
        }

        $stats = [
            'total' => (clone $query)->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'verified' => (clone $query)->where('status', 'verified')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
        ];

        $branches = [];
        if (! $isCabang) {
            $branches = NationalChaperone::query()
                ->whereNotNull('branch')
                ->where('branch', '!=', '')
                ->distinct()
                ->pluck('branch')
                ->sort()
                ->values();
        }

        return Inertia::render('admin/company/chaperones/list', [
            'stats' => $stats,
            'isCabang' => $isCabang,
            'userBranch' => $branch,
            'branches' => $branches,
        ]);
    }

    public function getData(Request $request): JsonResponse
    {
        $this->authorize('viewAny', NationalChaperone::class);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');
        $branch = $this->resolveBranch($user);

        $query = NationalChaperone::query()
            ->with([
                'creator:id,name',
                'verifier:id,name',
                'province:id,name',
                'regency:id,name',
                'participants:id,registration_number,branch',
                'participants.student:id,full_name,nik',
            ])
            ->withCount('participants');

        // Extract filter values safely whether sent in filterValue or query params
        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $branchFilter = data_get($filterValue, 'branch', $request->input('branch'));
        $statusFilter = data_get($filterValue, 'status', $request->input('status'));
        $sourceTypeFilter = data_get($filterValue, 'source_type', $request->input('source_type'));

        if ($isCabang) {
            $query->forBranch($branch, $user->kantor_id);
        } elseif (filled($branchFilter) && $branchFilter !== 'all') {
            $query->where('branch', $branchFilter);
        }

        if (filled($statusFilter) && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if (filled($sourceTypeFilter) && $sourceTypeFilter !== 'all') {
            $query->where('source_type', $sourceTypeFilter);
        }

        if ($request->filled('globalSearch')) {
            $search = strtolower(trim($request->string('globalSearch')->toString()));
            $cleanId = preg_replace('/^(omq-)?(pen|off)-?0*/i', '', $search);
            $query->where(function ($q) use ($search, $cleanId) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereRaw('LOWER(branch) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('participants.student', function ($sq) use ($search) {
                        $sq->whereRaw('LOWER(full_name) LIKE ?', ["%{$search}%"])
                            ->orWhere('nik', 'like', "%{$search}%");
                    })
                    ->orWhereHas('participants', function ($pq) use ($search) {
                        $pq->whereRaw('LOWER(registration_number) LIKE ?', ["%{$search}%"]);
                    });
                if (is_numeric($cleanId) && (int) $cleanId > 0) {
                    $q->orWhere('id', (int) $cleanId);
                }
            });
        }

        $orderBy = $request->input('orderBy', $request->input('sortField', 'created_at'));
        $orderDirection = strtolower((string) $request->input('orderDirection', $request->input('sortOrder', 'desc'))) === 'asc' ? 'asc' : 'desc';

        $allowedSort = ['id', 'name', 'branch', 'source_type', 'status', 'created_at'];
        if (in_array($orderBy, $allowedSort, true)) {
            $query->orderBy($orderBy, $orderDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) ($request->input('perPage') ?? $request->input('pageSize') ?? 10), 1), 100);
        $page = max((int) $request->input('page', 1), 1);
        $chaperones = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json($chaperones);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', NationalChaperone::class);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');
        $branch = $isCabang ? $this->resolveBranch($user) : ($request->input('branch') ?? $this->resolveBranch($user));

        // Fetch eligible teachers for this branch
        $teachers = $this->getEligibleTeachers($user, $branch);

        // Fetch eligible national participants for this branch
        $participants = $this->getEligibleNationalParticipants($user, $branch);

        $provinces = Province::query()->orderBy('name')->get(['id', 'name']);

        $selectedParticipantIds = [];
        if ($request->filled('participant_id')) {
            $selectedParticipantIds = [(int) $request->input('participant_id')];
        }

        return Inertia::render('admin/company/chaperones/create', [
            'isCabang' => $isCabang,
            'defaultBranch' => $branch ?? '',
            'defaultKantorId' => $user->kantor_id,
            'teachers' => $teachers,
            'participants' => $participants,
            'provinces' => $provinces,
            'selectedParticipantIds' => $selectedParticipantIds,
        ]);
    }

    public function assignParticipant(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chaperone_id' => ['required', 'integer', 'exists:national_chaperones,id'],
            'participant_id' => ['required', 'integer', 'exists:participants,id'],
        ]);

        $chaperone = NationalChaperone::findOrFail($validated['chaperone_id']);
        $this->authorize('update', $chaperone);

        $participant = Participant::with('student')->findOrFail($validated['participant_id']);

        $chaperone->participants()->syncWithoutDetaching([$participant->id]);

        $studentName = $participant->student?->full_name ?? $participant->registration_number;

        return back()->with('success', "Peserta {$studentName} ({$participant->registration_number}) berhasil ditugaskan ke pendamping {$chaperone->name} ({$chaperone->branch}).");
    }

    public function unassignParticipant(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chaperone_id' => ['required', 'integer', 'exists:national_chaperones,id'],
            'participant_id' => ['required', 'integer', 'exists:participants,id'],
        ]);

        $chaperone = NationalChaperone::findOrFail($validated['chaperone_id']);
        $this->authorize('update', $chaperone);

        $participant = Participant::with('student')->findOrFail($validated['participant_id']);

        $chaperone->participants()->detach($participant->id);

        $studentName = $participant->student?->full_name ?? $participant->registration_number;

        return back()->with('success', "Peserta {$studentName} berhasil dilepas dari pendamping {$chaperone->name}.");
    }

    public function store(StoreNationalChaperoneRequest $request): RedirectResponse
    {
        $this->authorize('create', NationalChaperone::class);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');
        $branch = $isCabang ? ($this->resolveBranch($user) ?? $user->branch) : ($request->input('branch') ?? $this->resolveBranch($user) ?? 'PUSAT');
        $kantorId = $isCabang ? $user->kantor_id : $request->input('kantor_id');

        $validated = $request->validated();
        $participantIds = $validated['participant_ids'] ?? [];
        unset($validated['participant_ids']);

        $validated['created_by'] = $user->id;
        $validated['branch'] = $branch;
        $validated['kantor_id'] = $kantorId;
        $validated['status'] = 'submitted';

        DB::transaction(function () use ($validated, $participantIds) {
            $chaperone = NationalChaperone::create($validated);
            if (! empty($participantIds)) {
                $chaperone->participants()->sync($participantIds);
            }
        });

        return redirect()->route('admin.companies.chaperones.index')
            ->with('success', 'Data pendamping Babak Final Nasional berhasil didaftarkan. Menunggu verifikasi Panitia Pusat.');
    }

    public function show(NationalChaperone $chaperone): Response
    {
        $this->authorize('view', $chaperone);

        $chaperone->load([
            'creator:id,name,email',
            'verifier:id,name,email',
            'province:id,name',
            'regency:id,name',
            'district:id,name',
            'village:id,name',
            'participants.student:id,full_name,school_name,grade',
            'participants.olimpiade:id,name,category',
            'participants.national:id,participant_id,status',
        ]);

        return Inertia::render('admin/company/chaperones/show', [
            'chaperone' => $chaperone,
            'canVerify' => Auth::user()->hasRole('Administrators'),
        ]);
    }

    public function edit(NationalChaperone $chaperone): Response
    {
        $this->authorize('update', $chaperone);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');
        $branch = $chaperone->branch ?? $this->resolveBranch($user);

        $chaperone->load('participants:id');
        $selectedParticipantIds = $chaperone->participants->pluck('id')->all();

        $teachers = $this->getEligibleTeachers($user, $branch);
        $participants = $this->getEligibleNationalParticipants($user, $branch, $chaperone->id);
        $provinces = Province::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/company/chaperones/edit', [
            'chaperone' => $chaperone,
            'selectedParticipantIds' => $selectedParticipantIds,
            'isCabang' => $isCabang,
            'teachers' => $teachers,
            'participants' => $participants,
            'provinces' => $provinces,
        ]);
    }

    public function update(UpdateNationalChaperoneRequest $request, NationalChaperone $chaperone): RedirectResponse
    {
        $this->authorize('update', $chaperone);

        $user = Auth::user();
        $isCabang = $user->hasRole('Cabang') && ! $user->hasRole('Administrators');

        $validated = $request->validated();
        $participantIds = $validated['participant_ids'] ?? [];
        unset($validated['participant_ids']);

        if (! $isCabang && $request->filled('branch')) {
            $validated['branch'] = $request->input('branch');
            $validated['kantor_id'] = $request->input('kantor_id');
        }

        DB::transaction(function () use ($chaperone, $validated, $participantIds) {
            $chaperone->update($validated);
            $chaperone->participants()->sync($participantIds);
        });

        return redirect()->route('admin.companies.chaperones.show', $chaperone->id)
            ->with('success', 'Data pendamping berhasil diperbarui.');
    }

    public function destroy(NationalChaperone $chaperone): RedirectResponse
    {
        $this->authorize('delete', $chaperone);

        $chaperone->participants()->detach();
        $chaperone->delete();

        return redirect()->route('admin.companies.chaperones.index')
            ->with('success', 'Data pendamping berhasil dihapus.');
    }

    public function verify(Request $request, NationalChaperone $chaperone): RedirectResponse
    {
        $this->authorize('verify', $chaperone);

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,verified,rejected'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $chaperone->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $chaperone->notes,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        $statusText = match ($validated['status']) {
            'verified' => 'disetujui sebagai pendamping resmi',
            'rejected' => 'ditolak / perlu revisi',
            default => 'dikembalikan ke status menunggu',
        };

        return back()->with('success', "Pendamping {$chaperone->name} berhasil {$statusText}.");
    }

    public function printCard(Request $request, NationalChaperone $chaperone)
    {
        $this->authorize('view', $chaperone);

        if ($chaperone->status !== 'verified' && ! Auth::user()->hasRole('Administrators')) {
            abort(403, 'Kartu tanda pengenal pendamping hanya dapat dicetak setelah disetujui resmi oleh Admin Pusat.');
        }

        $chaperone->load([
            'province:id,name',
            'regency:id,name',
            'participants.student:id,full_name,school_name,grade,is_binaan',
            'participants.olimpiade:id,name,category',
        ]);

        $chaperoneIdFormatted = 'OFF-'.str_pad((string) $chaperone->id, 5, '0', STR_PAD_LEFT);
        $verifyUrl = route('home.registration.verify', ['registrationNumber' => $chaperoneIdFormatted]);
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 90, color: '#17524A');
        $barcodeSvg = $this->barcodeService->generateCode128Svg($chaperoneIdFormatted, height: 26, barWidth: 1.1, color: '#17524A');

        $isPdf = $request->query('format') === 'pdf';

        if ($isPdf) {
            $pdf = Pdf::loadView('cards.chaperone-card', compact('chaperone', 'chaperoneIdFormatted', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'))
                ->setPaper('a4', 'portrait')
                ->setOption(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true]);

            return $pdf->stream('Kartu-Pendamping-'.$chaperone->name.'.pdf');
        }

        return view('cards.chaperone-card', compact('chaperone', 'chaperoneIdFormatted', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'));
    }

    public function teacherDetail(int|string $id): JsonResponse
    {
        $this->authorize('create', NationalChaperone::class);

        $teacher = null;
        $local = null;

        if (is_string($id) && str_starts_with($id, 'api_')) {
            $apiId = substr($id, 4);
            try {
                $teacher = $this->penyaluran->teacher($apiId, force: true);
            } catch (\Throwable $e) {
                $teacher = null;
            }
        } else {
            // 1. Try finding local Teacher by primary key ID first (prevents ID collisions between users.id and penyaluran_id)
            $local = User::role('Teacher')->find($id);

            // 2. If not found by primary key ID, search by penyaluran_id
            if (! $local) {
                $local = User::role('Teacher')->where('penyaluran_id', $id)->first();
            }

            // 3. If local user is found, retrieve rich Penyaluran profile via their bearer token if available
            if ($local) {
                if ($local->penyaluran_token) {
                    try {
                        $teacher = $this->penyaluran->teacherByToken($local->penyaluran_token);
                    } catch (\Throwable $e) {
                        $teacher = null;
                    }
                }

                // If not retrieved by token, try remote Penyaluran teacher endpoint by penyaluran_id
                if (! $teacher && $local->penyaluran_id) {
                    try {
                        $teacher = $this->penyaluran->teacher($local->penyaluran_id, force: true);
                    } catch (\Throwable $e) {
                        $teacher = null;
                    }
                }

                // Fallback to local teacher attributes if API returned nothing
                if (! $teacher) {
                    $teacher = [
                        'id' => $local->penyaluran_id ?? $local->id,
                        'name' => $local->name,
                        'phone' => $local->phone,
                        'email' => $local->email,
                        'branch' => $local->branch,
                    ];
                }
            } else {
                // If no local user exists, try Penyaluran API directly
                try {
                    $teacher = $this->penyaluran->teacher($id, force: true);
                } catch (\Throwable $e) {
                    $teacher = null;
                }
            }
        }

        if (! $teacher && ! $local) {
            return response()->json(['success' => false, 'message' => 'Data guru tidak ditemukan.'], 404);
        }

        $flat = $teacher ?? [];
        foreach (['guru', 'user', 'profile', 'biodata', 'data', 'domisili', 'wilayah'] as $subKey) {
            if (isset($teacher[$subKey]) && is_array($teacher[$subKey])) {
                $flat = array_merge($flat, $teacher[$subKey]);
            }
        }

        $rawNik = $flat['nik'] ?? $flat['no_ktp'] ?? $flat['ktp'] ?? $flat['nomor_ktp'] ?? $flat['identity_number'] ?? $flat['no_identitas'] ?? '';
        $cleanNik = preg_replace('/\D+/', '', (string) $rawNik);

        $rawGender = $flat['gender'] ?? $flat['jenis_kelamin'] ?? $flat['jk'] ?? $flat['sex'] ?? 'L';
        $gender = 'male';
        if (is_string($rawGender)) {
            $upperG = strtoupper(trim($rawGender));
            if (in_array($upperG, ['P', 'F', 'FEMALE', 'PEREMPUAN', 'WANITA'], true)) {
                $gender = 'female';
            }
        }

        $regions = BiodataController::resolveRegionIds($flat);

        $birthDate = $flat['birth_date'] ?? $flat['tanggal_lahir'] ?? $flat['tgl_lahir'] ?? null;
        if ($birthDate && is_string($birthDate) && strlen($birthDate) >= 10) {
            $birthDate = substr($birthDate, 0, 10);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $local ? $local->id : ($flat['id'] ?? $id),
                'penyaluran_teacher_id' => $local?->penyaluran_id ?? $flat['id'] ?? null,
                'name' => $flat['name'] ?? $flat['nama'] ?? $flat['full_name'] ?? $local?->name ?? '',
                'nik' => $cleanNik,
                'gender' => $gender,
                'phone' => $flat['phone'] ?? $flat['hp'] ?? $flat['no_hp'] ?? $local?->phone ?? '',
                'email' => (! empty($flat['email']) && ! str_ends_with($flat['email'], '@penyaluran.local')) ? $flat['email'] : ($local?->email ?? ''),
                'birth_place' => $flat['birth_place'] ?? $flat['tempat_lahir'] ?? '',
                'birth_date' => $birthDate,
                'address' => $flat['address'] ?? $flat['alamat'] ?? $flat['alamat_lengkap'] ?? '',
                'province_id' => $regions['province_id'] ?? $flat['province_id'] ?? null,
                'regency_id' => $regions['regency_id'] ?? $flat['regency_id'] ?? null,
                'district_id' => $regions['district_id'] ?? $flat['district_id'] ?? null,
                'village_id' => $regions['village_id'] ?? $flat['village_id'] ?? null,
                'branch' => $flat['kantor_name'] ?? $flat['branch'] ?? $local?->branch ?? '',
            ],
        ]);
    }

    private function getEligibleTeachers(User $user, ?string $branch): array
    {
        $teachers = [];
        $userKantorId = $user->kantor_id;

        // 1. Fetch local teacher users first
        $localTeachers = User::role('Teacher')
            ->when(filled($branch), function ($q) use ($branch) {
                $q->where(function ($sq) use ($branch) {
                    $sq->whereRaw('LOWER(branch) LIKE ?', ['%'.strtolower($branch).'%']);
                });
            })
            ->get(['id', 'name', 'phone', 'email', 'branch', 'kantor_id', 'penyaluran_id', 'penyaluran_token']);

        // 2. Fetch API teachers from Penyaluran
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiTeachers = $this->penyaluran->allTeachers($queryParams);
            if (empty($apiTeachers) && ! empty($queryParams)) {
                $apiTeachers = $this->penyaluran->allTeachers();
            }

            if (! empty($apiTeachers)) {
                $collection = collect($apiTeachers);
                if (filled($branch)) {
                    $branchLower = strtolower($branch);
                    $collection = $collection->filter(function (array $t) use ($branchLower, $userKantorId) {
                        if ($userKantorId && ! empty($t['kantor_id']) && (int) $t['kantor_id'] === (int) $userKantorId) {
                            return true;
                        }
                        $kantor = strtolower(trim((string) ($t['kantor_name'] ?? $t['branch'] ?? '')));
                        if ($kantor !== '') {
                            $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                            $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                            if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                                return true;
                            }
                        }

                        return false;
                    });
                }

                foreach ($collection as $t) {
                    $flat = $t;
                    foreach (['guru', 'user', 'profile', 'biodata', 'data', 'domisili', 'wilayah'] as $subKey) {
                        if (isset($t[$subKey]) && is_array($t[$subKey])) {
                            $flat = array_merge($flat, $t[$subKey]);
                        }
                    }

                    $rawNik = $flat['nik'] ?? $flat['no_ktp'] ?? $flat['ktp'] ?? $flat['nomor_ktp'] ?? $flat['identity_number'] ?? $flat['no_identitas'] ?? '';
                    $cleanNik = preg_replace('/\D+/', '', (string) $rawNik);

                    $rawGender = $flat['gender'] ?? $flat['jenis_kelamin'] ?? $flat['jk'] ?? $flat['sex'] ?? 'L';
                    $gender = 'male';
                    if (is_string($rawGender)) {
                        $upperG = strtoupper(trim($rawGender));
                        if (in_array($upperG, ['P', 'F', 'FEMALE', 'PEREMPUAN', 'WANITA'], true)) {
                            $gender = 'female';
                        }
                    }

                    $regions = BiodataController::resolveRegionIds($flat);

                    $birthDate = $flat['birth_date'] ?? $flat['tanggal_lahir'] ?? $flat['tgl_lahir'] ?? null;
                    if ($birthDate && is_string($birthDate) && strlen($birthDate) >= 10) {
                        $birthDate = substr($birthDate, 0, 10);
                    }

                    $apiPenyaluranId = $flat['id'] ?? $t['id'] ?? null;
                    $phone = $flat['phone'] ?? $flat['hp'] ?? $flat['no_hp'] ?? '';

                    // Match with local teacher user to preserve local user ID as unambiguous key
                    $matchedLocal = $localTeachers->first(function ($lt) use ($apiPenyaluranId, $phone) {
                        if ($apiPenyaluranId && (int) $lt->penyaluran_id === (int) $apiPenyaluranId) {
                            return true;
                        }
                        if ($phone && ! empty($lt->phone) && $lt->phone === $phone) {
                            return true;
                        }

                        return false;
                    });

                    $teachers[] = [
                        'id' => $matchedLocal ? (string) $matchedLocal->id : 'api_'.$apiPenyaluranId,
                        'user_id' => $matchedLocal?->id,
                        'penyaluran_teacher_id' => $apiPenyaluranId,
                        'name' => $flat['name'] ?? $flat['nama'] ?? $flat['full_name'] ?? $t['name'] ?? '',
                        'nik' => $cleanNik,
                        'phone' => $phone,
                        'gender' => $gender,
                        'email' => (! empty($flat['email']) && ! str_ends_with($flat['email'], '@penyaluran.local')) ? $flat['email'] : ($matchedLocal?->email ?? ''),
                        'birth_place' => $flat['birth_place'] ?? $flat['tempat_lahir'] ?? '',
                        'birth_date' => $birthDate,
                        'address' => $flat['address'] ?? $flat['alamat'] ?? $flat['alamat_lengkap'] ?? '',
                        'province_id' => $regions['province_id'] ?? $flat['province_id'] ?? null,
                        'regency_id' => $regions['regency_id'] ?? $flat['regency_id'] ?? null,
                        'district_id' => $regions['district_id'] ?? $flat['district_id'] ?? null,
                        'village_id' => $regions['village_id'] ?? $flat['village_id'] ?? null,
                        'branch' => $flat['kantor_name'] ?? $flat['branch'] ?? $t['kantor_name'] ?? $t['branch'] ?? '',
                    ];
                }
            }
        } catch (\Throwable $e) {
            // Log and fallback
        }

        // Add local teachers that were not in API list
        foreach ($localTeachers as $lt) {
            $alreadyAdded = collect($teachers)->contains(function ($t) use ($lt) {
                return (string) ($t['id'] ?? '') === (string) $lt->id
                    || (isset($t['user_id']) && $t['user_id'] === $lt->id)
                    || (! empty($t['penyaluran_teacher_id']) && (int) $t['penyaluran_teacher_id'] === (int) $lt->penyaluran_id);
            });

            if (! $alreadyAdded) {
                $teachers[] = [
                    'id' => (string) $lt->id,
                    'user_id' => $lt->id,
                    'penyaluran_teacher_id' => $lt->penyaluran_id,
                    'name' => $lt->name,
                    'nik' => '',
                    'phone' => $lt->phone ?? '',
                    'gender' => 'male',
                    'email' => (! empty($lt->email) && ! str_ends_with($lt->email, '@penyaluran.local')) ? $lt->email : '',
                    'address' => '',
                    'province_id' => null,
                    'regency_id' => null,
                    'district_id' => null,
                    'village_id' => null,
                    'branch' => $lt->branch ?? '',
                ];
            }
        }

        return $teachers;
    }

    private function getEligibleNationalParticipants(User $user, ?string $branch, ?int $currentChaperoneId = null): array
    {
        $query = Participant::query()
            ->with([
                'student:id,full_name,school_name,grade,is_binaan',
                'olimpiade:id,name,category',
                'national:id,participant_id,status',
            ])
            ->whereHas('national', function ($q) {
                $q->whereIn('status', ['unconfirmed', 'waiting_confirmation', 'verified']);
            });

        if (filled($branch)) {
            $branchUpper = strtoupper(trim($branch));
            $query->whereRaw('UPPER(branch) = ?', [$branchUpper]);
        }

        return $query->get()->map(function (Participant $p) use ($currentChaperoneId) {
            $assigned = $p->nationalChaperones()
                ->when($currentChaperoneId, fn ($q) => $q->where('national_chaperones.id', '!=', $currentChaperoneId))
                ->exists();

            return [
                'id' => $p->id,
                'registration_number' => $p->registration_number,
                'name' => $p->student?->full_name ?? '-',
                'school_name' => $p->student?->school_name ?? '-',
                'grade' => $p->student?->grade ?? '-',
                'olimpiade_name' => $p->olimpiade?->name ?? '-',
                'category' => $p->olimpiade?->category ?? '-',
                'is_binaan' => (bool) $p->student?->is_binaan,
                'national_status' => $p->national?->status ?? 'unconfirmed',
                'already_assigned_other' => $assigned,
            ];
        })->all();
    }
}
