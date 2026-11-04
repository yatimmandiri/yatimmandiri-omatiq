<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Pass-Undangan-OMATIQ-{{ $guest->name }}</title>
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
            background-color: #0f172a;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.35) 0%, transparent 65%),
                radial-gradient(#b45309 0.8px, transparent 0.8px);
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
            background: rgba(17, 24, 39, 0.92);
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
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
            position: relative;
            display: flex;
            flex-direction: column;
            border: 2px solid #b45309;
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
            background: #111827;
            border: 1px solid rgba(245, 158, 11, 0.4);
            z-index: 10;
        }

        /* Header Obsidian & Gold */
        .pass-header {
            background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
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
            padding: 3px 14px;
            border-radius: 20px;
            text-transform: uppercase;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        /* Pass Body */
        .pass-body {
            padding: 4.5mm 4mm;
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
            border: 2px solid #b45309;
            background: #fffbeb;
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
            color: #b45309;
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
            background: #111827;
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
            color: #111827;
            line-height: 1.2;
            margin-bottom: 3px;
            text-transform: uppercase;
        }

        .official-institution {
            font-size: 9px;
            font-weight: 800;
            color: #b45309;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .official-position {
            font-size: 8.5px;
            font-weight: 700;
            color: #475569;
        }

        /* Table Allocation Section */
        .seating-box {
            background: linear-gradient(135deg, #111827, #1f2937);
            color: #ffffff;
            border-radius: 8px;
            padding: 4px 6px;
            text-align: center;
            margin-bottom: 3.5mm;
            border: 1.5px solid #f59e0b;
        }

        .seating-label {
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #fbbf24;
            text-transform: uppercase;
        }

        .seating-title {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.8px;
            color: #ffffff;
            text-transform: uppercase;
        }

        /* Info Table */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 3.5mm;
            background: #fffbeb;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #fef3c7;
        }

        .info-table td {
            padding: 3px 5px;
            vertical-align: top;
        }

        .info-label {
            width: 25mm;
            font-weight: 700;
            color: #92400e;
            text-transform: uppercase;
        }

        .info-separator {
            width: 2mm;
            text-align: center;
            color: #b45309;
        }

        .info-val {
            font-weight: 800;
            color: #111827;
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
            background: #111827;
            color: #fbbf24;
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
            Pass Tamu Kehormatan <span>• {{ $guest->code }}</span>
        </div>
        <button onclick="window.print()" class="btn-print">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Cetak Kartu Undangan
        </button>
    </div>
    @endif

    <div class="badge-container">
        <div class="badge-wrapper">
            <!-- Lanyard Slot -->
            <div class="lanyard-slot"></div>

            <!-- Pass Header -->
            <div class="pass-header">
                <img src="{{ asset('assets/images/LOGO OMATIQ WHITE.png') }}" alt="Logo OMATIQ" class="logo-img">
                <div class="pass-subtitle">Olimpiade Matematika & Al-Qur'an 2026</div>
                <div class="pass-badge-pill">TAMU UNDANGAN ({{ strtoupper($guest->category) }})</div>
            </div>

            <!-- Pass Body -->
            <div class="pass-body">
                <!-- Profile Block -->
                <div class="profile-row">
                    <div class="photo-box">
                        @if($guest->photo_path)
                            <img src="{{ asset($guest->photo_url) }}" alt="{{ $guest->name }}" class="photo-img">
                        @else
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2">
                                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                            </svg>
                            <span class="photo-box-text">VIP GUEST</span>
                        @endif
                    </div>

                    <div class="profile-details">
                        <div class="official-id">{{ $guest->code }}</div>
                        <h2 class="official-name">{{ $guest->name }}</h2>
                        <div class="official-institution">
                            {{ $guest->institution ?: 'Tamu Kehormatan OMATIQ' }}
                        </div>
                        <div class="official-position">
                            {{ $guest->position ?: 'Undangan Khusus' }}
                        </div>
                    </div>
                </div>

                <!-- Table Allocation -->
                <div class="seating-box">
                    <div class="seating-label">Alokasi Tempat Duduk / Meja</div>
                    <div class="seating-title">{{ strtoupper($guest->table_number ?: 'AREA KURSI KEHORMATAN (VIP)') }}</div>
                </div>

                <!-- Info Table -->
                <table class="info-table">
                    <tr>
                        <td class="info-label">Kategori Tamu</td>
                        <td class="info-separator">:</td>
                        <td class="info-val">{{ strtoupper($guest->category) }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Kapasitas Kursi</td>
                        <td class="info-separator">:</td>
                        <td class="info-val">{{ $guest->seat_count }} Orang (Pax)</td>
                    </tr>
                    @if($guest->phone)
                    <tr>
                        <td class="info-label">No. Telepon / WA</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="font-family: monospace;">{{ $guest->phone }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-label">Status Kehadiran</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="color: #b45309;">TERKONFIRMASI</td>
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
                        <div class="verify-hint">Scan QR kamera HP untuk identifikasi & penyambutan tamu</div>
                        <div class="verify-hint" style="color: #111827; font-weight: 800; margin-top: 3px;">
                            PANITIA PUSAT OMATIQ
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pass Footer -->
            <div class="pass-footer">
                Kartu tanda kehormatan resmi Babak Final Nasional OMATIQ • Yatim Mandiri
            </div>
        </div>
    </div>
</body>
</html>
