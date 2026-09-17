<?php

use App\Http\Controllers\Teacher\BiodataController;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.penyaluran.url', 'https://penyaluran-test.example.com');
    Cache::flush();
});

it('logs in guru and returns bearer token', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => true,
            'token' => 'sample-bearer-token-123',
        ], 200),
    ]);

    $service = new PenyaluranService;
    $token = $service->loginGuru('081234567890');

    expect($token)->toBe('sample-bearer-token-123');

    Http::assertSent(function (Request $request) {
        return $request->url() === 'https://penyaluran-test.example.com/api/v1/guru/login'
            && $request['phone'] === '081234567890';
    });
});

it('throws RuntimeException when login returns no token or fails', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => false,
            'message' => 'Nomor HP tidak terdaftar sebagai guru.',
        ], 404),
    ]);

    $service = new PenyaluranService;

    expect(fn () => $service->loginGuru('081999999999'))
        ->toThrow(RuntimeException::class, 'Nomor HP tidak terdaftar sebagai Guru/Pembina di sistem Penyaluran. Pastikan nomor yang Anda masukkan sudah terdaftar.');
});

it('fetches guru profile and caches it', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => [
                'id' => 42,
                'name' => 'Ustadz Abdullah',
                'phone' => '081234567890',
            ],
        ], 200),
    ]);

    $service = new PenyaluranService;
    $profile1 = $service->me('test-token-42');
    $profile2 = $service->me('test-token-42');

    expect($profile1['id'])->toBe(42)
        ->and($profile1['name'])->toBe('Ustadz Abdullah')
        ->and($profile2['id'])->toBe(42);

    Http::assertSentCount(1);
});

it('updates guru profile and invalidates cache', function () {
    $token = 'test-token-update';
    $cacheKey = 'penyaluran:me:'.sha1($token);
    Cache::put($cacheKey, ['id' => 50, 'name' => 'Old Name'], 300);

    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => ['id' => 50, 'email' => 'newemail@example.com'],
        ], 200),
    ]);

    $service = new PenyaluranService;
    $res = $service->updateMe($token, ['email' => 'newemail@example.com']);

    expect($res['email'])->toBe('newemail@example.com')
        ->and(Cache::has($cacheKey))->toBeFalse();

    Http::assertSent(function (Request $request) {
        return $request->url() === 'https://penyaluran-test.example.com/api/v1/guru/me'
            && $request->method() === 'PUT'
            && $request['email'] === 'newemail@example.com';
    });
});

it('fetches and normalizes student list from penyaluran guru me response', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'message' => 'Data profil guru berhasil diambil.',
            'data' => [
                'id' => 248,
                'code' => 'GG161480',
                'name' => 'MUHAMMAD ZAINUL ARIFIN',
                'phone' => '6281259513025',
                'kantor_name' => 'LAMONGAN',
                'sanggars' => [
                    [
                        'id' => 316,
                        'name' => 'SANGGAR GENIUS JOTOSANUR',
                        'type' => 'Genius',
                        'address' => null,
                        'kantor_name' => 'LAMONGAN',
                    ],
                ],
                'students' => [
                    [
                        'id' => 757,
                        'student_id' => 757,
                        'name' => 'PUTRI AZZUMA APRILIA',
                        'nickname' => null,
                        'nik' => '3524235304170003',
                        'nis' => null,
                        'gender' => 'P',
                        'birth_place' => null,
                        'birth_date' => '2017-04-13',
                        'school_name' => 'SDN JOTOSANUR 2',
                        'school_level' => 'SD',
                        'class' => 'II',
                        'status' => true,
                        'address' => 'RT 02 RW 05, DUSUN JOTO',
                        'guardian_name' => 'SUGENG',
                        'guardian_phone' => '628120000000',
                        'kantor_name' => 'LAMONGAN',
                        'type' => 'NON-YATIM',
                        'teacher_id' => 248,
                    ],
                    [
                        'id' => 758,
                        'student_id' => 758,
                        'name' => 'SALMA MUFIDAH RAMADHANI',
                        'nickname' => null,
                        'nik' => '3524234407150001',
                        'nis' => null,
                        'gender' => 'P',
                        'birth_place' => null,
                        'birth_date' => '2015-07-04',
                        'school_name' => 'SDN TAKERAN KLANTING',
                        'school_level' => 'SD',
                        'class' => 'V',
                        'status' => true,
                        'address' => 'DUSUN BANJARKEPUH RT 01 RW 06',
                        'guardian_name' => 'SRIYATIN',
                        'guardian_phone' => '6285850274947',
                        'kantor_name' => 'LAMONGAN',
                        'type' => 'YATIM',
                        'teacher_id' => 248,
                    ],
                ],
                'total_students' => 2,
            ],
        ], 200),
    ]);

    $service = new PenyaluranService;
    $students = $service->students('test-token-me');
    $sanggars = $service->sanggars('test-token-me');

    expect(count($students))->toBe(2)
        ->and($students[0]['student_id'])->toBe(757)
        ->and($students[0]['name'])->toBe('PUTRI AZZUMA APRILIA')
        ->and($students[0]['gender'])->toBe('female')
        ->and($students[0]['school_level'])->toBe('SD')
        ->and($students[0]['class'])->toBe('II')
        ->and($students[0]['sanggar_id'])->toBe(316)
        ->and($students[0]['sanggar_name'])->toBe('SANGGAR GENIUS JOTOSANUR')
        ->and($students[0]['kantor_name'])->toBe('LAMONGAN')
        ->and($students[1]['student_id'])->toBe(758)
        ->and($students[1]['gender'])->toBe('female')
        ->and(count($sanggars))->toBe(1)
        ->and($sanggars[0]['id'])->toBe(316);
});

it('fetches and normalizes student list from legacy penyaluran students endpoint', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/students?sanggar_id=12' => Http::response([
            'success' => true,
            'data' => [
                [
                    'id' => 101,
                    'name' => 'Muhammad Ali',
                    'nik' => '3578010101010001',
                    'gender' => 'L',
                    'school_name' => 'SD Negeri 1',
                    'level' => 'SD',
                    'class' => '4',
                    'birth_date' => '2014-01-01',
                    'guardian_phone' => '081234567800',
                ],
                [
                    'id' => 102,
                    'name' => 'Aisyah Putri',
                    'nik' => '3578010101010002',
                    'gender' => 'P',
                    'school_name' => 'SD Negeri 2',
                    'level' => 'SD',
                    'class' => '5',
                    'birth_date' => '2013-05-12',
                    'guardian_phone' => '081234567801',
                ],
            ],
        ], 200),
    ]);

    $service = new PenyaluranService;
    $students = $service->students('test-token', 12);

    expect(count($students))->toBe(2)
        ->and($students[0]['student_id'])->toBe(101)
        ->and($students[0]['name'])->toBe('Muhammad Ali')
        ->and($students[0]['gender'])->toBe('male')
        ->and($students[0]['school_level'])->toBe('SD')
        ->and($students[1]['student_id'])->toBe(102)
        ->and($students[1]['gender'])->toBe('female');
});

it('fetches sanggars list', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/sanggars' => Http::response([
            'success' => true,
            'data' => [
                ['id' => 1, 'name' => 'Sanggar Al-Falah', 'type' => 'Genius'],
                ['id' => 2, 'name' => 'Sanggar Al-Ikhlas', 'type' => 'Al-Quran'],
            ],
        ], 200),
    ]);

    $service = new PenyaluranService;
    $sanggars = $service->sanggars('test-token');

    expect(count($sanggars))->toBe(2)
        ->and($sanggars[0]['name'])->toBe('Sanggar Al-Falah');
});

it('formats student payload according to penyaluran contract', function () {
    $service = new PenyaluranService;

    $input = [
        'full_name' => 'Budi Santoso',
        'nik' => '3578010101010003',
        'gender' => 'male',
        'grade' => '6',
        'parent_phone' => '081234567899',
        'birth_date' => '2012-07-20 00:00:00',
        'is_active' => true,
    ];

    $formatted = $service->formatStudentPayload($input);

    expect($formatted['name'])->toBe('Budi Santoso')
        ->and($formatted['nik'])->toBe('3578010101010003')
        ->and($formatted['gender'])->toBe('L')
        ->and($formatted['class'])->toBe('6')
        ->and($formatted['guardian_phone'])->toBe('081234567899')
        ->and($formatted['phone'])->toBe('081234567899')
        ->and($formatted['birth_date'])->toBe('2012-07-20')
        ->and($formatted['status'])->toBeTrue();
});

it('resolves region names from penyaluran me payload into local region ids', function () {
    DB::table('provinces')->insertOrIgnore(['id' => '35', 'name' => 'JAWA TIMUR', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('regencies')->insertOrIgnore(['id' => '3507', 'province_id' => '35', 'name' => 'KABUPATEN MALANG', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('districts')->insertOrIgnore(['id' => '3507170', 'regency_id' => '3507', 'name' => 'SUMBER PUCUNG', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('villages')->insertOrIgnore(['id' => '3507170001', 'district_id' => '3507170', 'name' => 'KARANGKATES', 'created_at' => now(), 'updated_at' => now()]);

    $profile = [
        'province_name' => 'JAWA TIMUR',
        'regency_name' => 'KABUPATEN MALANG',
        'district_name' => 'SUMBER PUCUNG',
        'village_name' => 'KARANGKATES',
    ];

    $regions = BiodataController::resolveRegionIds($profile);

    expect($regions['province_id'])->toBe('35')
        ->and($regions['regency_id'])->toBe('3507')
        ->and($regions['district_id'])->toBe('3507170')
        ->and($regions['village_id'])->toBe('3507170001');
});

it('extracts teacher biodata from penyaluran profile and calculates completeness accurately', function () {
    $user = User::factory()->create([
        'name' => 'Guru Test',
        'email' => 'gurutest@gmail.com',
        'phone' => '081234567890',
    ]);

    $profile = [
        'name' => 'Guru Test Lengkap',
        'email' => 'gurutest@gmail.com',
        'hp' => '081234567890',
        'nik' => '3578010101010001',
        'jenis_kelamin' => 'L',
        'tempat_lahir' => 'Surabaya',
        'tanggal_lahir' => '1990-01-01',
        'alamat' => 'Jl. Dharmahusada No. 10',
        'provinsi_id' => '35',
        'kabupaten_id' => '3507',
        'kecamatan_id' => '3507170',
        'desa_id' => '3507170001',
    ];

    $biodata = BiodataController::extractTeacherBiodata($profile, $user);
    $completeness = BiodataController::completeness($biodata);

    expect($biodata['name'])->toBe('Guru Test Lengkap')
        ->and($biodata['gender'])->toBe('male')
        ->and($biodata['nik'])->toBe('3578010101010001')
        ->and($completeness['percent'])->toBe(100)
        ->and($completeness['is_complete'])->toBeTrue()
        ->and($completeness['missing'])->toBeEmpty();
});
