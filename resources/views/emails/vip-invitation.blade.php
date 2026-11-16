<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undangan Kehormatan VIP — OMATIQ 2026</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f4f6f8;
            padding: 40px 15px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #134e45 0%, #17524A 50%, #1e6b60 100%);
            padding: 36px 30px;
            text-align: center;
            color: #ffffff;
        }
        .badge {
            display: inline-block;
            background: rgba(255, 230, 0, 0.18);
            border: 1px solid #FFE600;
            color: #FFE600;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 6px 16px;
            border-radius: 9999px;
            margin-bottom: 14px;
        }
        .title {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .subtitle {
            margin: 8px 0 0 0;
            font-size: 13px;
            color: #d1fae5;
            letter-spacing: 0.3px;
        }
        .content {
            padding: 36px 30px;
        }
        .salutation {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .guest-name {
            font-size: 20px;
            font-weight: 800;
            color: #134e45;
            margin: 4px 0 2px 0;
        }
        .guest-position {
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
        }
        .letter-body {
            font-size: 14px;
            line-height: 1.7;
            color: #334155;
            margin: 20px 0;
        }
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 20px;
            margin: 24px 0;
        }
        .info-row {
            display: table;
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            display: table-cell;
            width: 38%;
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            display: table-cell;
            width: 62%;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
        }
        .cta-container {
            text-align: center;
            margin: 32px 0 20px 0;
        }
        .btn-rsvp {
            display: inline-block;
            background: linear-gradient(135deg, #17524A 0%, #1e6b60 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-size: 15px;
            font-weight: 800;
            padding: 16px 36px;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(23, 82, 74, 0.35);
            letter-spacing: 0.5px;
        }
        .note-box {
            background-color: #fefce8;
            border: 1px solid #fef08a;
            border-radius: 12px;
            padding: 14px 18px;
            font-size: 12px;
            line-height: 1.6;
            color: #854d0e;
            margin-top: 24px;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 24px 30px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.6;
        }
        .footer a {
            color: #17524A;
            text-decoration: none;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="badge">VIP INVITATION &bull; RESMI</div>
                <h1 class="title">OMATIQ 2026</h1>
                <p class="subtitle">Olimpiade Matematika dan Al-Qur'an &bull; Building Future Innovator</p>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="salutation">
                    Kepada Yang Terhormat,<br>
                    <div class="guest-name">{{ $guest->name }}</div>
                    <div class="guest-position">
                        {{ $guest->position ?: 'Tamu Kehormatan' }}
                        @if($guest->institution)
                            &bull; {{ $guest->institution }}
                        @endif
                    </div>
                </div>

                <div class="letter-body">
                    Assalamu’alaikum Warahmatullahi Wabarakatuh,<br><br>
                    Dengan penuh rasa hormat dan syukur, Panitia Pelaksana <strong>OMATIQ 2026</strong> bersama <strong>Yayasan Yatim Mandiri</strong> mengundang Bapak/Ibu untuk hadir sebagai <strong>Tamu Undangan Kehormatan (VIP)</strong> dalam rangkaian acara Grand Final dan Penganugerahan Juara OMATIQ Tingkat Nasional.
                </div>

                <!-- Event Info Card -->
                <div class="info-card">
                    <div class="info-row">
                        <div class="info-label">Tanggal Acara</div>
                        <div class="info-value">{{ $eventDate }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Waktu</div>
                        <div class="info-value">{{ $eventTime }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Lokasi Venue</div>
                        <div class="info-value">{{ $eventVenue }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Alokasi Tempat</div>
                        <div class="info-value" style="color: #134e45;">{{ $guest->table_number ?: 'Area Kehormatan VIP' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Kapasitas Kursi</div>
                        <div class="info-value">{{ $guest->seat_count }} Kursi (Termasuk Pendamping)</div>
                    </div>
                </div>

                <!-- Call To Action -->
                <div class="cta-container">
                    <a href="{{ $rsvpUrl }}" class="btn-rsvp">
                        Konfirmasi Kehadiran (RSVP) &rarr;
                    </a>
                </div>

                <div class="note-box">
                    <strong>Penting:</strong> Demi optimalisasi tata tempat dan kenyamanan Bapak/Ibu, mohon berkenan mengklik tombol konfirmasi kehadiran di atas. Setelah konfirmasi, sistem akan secara otomatis mengirimkan <strong>VIP E-Pass & QR Code resmi</strong> yang dapat ditunjukkan saat tiba di pintu masuk venue.
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                &copy; {{ date('Y') }} Panitia Pelaksana OMATIQ &bull; Laznas Yatim Mandiri<br>
                Informasi & Konfirmasi: <a href="https://omatiq.com">www.omatiq.com</a> &bull; Hotline: 0811-1234-5678<br>
                Email ini dikirim otomatis kepada alamat terdaftar: {{ $guest->email }}.
            </div>
        </div>
    </div>
</body>
</html>
