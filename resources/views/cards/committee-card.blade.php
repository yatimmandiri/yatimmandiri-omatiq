<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Pass-Panitia-OMATIQ-{{ $committee->name }}</title>
    <link rel="icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" type="image/png">
    <link rel="shortcut icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}">
    <style>
        @page {
            size: a4 portrait;
            margin: 10mm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        @if(empty($isPdf))
        body {
            background-color: #0b1329;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.45) 0%, transparent 65%),
                radial-gradient(#1e3a8a 0.8px, transparent 0.8px);
            background-size: 100% 100%, 20px 20px;
            color: #1e293b;
            padding: 24px 15px 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        .toolbar {
            width: 100%;
            max-width: 400px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 10px 16px;
            border-radius: 14px;
            border: 1px solid rgba(245, 158, 11, 0.45);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        }

        .toolbar-title {
            font-weight: 800;
            font-size: 13px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .toolbar-title span {
            color: #fbbf24;
        }

        .btn-print {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #0f172a;
            border: none;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
            transition: all 0.2s ease;
        }

        .btn-print:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
        }
        @endif

        /* Card Container (Standard Event Badge Width: 88mm x ~138mm) */
        .badge-container {
            width: 88mm;
            min-height: 138mm;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1.5px solid #0f172a;
        }

        .badge-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        /* Lanyard Slot Guide */
        .lanyard-slot {
            position: absolute;
            top: 5mm;
            left: 50%;
            transform: translateX(-50%);
            width: 14mm;
            height: 3.2mm;
            border-radius: 3mm;
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.3);
            z-index: 10;
        }

        /* Header Navy */
        .pass-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: #ffffff;
            padding: 12mm 4mm 4mm;
            text-align: center;
            border-bottom: 3px solid #f59e0b;
            position: relative;
        }

        .logo-img {
            height: 28px;
            max-width: 160px;
            object-fit: contain;
            margin-bottom: 2px;
        }

        .pass-subtitle {
            font-size: 7.5px;
            font-weight: 700;
            letter-spacing: 1.2px;
            color: #cbd5e1;
            text-transform: uppercase;
        }

        .pass-badge-pill {
            display: inline-block;
            margin-top: 4px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #0f172a;
            font-size: 9.5px;
            font-weight: 900;
            letter-spacing: 1px;
            padding: 3px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        /* Pass Body */
        .pass-body {
            padding: 4mm 4mm;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            background: #ffffff;
        }

        /* Profile Block */
        .profile-row {
            display: flex;
            gap: 3.5mm;
            align-items: center;
            margin-bottom: 3.5mm;
        }

        .photo-box {
            width: 25mm;
            height: 33mm;
            border-radius: 8px;
            border: 2px solid #0f172a;
            background: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .photo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-box-text {
            font-size: 7.5px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            text-align: center;
            margin-top: 2px;
        }

        .profile-details {
            flex-grow: 1;
            overflow: hidden;
        }

        .official-id {
            display: inline-block;
            background: #0f172a;
            color: #fbbf24;
            font-family: monospace;
            font-weight: 800;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 6px;
            letter-spacing: 0.8px;
            margin-bottom: 3px;
        }

        .official-name {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.2;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .official-division {
            font-size: 9px;
            font-weight: 800;
            color: #d97706;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .official-role {
            font-size: 8.5px;
            font-weight: 700;
            color: #475569;
        }

        /* Info Table */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 3.5mm;
            background: #f8fafc;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }

        .info-table td {
            padding: 3px 5px;
            vertical-align: top;
        }

        .info-label {
            width: 25mm;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
        }

        .info-separator {
            width: 2mm;
            text-align: center;
            color: #94a3b8;
        }

        .info-val {
            font-weight: 800;
            color: #0f172a;
        }

        /* Access Zone Section */
        .zone-badge-box {
            background: #0f172a;
            color: #ffffff;
            border-radius: 8px;
            padding: 4px 6px;
            text-align: center;
            margin-bottom: 3.5mm;
            border: 1.5px solid #f59e0b;
        }

        .zone-label {
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #fbbf24;
            text-transform: uppercase;
        }

        .zone-title {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.8px;
            color: #ffffff;
            text-transform: uppercase;
        }

        /* Verification QR & Barcode Row */
        .verify-row {
            display: flex;
            align-items: center;
            gap: 3mm;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 3mm;
            margin-top: auto;
        }

        .qr-wrapper {
            width: 21mm;
            height: 21mm;
            background: #ffffff;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            flex-shrink: 0;
            padding: 1mm;
        }

        .barcode-col {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .verify-hint {
            font-size: 6.5px;
            color: #64748b;
            text-align: center;
            margin-top: 2px;
            font-weight: 600;
        }

        /* Pass Footer */
        .pass-footer {
            background: #0f172a;
            color: #94a3b8;
            font-size: 6.5px;
            font-weight: 700;
            text-align: center;
            padding: 2.5mm 3mm;
            border-top: 2px solid #f59e0b;
            letter-spacing: 0.5px;
        }

        @media print {
            body {
                background: none !important;
                padding: 0 !important;
            }

            .toolbar {
                display: none !important;
            }

            .badge-container {
                box-shadow: none !important;
                border: 1px solid #000000 !important;
                page-break-inside: avoid;
                margin: 0 auto;
            }
        }
    </style>
</head>
<body>
    @if(empty($isPdf))
    <div class="toolbar">
        <div class="toolbar-title">
            Pass Panitia <span>• {{ $committee->code }}</span>
        </div>
        <button onclick="window.print()" class="btn-print">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Cetak Kartu Pass
        </button>
    </div>
    @endif

    <div class="badge-container">
        <div class="badge-wrapper">
            <!-- Lanyard Slot -->
            <div class="lanyard-slot"></div>

            <!-- Pass Header -->
            <div class="pass-header">
                <img src="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" alt="Logo OMATIQ" class="logo-img">
                <div class="pass-subtitle">Olimpiade Matematika & Al-Qur'an 2026</div>
                <div class="pass-badge-pill">PANITIA PELAKSANA</div>
            </div>

            <!-- Pass Body -->
            <div class="pass-body">
                <!-- Profile Block -->
                <div class="profile-row">
                    <div class="photo-box">
                        @if($committee->photo_path)
                            <img src="{{ asset($committee->photo_url) }}" alt="{{ $committee->name }}" class="photo-img">
                        @else
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                            <span class="photo-box-text">Foto 3x4</span>
                        @endif
                    </div>

                    <div class="profile-details">
                        <div class="official-id">{{ $committee->code }}</div>
                        <h2 class="official-name">{{ $committee->name }}</h2>
                        <div class="official-division">
                            DIVISI {{ strtoupper($committee->division) }}
                        </div>
                        <div class="official-role">
                            {{ $committee->position ?: 'Panitia Pelaksana' }}
                        </div>
                    </div>
                </div>

                <!-- Access Zone -->
                <div class="zone-badge-box">
                    <div class="zone-label">Hak Akses Venue</div>
                    <div class="zone-title">{{ $committee->access_zone ?: 'ALL ACCESS' }}</div>
                </div>

                <!-- Info Table -->
                <table class="info-table">
                    @if($committee->phone)
                    <tr>
                        <td class="info-label">WhatsApp</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="font-family: monospace;">{{ $committee->phone }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-label">Jenis Kelamin</td>
                        <td class="info-separator">:</td>
                        <td class="info-val">{{ $committee->gender === 'female' ? 'Perempuan' : 'Laki-laki' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Tahun Acara</td>
                        <td class="info-separator">:</td>
                        <td class="info-val">{{ $committee->event_year }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Status Keanggotaan</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="color: #15803d;">RESMI / AKTIF</td>
                    </tr>
                </table>

                <!-- Verification QR & Barcode -->
                <div class="verify-row">
                    <div class="qr-wrapper">
                        @if(!empty($verifyUrl))
                            <a href="{{ $verifyUrl }}" target="_blank" rel="noopener noreferrer" title="Buka Halaman Verifikasi Resmi" style="display: block; text-decoration: none;">
                                {!! $qrCodeSvg !!}
                            </a>
                        @else
                            {!! $qrCodeSvg !!}
                        @endif
                    </div>
                    <div class="barcode-col">
                        {!! $barcodeSvg !!}
                        <div class="verify-hint">Scan QR kamera HP untuk validasi hak akses venue</div>
                        <div class="verify-hint" style="color: #0f172a; font-weight: 800; margin-top: 3px;">
                            PANITIA PUSAT OMATIQ
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pass Footer -->
            <div class="pass-footer">
                Kartu tanda pengenal resmi panitia Babak Final Nasional OMATIQ • Yatim Mandiri
            </div>
        </div>
    </div>
</body>
</html>
