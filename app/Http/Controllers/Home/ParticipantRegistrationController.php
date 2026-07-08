<?php

namespace App\Http\Controllers\Home;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantRegistrationController extends Controller
{
    use UploadFiles;

    public function create(): Response
    {
        return Inertia::render('home/registration/index', [
            'pageTitle' => 'Pendaftaran OMATIQ',
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()->orderBy('name')->get(['id', 'province_id', 'name']),
            'meta' => [
                'title' => 'Pendaftaran OMATIQ',
                'description' => 'Daftarkan peserta untuk menjadi bagian dari OMATIQ 2026.',
                'keywords' => 'pendaftaran OMATIQ, daftar olimpiade, peserta OMATIQ',
            ],
        ]);
    }

    public function store(StoreParticipantRequest $request)
    {
        $data = $this->payload($request);
        $data['registration_number'] = $this->registrationNumber();
        $data['status'] = 'submitted';

        foreach ($this->fileMap() as $input => $column) {
            if ($request->hasFile($input)) {
                $data[$column] = $this->uploadFile(
                    null,
                    $request->file($input),
                    'uploads/participants/'.$input,
                );
            }
        }

        $participant = Participant::create($data);

        return redirect()
            ->route('home.registration.success', $participant->registration_number)
            ->with('success', 'Pendaftaran berhasil dikirim. Simpan nomor registrasi kamu.');
    }

    public function success(string $registrationNumber): Response
    {
        $participant = Participant::query()
            ->with('olimpiade:id,name')
            ->where('registration_number', $registrationNumber)
            ->firstOrFail();

        return Inertia::render('home/registration/success', [
            'pageTitle' => 'Pendaftaran Berhasil',
            'participant' => [
                'registration_number' => $participant->registration_number,
                'full_name' => $participant->full_name,
                'olimpiade' => $participant->olimpiade?->name,
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
        $data = $request->safe()->except([
            'photo',
            'identity_card',
            'recommendation_letter',
            'achievement_certificate',
        ]);

        $data['has_joined_before'] = $request->boolean('has_joined_before');
        $data['data_truth_consent'] = $request->boolean('data_truth_consent');
        $data['documentation_consent'] = $request->boolean('documentation_consent');
        $data['rules_consent'] = $request->boolean('rules_consent');

        if (! $data['has_joined_before']) {
            $data['previous_year'] = null;
        }

        return $data;
    }

    private function registrationNumber(): string
    {
        return DB::transaction(function () {
            $prefix = 'OMQ-'.now()->format('Ymd');
            $latest = Participant::query()
                ->where('registration_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->count();

            return $prefix.'-'.str_pad((string) ($latest + 1), 4, '0', STR_PAD_LEFT);
        });
    }

    private function fileMap(): array
    {
        return [
            'photo' => 'photo_path',
            'identity_card' => 'identity_card_path',
            'recommendation_letter' => 'recommendation_letter_path',
            'achievement_certificate' => 'achievement_certificate_path',
        ];
    }
}
