<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createStudentCreateTeacher(): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    foreach (['view-participant', 'create-participant'] as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $role->givePermissionTo(['view-participant', 'create-participant']);

    $teacher = User::factory()->create();
    $teacher->assignRole($role);

    return $teacher;
}

function openStudentCreateRegistration(): void
{
    $settings = app(SiteSettings::class);
    $settings->registration_binaan_open = true;
    $settings->save();
}

function createStudentCreateRegion(string $id, string $provinceId, string $name): object
{
    $province = new Province;
    $province->id = $provinceId;
    $province->name = 'Jawa Timur';
    $province->save();

    $regency = new Regency;
    $regency->id = $id;
    $regency->province_id = $provinceId;
    $regency->name = $name;
    $regency->save();

    return (object) ['province' => $province, 'regency' => $regency];
}

it('provides regencies with province_id on the student create page', function () {
    openStudentCreateRegistration();
    $teacher = createStudentCreateTeacher();

    $region = createStudentCreateRegion('3578', '35', 'Kota Surabaya');

    $this->actingAs($teacher)
        ->get(route('admin.teacher.students.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
            ->has('provinces', 1)
            ->has('regencies', 1)
            ->where('regencies.0.id', 3578)
            ->where('regencies.0.province_id', '35')
            ->where('regencies.0.name', 'Kota Surabaya')
        );
});

it('lets a teacher create a student and participant without education_level', function () {
    Storage::fake('public');

    openStudentCreateRegistration();
    $teacher = createStudentCreateTeacher();

    createStudentCreateRegion('3578', '35', 'Kota Surabaya');

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), [
            'nik' => '3525011505120002',
            'olimpiade_id' => $olimpiade->id,
            'full_name' => 'Siti Aminah',
            'nickname' => 'Siti',
            'gender' => 'female',
            'birth_place' => 'Surabaya',
            'birth_date' => '2012-05-15',
            'age' => 14,
            'school_name' => 'SMP Negeri 2 Surabaya',
            'grade' => '8',
            'address' => 'Jl. Raya Darmo No. 12',
            'province_id' => '35',
            'regency_id' => '3578',
            'parent_phone' => '081234567890',
            'photo' => UploadedFile::fake()->image('photo.jpg'),
            'identity_card' => UploadedFile::fake()->image('ktp.jpg'),
            'family_card' => UploadedFile::fake()->image('kk.jpg'),
        ])
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    expect(Participant::count())->toBe(1);
    expect(Student::count())->toBe(1);

    $student = Student::first();

    expect($student->full_name)->toBe('Siti Aminah')
        ->and($student->mentor_id)->toBe($teacher->id)
        ->and($student->is_binaan)->toBeTrue()
        ->and($student->getAttributes())->not->toHaveKey('education_level');
});
