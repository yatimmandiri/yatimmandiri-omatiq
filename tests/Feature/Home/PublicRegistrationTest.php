<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Participant', 'guard_name' => 'web']);

    $settings = app(SiteSettings::class);
    $settings->registration_public_open = true;
    $settings->save();

    Cache::put('branch_offices', [
        ['id' => 1, 'name' => 'SURABAYA PUSAT'],
    ], 3600);

    DB::table('provinces')->insert(['id' => '35', 'name' => 'JAWA TIMUR', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('regencies')->insert(['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('districts')->insert(['id' => '3578010', 'regency_id' => '3578', 'name' => 'GUBENG', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('villages')->insert(['id' => '3578010001', 'district_id' => '3578010', 'name' => 'AIRLANGGA', 'created_at' => now(), 'updated_at' => now()]);
});

function validRegistrationPayload(int $olimpiadeId, array $overrides = []): array
{
    return [
        'nik' => '3578011111110001',
        'olimpiade_id' => $olimpiadeId,
        'full_name' => 'Bintang Pratama',
        'nickname' => 'Bintang',
        'gender' => 'male',
        'birth_place' => 'Surabaya',
        'birth_date' => '2014-06-15',
        'school_name' => 'SD Negeri 1 Gubeng',
        'grade' => 'IV',
        'address' => 'Jl. Dharmawangsa No. 10',
        'province_id' => '35',
        'regency_id' => '3578',
        'district_id' => '3578010',
        'village_id' => '3578010001',
        'parent_phone' => '081234567890',
        'referral_source' => 'Website',
        'branch' => 'SURABAYA PUSAT',
        'payment_proof' => UploadedFile::fake()->image('bukti.jpg'),
        'student_card' => UploadedFile::fake()->image('kartu.jpg'),
        'data_truth_consent' => true,
        'documentation_consent' => true,
        'rules_consent' => true,
        'participant_signature_name' => 'Bintang Pratama',
        'guardian_signature_name' => 'Bapak Bintang',
        'email' => 'bintang@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        ...$overrides,
    ];
}

test('registration page can be rendered when registration is open', function () {
    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
        'status' => true,
    ]);

    $response = $this->get(route('home.registration.create'));
    $response->assertOk();
});

test('registration page shows closed status when registration_public_open is false', function () {
    $settings = app(SiteSettings::class);
    $settings->registration_public_open = false;
    $settings->save();

    $response = $this->get(route('home.registration.create'));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home/registration/index')
            ->where('registration_closed', true)
        );
});

test('submitting registration is blocked when registration_public_open is false', function () {
    $settings = app(SiteSettings::class);
    $settings->registration_public_open = false;
    $settings->save();

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA',
        'category' => 'IPA',
        'status' => true,
    ]);

    $response = $this->post(route('home.registration.store'), validRegistrationPayload($olimpiade->id));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(Participant::count())->toBe(0);
});

test('new public participant can successfully register with uploaded files', function () {
    Storage::fake('public');

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'status' => true,
        'event_year' => 2026,
    ]);

    $payload = validRegistrationPayload($olimpiade->id);

    $response = $this->post(route('home.registration.store'), $payload);

    $participant = Participant::first();
    expect($participant)->not->toBeNull()
        ->and($participant->registration_type)->toBe('public')
        ->and($participant->status)->toBe('submitted')
        ->and($participant->payment_status)->toBe('waiting_confirmation')
        ->and($participant->registration_number)->toStartWith('OMQ-')
        ->and($participant->event_year)->toBe(2026);

    $response->assertRedirect(route('home.registration.success', $participant->registration_number));

    $user = User::where('email', 'bintang@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('Participant'))->toBeTrue()
        ->and($user->hasVerifiedEmail())->toBeTrue();

    $student = Student::where('nik', '3578011111110001')->first();
    expect($student)->not->toBeNull()
        ->and($student->full_name)->toBe('Bintang Pratama')
        ->and($student->is_binaan)->toBeFalse();
});

test('prevents duplicate registration for the same NIK in the same event year', function () {
    Storage::fake('public');

    $olimpiade1 = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'status' => true,
        'event_year' => 2026,
    ]);

    $olimpiade2 = Olimpiade::create([
        'name' => 'Olimpiade IPA 2026',
        'category' => 'IPA',
        'status' => true,
        'event_year' => 2026,
    ]);

    $this->post(route('home.registration.store'), validRegistrationPayload($olimpiade1->id, ['email' => 'peserta1@example.com']));

    expect(Participant::count())->toBe(1);

    // Second registration with same NIK in same year should fail
    $response = $this->post(route('home.registration.store'), validRegistrationPayload($olimpiade2->id, ['email' => 'peserta2@example.com']));

    $response->assertSessionHasErrors(['nik']);
    expect(Participant::count())->toBe(1);
});

test('allows registration for the same NIK in a different event year', function () {
    Storage::fake('public');

    $olimpiade2026 = Olimpiade::create([
        'name' => 'Olimpiade 2026',
        'category' => 'Matematika',
        'status' => true,
        'event_year' => 2026,
    ]);

    $olimpiade2027 = Olimpiade::create([
        'name' => 'Olimpiade 2027',
        'category' => 'Matematika',
        'status' => true,
        'event_year' => 2027,
    ]);

    $this->post(route('home.registration.store'), validRegistrationPayload($olimpiade2026->id, ['email' => 'user2026@example.com']));
    expect(Participant::count())->toBe(1);

    // Different year (2027) with different email
    $response = $this->post(route('home.registration.store'), validRegistrationPayload($olimpiade2027->id, ['email' => 'user2027@example.com']));

    $response->assertSessionHasNoErrors();
    expect(Participant::count())->toBe(2);
});

test('validates required fields on public registration', function () {
    $response = $this->post(route('home.registration.store'), []);

    $response->assertSessionHasErrors([
        'nik', 'olimpiade_id', 'full_name', 'gender', 'birth_date',
        'school_name', 'grade', 'address', 'province_id', 'regency_id',
        'parent_phone', 'email', 'password',
    ]);
});
