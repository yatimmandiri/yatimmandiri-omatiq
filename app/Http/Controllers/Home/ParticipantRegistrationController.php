<?php

namespace App\Http\Controllers\Home;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreParticipantRequest;
use App\Models\Company\EventCommittee;
use App\Models\Company\EventGuest;
use App\Models\Company\NationalChaperone;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Settings\SiteSettings;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantRegistrationController extends Controller
{
    use UploadFiles;

    public function create(): Response
    {
        $settings = app(SiteSettings::class);

        if (! $settings->registration_public_open) {
            return Inertia::render('home/registration/index', [
                'pageTitle' => 'Pendaftaran OMATIQ',
                'registration_closed' => true,
                'meta' => [
                    'title' => 'Pendaftaran OMATIQ',
                    'description' => 'Pendaftaran OMATIQ 2026 sedang ditutup.',
                    'keywords' => 'pendaftaran OMATIQ',
                ],
            ]);
        }

        $branches = Cache::remember('branch_offices', 3600, function () {
            if (Storage::disk('local')->exists('branch-offices.json')) {
                $raw = json_decode(Storage::disk('local')->get('branch-offices.json'), true) ?? [];

                return array_map(function (array $b) {
                    $name = strtoupper(trim((string) ($b['name'] ?? '')));
                    if ($name === 'SURABAYA' || $name === 'PUSAT 2') {
                        return [
                            'id' => $b['id'] ?? 49,
                            'name' => 'PUSAT 2',
                            'label' => 'SURABAYA',
                        ];
                    }

                    return [
                        'id' => $b['id'] ?? null,
                        'name' => $name,
                        'label' => $b['label'] ?? $name,
                    ];
                }, $raw);
            }

            return [];
        });

        return Inertia::render('home/registration/index', [
            'pageTitle' => 'Pendaftaran OMATIQ',
            'olimpiades' => Olimpiade::query()->active()->openForPublic()->forCurrentPeriod()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'branches' => $branches,
            'meta' => [
                'title' => 'Pendaftaran OMATIQ',
                'description' => 'Daftarkan peserta untuk menjadi bagian dari OMATIQ 2026.',
                'keywords' => 'pendaftaran OMATIQ, daftar olimpiade, peserta OMATIQ',
            ],
        ]);
    }

    public function checkNik(Request $request)
    {
        $request->validate([
            'nik' => ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/'],
        ], [
            'nik.size' => 'NIK harus 16 digit angka.',
            'nik.regex' => 'NIK harus berupa 16 digit angka.',
        ]);

        $nik = trim($request->input('nik'));
        $binaanInfo = $this->findBinaanByNik($nik);

        if ($binaanInfo) {
            $sanggarName = $binaanInfo['sanggar_name'] ?? 'Sanggar Yatim Mandiri';
            $teacherName = $binaanInfo['teacher_name'] ?? 'Guru Pembina';

            return response()->json([
                'is_binaan' => true,
                'name' => $binaanInfo['name'] ?? null,
                'sanggar_name' => $sanggarName,
                'teacher_name' => $teacherName,
                'message' => "Anda sudah terdaftar di sanggar {$sanggarName} dan guru {$teacherName}. Silahkan daftar melalui guru anda.",
            ]);
        }

        return response()->json([
            'is_binaan' => false,
        ]);
    }

    protected function findBinaanByNik(string $nik): ?array
    {
        // 1. Cek DB lokal
        $localStudent = Student::query()
            ->where('nik', $nik)
            ->where('is_binaan', true)
            ->first();

        if ($localStudent) {
            $sanggarName = Participant::where('student_id', $localStudent->id)
                ->whereNotNull('penyaluran_sanggar_name')
                ->latest()
                ->value('penyaluran_sanggar_name')
                ?? 'Yatim Mandiri';

            $teacherName = $localStudent->mentor_name
                ?? $localStudent->mentor?->name
                ?? 'Guru Pembina';

            return [
                'name' => $localStudent->full_name,
                'sanggar_name' => $sanggarName,
                'teacher_name' => $teacherName,
            ];
        }

        // 2. Cek API Penyaluran
        try {
            $penyaluran = app(PenyaluranService::class);
            $cachedIndex = Cache::get('penyaluran:all_students_index');

            if (is_array($cachedIndex) && isset($cachedIndex['byNik'][$nik])) {
                $apiStudent = $cachedIndex['byNik'][$nik];

                return [
                    'name' => $apiStudent['name'] ?? null,
                    'sanggar_name' => $apiStudent['sanggar_name'] ?? 'Sanggar Yatim Mandiri',
                    'teacher_name' => $apiStudent['teacher_name'] ?? 'Guru Pembina',
                ];
            }

            $matched = $penyaluran->allStudents(['search' => $nik]);
            $foundApi = collect($matched)->firstWhere(function ($s) use ($nik) {
                $sNik = ! empty($s['nik']) ? trim((string) $s['nik']) : null;

                return $sNik && $sNik === $nik;
            });

            if ($foundApi) {
                return [
                    'name' => $foundApi['name'] ?? $foundApi['full_name'] ?? null,
                    'sanggar_name' => $foundApi['sanggar_name'] ?? 'Sanggar Yatim Mandiri',
                    'teacher_name' => $foundApi['teacher_name'] ?? $foundApi['guru_name'] ?? 'Guru Pembina',
                ];
            }
        } catch (\Throwable $e) {
            // Silently swallow error to prevent blocking on network glitch
        }

        return null;
    }

    public function villages(Request $request)
    {
        $request->validate([
            'district_id' => ['required', 'exists:districts,id'],
        ]);

        return response()->json([
            'data' => Village::query()
                ->where('district_id', $request->input('district_id'))
                ->orderBy('name')
                ->get(['id', 'district_id', 'name'])
                ->map(fn (Village $v) => [
                    'id' => $v->id,
                    'district_id' => $v->district_id,
                    'name' => $v->name,
                ]),
        ]);
    }

    public function store(StoreParticipantRequest $request)
    {
        $settings = app(SiteSettings::class);

        if (! $settings->registration_public_open) {
            return back()->with('error', 'Pendaftaran umum sedang ditutup.');
        }

        $paymentProofPath = $this->handlePaymentProof($request);

        $maxAttempts = 5;
        $participant = null;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $participant = DB::transaction(function () use ($request, $paymentProofPath) {
                    $user = User::create([
                        'name' => $request->full_name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                        'email_verified_at' => now(),
                    ]);
                    $user->assignRole('Participant');

                    $olimpiade = Olimpiade::find($request->olimpiade_id);
                    $data = $this->payload($request);
                    $data['user_id'] = $user->id;
                    $data['event_year'] = $olimpiade?->event_year ?? (int) date('Y');
                    $data['registration_number'] = Participant::generateRegistrationNumber();
                    $data['status'] = 'submitted';
                    $data['registration_type'] = 'public';
                    $data['payment_status'] = 'waiting_confirmation';
                    $data['payment_proof_path'] = $paymentProofPath;

                    $student = Student::firstOrCreate(
                        [
                            'nik' => $request->nik,
                            'is_binaan' => false,
                        ],
                        $this->studentData($request),
                    );

                    $this->handleStudentFiles($student, $request);

                    $data['student_id'] = $student->id;

                    return Participant::create($data);
                });

                break;
            } catch (UniqueConstraintViolationException|QueryException $e) {
                $isRegNumberCollision = str_contains($e->getMessage(), 'participants_registration_number_unique')
                    || (str_contains($e->getMessage(), 'Duplicate entry') && str_contains($e->getMessage(), 'OMQ-'));

                if (! $isRegNumberCollision || $attempt >= $maxAttempts) {
                    throw $e;
                }

                usleep(50000 * $attempt);
            }
        }

        return redirect()
            ->route('home.registration.success', $participant->registration_number)
            ->with('success', 'Pendaftaran berhasil dikirim. Simpan nomor registrasi kamu.');
    }

    public function success(string $registrationNumber): Response
    {
        $participant = Participant::query()
            ->with(['olimpiade:id,name', 'user:id,email', 'student:id,full_name'])
            ->where('registration_number', $registrationNumber)
            ->firstOrFail();

        return Inertia::render('home/registration/success', [
            'pageTitle' => 'Pendaftaran Berhasil',
            'participant' => [
                'registration_number' => $participant->registration_number,
                'full_name' => $participant->student?->full_name ?? $participant->user?->name,
                'olimpiade' => $participant->olimpiade?->name,
                'email' => $participant->user?->email,
            ],
            'meta' => [
                'title' => 'Pendaftaran Berhasil',
                'description' => 'Pendaftaran OMATIQ berhasil dikirim.',
                'keywords' => 'pendaftaran OMATIQ berhasil',
            ],
        ]);
    }

    public function verify(Request $request, ?string $registrationNumber = null): Response
    {
        $inputCode = $registrationNumber ?? $request->query('q') ?? $request->query('code') ?? $request->query('reg');
        $persona = null;
        $entity = null;
        $isValid = false;
        $isFirstCheckIn = false;

        if (! empty($inputCode)) {
            $inputCode = trim((string) $inputCode);

            // 1. Panitia Pelaksana (CREW-XXXXX / PAN-XXXXX)
            if (preg_match('/^(?:crew|pan)-?/i', $inputCode)) {
                $committee = EventCommittee::where('code', $inputCode)
                    ->orWhere('phone', $inputCode)
                    ->orWhere('nik', $inputCode)
                    ->first();

                if ($committee) {
                    $persona = 'committee';
                    $isValid = $committee->status === 'active';
                    $isCheckInToday = $committee->checked_in_at && $committee->checked_in_at->isToday();
                    if ($isValid && ! $isCheckInToday) {
                        $isFirstCheckIn = true;
                        $committee->updateQuietly(['checked_in_at' => now()]);
                        $committee->refresh();
                    }
                    $entity = $this->formatCommitteePayload($committee);
                }
            }
            // 2. Tamu Undangan (INV-XXXXX / VIP-XXXXX)
            elseif (preg_match('/^(?:inv|vip)-?/i', $inputCode)) {
                $guest = EventGuest::where('code', $inputCode)
                    ->orWhere('phone', $inputCode)
                    ->first();

                if ($guest) {
                    $persona = 'guest';
                    $isValid = $guest->status !== 'declined';
                    $isCheckInToday = $guest->checked_in_at && $guest->checked_in_at->isToday();
                    if ($isValid && ! $isCheckInToday) {
                        $isFirstCheckIn = true;
                        $guest->updateQuietly(['checked_in_at' => now(), 'status' => 'attended']);
                        $guest->refresh();
                    }
                    $entity = $this->formatGuestPayload($guest);
                }
            }
            // 3. Pendamping Cabang (OFF-XXXXX / CHP-XXXXX)
            elseif (preg_match('/^(?:off|chp)-?/i', $inputCode)) {
                $id = $inputCode;
                if (preg_match('/^off-?0*(\d+)/i', $inputCode, $matches)) {
                    $id = (int) $matches[1];
                }

                $chaperone = NationalChaperone::with([
                    'province:id,name',
                    'regency:id,name',
                    'verifier:id,name',
                    'participants.student:id,full_name,school_name,school_level,grade,is_binaan,photo_path',
                    'participants.olimpiade:id,name,category',
                    'participants.national:id,participant_id,status',
                ])
                    ->where(function ($q) use ($id, $inputCode) {
                        if (is_numeric($id)) {
                            $q->where('id', (int) $id);
                        }
                        $q->orWhere('phone', $inputCode)
                            ->orWhere('nik', $inputCode);
                    })
                    ->first();

                if ($chaperone) {
                    $persona = 'chaperone';
                    $isValid = $chaperone->status !== 'rejected';
                    $entity = $this->formatChaperonePayload($chaperone);
                }
            }
            // 4. Peserta OMATIQ (OMQ-...)
            else {
                $participant = Participant::with([
                    'olimpiade:id,name,category,event_year',
                    'student:id,full_name,nik,nis,school_name,school_level,grade,photo_path,regency_id,parent_phone,mentor_name,is_binaan',
                    'student.regency:id,name',
                    'mentor:id,name,phone',
                    'user:id,name,email',
                    'national',
                ])
                    ->where('registration_number', $inputCode)
                    ->first();

                if ($participant) {
                    $persona = 'participant';
                    $isValid = $participant->status !== 'rejected';
                    $entity = $this->formatParticipantPayload($participant);
                } else {
                    // Fallback lookup if numeric phone or NIK entered
                    $committee = EventCommittee::where('code', $inputCode)->orWhere('phone', $inputCode)->orWhere('nik', $inputCode)->first();
                    if ($committee) {
                        $persona = 'committee';
                        $isValid = $committee->status === 'active';
                        $isCheckInToday = $committee->checked_in_at && $committee->checked_in_at->isToday();
                        if ($isValid && ! $isCheckInToday) {
                            $isFirstCheckIn = true;
                            $committee->updateQuietly(['checked_in_at' => now()]);
                            $committee->refresh();
                        }
                        $entity = $this->formatCommitteePayload($committee);
                    } else {
                        $guest = EventGuest::where('code', $inputCode)->orWhere('phone', $inputCode)->first();
                        if ($guest) {
                            $persona = 'guest';
                            $isValid = $guest->status !== 'declined';
                            $isCheckInToday = $guest->checked_in_at && $guest->checked_in_at->isToday();
                            if ($isValid && ! $isCheckInToday) {
                                $isFirstCheckIn = true;
                                $guest->updateQuietly(['checked_in_at' => now(), 'status' => 'attended']);
                                $guest->refresh();
                            }
                            $entity = $this->formatGuestPayload($guest);
                        } else {
                            $chaperone = NationalChaperone::with([
                                'province:id,name',
                                'regency:id,name',
                                'verifier:id,name',
                                'participants.student:id,full_name,school_name,school_level,grade,is_binaan,photo_path',
                                'participants.olimpiade:id,name,category',
                                'participants.national:id,participant_id,status',
                            ])->where('phone', $inputCode)->orWhere('nik', $inputCode)->first();
                            if ($chaperone) {
                                $persona = 'chaperone';
                                $isValid = $chaperone->status !== 'rejected';
                                $entity = $this->formatChaperonePayload($chaperone);
                            }
                        }
                    }
                }
            }

            if (! $persona) {
                $persona = 'not_found';
            }
        }

        return Inertia::render('home/registration/verify', [
            'pageTitle' => 'Terminal Akses Masuk & Verifikasi Venue OMATIQ',
            'queryCode' => $inputCode,
            'persona' => $persona,
            'isValid' => $isValid,
            'isFirstCheckIn' => $isFirstCheckIn,
            'entity' => $entity,
            // Backward-compatible props
            'queryRegistrationNumber' => $inputCode,
            'participant' => $persona === 'participant' ? $entity : null,
            'chaperone' => $persona === 'chaperone' ? $entity : null,
            'committee' => $persona === 'committee' ? $entity : null,
            'guest' => $persona === 'guest' ? $entity : null,
            'meta' => [
                'title' => 'Universal Gate Verifikasi Venue OMATIQ',
                'description' => 'Terminal resmi terpadu verifikasi akses masuk venue OMATIQ untuk Peserta, Pendamping, Panitia, dan Tamu Undangan.',
            ],
        ]);
    }

    public function verifyChaperone(Request $request, ?string $code = null): RedirectResponse
    {
        $inputCode = $code ?? $request->query('q') ?? $request->query('code');

        return redirect()->route('home.registration.verify', ['registrationNumber' => $inputCode]);
    }

    public function verifyCommittee(Request $request, ?string $code = null): RedirectResponse
    {
        $inputCode = $code ?? $request->query('q') ?? $request->query('code');

        return redirect()->route('home.registration.verify', ['registrationNumber' => $inputCode]);
    }

    public function verifyGuest(Request $request, ?string $code = null): RedirectResponse
    {
        $inputCode = $code ?? $request->query('q') ?? $request->query('code');

        return redirect()->route('home.registration.verify', ['registrationNumber' => $inputCode]);
    }

    private function formatParticipantPayload(Participant $participant): array
    {
        return [
            'id' => $participant->id,
            'registration_number' => $participant->registration_number,
            'status' => $participant->status,
            'registration_type' => $participant->registration_type,
            'event_year' => $participant->event_year ?? 2026,
            'branch' => $participant->branch,
            'penyaluran_sanggar_name' => $participant->penyaluran_sanggar_name,
            'guardian_name' => $participant->guardian_signature_name,
            'olimpiade' => [
                'id' => $participant->olimpiade?->id,
                'name' => $participant->olimpiade?->name,
                'category' => $participant->olimpiade?->category,
            ],
            'student' => $participant->student ? [
                'full_name' => $participant->student->full_name,
                'nik' => $participant->student->nik ? (strlen($participant->student->nik) === 16 ? substr($participant->student->nik, 0, 6).'******'.substr($participant->student->nik, -4) : $participant->student->nik) : null,
                'nis' => $participant->student->nis,
                'school_name' => $participant->student->school_name,
                'school_level' => $participant->student->school_level,
                'grade' => $participant->student->grade,
                'regency_name' => $participant->student->regency?->name,
                'mentor_name' => $participant->mentor?->name ?? $participant->student->mentor_name,
                'guardian_name' => $participant->guardian_signature_name,
                'is_binaan' => (bool) $participant->student->is_binaan,
                'photo_url' => $participant->student->photo_url,
            ] : null,
            'verified_at' => now()->translatedFormat('d F Y, H:i').' WIB',
            'national' => $participant->national ? [
                'status' => $participant->national->status,
                'shirt_size' => $participant->national->shirt_size,
                'payment_status' => $participant->national->payment_status,
                'is_verified' => $participant->national->status === 'verified',
            ] : null,
        ];
    }

    private function formatChaperonePayload(NationalChaperone $chaperone): array
    {
        $formattedId = 'OFF-'.str_pad((string) $chaperone->id, 5, '0', STR_PAD_LEFT);

        return [
            'id' => $chaperone->id,
            'formatted_id' => $formattedId,
            'name' => $chaperone->name,
            'nik' => $chaperone->nik ? (strlen($chaperone->nik) === 16 ? substr($chaperone->nik, 0, 6).'******'.substr($chaperone->nik, -4) : $chaperone->nik) : null,
            'gender' => $chaperone->gender,
            'phone' => $chaperone->phone,
            'email' => $chaperone->email,
            'branch' => $chaperone->branch,
            'position' => $chaperone->position ?: ($chaperone->source_type === 'guru' ? 'Guru Pembimbing Cabang' : 'Staf Kantor Cabang'),
            'source_type' => $chaperone->source_type,
            'status' => $chaperone->status,
            'notes' => $chaperone->notes,
            'verified_at' => $chaperone->verified_at ? $chaperone->verified_at->translatedFormat('d F Y, H:i').' WIB' : null,
            'verifier_name' => $chaperone->verifier?->name ?? 'Panitia Pusat OMATIQ',
            'province_name' => $chaperone->province?->name,
            'regency_name' => $chaperone->regency?->name,
            'participants_count' => $chaperone->participants->count(),
            'participants' => $chaperone->participants->map(fn (Participant $p) => [
                'id' => $p->id,
                'registration_number' => $p->registration_number,
                'name' => $p->student?->full_name ?? '-',
                'school_name' => $p->student?->school_name ?? '-',
                'school_level' => $p->student?->school_level ?? 'SD/MI',
                'grade' => $p->student?->grade ?? '-',
                'olimpiade_name' => $p->olimpiade?->name ?? 'OMATIQ',
                'category' => $p->olimpiade?->category ?? '-',
                'is_binaan' => (bool) $p->student?->is_binaan,
                'photo_url' => $p->student?->photo_url,
                'national_status' => $p->national?->status ?? 'unconfirmed',
                'is_national_verified' => $p->national?->status === 'verified',
            ])->all(),
        ];
    }

    private function formatCommitteePayload(EventCommittee $committee): array
    {
        $checkedInAt = $committee->checked_in_at;
        $isToday = $checkedInAt && $checkedInAt->isToday();

        return [
            'id' => $committee->id,
            'code' => $committee->code,
            'name' => $committee->name,
            'nik' => $committee->nik ? (strlen($committee->nik) === 16 ? substr($committee->nik, 0, 6).'******'.substr($committee->nik, -4) : $committee->nik) : null,
            'gender' => $committee->gender,
            'phone' => $committee->phone,
            'email' => $committee->email,
            'division' => $committee->division,
            'position' => $committee->position ?: 'Panitia Pelaksana',
            'access_zone' => $committee->access_zone ?: 'All Access',
            'duty_description' => $committee->duty_description,
            'photo_url' => $committee->photo_url,
            'status' => $committee->status,
            'notes' => $committee->notes,
            'event_year' => $committee->event_year,
            'checked_in_at' => $checkedInAt ? $checkedInAt->translatedFormat('d F Y, H:i').' WIB' : null,
            'checked_in_time' => $checkedInAt ? $checkedInAt->translatedFormat('H:i').' WIB' : null,
            'is_checked_in_today' => $isToday,
            'has_user_account' => ! is_null($committee->user_id),
        ];
    }

    private function formatGuestPayload(EventGuest $guest): array
    {
        $checkedInAt = $guest->checked_in_at;
        $isToday = $checkedInAt && $checkedInAt->isToday();

        return [
            'id' => $guest->id,
            'code' => $guest->code,
            'name' => $guest->name,
            'institution' => $guest->institution ?: 'Tamu Kehormatan',
            'position' => $guest->position ?: 'Undangan Khusus',
            'category' => strtoupper((string) $guest->category),
            'phone' => $guest->phone,
            'email' => $guest->email,
            'table_number' => $guest->table_number ?: 'AREA KURSI KEHORMATAN (VIP)',
            'seat_count' => $guest->seat_count,
            'photo_url' => $guest->photo_url,
            'status' => $guest->status,
            'notes' => $guest->notes,
            'event_year' => $guest->event_year,
            'checked_in_at' => $checkedInAt ? $checkedInAt->translatedFormat('d F Y, H:i').' WIB' : null,
            'checked_in_time' => $checkedInAt ? $checkedInAt->translatedFormat('H:i').' WIB' : null,
            'is_checked_in_today' => $isToday,
        ];
    }

    private function payload(StoreParticipantRequest $request): array
    {
        $data = $request->safe()->only([
            'nik', 'olimpiade_id', 'referral_source', 'branch',
            'has_joined_before', 'previous_year', 'achievements',
            'participant_signature_name', 'guardian_signature_name',
        ]);

        if (strtoupper(trim((string) ($data['branch'] ?? ''))) === 'SURABAYA') {
            $data['branch'] = 'PUSAT 2';
        }

        return $data;
    }

    private function studentData(StoreParticipantRequest $request): array
    {
        return [
            'full_name' => $request->full_name,
            'nickname' => $request->nickname,
            'gender' => $request->gender,
            'birth_place' => $request->birth_place,
            'birth_date' => $request->birth_date,
            'school_name' => $request->school_name,
            'grade' => $request->grade,
            'address' => $request->address,
            'province_id' => $request->province_id,
            'regency_id' => $request->regency_id,
            'district_id' => $request->district_id,
            'village_id' => $request->village_id,
            'parent_phone' => $request->parent_phone,
            'is_binaan' => false,
        ];
    }

    private function handleStudentFiles(Student $student, StoreParticipantRequest $request): void
    {
        foreach ($this->fileMap() as $input => $column) {
            if ($request->hasFile($input)) {
                $path = $this->uploadFile(
                    $student->{$column},
                    $request->file($input),
                    'students/student_cards',
                );
                $student->update([$column => $path]);
            }
        }
    }

    private function handlePaymentProof(StoreParticipantRequest $request): ?string
    {
        if (! $request->hasFile('payment_proof')) {
            return null;
        }

        return $this->uploadFile(null, $request->file('payment_proof'), 'participants/payment_proofs');
    }

    private function fileMap(): array
    {
        return [
            'student_card' => 'student_card_path',
        ];
    }

    private function registrationNumber(): string
    {
        return Participant::generateRegistrationNumber();
    }
}
