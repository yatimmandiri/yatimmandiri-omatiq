<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Pass-Pendamping-OMATIQ-{{ $chaperone->name }}</title>
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
            background-color: #0e221f;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(29, 106, 96, 0.45) 0%, transparent 65%),
                radial-gradient(#207267 0.8px, transparent 0.8px);
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
            background: rgba(18, 58, 52, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 10px 16px;
            border-radius: 14px;
            border: 1px solid rgba(229, 190, 30, 0.45);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
        }

        .toolbar-title {
            font-weight: 800;
            font-size: 13px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-print {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 800;
            text-decoration: none;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #FFE600 0%, #E5BE1E 100%);
            color: #081d1a;
            box-shadow: 0 3px 12px rgba(229, 190, 30, 0.4);
            transition: all 0.2s ease;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #fff04b 0%, #eebd1c 100%);
            transform: translateY(-1px);
        }

        .badge-container {
            width: 100%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @endif

        .badge-wrapper {
            width: 100%;
            max-width: 380px;
            background: #ffffff;
            border-radius: 20px;
            border: 2.5px solid #17524A;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
            overflow: hidden;
            position: relative;
            margin: 0 auto;
        }

        /* Lanyard punch hole */
        .lanyard-slot {
            width: 46px;
            height: 9px;
            background: #e2e8f0;
            border: 1.5px solid #94a3b8;
            border-radius: 8px;
            margin: 10px auto 4px;
        }

        /* Header Pass */
        .pass-header {
            background: linear-gradient(135deg, #0f3933 0%, #17524A 55%, #1b685e 100%);
            color: #ffffff;
            padding: 14px 16px 12px;
            text-align: center;
            border-bottom: 3px solid #E5BE1E;
            position: relative;
        }

        .logo-img {
            max-height: 38px;
            width: auto;
            object-fit: contain;
            margin-bottom: 4px;
        }

        .pass-subtitle {
            font-size: 9px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #FFE600;
            font-weight: 800;
        }

        .pass-badge-pill {
            display: inline-block;
            background: #E5BE1E;
            color: #081d1a;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 4px 16px;
            border-radius: 20px;
            margin-top: 6px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        /* Body Pass */
        .pass-body {
            padding: 16px 18px 14px;
            background: #ffffff;
        }

        /* Photo & Basic Info Block */
        .profile-row {
            display: flex;
            gap: 14px;
            align-items: center;
            margin-bottom: 14px;
            padding-bottom: 12px;
            border-bottom: 1px dashed #cbd5e1;
        }

        .photo-box {
            width: 82px;
            height: 108px;
            border: 2px dashed #94a3b8;
            border-radius: 10px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 6px;
            flex-shrink: 0;
        }

        .photo-box-text {
            font-size: 8px;
            color: #64748b;
            font-weight: 700;
            line-height: 1.2;
            margin-top: 4px;
        }

        .profile-details {
            flex: 1;
            min-width: 0;
        }

        .official-id {
            font-size: 10px;
            font-family: monospace;
            font-weight: 800;
            color: #17524A;
            background: rgba(23, 82, 74, 0.08);
            padding: 2px 8px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 4px;
        }

        .official-name {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.25;
            margin-bottom: 4px;
        }

        .official-branch {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 800;
            color: #17524A;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 2px 10px;
            border-radius: 12px;
            margin-bottom: 4px;
        }

        .official-role {
            font-size: 11px;
            color: #475569;
            font-weight: 600;
        }

        /* Detail List */
        .info-table {
            width: 100%;
            font-size: 11px;
            margin-bottom: 12px;
        }

        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .info-label {
            color: #64748b;
            font-weight: 600;
            width: 90px;
        }

        .info-separator {
            width: 10px;
            color: #94a3b8;
        }

        .info-val {
            color: #0f172a;
            font-weight: 700;
        }

        /* Rombongan Peserta Section */
        .participant-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 12px;
        }

        .participant-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #17524A;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
        }

        .participant-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .participant-item {
            font-size: 10px;
            color: #1e293b;
            padding: 3px 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .participant-item:last-child {
            border-bottom: none;
        }

        .p-name {
            font-weight: 700;
        }

        .p-reg {
            font-family: monospace;
            font-size: 9px;
            color: #64748b;
        }

        /* Barcode & Validation Section */
        .verify-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #ffffff;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
        }

        .qr-wrapper {
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .barcode-col {
            flex: 1;
            text-align: right;
            padding-left: 10px;
        }

        .barcode-col svg {
            max-width: 140px;
            height: 24px;
        }

        .verify-hint {
            font-size: 8px;
            color: #64748b;
            font-weight: 600;
            margin-top: 2px;
        }

        /* Footer */
        .pass-footer {
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
            padding: 6px 12px;
            text-align: center;
            font-size: 8px;
            color: #64748b;
            font-weight: 600;
        }

        /* Print Specifics */
        @media print {
            body {
                background: none !important;
                padding: 0 !important;
            }

            .toolbar {
                display: none !important;
            }

            .badge-wrapper {
                box-shadow: none !important;
                border: 2px solid #17524A !important;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    @if(empty($isPdf))
    <div class="toolbar">
        <div class="toolbar-title">
            <span>Pass Official Babak Final Nasional</span>
        </div>
        <button class="btn-print" onclick="window.print()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Unduh / Cetak PDF</span>
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
                <div class="pass-subtitle">Olimpiade Matematika & Al-Qur'an</div>
                <div class="pass-badge-pill">OFFICIAL PENDAMPING</div>
            </div>

            <!-- Pass Body -->
            <div class="pass-body">
                <!-- Photo & Basic Info Block -->
                <div class="profile-row">
                    <div class="photo-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <span class="photo-box-text">Tempel Foto 3x4</span>
                    </div>

                    <div class="profile-details">
                        <div class="official-id">{{ $chaperoneIdFormatted }}</div>
                        <h2 class="official-name">{{ $chaperone->name }}</h2>
                        <div class="official-branch">
                            Cabang: {{ $chaperone->branch }}
                        </div>
                        <div class="official-role">
                            {{ $chaperone->position ?: ($chaperone->source_type === 'guru' ? 'Guru Pembimbing Cabang' : 'Staf Kantor Cabang') }}
                        </div>
                    </div>
                </div>

                <!-- Info Table -->
                <table class="info-table">
                    <tr>
                        <td class="info-label">NIK</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="font-family: monospace;">{{ $chaperone->nik }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">No. WhatsApp</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="font-family: monospace;">{{ $chaperone->phone }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Jenis Kelamin</td>
                        <td class="info-separator">:</td>
                        <td class="info-val">{{ $chaperone->gender === 'female' ? 'Perempuan' : 'Laki-laki' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Status Verifikasi</td>
                        <td class="info-separator">:</td>
                        <td class="info-val" style="color: #15803d;">RESMI / TERVERIFIKASI</td>
                    </tr>
                </table>

                <!-- Rombongan Peserta Section -->
                <div class="participant-section">
                    <div class="participant-title">
                        <span>Rombongan Peserta Dampingan</span>
                        <span>{{ count($chaperone->participants) }} Peserta</span>
                    </div>
                    @if(count($chaperone->participants) > 0)
                        <ul class="participant-list">
                            @foreach($chaperone->participants as $p)
                                <li class="participant-item">
                                    <span class="p-name">{{ $p->student?->full_name ?? '-' }}</span>
                                    <span class="p-reg">{{ $p->registration_number }}</span>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <div style="font-size: 9px; color: #94a3b8; font-style: italic;">
                            Seluruh kontingen dari Cabang {{ $chaperone->branch }}
                        </div>
                    @endif
                </div>

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
                        <div class="verify-hint">Scan QR kamera HP untuk cek rombongan & keaslian pass</div>
                        <div class="verify-hint" style="color: #17524A; font-weight: 700; margin-top: 3px;">
                            PANITIA PUSAT OMATIQ
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pass Footer -->
            <div class="pass-footer">
                Kartu tanda pengenal resmi pendamping Babak Final Nasional OMATIQ • Yatim Mandiri
            </div>
        </div>
    </div>
</body>
</html>
