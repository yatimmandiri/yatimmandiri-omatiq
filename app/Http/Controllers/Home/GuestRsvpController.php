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
            'token' => $guest->code,
            'verifyUrl' => $verifyUrl,
            'qrCodeSvg' => $qrCodeSvg,
            'eventInfo' => [
                'name' => 'OMATIQ 2026 — Grand Final & Penganugerahan Juara',
                'date' => 'Minggu, 20 Desember 2026',
                'time' => '07.30 WIB - Selesai',
                'venue' => 'Grand City Convention & Exhibition Hall, Surabaya',
                'organizer' => 'Panitia Pelaksana OMATIQ & Laznas Yatim Mandiri',
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

        if ($guest->status !== 'invited') {
            return back()->with('error', 'Konfirmasi kehadiran telah tercatat sebelumnya dan formulir telah dikunci. Hubungi panitia jika membutuhkan perubahan data.');
        }

        $validated = $request->validate([
            'attendance' => ['required', 'in:confirmed,declined'],
            'seat_count' => ['nullable', 'integer', 'min:1', 'max:10'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $newStatus = $validated['attendance'];
        $guest->status = $newStatus;
        $guest->confirmed_at = now();

        if (! empty($validated['notes'])) {
            $guest->notes = trim(($guest->notes ? $guest->notes."\n[Catatan Tamu: " : '[Catatan Tamu: ').$validated['notes'].']');
        }

        if (! empty($validated['seat_count'])) {
            $guest->seat_count = (int) $validated['seat_count'];
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
            ? 'Terima kasih atas konfirmasi kehadiran Anda. VIP E-Pass dan QR Code telah dikirimkan ke email Anda dan dapat dilihat di bawah.'
            : 'Terima kasih atas konfirmasi Anda. Kami memaklumi bila Bapak/Ibu berhalangan hadir pada acara ini.';

        return back()->with('success', $message);
    }
}
