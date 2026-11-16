<?php

namespace App\Mail;

use App\Models\Company\EventGuest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VipInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public EventGuest $guest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Undangan Kehormatan VIP — OMATIQ 2026: {$this->guest->name}",
        );
    }

    public function content(): Content
    {
        $rsvpUrl = route('home.guest.rsvp', ['token' => $this->guest->ensureRsvpToken()]);

        return new Content(
            view: 'emails.vip-invitation',
            with: [
                'guest' => $this->guest,
                'rsvpUrl' => $rsvpUrl,
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
