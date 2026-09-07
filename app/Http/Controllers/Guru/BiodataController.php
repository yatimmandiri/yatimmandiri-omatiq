<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Core\Region\Province;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BiodataController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Teacher')) {
            abort(403);
        }

        $profile = null;
        if ($user->penyaluran_token) {
            try {
                $profile = app(PenyaluranService::class)->me($user->penyaluran_token);
            } catch (\Throwable $e) {
                $profile = null;
            }
        }

        // Normalize biodata dari Penyaluran (sumber tunggal)
        $gender = $profile['gender'] ?? $profile['jenis_kelamin'] ?? null;
        if ($gender === 'L') {
            $gender = 'male';
        } elseif ($gender === 'P') {
            $gender = 'female';
        }

        $biodata = [
            'name' => $profile['name'] ?? $profile['nama'] ?? $user->name,
            'email' => $profile['email'] ?? $user->email,
            'phone' => $profile['phone'] ?? $profile['hp'] ?? $profile['no_hp'] ?? $user->phone,
            'nik' => $profile['nik'] ?? null,
            'gender' => $gender,
            'birth_place' => $profile['birth_place'] ?? $profile['tempat_lahir'] ?? null,
            'birth_date' => $profile['birth_date'] ?? $profile['tanggal_lahir'] ?? $profile['tgl_lahir'] ?? null,
            'address' => $profile['address'] ?? $profile['alamat'] ?? null,
            'photo_url' => $profile['photo_url'] ?? $profile['foto'] ?? null,
            // Wilayah — dari Penyaluran (ids)
            'province_id' => $profile['province_id'] ?? $profile['provinsi_id'] ?? null,
            'regency_id' => $profile['regency_id'] ?? $profile['kabupaten_id'] ?? $profile['kota_id'] ?? null,
            'district_id' => $profile['district_id'] ?? $profile['kecamatan_id'] ?? null,
            'village_id' => $profile['village_id'] ?? $profile['desa_id'] ?? $profile['kelurahan_id'] ?? null,
        ];

        // Hitung kelengkapan (same logic as DashboardService) — include wilayah
        $fields = [
            'name' => filled($biodata['name']),
            'email' => filled($biodata['email']) && ! str_ends_with((string) $biodata['email'], '@penyaluran.local'),
            'phone' => filled($biodata['phone']),
            'nik' => filled($biodata['nik']),
            'gender' => filled($biodata['gender']),
            'birth_place' => filled($biodata['birth_place']),
            'birth_date' => filled($biodata['birth_date']),
            'address' => filled($biodata['address']),
            'province_id' => filled($biodata['province_id']),
            'regency_id' => filled($biodata['regency_id']),
            'district_id' => filled($biodata['district_id']),
            'village_id' => filled($biodata['village_id']),
        ];
        $filled = collect($fields)->filter()->count();
        $total = count($fields);
        $percent = $total > 0 ? (int) round(($filled / $total) * 100) : 0;

        return Inertia::render('guru/biodata', [
            'biodata' => [
                ...$biodata,
                'teacher_profile_completed_at' => $user->teacher_profile_completed_at,
                'penyaluran' => $profile,
                'completeness' => [
                    'fields' => $fields,
                    'filled' => $filled,
                    'total' => $total,
                    'percent' => $percent,
                    'is_complete' => $percent === 100,
                    'missing' => collect($fields)->filter(fn ($v) => ! $v)->keys()->all(),
                ],
            ],
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Teacher')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'nik' => ['nullable', 'string', 'max:20', 'regex:/^[0-9]{10,20}$/'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'address' => ['nullable', 'string', 'max:500'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
        ]);

        $token = $request->session()->get('penyaluran_token') ?? $user->penyaluran_token;

        if (! $token && ! app()->environment('testing')) {
            return back()->withErrors(['name' => 'Sesi Penyaluran tidak ditemukan. Silakan login ulang.'])->withInput();
        }

        // Update langsung ke Penyaluran (sumber tunggal, tidak simpan ke users lokal)
        if ($token) {
            try {
                $payload = collect([
                    'name' => $validated['name'] ?? null,
                    'nik' => $validated['nik'] ?? null,
                    'gender' => $validated['gender'] ?? null,
                    'birth_place' => $validated['birth_place'] ?? null,
                    'birth_date' => $validated['birth_date'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'province_id' => $validated['province_id'] ?? null,
                    'regency_id' => $validated['regency_id'] ?? null,
                    'district_id' => $validated['district_id'] ?? null,
                    'village_id' => $validated['village_id'] ?? null,
                ])->filter(fn ($v) => filled($v))->all();

                // Konversi gender male/female ke format Penyaluran L/P jika diperlukan
                if (isset($payload['gender'])) {
                    $payload['gender'] = $payload['gender'] === 'male' ? 'L' : ($payload['gender'] === 'female' ? 'P' : $payload['gender']);
                }

                app(PenyaluranService::class)->updateMe($token, $payload);
            } catch (\Throwable $e) {
                return back()->withErrors(['name' => 'Gagal memperbarui biodata di Penyaluran: '.$e->getMessage()])->withInput();
            }
        }

        // Sinkron ringan ke local User untuk konsistensi nama (opsional, tidak untuk kelengkapan)
        if (isset($validated['name']) && $validated['name'] !== $user->name) {
            $user->forceFill(['name' => $validated['name']])->save();
        }

        return redirect()->route('guru.dashboard')->with('success', 'Biodata guru berhasil diperbarui di Penyaluran.');
    }
}
