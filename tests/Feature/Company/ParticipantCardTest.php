<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\BarcodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Participant', 'guard_name' => 'web']);

    $this->olimpiade = Olimpiade::factory()->create([
        'name' => 'Matematika Level 1',
        'category' => 'SD 1-2',
        'event_year' => 2026,
        'status' => true,
    ]);

    $this->student = Student::factory()->create([
        'full_name' => 'Ahmad Fauzi',
        'nik' => '3578010101010001',
        'nis' => '12345',
        'school_name' => 'SD Al-Hikmah',
        'birth_date' => '2015-01-01',
        'school_level' => 'SD',
        'grade' => '3',
    ]);
});

test('public cannot view card if status is submitted or rejected', function () {
    $submitted = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-TEST02',
        'status' => 'submitted',
    ]);

    $response = $this->get(route('home.registration.card', $submitted->registration_number));
    $response->assertForbidden();

    $rejected = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-TEST03',
        'status' => 'rejected',
    ]);

    $response2 = $this->get(route('home.registration.card', $rejected->registration_number));
    $response2->assertForbidden();
});

test('admin can access participant card via admin route', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $participant = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-ADMIN01',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.participants.card', $participant->id));

    $response->assertOk()
        ->assertSee('REG-2026-ADMIN01');
});

test('teacher can view participant card for own student', function () {
    $teacher = User::factory()->create([
        'email_verified_at' => now(),
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $participant = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'mentor_id' => $teacher->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-TEACHER01',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($teacher)->get(route('teacher.data-peserta.card', $participant->id));

    $response->assertOk()
        ->assertSee('REG-2026-TEACHER01');
});

test('teacher cannot view participant card of other teachers student without permission', function () {
    $teacher1 = User::factory()->create([
        'email_verified_at' => now(),
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher1->assignRole('Teacher');

    $otherTeacher = User::factory()->create([
        'email_verified_at' => now(),
        'teacher_profile_completed_at' => now(),
    ]);
    $otherTeacher->assignRole('Teacher');

    $participant = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'mentor_id' => $otherTeacher->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-OTHER01',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($teacher1)->get(route('teacher.data-peserta.card', $participant->id));

    $response->assertForbidden();
});

test('participant card can be downloaded as PDF', function () {
    $participant = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'event_year' => 2026,
        'registration_number' => 'REG-2026-PDF01',
        'status' => 'verified',
    ]);

    $response = $this->get(route('home.registration.card', [
        'registrationNumber' => $participant->registration_number,
        'format' => 'pdf',
    ]));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

test('barcode service generates valid vector svg', function () {
    $barcodeService = app(BarcodeService::class);

    $code128 = $barcodeService->generateCode128Svg('REG-2026-0001');
    expect($code128)->toContain('<svg')
        ->and($code128)->toContain('</svg>')
        ->and($code128)->toContain('<rect');

    $qr = $barcodeService->generateQrCodeSvg('https://example.com/kartu/REG-2026-0001');
    expect($qr)->toContain('<svg')
        ->and($qr)->toContain('</svg>')
        ->and($qr)->toContain('<rect');
});
