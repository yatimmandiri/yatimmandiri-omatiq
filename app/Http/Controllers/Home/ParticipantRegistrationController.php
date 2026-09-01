<?php

namespace App\Http\Controllers\Home;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
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
            'districts' => District::query()
                ->orderBy('name')
                ->get(['id', 'regency_id', 'name'])
                ->map(fn (District $d) => ['id' => $d->id, 'regency_id' => $d->regency_id, 'name' => $d->name]),
            'villages' => [],
            'branches' => $branches,
            'meta' => [
                'title' => 'Pendaftaran OMATIQ',
                'description' => 'Daftarkan peserta untuk menjadi bagian dari OMATIQ 2026.',
                'keywords' => 'pendaftaran OMATIQ, daftar olimpiade, peserta OMATIQ',
            ],
        ]);
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
                ['nik' => $request->nik],
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
