<?php

use App\Mail\VipPassTicketMail;
use App\Models\Company\EventGuest;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Mail::fake();
    $this->seed(UserRolePermissionSeeder::class);
});

test('administrator can create guest with auto-generated INV code and table allocation', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.guests.store'), [
        'name' => 'Prof. Dr. Ir. H. Mohammad Nuh, DEA',
        'institution' => 'Kementerian / Dewan Pembina',
        'position' => 'Tokoh Pendidikan Nasional',
        'category' => 'vvip',
        'phone' => '081198765432',
        'email' => 'm.nuh@undangan.local',
        'table_number' => 'Meja VVIP Kehormatan 01',
        'seat_count' => 2,
        'status' => 'confirmed',
        'notes' => 'Memberikan sambutan pembukaan',
    ]);

    $response->assertRedirect(route('admin.companies.guests.index'));
    $response->assertSessionHas('success');

    $guest = EventGuest::first();
    expect($guest)->not->toBeNull()
        ->and($guest->code)->toBe('INV-00001')
        ->and($guest->name)->toBe('Prof. Dr. Ir. H. Mohammad Nuh, DEA')
        ->and($guest->category)->toBe('vvip')
        ->and($guest->table_number)->toBe('Meja VVIP Kehormatan 01')
        ->and($guest->seat_count)->toBe(2);
});

test('bulk check-in marks selected guests as attended and sets checked_in_at (Plan C)', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $g1 = EventGuest::create([
        'code' => 'INV-00001',
        'created_by' => $admin->id,
        'name' => 'Kepala Dinas Pendidikan',
        'category' => 'vip',
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $g2 = EventGuest::create([
        'code' => 'INV-00002',
        'created_by' => $admin->id,
        'name' => 'Pimpinan Bank Jatim Syariah',
        'category' => 'sponsor',
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->postJson(route('admin.companies.guests.bulk-check-in'), [
        'ids' => [$g1->id, $g2->id],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'count' => 2,
        ]);

    expect($g1->fresh()->checked_in_at)->not->toBeNull()
        ->and($g1->fresh()->status)->toBe('attended')
        ->and($g2->fresh()->checked_in_at)->not->toBeNull()
        ->and($g2->fresh()->status)->toBe('attended');
});

test('print card renders honorary guest pass', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00001',
        'created_by' => $admin->id,
        'name' => 'Bpk. H. Ahmad Fauzi',
        'institution' => 'Pemerintah Kota Surabaya',
        'position' => 'Pemerintah Daerah',
        'category' => 'vip',
        'table_number' => 'Meja VIP 03',
        'seat_count' => 1,
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.guests.card', $guest));
    $response->assertOk()
        ->assertViewIs('cards.guest-card')
        ->assertSee('INV-00001')
        ->assertSee('Bpk. H. Ahmad Fauzi')
        ->assertSee('MEJA VIP 03');
});

test('vip guest registration creates rsvp_token and does not send initial email for physical invitation', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.guests.store'), [
        'name' => 'Dr. H. Bambang Soeprapto',
        'institution' => 'Pemerintah Provinsi Jatim',
        'position' => 'Kepala Biro Kesra',
        'category' => 'vip',
        'email' => 'bambang.kesra@jatimprov.go.id',
        'phone' => '081234567890',
        'table_number' => 'Meja VIP 01',
        'seat_count' => 2,
    ]);

    $response->assertRedirect(route('admin.companies.guests.index'));

    $guest = EventGuest::where('email', 'bambang.kesra@jatimprov.go.id')->first();
    expect($guest)->not->toBeNull()
        ->and($guest->category)->toBe('vip')
        ->and($guest->status)->toBe('invited')
        ->and($guest->rsvp_token)->not->toBeNull();

    // No email sent during initial registration
    Mail::assertNothingSent();
});

test('admin can download individual rsvp qr code as png', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00001',
        'name' => 'Gubernur Jawa Timur',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.guests.download-rsvp-qr', $guest));
    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('image/png')
        ->and($response->headers->get('content-disposition'))->toContain('QR-RSVP-INV-00001');
});

test('admin can bulk download rsvp qr codes as zip archive', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $g1 = EventGuest::create([
        'code' => 'INV-00001',
        'name' => 'Tamu Pertama',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $g2 = EventGuest::create([
        'code' => 'INV-00002',
        'name' => 'Tamu Kedua',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.companies.guests.bulk-download-rsvp-qr'), [
        'ids' => [$g1->id, $g2->id],
    ]);

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/zip');
});

test('vip guest can view rsvp page using code and confirm attendance which sends VipPassTicketMail', function () {
    $guest = EventGuest::create([
        'code' => 'INV-00005',
        'name' => 'Ibu Hj. Khofifah Indar Parawansa',
        'category' => 'vip',
        'email' => 'khofifah@undangan.local',
        'status' => 'invited',
        'table_number' => 'Meja VVIP Utama',
        'seat_count' => 1,
        'event_year' => 2026,
    ]);

    // 1. View RSVP page using code (printed on physical invitation)
    $showResponse = $this->get(route('home.guest.rsvp', ['identifier' => $guest->code]));
    $showResponse->assertOk();

    // 2. Submit confirmation with representative details and companion
    $postResponse = $this->post(route('home.guest.rsvp.confirm', ['identifier' => $guest->code]), [
        'name' => 'Dr. H. Bambang Subroto, M.Si',
        'email' => 'bambang.subroto@undangan.local',
        'phone' => '081234567890',
        'attendance' => 'confirmed',
        'has_companion' => true,
        'notes' => 'Akan hadir tepat waktu.',
    ]);

    $postResponse->assertSessionHas('success');

    $guest->refresh();
    expect($guest->status)->toBe('confirmed')
        ->and($guest->name)->toBe('Dr. H. Bambang Subroto, M.Si')
        ->and($guest->email)->toBe('bambang.subroto@undangan.local')
        ->and($guest->phone)->toBe('081234567890')
        ->and($guest->seat_count)->toBe(2)
        ->and($guest->confirmed_at)->not->toBeNull();

    Mail::assertSent(VipPassTicketMail::class, function ($mail) use ($guest) {
        return $mail->hasTo('bambang.subroto@undangan.local') && $mail->guest->id === $guest->id;
    });
});

test('press guest parent with seat_count quota creates individual child INV codes and blocks when full', function () {
    $parent = EventGuest::create([
        'code' => 'INV-00008',
        'name' => 'Media Jawa Pos',
        'institution' => 'Jawa Pos Media Group',
        'category' => 'press',
        'status' => 'invited',
        'seat_count' => 2,
        'event_year' => 2026,
    ]);

    // 1st journalist registers
    $res1 = $this->post(route('home.guest.rsvp.confirm', ['identifier' => $parent->code]), [
        'name' => 'Ahmad Jurnalis',
        'email' => 'ahmad@jawapos.local',
        'phone' => '081399887766',
        'attendance' => 'confirmed',
    ]);
    $res1->assertSessionHas('success');

    $child1 = EventGuest::where('parent_guest_id', $parent->id)->where('email', 'ahmad@jawapos.local')->first();
    expect($child1)->not->toBeNull()
        ->and($child1->code)->not->toBe($parent->code)
        ->and($child1->seat_count)->toBe(1)
        ->and($child1->status)->toBe('confirmed');

    // 2nd journalist registers
    $res2 = $this->post(route('home.guest.rsvp.confirm', ['identifier' => $parent->code]), [
        'name' => 'Budi Reporter',
        'email' => 'budi@jawapos.local',
        'phone' => '081399887755',
        'attendance' => 'confirmed',
    ]);
    $res2->assertSessionHas('success');

    expect($parent->children()->count())->toBe(2);

    // 3rd journalist should be blocked because quota (2) is full
    $res3 = $this->post(route('home.guest.rsvp.confirm', ['identifier' => $parent->code]), [
        'name' => 'Cici Fotografer',
        'email' => 'cici@jawapos.local',
        'phone' => '081399887744',
        'attendance' => 'confirmed',
    ]);
    $res3->assertSessionHas('error');
    expect($parent->children()->count())->toBe(2);
});

test('admin can print single guest invitation as A5 landscape', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00010',
        'name' => 'Bpk. H. Ahmad Dahlan',
        'institution' => 'Kementerian Agama Jawa Timur',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.guests.invitation', $guest));
    $response->assertOk()
        ->assertViewIs('invitations.guest-invitation')
        ->assertSee('Kementerian Agama Jawa Timur')
        ->assertSee('Grand Final OMATIQ');
});

test('admin can bulk print guest invitations', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $g1 = EventGuest::create([
        'code' => 'INV-00011',
        'name' => 'Tamu Pertama',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $g2 = EventGuest::create([
        'code' => 'INV-00012',
        'name' => 'Tamu Kedua',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.guests.bulk-invitations', [
        'ids' => [$g1->id, $g2->id],
    ]));

    $response->assertOk()
        ->assertViewIs('invitations.guest-invitation')
        ->assertSee('Tamu Pertama')
        ->assertSee('Tamu Kedua');
});

test('non-vip guest can check-in normally at unified gate /verifikasi/', function () {
    $guest = EventGuest::create([
        'code' => 'INV-00099',
        'name' => 'Bapak Slamet Rahardjo',
        'institution' => 'Komunitas Peduli Yatim',
        'category' => 'non_vip',
        'status' => 'confirmed',
        'table_number' => 'Area Reguler 05',
        'seat_count' => 1,
        'event_year' => 2026,
    ]);

    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('home.registration.verify', ['registrationNumber' => $guest->code]));
    $response->assertOk();

    $guest->refresh();
    expect($guest->status)->toBe('attended')
        ->and($guest->checked_in_at)->not->toBeNull();
});

test('unauthenticated guest scanning universal qr /verifikasi/{code} is redirected to rsvp page', function () {
    $guest = EventGuest::create([
        'code' => 'INV-00100',
        'name' => 'Instansi Tamu VIP',
        'institution' => 'Dinas Pendidikan',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $response = $this->get(route('home.registration.verify', ['registrationNumber' => $guest->code]));
    $response->assertRedirect(route('home.guest.rsvp', ['identifier' => $guest->code]));
});

test('authenticated verifier scanning universal qr for invited guest who forgot rsvp still checks them in', function () {
    $guest = EventGuest::create([
        'code' => 'INV-00101',
        'name' => 'Instansi Lupa RSVP',
        'institution' => 'Kementerian Agama',
        'category' => 'vip',
        'status' => 'invited',
        'event_year' => 2026,
    ]);

    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('home.registration.verify', ['registrationNumber' => $guest->code]));
    $response->assertOk();

    $guest->refresh();
    expect($guest->status)->toBe('attended')
        ->and($guest->checked_in_at)->not->toBeNull();
});

test('guest getData endpoint respects perPage, sorting and page parameters from DataTable', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    for ($i = 1; $i <= 30; $i++) {
        EventGuest::create([
            'code' => 'INV-'.str_pad((string) $i, 5, '0', STR_PAD_LEFT),
            'name' => "Tamu Undangan {$i}",
            'category' => 'vip',
            'status' => 'invited',
            'event_year' => 2026,
        ]);
    }

    $resDefault = $this->actingAs($admin)->getJson(route('admin.companies.guests.data'));
    $resDefault->assertOk();
    expect($resDefault->json('per_page'))->toBe(10)
        ->and(count($resDefault->json('data')))->toBe(10)
        ->and($resDefault->json('total'))->toBe(30);

    $res25 = $this->actingAs($admin)->getJson(route('admin.companies.guests.data', [
        'perPage' => 25,
        'page' => 1,
    ]));
    $res25->assertOk();
    expect($res25->json('per_page'))->toBe(25)
        ->and(count($res25->json('data')))->toBe(25);
});
