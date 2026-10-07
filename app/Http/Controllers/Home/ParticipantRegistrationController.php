<?php

namespace App\Http\Controllers\Home;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Settings\SiteSettings;
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
                return json_decode(Storage::disk('local')->get('branch-offices.json'), true) ?? [];
            }

            return [];
        });

        return Inertia::render('home/registration/index', [
            'pageTitle' => 'Pendaftaran OMATIQ',
            'olimpiades' => Olimpiade::query()->active()->forCurrentPeriod()->ordered()->get(['id', 'name', 'category', 'slug']),
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

            $allStudents = $penyaluran->allStudents();
            $foundApi = collect($allStudents)->firstWhere(function ($s) use ($nik) {
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

        $participant = DB::transaction(function () use ($request) {
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
            $data['registration_number'] = $this->registrationNumber();
            $data['status'] = 'submitted';
            $data['registration_type'] = 'public';
            $data['payment_status'] = 'waiting_confirmation';
            $data['payment_proof_path'] = $this->handlePaymentProof($request);

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
        $regNo = $registrationNumber ?? $request->query('q') ?? $request->query('reg');
        $participant = null;
        $isValid = false;

        if (! empty($regNo)) {
            $regNo = trim((string) $regNo);
            $participant = Participant::query()
                ->with([
                    'olimpiade:id,name,category,event_year',
                    'student:id,full_name,nik,nis,school_name,school_level,grade,photo_path,regency_id,parent_phone,mentor_name,is_binaan',
                    'student.regency:id,name',
                    'mentor:id,name,phone',
                    'user:id,name,email',
                ])
                ->where('registration_number', $regNo)
                ->first();

            if ($participant && $participant->status !== 'rejected') {
                $isValid = true;
            }
        }

        return Inertia::render('home/registration/verify', [
            'pageTitle' => 'Verifikasi Keaslian Peserta OMATIQ',
            'queryRegistrationNumber' => $regNo,
            'isValid' => $isValid,
            'participant' => $participant ? [
                'id' => $participant->id,
                'registration_number' => $participant->registration_number,
                'status' => $participant->status,
                'registration_type' => $participant->registration_type,
                'event_year' => $participant->event_year ?? 2026,
                'branch' => $participant->branch,
                'penyaluran_sanggar_name' => $participant->penyaluran_sanggar_name,
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
                    'is_binaan' => (bool) $participant->student->is_binaan,
                    'photo_url' => $participant->student->photo_url,
                ] : null,
                'verified_at' => now()->translatedFormat('d F Y, H:i').' WIB',
            ] : null,
            'meta' => [
                'title' => 'Verifikasi Keaslian Peserta OMATIQ',
                'description' => 'Halaman resmi verifikasi keaslian dan status kepesertaan OMATIQ.',
                'keywords' => 'verifikasi peserta OMATIQ, cek kartu pendaftaran OMATIQ, keaslian peserta',
            ],
        ]);
    }

    private function payload(StoreParticipantRequest $request): array
    {
        return $request->safe()->only([
            'nik', 'olimpiade_id', 'referral_source', 'branch',
            'has_joined_before', 'previous_year', 'achievements',
            'participant_signature_name', 'guardian_signature_name',
        ]);
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
                    'uploads/students/'.$input,
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

        return $this->uploadFile(null, $request->file('payment_proof'), 'uploads/participants/payment_proof');
    }

    private function fileMap(): array
    {
        return [
            'student_card' => 'student_card_path',
        ];
    }

    private function registrationNumber(): string
    {
        return DB::transaction(function () {
            $prefix = 'OMQ-'.now()->format('Ymd');
            $max = Participant::query()
                ->where('registration_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->max('registration_number');

            $next = 1;
            if ($max && preg_match('/-(\d{4})$/', $max, $m)) {
                $next = ((int) $m[1]) + 1;
            }

            return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        });
    }
}
