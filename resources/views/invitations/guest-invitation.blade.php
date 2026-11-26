<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $pageTitle ?? 'Surat Undangan Resmi OMATIQ 2026' }}</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #0f172a;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }

        /* Top Action Bar (Screen Only) */
        .print-toolbar {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
        }

        .print-toolbar .title {
            font-size: 14px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .print-toolbar .badge-info {
            background: rgba(23, 82, 74, 0.8);
            border: 1px solid #22c55e;
            color: #4ade80;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 9999px;
        }

        .btn-print {
            background: linear-gradient(135deg, #FFE600 0%, #E5BE1E 100%);
            color: #0f172a;
            font-weight: 800;
            font-size: 13px;
            padding: 8px 20px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(255, 230, 0, 0.3);
            transition: all 0.2s ease;
        }

        .btn-print:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 230, 0, 0.4);
        }

        .sheet-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 15px;
            gap: 28px;
        }

        /* Base A5 Landscape Sheet (210mm x 148mm) */
        .invitation-page {
            width: 210mm;
            height: 148mm;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            background-size: 100% 100%;
            background-position: center center;
            background-repeat: no-repeat;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
            border-radius: 6px;
        }

        /* =========================================================
         * HALAMAN 1: PEMBUKA / COVER
         * ========================================================= */
        .cover-content {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            padding: 28mm 15mm 14mm 15mm;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .cover-heading {
            font-size: 40pt;
            font-weight: 900;
            letter-spacing: 1px;
            line-height: 1;
            text-transform: uppercase;
        }

        .cover-heading.vip {
            color: #5ad2d4;
        }

        .cover-heading.press {
            color: #045256;
        }

        .cover-subtitle {
            margin-top: 2.5mm;
            font-size: 11.5pt;
            font-weight: 600;
            line-height: 1.35;
        }

        .cover-subtitle.vip {
            color: #ffffff;
        }

        .cover-subtitle.press {
            color: #064e52;
            text-transform: uppercase;
            font-weight: 700;
            font-size: 10.5pt;
        }

        .cover-subtitle .italic-accent {
            font-style: italic;
            font-weight: 500;
            display: block;
            margin-top: 0.5mm;
        }

        .recipient-wrapper {
            margin-top: 13mm;
            max-width: 105mm;
        }

        .recipient-label {
            font-size: 10.5pt;
            font-weight: 500;
            margin-bottom: 2.5mm;
        }

        .recipient-label.vip {
            color: #ffffff;
        }

        .recipient-label.press {
            color: #045256;
        }

        .recipient-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 7mm 8mm;
            min-height: 36mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        .recipient-primary {
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.3;
        }

        .recipient-secondary {
            font-size: 11.5pt;
            font-weight: 500;
            color: #1e293b;
            margin-top: 1.5mm;
            line-height: 1.3;
        }

        /* =========================================================
         * HALAMAN 2: KONTEN / DETAIL ACARA
         * ========================================================= */
        .detail-content {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            padding: 15mm 14mm 10mm 14mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .detail-header {
            text-align: center;
        }

        .detail-title {
            font-size: 15.5pt;
            font-weight: 800;
            color: #073b3e;
            line-height: 1.28;
        }

        .detail-lead {
            margin-top: 3mm;
            font-size: 10.5pt;
            font-weight: 500;
            color: #1e293b;
        }

        .detail-info-grid {
            display: grid;
            grid-template-columns: 1fr 0.9fr 1.35fr;
            gap: 6mm;
            align-items: start;
            text-align: center;
            margin-top: 3mm;
            margin-bottom: 2mm;
        }

        .info-highlight {
            font-size: 15pt;
            font-weight: 800;
            color: #f7941d;
            line-height: 1.2;
        }

        .info-sub {
            font-size: 9.5pt;
            font-weight: 700;
            color: #1e293b;
            margin-top: 1.5mm;
            line-height: 1.35;
        }

        .detail-bottom-grid {
            display: grid;
            grid-template-columns: 1.25fr 0.9fr 0.95fr;
            gap: 5mm;
            align-items: end;
        }

        .rundown-box {
            font-size: 8pt;
            color: #0f172a;
            line-height: 1.45;
            padding-bottom: 2mm;
        }

        .rundown-title {
            font-weight: 800;
            font-size: 8.5pt;
            margin-bottom: 1.5mm;
            color: #073b3e;
        }

        .rundown-list {
            list-style: disc;
            padding-left: 4mm;
        }

        .rundown-list li {
            margin-bottom: 0.6mm;
        }

        .qr-card {
            background: #ffffff;
            border: 1.5px solid #2b8a8d;
            border-radius: 14px;
            padding: 3.5mm 4mm 3mm 4mm;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(7, 59, 62, 0.08);
            margin: 0 auto;
            width: 44mm;
        }

        .qr-caption {
            font-size: 7pt;
            font-weight: 600;
            color: #0f172a;
            line-height: 1.25;
            margin-bottom: 2mm;
        }

        .qr-svg-box {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .qr-svg-box svg {
            width: 24mm;
            height: 24mm;
            display: block;
        }

        .signature-box {
            text-align: center;
            padding-bottom: 2mm;
            color: #0f172a;
        }

        .sig-greeting {
            font-size: 8.5pt;
            font-weight: 700;
            margin-bottom: 14mm;
        }

        .sig-name {
            font-size: 8.5pt;
            font-weight: 800;
            color: #0f172a;
        }

        .sig-role {
            font-size: 8pt;
            font-weight: 500;
            color: #334155;
        }

        /* Print Media Styles */
        @media print {
            body {
                background: #ffffff !important;
            }

            .print-toolbar {
                display: none !important;
            }

            .sheet-container {
                padding: 0 !important;
                gap: 0 !important;
            }

            .invitation-page {
                box-shadow: none !important;
                border-radius: 0 !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                width: 210mm !important;
                height: 148mm !important;
                margin: 0 !important;
            }

            @page {
                size: 210mm 148mm landscape;
                margin: 0;
            }
        }
    </style>
</head>
<body>

    <!-- Screen Toolbar -->
    <header class="print-toolbar">
        <div class="title">
            <span>✉️ Lembar Cetak Undangan Resmi Tamu (A5 Landscape - 2 Halaman)</span>
            <span class="badge-info">{{ count($guestList) }} Tamu ({{ count($guestList) * 2 }} Halaman)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="btn-print" onclick="window.print()">
                🖨️ Cetak Lembar Undangan (Print / PDF)
            </button>
        </div>
    </header>

    <!-- Main Printable Sheets Container -->
    <main class="sheet-container">
        @foreach($guestList as $g)
            @php
                $categoryLower = strtolower((string) $g->category);
                $isPress = in_array($categoryLower, ['press', 'media'], true);
                $universalUrl = route('home.registration.verify', ['registrationNumber' => $g->code]);
                $qrSvg = app(\App\Services\BarcodeService::class)->generateQrCodeSvg($universalUrl, size: 92, color: '#0f172a');

                $coverBg = $isPress
                    ? asset('assets/images/bg-press-inv.png')
                    : asset('assets/images/bg-vip-inv.png');
                $contentBg = asset('assets/images/bg-content-inv.png');
            @endphp

            <!-- HALAMAN 1: PEMBUKA / COVER -->
            <section class="invitation-page" style="background-image: url('{{ $coverBg }}');">
                <div class="cover-content">
                    <h1 class="cover-heading {{ $isPress ? 'press' : 'vip' }}">UNDANGAN</h1>

                    @if($isPress)
                        <div class="cover-subtitle press">
                            PRESS CONFERENCE OMATIQ 2026 DAN TEMA TAHUNAN 2027
                        </div>
                    @else
                        <div class="cover-subtitle vip">
                            Grand Final OMATIQ &amp; Sholawat Senandung Islami
                            <span class="italic-accent">Bersama Haddad Alwi</span>
                        </div>
                    @endif

                    <div class="recipient-wrapper">
                        <div class="recipient-label {{ $isPress ? 'press' : 'vip' }}">Kepada Yang Terhormat</div>
                        <div class="recipient-card">
                            @if($isPress)
                                @if(filled($g->position) || filled($g->institution))
                                    <div class="recipient-primary">
                                        {{ $g->position ?: $g->institution }}
                                    </div>
                                    @if(filled($g->name))
                                        <div class="recipient-secondary">{{ $g->name }}</div>
                                    @endif
                                @else
                                    <div class="recipient-primary">{{ $g->name }}</div>
                                @endif
                            @else
                                <div class="recipient-primary">
                                    {{ $g->institution ?: $g->name }}
                                </div>
                                @if(filled($g->institution) && filled($g->name) && $g->name !== $g->institution)
                                    <div class="recipient-secondary">{{ $g->name }}</div>
                                @endif
                            @endif
                        </div>
                    </div>
                </div>
            </section>

            <!-- HALAMAN 2: KONTEN / DETAIL ACARA -->
            <section class="invitation-page" style="background-image: url('{{ $contentBg }}');">
                <div class="detail-content">
                    <header class="detail-header">
                        @if($isPress)
                            <h2 class="detail-title">
                                Press Conference Omatiq 2026 dan Tema Tahunan 2027
                            </h2>
                        @else
                            <h2 class="detail-title">
                                Grand Final OMATIQ &amp; Sholawat Senandung Islami<br>
                                Bersama Haddad Alwi
                            </h2>
                        @endif
                        <div class="detail-lead">akan dilaksanakan pada:</div>
                    </header>

                    <div class="detail-info-grid">
                        @if($isPress)
                            <div>
                                <div class="info-highlight">Senin</div>
                                <div class="info-sub">14 Desember 2026</div>
                            </div>
                            <div>
                                <div class="info-highlight">09.00 WIB</div>
                                <div class="info-sub">-Selesai</div>
                            </div>
                            <div>
                                <div class="info-highlight">Lobby<br>Abdurrahman Saleh RRI</div>
                                <div class="info-sub">Jl. Medan Merdeka Barat,<br>Kec. Gambir, Jakarta Pusat</div>
                            </div>
                        @else
                            <div>
                                <div class="info-highlight">Rabu</div>
                                <div class="info-sub">16 Desember 2026</div>
                            </div>
                            <div>
                                <div class="info-highlight">13.00 WIB</div>
                                <div class="info-sub">-Selesai</div>
                            </div>
                            <div>
                                <div class="info-highlight">Auditorium<br>Abdurrahman Saleh RRI</div>
                                <div class="info-sub">Jl. Medan Merdeka Barat,<br>Kec. Gambir, Jakarta Pusat</div>
                            </div>
                        @endif
                    </div>

                    <footer class="detail-bottom-grid">
                        <div class="rundown-box">
                            <div class="rundown-title">Rangkaian Acara:</div>
                            @if($isPress)
                                <ul class="rundown-list">
                                    <li>Registrasi (09.00 - 10.00)</li>
                                    <li>Press Conference OMATIQ 2026 (10.00 - 11.30)</li>
                                    <li>Ishoma (11.30 - 12.30)</li>
                                    <li>Press Conference Tema Tahunan 2027 (12.30 - 14.00)</li>
                                </ul>
                            @else
                                <ul class="rundown-list">
                                    <li>Pembukaan &amp; Sambutan (08.00-09.00 WIB)</li>
                                    <li>Grand Final Al-Qur'an (09.00-11.00 WIB)</li>
                                    <li>Grand Final Matematika (11.00-12.30 WIB)</li>
                                    <li>Sholawat dan Senandung Islami bersama Haddad Alwi (13.30-14.30 WIB)</li>
                                    <li>Pengumuman Pemenang (14.30-15.00 WIB)</li>
                                </ul>
                            @endif
                        </div>

                        <div>
                            <div class="qr-card">
                                <div class="qr-caption">
                                    mohon berkenan scan<br>untuk konfirmasi kehadiran
                                </div>
                                <div class="qr-svg-box">
                                    {!! $qrSvg !!}
                                </div>
                            </div>
                        </div>

                        <div class="signature-box">
                            <div class="sig-greeting">Hormat kami,</div>
                            <div class="sig-name">M. Faqih Qodril Akbar</div>
                            <div class="sig-role">Ketua Acara OMATIQ</div>
                        </div>
                    </footer>
                </div>
            </section>
        @endforeach
    </main>

</body>
</html>
