<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIP E-Pass & Akses Masuk Venue — OMATIQ 2026</title>
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
            padding: 32px 30px;
            text-align: center;
            color: #ffffff;
        }
        .badge {
            display: inline-block;
            background: rgba(255, 230, 0, 0.2);
            border: 1px solid #FFE600;
            color: #FFE600;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 9999px;
            margin-bottom: 12px;
        }
        .title {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .subtitle {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: #d1fae5;
        }
        .content {
            padding: 32px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 4px;
        }
        .guest-name {
            font-size: 22px;
            font-weight: 900;
            color: #134e45;
            margin: 0 0 4px 0;
        }
        .guest-position {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
            margin-bottom: 24px;
        }
        .pass-box {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 18px;
            padding: 26px 20px;
            margin: 20px 0;
        }
        .qr-wrapper {
            display: inline-block;
            background: #ffffff;
            padding: 16px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            margin-bottom: 12px;
        }
        .qr-wrapper img {
            display: block;
            margin: 0 auto;
            width: 180px;
            height: 180px;
            border-radius: 8px;
        }
        .pass-code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #0f172a;
            margin: 8px 0;
        }
        .table-pill {
            display: inline-block;
            background-color: #fef3c7;
            border: 1px solid #fde68a;
            color: #92400e;
            font-size: 13px;
            font-weight: 800;
            padding: 6px 18px;
            border-radius: 9999px;
            margin-top: 6px;
        }
        .instructions {
            text-align: left;
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 16px 20px;
            margin: 24px 0 16px 0;
            font-size: 13px;
            line-height: 1.6;
            color: #065f46;
        }
        .instructions ol {
            margin: 8px 0 0 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 6px;
        }
        .btn-view-pass {
            display: inline-block;
            background: #17524A;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 10px;
            margin-top: 14px;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 22px 30px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="badge">OFFICIAL VIP E-PASS</div>
                <h1 class="title">OMATIQ 2026</h1>
                <p class="subtitle">Olimpiade Matematika dan Al-Qur'an &bull; Grand Final Nasional</p>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="greeting">Terima kasih atas konfirmasi kehadiran Anda,</div>
                <h2 class="guest-name">{{ $guest->name }}</h2>
                <div class="guest-position">
                    {{ $guest->position ?: 'Tamu Kehormatan' }} &bull; {{ $guest->institution ?: 'Undangan VIP' }}
                </div>

                <!-- E-Pass Box with QR -->
                <div class="pass-box">
                    <div class="qr-wrapper">
                        <img src="{{ $message->embedData($qrPngBinary, 'vip-pass-' . $guest->code . '.png', 'image/png') }}" alt="VIP Pass QR Code {{ $guest->code }}" width="180" height="180" />
                    </div>
                    <div class="pass-code">{{ $guest->code }}</div>
                    <div class="table-pill">
                        🎟️ Kapasitas: {{ $guest->seat_count }} Orang
                    </div>
                </div>

                <!-- Venue Info & Instructions -->
                <div class="instructions">
                    <strong>Panduan Akses Masuk Venue:</strong>
                    <ol>
                        <li>Simpan email ini atau ambil tangkapan layar (screenshot) QR Code di atas pada smartphone Anda.</li>
                        <li>Saat tiba di venue <strong>{{ $eventVenue }}</strong> pada <strong>{{ $eventDate }}</strong> (mulai pukul {{ $eventTime }}), tunjukkan QR Code ini ke petugas presensi di <strong>Pintu Masuk / Universal Gate</strong>.</li>
                        <li>Petugas akan memindai QR Code untuk verifikasi instan dan mengarahkan Anda ke meja/kursi kehormatan.</li>
                    </ol>
                </div>

                <div>
                    <a href="{{ $verifyUrl }}" class="btn-view-pass" target="_blank">
                        Buka Status E-Pass di Browser &rarr;
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                &copy; {{ date('Y') }} Panitia Pelaksana OMATIQ &bull; Laznas Yatim Mandiri<br>
                Layanan Bantuan & Liaison Officer: 0811-1234-5678 &bull; <a href="https://omatiq.com" style="color: #17524A; text-decoration: none;">www.omatiq.com</a>
            </div>
        </div>
    </div>
</body>
</html>
