<?php

use App\Models\Company\EventCommittee;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->seed(UserRolePermissionSeeder::class);
});

test('administrator can create committee member with auto-generated CREW code, branch, and optional photo', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.committees.store'), [
        'name' => 'Dr. H. Ahmad Dahlan, M.Pd.',
        'branch' => 'Pusat 1',
        'nik' => '3578012345670001',
        'gender' => 'male',
        'shirt_size' => 'XL',
        'phone' => '081234567890',
        'email' => 'ahmad.dahlan@omatiq.org',
        'division' => 'Dewan Juri Nasional',
        'position' => 'Ketua Dewan Juri Matematika',
        'access_zone' => 'All Access',
        'status' => 'active',
        'notes' => 'Koordinator juri final matematika',
        'photo' => UploadedFile::fake()->image('juri.jpg', 400, 500),
    ]);

    $response->assertRedirect(route('admin.companies.committees.index'));
    $response->assertSessionHas('success');

    $committee = EventCommittee::first();
    expect($committee)->not->toBeNull()
        ->and($committee->code)->toBe('CREW-00001')
        ->and($committee->name)->toBe('Dr. H. Ahmad Dahlan, M.Pd.')
        ->and($committee->branch)->toBe('Pusat 1')
        ->and($committee->division)->toBe('Dewan Juri Nasional')
        ->and($committee->shirt_size)->toBe('XL')
        ->and($committee->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($committee->photo_path);
});

test('administrator can update committee and toggle status', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Fauzi Rahman',
        'gender' => 'male',
        'division' => 'Acara & Lomba',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.committees.status', $committee), [
        'status' => 'inactive',
    ]);

    $response->assertSessionHas('success');
    expect($committee->fresh()->status)->toBe('inactive');
});

test('bulk check-in updates checked_in_at for selected committees (Plan C)', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $c1 = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Crew Satu',
        'division' => 'Acara',
        'gender' => 'male',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $c2 = EventCommittee::create([
        'code' => 'CREW-00002',
        'created_by' => $admin->id,
        'name' => 'Crew Dua',
        'division' => 'Logistik',
        'gender' => 'female',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->postJson(route('admin.companies.committees.bulk-check-in'), [
        'ids' => [$c1->id, $c2->id],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'count' => 2,
        ]);

    expect($c1->fresh()->checked_in_at)->not->toBeNull()
        ->and($c2->fresh()->checked_in_at)->not->toBeNull();
});

test('print card renders committee badge pass', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Siti Aminah',
        'division' => 'Konsumsi',
        'position' => 'Koordinator Konsumsi',
        'access_zone' => 'All Access',
        'gender' => 'female',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.committees.card', $committee));
    $response->assertOk()
        ->assertViewIs('cards.committee-card')
        ->assertSee('CREW-00001')
        ->assertSee('Siti Aminah')
        ->assertSee('KONSUMSI');
});

test('administrator can download template CSV matching Google Sheet headers', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('admin.companies.committees.template'));
    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = $response->streamedContent();
    expect($content)->toContain('Timestamp')
        ->and($content)->toContain('Nama Lengkap')
        ->and($content)->toContain('Kantor Cabang')
        ->and($content)->toContain('NIK')
        ->and($content)->toContain('Ukuran Kaos');
});

test('administrator can import committees from CSV matching Google Sheet format and updates duplicates', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    // CSV with exact Google Sheet headers and rows from user screenshot
    $csvContent = implode("\n", [
        'Timestamp,Nama Lengkap,Kantor Cabang,NIK,Ukuran Kaos',
        '03/11/2026 14:01:45,GRACE PUTRI ARIA,Pusat 1,3515144704950001,XXL',
        '03/11/2026 14:02:21,DAVID MAULANA SUWASGITA,Regional,3513052805020001,XXL',
        '03/11/2026 14:05:17,Anjar Susilo,Pusat 1,3504052204030001,M',
        '03/11/2026 14:05:37,TEDDY ROHMAT SETIAPERMANA,Regional,3211261902880004,XL',
    ]);

    $file = UploadedFile::fake()->createWithContent('panitia_gsheet.csv', $csvContent);

    $response = $this->actingAs($admin)->postJson(route('admin.companies.committees.import'), [
        'file' => $file,
        'default_division' => 'Panitia Pelaksana Babak Final',
        'update_existing' => true,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'result' => [
                'total' => 4,
                'imported' => 4,
                'updated' => 0,
                'skipped' => 0,
            ],
        ]);

    expect(EventCommittee::count())->toBe(4);

    $grace = EventCommittee::where('nik', '3515144704950001')->first();
    expect($grace)->not->toBeNull()
        ->and($grace->name)->toBe('GRACE PUTRI ARIA')
        ->and($grace->branch)->toBe('Pusat 1')
        ->and($grace->shirt_size)->toBe('XXL')
        ->and($grace->division)->toBe('Panitia Pelaksana Babak Final');

    $david = EventCommittee::where('nik', '3513052805020001')->first();
    expect($david)->not->toBeNull()
        ->and($david->branch)->toBe('Regional')
        ->and($david->shirt_size)->toBe('XXL');

    // Re-import with an update (Grace changes size to XL, and a new member is added)
    $csvUpdate = implode("\n", [
        'Timestamp,Nama Lengkap,Kantor Cabang,NIK,Ukuran Kaos',
        '03/11/2026 14:01:45,GRACE PUTRI ARIA,Pusat 1 (Updated),3515144704950001,XL',
        '03/11/2026 14:15:00,Rina Marlina,Surabaya,3578019908990001,S',
    ]);

    $file2 = UploadedFile::fake()->createWithContent('panitia_gsheet_v2.csv', $csvUpdate);

    $response2 = $this->actingAs($admin)->postJson(route('admin.companies.committees.import'), [
        'file' => $file2,
        'update_existing' => true,
    ]);

    $response2->assertOk()
        ->assertJson([
            'success' => true,
            'result' => [
                'total' => 2,
                'imported' => 1,
                'updated' => 1,
                'skipped' => 0,
            ],
        ]);

    // Total committees should now be 5 (4 original + 1 new)
    expect(EventCommittee::count())->toBe(5);

    // Grace should be updated without creating a duplicate row
    $graceUpdated = EventCommittee::where('nik', '3515144704950001')->first();
    expect($graceUpdated->branch)->toBe('Pusat 1 (Updated)')
        ->and($graceUpdated->shirt_size)->toBe('XL');
});
