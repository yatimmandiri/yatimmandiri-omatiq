<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Peserta-OMATIQ-{{ $participant->registration_number }}</title>
    <link rel="icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" type="image/png">
    <link rel="shortcut icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}">
    @if(empty($isPdf))
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
    @endif
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 12mm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            background: linear-gradient(135deg, #e6f9f5 0%, #f0fdf9 40%, #e0f6f0 100%);
            color: #09767a;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px 48px;
        }

        /* Ambient Glass Toolbar */
        .toolbar {
            width: 100%;
            max-width: 820px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            padding: 12px 20px;
            border-radius: 16px;
            border: 1px solid rgba(9, 118, 122, 0.2);
            box-shadow: 0 10px 30px rgba(9, 118, 122, 0.08);
            gap: 12px;
            flex-wrap: wrap;
        }

        .toolbar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toolbar-brand img {
            height: 28px;
            width: auto;
        }

        .toolbar-title {
            font-weight: 800;
            font-size: 14px;
            color: #09767a;
            letter-spacing: -0.2px;
        }

        .toolbar-subtitle {
            font-size: 11px;
            color: #528989;
            font-weight: 600;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-mode {
            padding: 7px 13px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid rgba(9, 118, 122, 0.25);
            background: #ffffff;
            color: #09767a;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .btn-mode.active, .btn-mode:hover {
            background: #09767a;
            color: #ffffff;
            border-color: #09767a;
        }

        .btn-print {
            padding: 8px 18px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 800;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #09767a 0%, #0d9488 100%);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(9, 118, 122, 0.3);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #075e61 0%, #0f766e 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(9, 118, 122, 0.35);
        }

        /* Status Notice Banner */
        .status-banner {
            width: 100%;
            max-width: 820px;
            margin-bottom: 20px;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .status-banner.verified {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #065f46;
        }

        .status-banner.pending {
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.35);
            color: #92400e;
        }

        /* Cards Layout Container */
        .cards-stage {
            width: 100%;
            max-width: 820px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .print-sheet {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0;
            background: #ffffff;
            padding: 18px;
            border-radius: 20px;
            box-shadow: 0 16px 45px rgba(9, 118, 122, 0.12);
            border: 1.5px dashed #cbd5e1;
            position: relative;
        }

        /* Cut & Fold Line Guides */
        .fold-divider {
            width: 2px;
            height: 590px;
            border-left: 2px dashed #94a3b8;
            position: relative;
            margin: 0 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .fold-label {
            position: absolute;
            background: #f8fafc;
            border: 1px dashed #94a3b8;
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
            white-space: nowrap;
            transform: rotate(-90deg);
            letter-spacing: 0.5px;
        }

        /* Base Card Styling (Screen 372px x 590px -> 1:1.587 ratio) */
        .omatiq-card {
            width: 372px;
            height: 590px;
            position: relative;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: center;
            flex-shrink: 0;
        }

        /* Front & Back Background Templates */
        .card-front {
            background-image: url("{{ asset('assets/images/cards/card-bg-front.png') }}");
        }

        .card-back {
            background-image: url("{{ asset('assets/images/cards/card-bg-back.png') }}");
        }

        /* Front: Unverified Warning Badge Overlay (only when unverified) */
        .badge-unverified-overlay {
            position: absolute;
            top: 15.2%;
            left: 50%;
            transform: translateX(-50%);
            width: 91.2%;
            padding: 6.5px 10px;
            border-radius: 20px;
            background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
            border: 1.5px solid #fed7aa;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: 900;
            letter-spacing: 0.4px;
            text-align: center;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3);
            z-index: 6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Front: Inner Data Box */
        .front-data-box {
            position: absolute;
            top: 54.0%;
            left: 50%;
            transform: translateX(-50%);
            width: 88.0%;
            height: 27.5%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 6px 12px;
            text-align: left;
        }

        .participant-name {
            font-size: 19px;
            font-weight: 900;
            color: #09767a;
            letter-spacing: -0.3px;
            line-height: 1.15;
            text-transform: capitalize;
            text-align: center;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .bib-row {
            font-size: 10px;
            font-weight: 800;
            color: #09767a;
            letter-spacing: 0.3px;
            text-align: center;
            margin-bottom: 6px;
            font-family: 'Courier New', Courier, monospace;
        }

        .data-divider {
            width: 100%;
            height: 1px;
            background: rgba(9, 118, 122, 0.25);
            margin-bottom: 7px;
        }

        .credentials-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            line-height: 1.35;
            color: #09767a;
            font-weight: 600;
        }

        .credentials-table td {
            padding: 1.5px 0;
            vertical-align: top;
        }

        .credentials-table td.col-lbl {
            width: 92px;
            font-weight: 700;
            color: #09767a;
            white-space: nowrap;
        }

        .credentials-table td.col-sep {
            width: 10px;
            text-align: center;
            font-weight: 700;
            color: #09767a;
        }

        .credentials-table td.col-val {
            font-weight: 700;
            color: #075e61;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
        }

        /* Front: Bottom Sponsor Bar */
        .front-sponsors-bar {
            position: absolute;
            top: 87.2%;
            left: 50%;
            transform: translateX(-50%);
            width: 88.0%;
            height: 7.5%;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }

        .sponsor-logos-grid {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
        }

        .sponsor-logos-grid img {
            max-height: 15px;
            max-width: 34px;
            width: auto;
            object-fit: contain;
            filter: contrast(1.05);
        }

        /* Back: QR Code Center Container */
        .back-qr-box {
            position: absolute;
            top: 36.1%;
            left: 50%;
            transform: translateX(-50%);
            width: 56.8%;
            height: 32.1%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px;
            overflow: hidden;
        }

        .qr-svg-wrapper {
            width: 100%;
            height: 100%;
            max-width: 165px;
            max-height: 165px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .qr-svg-wrapper svg {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }

        /* Unverified Security Lock & Watermark Over QR */
        .qr-lock-container {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            text-align: center;
            z-index: 10;
        }

        .qr-void-banner {
            position: absolute;
            top: 18px;
            left: -25px;
            right: -25px;
            background: #dc2626;
            color: #ffffff;
            font-size: 8px;
            font-weight: 900;
            padding: 3px 0;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            transform: rotate(-12deg);
            box-shadow: 0 2px 6px rgba(220, 38, 38, 0.4);
            white-space: nowrap;
        }

        .lock-badge-icon {
            font-size: 26px;
            margin-bottom: 2px;
            color: #b45309;
        }

        .lock-badge-title {
            font-size: 11px;
            font-weight: 900;
            color: #b45309;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }

        .lock-badge-subtitle {
            font-size: 7.5px;
            font-weight: 700;
            color: #64748b;
            line-height: 1.2;
            margin-top: 2px;
            max-width: 140px;
        }

        /* Print Instruction Note */
        .print-instruction-note {
            margin-top: 16px;
            font-size: 11.5px;
            color: #475569;
            text-align: center;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
        }

        /* ================= PRINT STYLES ================= */
        @media print {
            body {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                min-height: auto !important;
                display: block !important;
            }

            .toolbar, .status-banner, .print-instruction-note {
                display: none !important;
            }

            .cards-stage {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .print-sheet {
                padding: 0 !important;
                margin: 0 auto !important;
                border: 1px dashed #94a3b8 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background: #ffffff !important;
                width: 172mm !important;
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                align-items: center !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .fold-divider {
                width: 0 !important;
                height: 136.5mm !important;
                border-left: 1px dashed #64748b !important;
                margin: 0 !important;
            }

            .fold-label {
                font-size: 5.5pt !important;
                padding: 2px 4px !important;
            }

            /* Exact Standard Event Lanyard Size: 86mm x 136.5mm */
            .omatiq-card {
                width: 86mm !important;
                height: 136.5mm !important;
                border-radius: 4mm !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .badge-unverified-overlay {
                width: 78.4mm !important;
                top: 20.5mm !important;
                font-size: 6.5pt !important;
                padding: 1.5mm 2.5mm !important;
            }

            .front-data-box {
                width: 75.7mm !important;
                top: 73.7mm !important;
                height: 37.5mm !important;
                padding: 1.5mm 3mm !important;
            }

            .front-sponsors-bar {
                width: 75.7mm !important;
                top: 119mm !important;
                height: 10mm !important;
            }

            .back-qr-box {
                width: 48.8mm !important;
                height: 43.8mm !important;
                top: 49.2mm !important;
                padding: 2mm !important;
            }

            .participant-name {
                font-size: 11pt !important;
                margin-bottom: 1.5pt !important;
            }

            .bib-row {
                font-size: 6.5pt !important;
                margin-bottom: 3.5pt !important;
            }

            .credentials-table {
                font-size: 6.2pt !important;
                line-height: 1.3 !important;
            }

            .credentials-table td.col-lbl {
                width: 22mm !important;
            }

            .credentials-table td.col-val {
                max-width: 42mm !important;
            }

            .sponsor-logos-grid img {
                max-height: 3.5mm !important;
                max-width: 8mm !important;
            }

            .qr-svg-wrapper {
                max-width: 38mm !important;
                max-height: 38mm !important;
            }

            /* Duplex Mode Print Handling */
            body.duplex-mode .print-sheet {
                border: none !important;
                width: 100% !important;
                flex-direction: column !important;
            }

            body.duplex-mode .fold-divider {
                display: none !important;
            }

            body.duplex-mode .omatiq-card {
                margin: 0 auto !important;
            }

            body.duplex-mode .card-back {
                page-break-before: always !important;
                break-before: page !important;
                margin-top: 10mm !important;
            }
        }
    </style>
</head>
<body>

    @if(empty($isPdf))
    <!-- Floating Ambient Toolbar -->
    <div class="toolbar">
        <div class="toolbar-brand">
            <img src="{{ asset('assets/images/icon-omatiq.png') }}" alt="OMATIQ 2026">
            <div>
                <div class="toolbar-title">OMATIQ 2026 &bull; Kartu Tanda Peserta {{ !empty($isNational) ? '(Babak Final Nasional)' : '' }}</div>
                <div class="toolbar-subtitle">{{ $participant->registration_number }} &bull; {{ $student->full_name ?? $participant->user?->name ?? 'Peserta' }}</div>
            </div>
        </div>

        <div class="toolbar-actions">
            <button type="button" class="btn-mode active" id="btnFoldMode" onclick="setPrintMode('fold')" title="Cetak Depan-Belakang berdampingan di 1 lembar A4 untuk dilipat">
                <span>📄 Mode Lipat A4 (1 Lembar)</span>
            </button>
            <button type="button" class="btn-mode" id="btnDuplexMode" onclick="setPrintMode('duplex')" title="Cetak bolak-balik printer duplex (2 halaman)">
                <span>📑 Mode 2 Halaman</span>
            </button>
            <button type="button" class="btn-print" onclick="window.print()" title="Unduh / Cetak sebagai PDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Unduh / Cetak PDF</span>
            </button>
        </div>
    </div>

    <!-- Status Banner Notice -->
    @if(empty($isVerified))
        <div class="status-banner pending">
            <div>
                <strong>&#9203; BUKTI PENDAFTARAN SEMENTARA</strong> &mdash; Pendaftaran sedang menunggu verifikasi admin/panitia pusat.
            </div>
            <div>STATUS: MENUNGGU VERIFIKASI ADMIN</div>
        </div>
    @else
        <div class="status-banner verified">
            <div>
                <strong>&#10003; KARTU RESMI TERVERIFIKASI</strong> &mdash; Akses resmi kompetisi OMATIQ 2026 {{ !empty($isNational) ? 'Babak Final Nasional' : '' }} aktif.
            </div>
            <div>STATUS: TERVERIFIKASI</div>
        </div>
    @endif
    @endif

    <!-- Cards Container Stage -->
    <div class="cards-stage">
        <div class="print-sheet" id="printSheet">
            
            <!-- SISI DEPAN (FRONT CARD) -->
            <div class="omatiq-card card-front">
                <!-- Warning Badge: Hanya ditampilkan jika peserta belum terverifikasi -->
                @if(empty($isVerified))
                <div class="badge-unverified-overlay">
                    {{ !empty($isNational) ? 'FINALIS NASIONAL • MENUNGGU VERIFIKASI' : 'BUKTI PENDAFTARAN SEMENTARA' }}
                </div>
                @endif

                <!-- Inner Data Container -->
                <div class="front-data-box">
                    <div class="participant-name" title="{{ $student->full_name ?? $participant->user?->name ?? '-' }}">
                        {{ ucwords(strtolower($student->full_name ?? $participant->user?->name ?? '-')) }}
                    </div>
                    <div class="bib-row">
                        REGISTRATION / BIB: {{ $participant->registration_number }}
                    </div>
                    <div class="data-divider"></div>
                    <table class="credentials-table">
                        <tr>
                            <td class="col-lbl">Asal Sekolah</td>
                            <td class="col-sep">:</td>
                            <td class="col-val">{{ $student->school_name ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="col-lbl">Jenjang &amp; Kelas</td>
                            <td class="col-sep">:</td>
                            <td class="col-val">{{ $student->school_level ?? 'SD/MI' }} - Kelas {{ $student->grade ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="col-lbl">Cabang / Wilayah</td>
                            <td class="col-sep">:</td>
                            <td class="col-val">{{ $participant->branch ?? $student->regency?->name ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="col-lbl">Orang Tua / Wali</td>
                            <td class="col-sep">:</td>
                            <td class="col-val">{{ $participant->guardian_signature_name ?? $student->guardian_signature_name ?? $student->parent_name ?? '-' }}</td>
                        </tr>
                    </table>
                </div>

                <!-- Bottom Sponsor Bar -->
                <div class="front-sponsors-bar">
                    <div class="sponsor-logos-grid">
                        @foreach($sponsors as $sp)
                            <img src="{{ asset('assets/images/sponsor/' . $sp['file']) }}" alt="{{ $sp['name'] }}" title="{{ $sp['name'] }}">
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- FOLD GUIDE LINE -->
            <div class="fold-divider">
                <span class="fold-label">✂ Garis Lipat Tengah (Fold Line)</span>
            </div>

            <!-- SISI BELAKANG (BACK CARD) -->
            <div class="omatiq-card card-back">
                <!-- Center QR Code Scanner -->
                <div class="back-qr-box">
                    <div class="qr-svg-wrapper">
                        {!! $qrCodeSvg !!}

                        @if(empty($isVerified))
                        <!-- Security Watermark & Lock Overlay to Prevent Scanning When Unverified -->
                        <div class="qr-lock-container">
                            <div class="qr-void-banner">⛔ BELUM TERVERIFIKASI ⛔</div>
                            <div class="lock-badge-icon">🔒</div>
                            <div class="lock-badge-title">SCAN TERKUNCI</div>
                            <div class="lock-badge-subtitle">Barcode otomatis aktif setelah pendaftaran diverifikasi admin</div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>

        </div>

        @if(empty($isPdf))
        <div class="print-instruction-note">
            <span>💡</span>
            <span><strong>Panduan Cetak:</strong> Pada pengaturan printer, pilih ukuran kertas <strong>A4</strong>, skala <strong>100% (Default)</strong>, dan centang <strong>"Background graphics"</strong> untuk hasil cetak maksimal.</span>
        </div>
        @endif
    </div>

    <script>
        function setPrintMode(mode) {
            const btnFold = document.getElementById('btnFoldMode');
            const btnDuplex = document.getElementById('btnDuplexMode');
            
            if (mode === 'duplex') {
                document.body.classList.add('duplex-mode');
                btnDuplex.classList.add('active');
                btnFold.classList.remove('active');
            } else {
                document.body.classList.remove('duplex-mode');
                btnFold.classList.add('active');
                btnDuplex.classList.remove('active');
            }
        }
    </script>
</body>
</html>
