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

test('administrator and public can render virtual 3D committee pass card', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Alfia Rahma',
        'branch' => 'Pusat 1',
        'division' => 'Panitia Pelaksana',
        'position' => 'Koordinator Acara',
        'gender' => 'female',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    // Admin view
    $adminResponse = $this->actingAs($admin)->get(route('admin.companies.committees.card', $committee));
    $adminResponse->assertOk()
        ->assertSee('Kartu-Panitia-OMATIQ-CREW-00001-Alfia Rahma')
        ->assertSee('Alfia Rahma')
        ->assertSee('Koordinator Acara')
        ->assertSee('CREW-00001')
        ->assertSee('Kartu Virtual 3D')
        ->assertSee('Lembar Cetak A4');

    // Public view by code
    $publicResponse = $this->get(route('home.committee.card', ['identifier' => 'CREW-00001']));
    $publicResponse->assertOk()
        ->assertSee('Alfia Rahma')
        ->assertSee('CREW-00001');

    // PDF format stream
    $pdfResponse = $this->actingAs($admin)->get(route('admin.companies.committees.card', ['committee' => $committee, 'format' => 'pdf']));
    $pdfResponse->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('inactive committee card is blocked for guest but allowed for administrator', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00002',
        'created_by' => $admin->id,
        'name' => 'Pending Crew',
        'division' => 'Logistik',
        'gender' => 'male',
        'status' => 'inactive',
        'event_year' => 2026,
    ]);

    // Public access should be 403
    $publicResponse = $this->get(route('home.committee.card', ['identifier' => 'CREW-00002']));
    $publicResponse->assertForbidden();

    // Admin access allowed with unverified banner
    $adminResponse = $this->actingAs($admin)->get(route('admin.companies.committees.card', $committee));
    $adminResponse->assertOk()
        ->assertSee('MENUNGGU AKTIVASI');
});

test('administrator can store and update daily duties for 4 days and view them in show', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.committees.store'), [
        'name' => 'Muhammad Rizky Panitia',
        'branch' => 'Surabaya',
        'gender' => 'male',
        'shirt_size' => 'L',
        'division' => 'Acara & Lomba',
        'position' => 'Koordinator Lapangan',
        'access_zone' => 'All Access',
        'status' => 'active',
        'daily_duties' => [
            'day_1' => 'Penginapan / Registrasi Asrama',
            'day_2' => 'Venue Perlombaan (Gate Utama)',
            'day_3' => 'Area Panggung & Arena Lomba',
            'day_4' => 'Pemandu Bus & Study Tour',
        ],
    ]);

    $response->assertRedirect(route('admin.companies.committees.index'));

    $committee = EventCommittee::where('name', 'Muhammad Rizky Panitia')->first();
    expect($committee)->not->toBeNull()
        ->and($committee->daily_duties)->toBeArray()
        ->and($committee->getDutyForDay(1))->toBe('Penginapan / Registrasi Asrama')
        ->and($committee->getDutyForDay(2))->toBe('Venue Perlombaan (Gate Utama)')
        ->and($committee->getDutyForDay(3))->toBe('Area Panggung & Arena Lomba')
        ->and($committee->getDutyForDay(4))->toBe('Pemandu Bus & Study Tour');

    // Update duties
    $updateResponse = $this->actingAs($admin)->put(route('admin.companies.committees.update', $committee), [
        'name' => 'Muhammad Rizky Panitia Updated',
        'branch' => 'Surabaya',
        'gender' => 'male',
        'shirt_size' => 'L',
        'division' => 'Acara & Lomba',
        'position' => 'Koordinator Lapangan',
        'access_zone' => 'All Access',
        'status' => 'active',
        'daily_duties' => [
            'day_1' => 'Pos Logistik & Konsumsi',
            'day_2' => 'Portal Presscon & Media',
            'day_3' => 'Area Panggung & Arena Lomba',
            'day_4' => 'All Access / Koordinator Lapangan',
        ],
    ]);

    $updateResponse->assertRedirect(route('admin.companies.committees.index'));
    $committee->refresh();
    expect($committee->getDutyForDay(1))->toBe('Pos Logistik & Konsumsi')
        ->and($committee->getDutyForDay(2))->toBe('Portal Presscon & Media');

    // Show page returns committee and checkInTimeline
    $showResponse = $this->actingAs($admin)->get(route('admin.companies.committees.show', $committee));
    $showResponse->assertOk();
});

test('committee getData endpoint respects perPage, sorting and page parameters from DataTable', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    // Create 30 committee members
    for ($i = 1; $i <= 30; $i++) {
        EventCommittee::create([
            'code' => 'CREW-'.str_pad((string) $i, 5, '0', STR_PAD_LEFT),
            'created_by' => $admin->id,
            'name' => "Panitia Nomor {$i}",
            'division' => 'Acara & Lomba',
            'gender' => 'male',
            'status' => 'active',
            'event_year' => 2026,
        ]);
    }

    // Default perPage = 10
    $resDefault = $this->actingAs($admin)->getJson(route('admin.companies.committees.data'));
    $resDefault->assertOk();
    expect($resDefault->json('per_page'))->toBe(10)
        ->and(count($resDefault->json('data')))->toBe(10)
        ->and($resDefault->json('total'))->toBe(30);

    // Request perPage = 25
    $res25 = $this->actingAs($admin)->getJson(route('admin.companies.committees.data', [
        'perPage' => 25,
        'page' => 1,
    ]));
    $res25->assertOk();
    expect($res25->json('per_page'))->toBe(25)
        ->and(count($res25->json('data')))->toBe(25);

    // Request perPage = 25 page 2 -> remaining 5
    $res25Page2 = $this->actingAs($admin)->getJson(route('admin.companies.committees.data', [
        'perPage' => 25,
        'page' => 2,
    ]));
    $res25Page2->assertOk();
    expect($res25Page2->json('per_page'))->toBe(25)
        ->and(count($res25Page2->json('data')))->toBe(5);

    // Sorting by name asc
    $resSort = $this->actingAs($admin)->getJson(route('admin.companies.committees.data', [
        'perPage' => 10,
        'orderBy' => 'name',
        'orderDirection' => 'asc',
    ]));
    $resSort->assertOk();
    expect($resSort->json('data.0.name'))->toBe('Panitia Nomor 1');
});
