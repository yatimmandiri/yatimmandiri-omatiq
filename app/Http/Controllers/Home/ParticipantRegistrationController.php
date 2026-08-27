<?php

namespace App\Http\Controllers\Home;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

        return Inertia::render('home/registration/index', [
            'pageTitle' => 'Pendaftaran OMATIQ',
            'olimpiades' => Olimpiade::query()->active()->where('show_on_registration', true)->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name'])
                ->map(fn (Regency $regency) => [
                    'id' => $regency->id,
                    'province_id' => $regency->province_id,
                    'name' => $regency->name,
                ]),
            'meta' => [
                'title' => 'Pendaftaran OMATIQ',
                'description' => 'Daftarkan peserta untuk menjadi bagian dari OMATIQ 2026.',
                'keywords' => 'pendaftaran OMATIQ, daftar olimpiade, peserta OMATIQ',
            ],
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

            $data = $this->payload($request);
            $data['user_id'] = $user->id;
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
            'age' => $request->age,
            'school_name' => $request->school_name,
            'grade' => $request->grade,
            'address' => $request->address,
            'province_id' => $request->province_id,
            'regency_id' => $request->regency_id,
            'parent_phone' => $request->parent_phone,
            'mentor_name' => $request->mentor_name,
            'mentor_phone' => $request->mentor_phone,
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
