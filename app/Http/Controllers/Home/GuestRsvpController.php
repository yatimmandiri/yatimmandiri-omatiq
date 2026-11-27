<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Mail\VipPassTicketMail;
use App\Models\Company\EventGuest;
use App\Services\BarcodeService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class GuestRsvpController extends Controller
{
    public function __construct(
        protected BarcodeService $barcodeService,
    ) {}

    public function show(string $identifier): Response|RedirectResponse
    {
        $guest = EventGuest::where('code', $identifier)
            ->orWhere('rsvp_token', $identifier)
            ->firstOrFail();

        $verifyUrl = route('home.registration.verify', ['registrationNumber' => $guest->code]);
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 180, color: '#17524A');
        $categoryLower = strtolower((string) $guest->category);
        $isPress = in_array($categoryLower, ['press', 'media'], true);
        $isVip = in_array($categoryLower, ['vip', 'vvip', 'tokoh', 'sponsor'], true) || ! $isPress;
        $isParentPress = $isPress && $guest->parent_guest_id === null;

        $pressQuota = null;
        if ($isParentPress) {
            $registeredCount = $guest->children()->where('status', '!=', 'declined')->count();
            $maxSeats = max(1, (int) $guest->seat_count);
            $pressQuota = [
                'max' => $maxSeats,
                'registered' => $registeredCount,
                'remaining' => max(0, $maxSeats - $registeredCount),
            ];
        }

        return Inertia::render('home/guests/rsvp', [
            'guest' => [
                'id' => $guest->id,
                'code' => $guest->code,
                'name' => $guest->name,
                'institution' => $guest->institution,
                'position' => $guest->position,
                'category' => strtoupper($guest->category),
                'email' => $guest->email,
                'phone' => $guest->phone,
                'table_number' => $guest->table_number ?: 'Area Kursi Kehormatan VIP',
                'seat_count' => $guest->seat_count,
                'status' => $guest->status,
                'confirmed_at' => $guest->confirmed_at?->translatedFormat('d F Y, H:i').' WIB',
                'checked_in_at' => $guest->checked_in_at?->translatedFormat('d F Y, H:i').' WIB',
            ],
            'isPress' => $isPress,
            'isVip' => $isVip,
            'pressQuota' => $pressQuota,
            'token' => $guest->code,
            'verifyUrl' => $verifyUrl,
            'qrCodeSvg' => $qrCodeSvg,
            'eventInfo' => $isPress
                ? [
                    'name' => 'Press Conference OMATIQ 2026 & Tema Tahunan 2027',
                    'date' => 'Senin, 14 Desember 2026',
                    'time' => '09.00 WIB - Selesai',
                    'venue' => "Lobby Abdurrahman Saleh RRI\nJl. Medan Merdeka Barat, Kec. Gambir, Jakarta Pusat",
                    'organizer' => '',
                ]
                : [
                    'name' => 'Grand Final OMATIQ & Sholawat Senandung Islami Bersama Haddad Alwi',
                    'date' => 'Rabu, 16 Desember 2026',
                    'time' => '13.00 WIB - Selesai',
                    'venue' => "Auditorium Abdurrahman Saleh RRI\nJl. Medan Merdeka Barat, Kec. Gambir, Jakarta Pusat",
                    'organizer' => '',
                ],
            'pageTitle' => "Konfirmasi Kehadiran VIP — {$guest->name}",
            'meta' => [
                'title' => "Konfirmasi Kehadiran VIP — {$guest->name}",
                'description' => "Konfirmasi kehadiran resmi Tamu Kehormatan VIP {$guest->name} pada Grand Final OMATIQ 2026.",
                'keywords' => 'undangan vip, omatiq 2026, yatim mandiri, rsvp vip',
            ],
        ]);
    }

    public function confirm(Request $request, string $identifier): RedirectResponse
    {
        $guest = EventGuest::where('code', $identifier)
            ->orWhere('rsvp_token', $identifier)
            ->firstOrFail();

        $categoryLower = strtolower((string) $guest->category);
        $isPress = in_array($categoryLower, ['press', 'media'], true);
        $isParentPress = $isPress && $guest->parent_guest_id === null;

        if ($isParentPress) {
            if ($guest->status === 'declined') {
                return back()->with('error', 'Undangan ini telah ditandai berhalangan hadir. Hubungi panitia jika membutuhkan perubahan.');
            }
        } elseif ($guest->status !== 'invited') {
            return back()->with('error', 'Konfirmasi kehadiran telah tercatat sebelumnya dan formulir telah dikunci. Hubungi panitia jika membutuhkan perubahan data.');
        }

        $rules = [
            'attendance' => ['required', 'in:confirmed,declined'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];

        if ($request->input('attendance') === 'confirmed') {
            $rules['name'] = ['required', 'string', 'max:255'];
            $rules['email'] = ['required', 'email', 'max:255'];
            $rules['phone'] = ['required', 'string', 'max:30'];
            if (! $isPress) {
                $rules['has_companion'] = ['nullable', 'boolean'];
                $rules['seat_count'] = ['nullable', 'integer', 'min:1', 'max:2'];
            }
        }

        $validated = $request->validate($rules, [
            'name.required' => 'Nama lengkap perwakilan yang hadir wajib diisi.',
            'email.required' => 'Email aktif wajib diisi untuk pengiriman tiket VIP Pass.',
            'email.email' => 'Format alamat email tidak valid.',
            'phone.required' => 'Nomor WhatsApp / HP aktif wajib diisi.',
        ]);

        $newStatus = $validated['attendance'];

        if ($isParentPress) {
            if ($newStatus === 'declined') {
                $guest->status = 'declined';
                $guest->confirmed_at = now();
                if (! empty($validated['notes'])) {
                    $guest->notes = trim(($guest->notes ? $guest->notes."\n[Catatan Tamu: " : '[Catatan Tamu: ').$validated['notes'].']');
                }
                $guest->save();

                return back()->with('success', 'Terima kasih atas konfirmasi Anda. Kami memaklumi bila media Anda berhalangan hadir pada acara ini.');
            }

            $registeredCount = $guest->children()->where('status', '!=', 'declined')->count();
            $maxSeats = max(1, (int) $guest->seat_count);

            if ($registeredCount >= $maxSeats) {
                return back()->with('error', "Kuota undangan untuk {$guest->name} sudah terpenuhi ({$maxSeats}/{$maxSeats} orang).");
            }

            $childGuest = EventGuest::create([
                'parent_guest_id' => $guest->id,
                'created_by' => $guest->created_by,
                'code' => EventGuest::generateCode(),
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'phone' => trim($validated['phone']),
                'institution' => $guest->institution ?: $guest->name,
                'position' => 'Jurnalis / Pers',
                'category' => $guest->category,
                'seat_count' => 1,
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'notes' => ! empty($validated['notes']) ? '[Catatan Tamu: '.trim($validated['notes']).']' : null,
                'event_year' => $guest->event_year ?? 2026,
            ]);

            if (! empty($childGuest->email)) {
                try {
                    Mail::to($childGuest->email)->send(new VipPassTicketMail($childGuest));
                } catch (Exception $e) {
                    Log::warning("Gagal mengirimkan email Press Pass ke {$childGuest->email}: ".$e->getMessage());
                }
            }

            return redirect()->route('home.guest.rsvp', ['identifier' => $childGuest->code])
                ->with('success', "Terima kasih atas konfirmasi kehadiran Anda. Tiket E-Pass ({$childGuest->code}) dan QR Code telah dikirimkan ke email {$childGuest->email}.");
        }

        $guest->status = $newStatus;
        $guest->confirmed_at = now();

        if ($newStatus === 'confirmed') {
            $guest->name = trim($validated['name']);
            $guest->email = strtolower(trim($validated['email']));
            $guest->phone = trim($validated['phone']);

            if ($isPress) {
                $guest->seat_count = 1;
            } else {
                $hasCompanion = ! empty($validated['has_companion']) || ((int) ($validated['seat_count'] ?? 1) === 2);
                $guest->seat_count = $hasCompanion ? 2 : 1;
            }
        }

        if (! empty($validated['notes'])) {
            $guest->notes = trim(($guest->notes ? $guest->notes."\n[Catatan Tamu: " : '[Catatan Tamu: ').$validated['notes'].']');
        }

        $guest->save();

        if ($newStatus === 'confirmed' && ! empty($guest->email)) {
            try {
                Mail::to($guest->email)->send(new VipPassTicketMail($guest));
            } catch (Exception $e) {
                Log::warning("Gagal mengirimkan email VIP Pass ke {$guest->email}: ".$e->getMessage());
            }
        }

        $message = $newStatus === 'confirmed'
            ? "Terima kasih atas konfirmasi kehadiran Anda. VIP E-Pass dan QR Code telah dikirimkan ke email {$guest->email} dan dapat dilihat di bawah."
            : 'Terima kasih atas konfirmasi Anda. Kami memaklumi bila Bapak/Ibu berhalangan hadir pada acara ini.';

        return back()->with('success', $message);
    }
}
