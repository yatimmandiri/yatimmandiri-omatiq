<?php

use App\Models\Company\NationalChaperone;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Http::fake([
        '*/api/v1/*' => Http::response(['success' => true, 'data' => []], 200),
    ]);
    $this->seed(UserRolePermissionSeeder::class);
});

test('cabang user can access chaperone index and create a chaperone for their branch', function () {
    $cabangUser = User::factory()->create([
        'name' => 'Kantor Cabang Surabaya',
        'branch' => 'SURABAYA',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Santri Finalis Surabaya']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'SURABAYA',
        'status' => 'verified',
    ]);

    // 1. Visit index
    $response = $this->actingAs($cabangUser)->get(route('admin.companies.chaperones.index'));
    $response->assertOk();

    // 2. Store chaperone
    $response = $this->actingAs($cabangUser)->post(route('admin.companies.chaperones.store'), [
        'source_type' => 'karyawan',
        'name' => 'Bambang Sudarsono, S.T.',
        'nik' => '3515081234560001',
        'gender' => 'male',
        'phone' => '081234567890',
        'email' => 'bambang@surabaya.local',
        'position' => 'Staf Program Cabang Surabaya',
        'participant_ids' => [$participant->id],
    ]);

    $response->assertRedirect(route('admin.companies.chaperones.index'));
    $response->assertSessionHas('success');

    $chaperone = NationalChaperone::first();
    expect($chaperone)->not->toBeNull()
        ->and($chaperone->name)->toBe('Bambang Sudarsono, S.T.')
        ->and($chaperone->branch)->toBe('SURABAYA')
        ->and($chaperone->status)->toBe('submitted')
        ->and($chaperone->participants)->toHaveCount(1)
        ->and($chaperone->participants->first()->id)->toBe($participant->id);
});

test('admin pusat can verify and approve or reject a chaperone with notes', function () {
    $adminUser = User::factory()->create([
        'name' => 'Admin Pusat OMATIQ',
        'email_verified_at' => now(),
    ]);
    $adminUser->assignRole('Administrators');

    $cabangUser = User::factory()->create([
        'name' => 'Cabang Malang',
        'branch' => 'MALANG',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $chaperone = NationalChaperone::create([
        'created_by' => $cabangUser->id,
        'branch' => 'MALANG',
        'source_type' => 'karyawan',
        'name' => 'Ahmad Syarif',
        'nik' => '3507011234560002',
        'gender' => 'male',
        'phone' => '081398765432',
        'status' => 'submitted',
    ]);

    // 1. Admin verifies and approves
    $response = $this->actingAs($adminUser)->put(route('admin.companies.chaperones.verify', $chaperone->id), [
        'status' => 'verified',
        'notes' => 'Disetujui sebagai official pendamping cabang Malang.',
    ]);

    $response->assertSessionHas('success');
    $chaperone->refresh();
    expect($chaperone->status)->toBe('verified')
        ->and($chaperone->verified_by)->toBe($adminUser->id)
        ->and($chaperone->notes)->toBe('Disetujui sebagai official pendamping cabang Malang.');

    // 2. Admin rejects with notes
    $response = $this->actingAs($adminUser)->put(route('admin.companies.chaperones.verify', $chaperone->id), [
        'status' => 'rejected',
        'notes' => 'Kuota pendamping cabang telah penuh.',
    ]);

    $response->assertSessionHas('success');
    $chaperone->refresh();
    expect($chaperone->status)->toBe('rejected')
        ->and($chaperone->notes)->toBe('Kuota pendamping cabang telah penuh.');
});

test('lanyard pass card is printable for verified chaperone', function () {
    $adminUser = User::factory()->create(['email_verified_at' => now()]);
    $adminUser->assignRole('Administrators');

    $chaperone = NationalChaperone::create([
        'created_by' => $adminUser->id,
        'branch' => 'JAKARTA',
        'source_type' => 'karyawan',
        'name' => 'Nur Hidayah',
        'nik' => '3171011234560003',
        'gender' => 'female',
        'phone' => '082112345678',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($adminUser)->get(route('admin.companies.chaperones.card', $chaperone->id));
    $response->assertOk();
    $response->assertSee('OFFICIAL PENDAMPING');
    $response->assertSee('Nur Hidayah');
    $response->assertSee('JAKARTA');
});

test('unverified chaperone card cannot be printed by non-admin', function () {
    $cabangUser = User::factory()->create([
        'name' => 'Cabang Sidoarjo',
        'branch' => 'SIDOARJO',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $chaperone = NationalChaperone::create([
        'created_by' => $cabangUser->id,
        'branch' => 'SIDOARJO',
        'source_type' => 'karyawan',
        'name' => 'Imron Rosyadi',
        'nik' => '3515011234560004',
        'gender' => 'male',
        'phone' => '085712345678',
        'status' => 'submitted',
    ]);

    // Cabang attempts to print pass while status is still submitted -> 403
    $response = $this->actingAs($cabangUser)->get(route('admin.companies.chaperones.card', $chaperone->id));
    $response->assertStatus(403);
});

test('public chaperone verification page displays verified status and escorted participants', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['name' => 'Olimpiade Matematika', 'category' => 'Level 1', 'event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Ahmad Santri Teladan']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'SURABAYA',
        'status' => 'verified',
    ]);

    $chaperone = NationalChaperone::create([
        'created_by' => $admin->id,
        'branch' => 'SURABAYA',
        'source_type' => 'guru',
        'name' => 'Ustadz Abdullah, S.Pd.I.',
        'nik' => '3578011234560005',
        'gender' => 'male',
        'phone' => '081234567899',
        'position' => 'Guru Pembimbing Cabang',
        'status' => 'verified',
        'verified_by' => $admin->id,
        'verified_at' => now(),
    ]);

    $chaperone->participants()->attach($participant->id);

    $formattedId = 'OFF-'.str_pad((string) $chaperone->id, 5, '0', STR_PAD_LEFT);

    // 1. Visit public verification by formatted ID
    $response = $this->get(route('home.chaperone.verify', $formattedId));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('home/chaperone/verify')
        ->where('isValid', true)
        ->where('chaperone.name', 'Ustadz Abdullah, S.Pd.I.')
        ->where('chaperone.branch', 'SURABAYA')
        ->where('chaperone.status', 'verified')
        ->where('chaperone.participants_count', 1)
        ->has('chaperone.participants', 1)
    );

    // 2. Directing from generic verify endpoint with OFF- code redirects smoothly
    $redirectResponse = $this->get('/verifikasi/'.$formattedId);
    $redirectResponse->assertRedirect(route('home.chaperone.verify', ['code' => $formattedId]));
});

test('admin chaperone data api can search and find chaperone by scanned barcode id', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $chaperone = NationalChaperone::create([
        'created_by' => $admin->id,
        'branch' => 'SURABAYA',
        'source_type' => 'karyawan',
        'name' => 'Target Scanned Chaperone',
        'nik' => '3578019999990001',
        'gender' => 'male',
        'phone' => '081999999999',
        'status' => 'verified',
    ]);

    $formattedId = 'OFF-'.str_pad((string) $chaperone->id, 5, '0', STR_PAD_LEFT);

    $response = $this->actingAs($admin)->getJson(route('admin.companies.chaperones.data', [
        'globalSearch' => $formattedId,
    ]));

    $response->assertOk();
    $response->assertJsonPath('total', 1);
    $response->assertJsonPath('data.0.name', 'Target Scanned Chaperone');
});

test('teacher detail endpoint returns autofill data with clean NIK', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $mockPenyaluran = Mockery::mock(PenyaluranService::class);
    $mockPenyaluran->shouldReceive('teacher')
        ->with(999, true)
        ->andReturn([
            'id' => 999,
            'name' => 'Guru Penyaluran Ber-NIK',
            'no_ktp' => '3578012345670001',
            'phone' => '081234567899',
            'gender' => 'L',
            'email' => 'guru999@penyaluran.org',
            'alamat' => 'Jl. Kebon Agung No. 10',
            'kantor_name' => 'SURABAYA',
        ]);
    app()->instance(PenyaluranService::class, $mockPenyaluran);

    $response = $this->actingAs($admin)->getJson(route('admin.companies.chaperones.teacher-detail', 999));
    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.name', 'Guru Penyaluran Ber-NIK');
    $response->assertJsonPath('data.nik', '3578012345670001');
    $response->assertJsonPath('data.gender', 'male');
});

test('teacher detail endpoint does not collide when user id matches another teachers penyaluran id', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    // Teacher A: User id 582, penyaluran_id 500 (Rosiana)
    $teacherA = User::factory()->create([
        'id' => 582,
        'name' => 'ROSIANA SURYA NINGSIH',
        'branch' => 'SOLO',
        'penyaluran_id' => 500,
        'penyaluran_token' => 'token_rosiana',
    ]);
    $teacherA->assignRole('Teacher');

    // Teacher B: User id 643, penyaluran_id 582 (Heny)
    $teacherB = User::factory()->create([
        'id' => 643,
        'name' => 'HENY APRIYATI',
        'branch' => 'JAKARTA TIMUR',
        'penyaluran_id' => 582,
        'penyaluran_token' => 'token_heny',
    ]);
    $teacherB->assignRole('Teacher');

    $mockPenyaluran = Mockery::mock(PenyaluranService::class);
    $mockPenyaluran->shouldReceive('teacherByToken')
        ->with('token_heny')
        ->andReturn([
            'id' => 582,
            'name' => 'HENY APRIYATI',
            'nik' => '3173076204810005',
            'gender' => 'P',
            'phone' => '081284500366',
            'alamat' => 'JL.H.NASIR NO.31D',
            'kantor_name' => 'JAKARTA TIMUR',
        ]);
    $mockPenyaluran->shouldReceive('teacherByToken')
        ->with('token_rosiana')
        ->andReturn([
            'id' => 500,
            'name' => 'ROSIANA SURYA NINGSIH',
            'nik' => '3372019999990001',
            'gender' => 'P',
            'phone' => '081999888777',
            'alamat' => 'SOLO KOTA',
            'kantor_name' => 'SOLO',
        ]);
    app()->instance(PenyaluranService::class, $mockPenyaluran);

    // 1. Fetching for Heny using her local ID (643) MUST return Heny, NOT Rosiana (582)
    $responseB = $this->actingAs($admin)->getJson(route('admin.companies.chaperones.teacher-detail', 643));
    $responseB->assertOk();
    $responseB->assertJsonPath('success', true);
    $responseB->assertJsonPath('data.name', 'HENY APRIYATI');
    $responseB->assertJsonPath('data.nik', '3173076204810005');
    $responseB->assertJsonPath('data.gender', 'female');
    $responseB->assertJsonPath('data.penyaluran_teacher_id', 582);

    // 2. Fetching for Rosiana using her local ID (582) MUST return Rosiana
    $responseA = $this->actingAs($admin)->getJson(route('admin.companies.chaperones.teacher-detail', 582));
    $responseA->assertOk();
    $responseA->assertJsonPath('success', true);
    $responseA->assertJsonPath('data.name', 'ROSIANA SURYA NINGSIH');
    $responseA->assertJsonPath('data.nik', '3372019999990001');
    $responseA->assertJsonPath('data.gender', 'female');
    $responseA->assertJsonPath('data.penyaluran_teacher_id', 500);
});
