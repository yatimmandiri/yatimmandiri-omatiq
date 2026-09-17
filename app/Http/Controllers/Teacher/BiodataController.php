<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BiodataController extends Controller
{
    public static function extractRegionValue(?array $profile, array $keys): ?string
    {
        if (! $profile) {
            return null;
        }

        foreach ($keys as $key) {
            if (isset($profile[$key])) {
                $val = $profile[$key];
                if (is_array($val)) {
                    $nested = $val['id'] ?? $val['code'] ?? $val['value'] ?? $val['name'] ?? $val['nama'] ?? null;
                    if ($nested !== null && $nested !== '') {
                        return (string) $nested;
                    }
                } elseif (is_scalar($val) && $val !== '') {
                    return (string) $val;
                }
            }
        }

        // Check in nested sub-structures if present
        foreach (['guru', 'user', 'profile', 'biodata', 'domisili', 'wilayah', 'data', 'alamat'] as $nestedKey) {
            if (isset($profile[$nestedKey]) && is_array($profile[$nestedKey])) {
                $found = self::extractRegionValue($profile[$nestedKey], $keys);
                if ($found !== null) {
                    return $found;
                }
            }
        }

        return null;
    }

    public static function extractRegionId(?array $profile, array $keys): ?string
    {
        return self::extractRegionValue($profile, $keys);
    }

    public static function resolveRegionIds(?array $profile): array
    {
        if (! $profile) {
            return [
                'province_id' => null,
                'regency_id' => null,
                'district_id' => null,
                'village_id' => null,
            ];
        }

        $rawProv = self::extractRegionValue($profile, [
            'province_id', 'provinsi_id', 'id_provinsi', 'id_prov', 'province_code', 'provinsi_code', 'kode_provinsi',
            'province_name', 'provinsi_name', 'nama_provinsi', 'province', 'provinsi', 'propinsi_id', 'propinsi_name', 'propinsi',
        ]);
        $rawReg = self::extractRegionValue($profile, [
            'regency_id', 'kabupaten_id', 'kota_id', 'id_kabupaten', 'id_kota', 'id_kab', 'regency_code', 'kabupaten_code', 'kota_code', 'kode_kabupaten', 'kode_kota',
            'regency_name', 'kabupaten_name', 'kota_name', 'nama_kabupaten', 'nama_kota', 'regency', 'kabupaten', 'kota', 'kab_kota', 'kabupaten_kota',
        ]);
        $rawDist = self::extractRegionValue($profile, [
            'district_id', 'kecamatan_id', 'id_kecamatan', 'id_distrik', 'id_kec', 'district_code', 'kecamatan_code', 'kode_kecamatan',
            'district_name', 'kecamatan_name', 'nama_kecamatan', 'district', 'kecamatan', 'kec',
        ]);
        $rawVill = self::extractRegionValue($profile, [
            'village_id', 'desa_id', 'kelurahan_id', 'id_desa', 'id_kelurahan', 'id_kel', 'id_des', 'village_code', 'desa_code', 'kelurahan_code', 'kode_desa', 'kode_kelurahan',
            'village_name', 'desa_name', 'kelurahan_name', 'nama_desa', 'nama_kelurahan', 'village', 'desa', 'kelurahan', 'kel',
        ]);

        $provinceId = null;
        if ($rawProv) {
            $p = Province::where('id', $rawProv)
                ->orWhere('name', strtoupper(trim($rawProv)))
                ->orWhere('name', 'like', '%'.strtoupper(trim(str_ireplace('provinsi', '', $rawProv))).'%')
                ->first();
            $provinceId = $p?->id ? (string) $p->id : (is_numeric($rawProv) ? (string) $rawProv : null);
        }

        $regencyId = null;
        if ($rawReg) {
            $cleanReg = strtoupper(trim(preg_replace('/^(kabupaten|kota|kab\.?|kotamadya)\s+/i', '', $rawReg)));
            $query = Regency::query();
            if ($provinceId) {
                $query->where('province_id', $provinceId);
            }
            $r = (clone $query)->where('id', $rawReg)->first()
                ?? (clone $query)->where('name', strtoupper(trim($rawReg)))->first()
                ?? (clone $query)->where('name', 'like', "%{$cleanReg}%")->first()
                ?? Regency::where('id', $rawReg)->first();
            $regencyId = $r?->id ? (string) $r->id : (is_numeric($rawReg) ? (string) $rawReg : null);
            if ($r && ! $provinceId) {
                $provinceId = (string) $r->province_id;
            }
        }

        $districtId = null;
        if ($rawDist) {
            $cleanDist = strtoupper(trim(preg_replace('/^(kecamatan|kec\.?)\s+/i', '', $rawDist)));
            $query = District::query();
            if ($regencyId) {
                $query->where('regency_id', $regencyId);
            }
            $d = (clone $query)->where('id', $rawDist)->first()
                ?? (clone $query)->where('name', strtoupper(trim($rawDist)))->first()
                ?? (clone $query)->where('name', 'like', "%{$cleanDist}%")->first()
                ?? District::where('id', $rawDist)->first();
            $districtId = $d?->id ? (string) $d->id : (is_numeric($rawDist) ? (string) $rawDist : null);
            if ($d && ! $regencyId) {
                $regencyId = (string) $d->regency_id;
            }
        }

        $villageId = null;
        if ($rawVill) {
            $cleanVill = strtoupper(trim(preg_replace('/^(desa|kelurahan|kel\.?|ds\.?)\s+/i', '', $rawVill)));
            $query = Village::query();
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
            $v = (clone $query)->where('id', $rawVill)->first()
                ?? (clone $query)->where('name', strtoupper(trim($rawVill)))->first()
                ?? (clone $query)->where('name', 'like', "%{$cleanVill}%")->first()
                ?? Village::where('id', $rawVill)->first();
            $villageId = $v?->id ? (string) $v->id : (is_numeric($rawVill) ? (string) $rawVill : null);
            if ($v && ! $districtId) {
                $districtId = (string) $v->district_id;
            }
        }

        return [
            'province_id' => $provinceId,
            'regency_id' => $regencyId,
            'district_id' => $districtId,
            'village_id' => $villageId,
        ];
    }

    public static function extractTeacherBiodata(?array $profile, ?User $user = null): array
    {
        if (! $profile) {
            return [
                'name' => $user?->name,
                'email' => $user?->email,
                'phone' => $user?->phone,
                'nik' => null,
                'gender' => null,
                'birth_place' => null,
                'birth_date' => null,
                'address' => null,
                'photo_url' => null,
                'province_id' => null,
                'regency_id' => null,
                'district_id' => null,
                'village_id' => null,
            ];
        }

        // Flatten any nested sub-arrays
        $flat = $profile;
        foreach (['guru', 'user', 'profile', 'biodata', 'data', 'domisili', 'wilayah'] as $subKey) {
            if (isset($profile[$subKey]) && is_array($profile[$subKey])) {
                $flat = array_merge($flat, $profile[$subKey]);
            }
        }

        $rawGender = $flat['gender'] ?? $flat['jenis_kelamin'] ?? $flat['jk'] ?? $flat['sex'] ?? null;
        $gender = null;
        if ($rawGender !== null && $rawGender !== '') {
            $upperG = strtoupper(trim((string) $rawGender));
            if (in_array($upperG, ['L', 'M', 'MALE', 'LAKI-LAKI', 'LAKI', 'PRIA'], true)) {
                $gender = 'male';
            } elseif (in_array($upperG, ['P', 'F', 'FEMALE', 'PEREMPUAN', 'WANITA'], true)) {
                $gender = 'female';
            }
        }

        $regions = self::resolveRegionIds($profile);

        $birthDate = $flat['birth_date'] ?? $flat['tanggal_lahir'] ?? $flat['tgl_lahir'] ?? $flat['tgllahir'] ?? null;
        if ($birthDate && is_string($birthDate) && strlen($birthDate) >= 10) {
            $birthDate = substr($birthDate, 0, 10);
        }

        return [
            'name' => $flat['name'] ?? $flat['nama'] ?? $flat['full_name'] ?? $flat['nama_lengkap'] ?? $user?->name,
            'email' => $flat['email'] ?? $user?->email,
            'phone' => $flat['phone'] ?? $flat['hp'] ?? $flat['no_hp'] ?? $flat['nomor_hp'] ?? $flat['telepon'] ?? $flat['no_telp'] ?? $user?->phone,
            'nik' => $flat['nik'] ?? $flat['no_ktp'] ?? $flat['ktp'] ?? $flat['nomor_ktp'] ?? $flat['identity_number'] ?? null,
            'gender' => $gender,
            'birth_place' => $flat['birth_place'] ?? $flat['tempat_lahir'] ?? $flat['tmpt_lahir'] ?? $flat['tmp_lahir'] ?? $flat['kota_lahir'] ?? null,
            'birth_date' => $birthDate,
            'address' => $flat['address'] ?? $flat['alamat'] ?? $flat['alamat_lengkap'] ?? $flat['domisili'] ?? $flat['alamat_domisili'] ?? null,
            'photo_url' => $flat['photo_url'] ?? $flat['photo'] ?? $flat['foto'] ?? $flat['foto_url'] ?? $flat['avatar'] ?? null,
            'province_id' => $regions['province_id'],
            'regency_id' => $regions['regency_id'],
            'district_id' => $regions['district_id'],
            'village_id' => $regions['village_id'],
        ];
    }

    public static function completeness(array $biodata): array
    {
        $fields = [
            'name' => filled($biodata['name'] ?? null),
            'email' => filled($biodata['email'] ?? null) && ! str_ends_with((string) ($biodata['email'] ?? ''), '@penyaluran.local'),
            'phone' => filled($biodata['phone'] ?? null),
            'nik' => filled($biodata['nik'] ?? null),
            'gender' => filled($biodata['gender'] ?? null),
            'birth_place' => filled($biodata['birth_place'] ?? null),
            'birth_date' => filled($biodata['birth_date'] ?? null),
            'address' => filled($biodata['address'] ?? null),
            'province_id' => filled($biodata['province_id'] ?? null),
            'regency_id' => filled($biodata['regency_id'] ?? null),
            'district_id' => filled($biodata['district_id'] ?? null),
            'village_id' => filled($biodata['village_id'] ?? null),
        ];

        $filled = collect($fields)->filter()->count();
        $total = count($fields);
        $percent = $total > 0 ? (int) round(($filled / $total) * 100) : 0;

        return [
            'fields' => $fields,
            'filled' => $filled,
            'total' => $total,
            'percent' => $percent,
            'is_complete' => $percent === 100,
            'missing' => collect($fields)->filter(fn ($v) => ! $v)->keys()->all(),
        ];
    }

    public function edit(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Teacher')) {
            abort(403);
        }

        $token = $request->session()->get('penyaluran_token') ?? $user->penyaluran_token;
        $profile = null;
        if ($token) {
            try {
                $profile = app(PenyaluranService::class)->me($token);
            } catch (\Throwable $e) {
                $profile = null;
            }
        }

        $biodata = self::extractTeacherBiodata($profile, $user);
        $completeness = self::completeness($biodata);

        $provinceId = $biodata['province_id'];
        $regencyId = $biodata['regency_id'];
        $districtId = $biodata['district_id'];

        $provinces = Province::orderBy('name')->get(['id', 'name']);
        $initialRegencies = $provinceId
            ? Regency::where('province_id', $provinceId)->orderBy('name')->get(['id', 'province_id', 'name'])->values()->all()
            : [];
        $initialDistricts = $regencyId
            ? District::where('regency_id', $regencyId)->orderBy('name')->get(['id', 'regency_id', 'name'])->values()->all()
            : [];
        $initialVillages = $districtId
            ? Village::where('district_id', $districtId)->orderBy('name')->get(['id', 'district_id', 'name'])->values()->all()
            : [];

        return Inertia::render('teacher/biodata', [
            'biodata' => [
                ...$biodata,
                'teacher_profile_completed_at' => $user->teacher_profile_completed_at,
                'penyaluran' => $profile,
                'completeness' => $completeness,
            ],
            'provinces' => $provinces,
            'initialRegencies' => $initialRegencies,
            'initialDistricts' => $initialDistricts,
            'initialVillages' => $initialVillages,
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
                $prov = ! empty($validated['province_id']) ? Province::find($validated['province_id']) : null;
                $reg = ! empty($validated['regency_id']) ? Regency::find($validated['regency_id']) : null;
                $dist = ! empty($validated['district_id']) ? District::find($validated['district_id']) : null;
                $vill = ! empty($validated['village_id']) ? Village::find($validated['village_id']) : null;

                $genderCode = null;
                if (! empty($validated['gender'])) {
                    $genderCode = $validated['gender'] === 'male' ? 'L' : ($validated['gender'] === 'female' ? 'P' : $validated['gender']);
                }

                $payload = collect([
                    'name' => $validated['name'] ?? null,
                    'nama' => $validated['name'] ?? null,
                    'nik' => $validated['nik'] ?? null,
                    'no_ktp' => $validated['nik'] ?? null,
                    'gender' => $genderCode,
                    'jenis_kelamin' => $genderCode,
                    'birth_place' => $validated['birth_place'] ?? null,
                    'tempat_lahir' => $validated['birth_place'] ?? null,
                    'birth_date' => $validated['birth_date'] ?? null,
                    'tanggal_lahir' => $validated['birth_date'] ?? null,
                    'tgl_lahir' => $validated['birth_date'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'alamat' => $validated['address'] ?? null,
                    // ID
                    'province_id' => $validated['province_id'] ?? null,
                    'regency_id' => $validated['regency_id'] ?? null,
                    'district_id' => $validated['district_id'] ?? null,
                    'village_id' => $validated['village_id'] ?? null,
                    // Alias bilingual ID
                    'provinsi_id' => $validated['province_id'] ?? null,
                    'kabupaten_id' => $validated['regency_id'] ?? null,
                    'kecamatan_id' => $validated['district_id'] ?? null,
                    'desa_id' => $validated['village_id'] ?? null,
                    'kelurahan_id' => $validated['village_id'] ?? null,
                    // Alias nama wilayah
                    'province' => $prov?->name,
                    'provinsi' => $prov?->name,
                    'regency' => $reg?->name,
                    'kabupaten' => $reg?->name,
                    'kota' => $reg?->name,
                    'district' => $dist?->name,
                    'kecamatan' => $dist?->name,
                    'village' => $vill?->name,
                    'desa' => $vill?->name,
                    'kelurahan' => $vill?->name,
                ])->filter(fn ($v) => filled($v))->all();

                app(PenyaluranService::class)->updateMe($token, $payload);

                // Bersihkan cache profile token
                Cache::forget('penyaluran:me:'.sha1($token));
                if ($user->penyaluran_token) {
                    Cache::forget('penyaluran:me:'.sha1($user->penyaluran_token));
                }
                if ($request->session()->has('penyaluran_token')) {
                    Cache::forget('penyaluran:me:'.sha1((string) $request->session()->get('penyaluran_token')));
                }
            } catch (\Throwable $e) {
                return back()->withErrors(['name' => 'Gagal memperbarui biodata di Penyaluran: '.$e->getMessage()])->withInput();
            }
        }

        // Sinkron ringan ke local User untuk konsistensi nama (opsional, tidak untuk kelengkapan)
        if (isset($validated['name']) && $validated['name'] !== $user->name) {
            $user->forceFill(['name' => $validated['name']])->save();
        }

        return redirect()->route('teacher.dashboard')->with('success', 'Biodata guru berhasil diperbarui di Penyaluran.');
    }
}
