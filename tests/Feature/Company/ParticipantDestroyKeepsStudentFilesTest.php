<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function createDestroyParticipantTeacher(): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    Permission::firstOrCreate(['name' => 'delete-participant']);

    $role->givePermissionTo('delete-participant');

    $teacher = User::factory()->create();
    $teacher->assignRole($role);

    return $teacher;
}

it('keeps student media files when a participant is deleted', function () {
    Storage::fake('public');

    $teacher = createDestroyParticipantTeacher();

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $student = Student::create([
        'nik' => '3525011505120002',
        'full_name' => 'Siti Aminah',
        'gender' => 'female',
        'birth_place' => 'Surabaya',
        'birth_date' => '2012-05-15',

        'school_name' => 'SMP Negeri 2 Surabaya',
        'grade' => '8',
        'address' => 'Jl. Raya Darmo No. 12',
        'parent_phone' => '081234567890',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
        'photo_path' => 'uploads/students/photo/photo.jpg',
        'identity_card_path' => 'uploads/students/identity_card/ktp.jpg',
        'family_card_path' => 'uploads/students/family_card/kk.jpg',
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0002',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'payment_proof_path' => 'uploads/participants/payment_proof/bukti.jpg',
    ]);

    foreach ([
        'uploads/students/photo/photo.jpg',
        'uploads/students/identity_card/ktp.jpg',
        'uploads/students/family_card/kk.jpg',
        'uploads/participants/payment_proof/bukti.jpg',
    ] as $file) {
        Storage::disk('public')->put($file, 'fake-contents');
    }

    $this->actingAs($teacher)
        ->delete(route('admin.companies.participants.destroy', $participant))
        ->assertRedirect(route('admin.companies.participants.index'));

    expect(Student::find($student->id))->not->toBeNull();
    expect(Participant::find($participant->id))->toBeNull();

    expect(Storage::disk('public')->exists('uploads/students/photo/photo.jpg'))->toBeTrue();
    expect(Storage::disk('public')->exists('uploads/students/identity_card/ktp.jpg'))->toBeTrue();
    expect(Storage::disk('public')->exists('uploads/students/family_card/kk.jpg'))->toBeTrue();

    expect(Storage::disk('public')->exists('uploads/participants/payment_proof/bukti.jpg'))->toBeFalse();
});
