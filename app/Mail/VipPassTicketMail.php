<?php

namespace App\Mail;

use App\Models\Company\EventGuest;
use App\Services\BarcodeService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VipPassTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public EventGuest $guest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "VIP E-Pass & Akses Masuk Venue OMATIQ 2026: {$this->guest->name}",
        );
    }

    public function content(): Content
    {
        $barcodeService = app(BarcodeService::class);
        $verifyUrl = route('home.registration.verify', ['registrationNumber' => $this->guest->code]);
        $qrPngBinary = $barcodeService->generateQrCodePng($verifyUrl, size: 400, color: '#17524A');

        return new Content(
            view: 'emails.vip-pass-ticket',
            with: [
                'guest' => $this->guest,
                'verifyUrl' => $verifyUrl,
                'qrPngBinary' => $qrPngBinary,
                'eventDate' => 'Minggu, 20 Desember 2026',
                'eventTime' => '07.30 WIB - Selesai',
                'eventVenue' => 'Grand City Convention & Exhibition Hall, Surabaya',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
