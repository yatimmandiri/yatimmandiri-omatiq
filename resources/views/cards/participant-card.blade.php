<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Peserta-OMATIQ-{{ $participant->registration_number }}</title>
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
            max-width: 380px;
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
            max-width: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .badge-wrapper {
            width: 100%;
            background: #ffffff;
            border-radius: 24px;
            border: 2.5px solid #17524A;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(229, 190, 30, 0.35);
            overflow: hidden;
            position: relative;
        }

        .print-guide {
            display: none;
        }
        @else
        body {
            background: #ffffff;
            color: #1e293b;
            padding: 0;
            margin: 0;
        }

        .toolbar {
            display: none;
        }

        .badge-container {
            width: 100%;
        }

        .badge-wrapper {
            width: 100%;
            background: #ffffff;
            border-radius: 18px;
            border: 2px solid #17524A;
            overflow: hidden;
        }

        .print-guide {
            display: none;
        }
        @endif

        /* Top Lanyard Punch Slot Simulation */
        .lanyard-bar {
            background: linear-gradient(180deg, #10423a 0%, #17524A 100%);
            padding: 10px 0 5px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .lanyard-slot {
            display: inline-block;
            width: 42px;
            height: 5px;
            background-color: #0b322c;
            border: 1.5px solid rgba(229, 190, 30, 0.85);
            border-radius: 5px;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        /* Event Header Banner */
        .badge-header {
            background: linear-gradient(135deg, #134e45 0%, #17524A 35%, #1d6e63 70%, #258a7c 100%);
            color: #ffffff;
            padding: 15px 16px 13px;
            text-align: center;
            position: relative;
            border-bottom: 3.5px solid #E5BE1E;
            box-shadow: inset 0 -4px 12px rgba(0, 0, 0, 0.08);
        }

        .header-logo-wrap {
            margin-bottom: 5px;
        }

        .header-logo-img {
            height: 28px;
            width: auto;
            max-width: 160px;
            object-fit: contain;
            display: inline-block;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .event-tagline {
            font-size: 8.5px;
            font-weight: 800;
            color: #FFE600;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            margin-bottom: 2px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        }

        .event-title {
            font-size: 22px;
            font-weight: 950;
            letter-spacing: 0.8px;
            color: #ffffff;
            line-height: 1.1;
            text-transform: uppercase;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .event-edition-pill {
            display: inline-block;
            background: linear-gradient(135deg, #FFE600 0%, #E5BE1E 100%);
            color: #06221d;
            font-size: 8.5px;
            font-weight: 900;
            padding: 2.5px 8px;
            border-radius: 5px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-top: 4px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        .event-org {
            font-size: 9.5px;
            color: #d1fae5;
            font-weight: 700;
            margin-top: 4px;
            letter-spacing: 0.4px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* Hero Access Tier Ribbon */
        .access-tier-ribbon {
            background: linear-gradient(90deg, #134e45 0%, #17524A 50%, #134e45 100%);
            color: #ffffff;
            padding: 6px 12px;
            text-align: center;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            border-bottom: 1.5px solid rgba(229, 190, 30, 0.5);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        /* Hero Section (Avatar + Big Name + Big BIB) */
        .badge-hero {
            padding: 14px 16px 10px;
            text-align: center;
            background: radial-gradient(circle at 50% 30%, #f0fdf4 0%, #ffffff 70%);
            border-bottom: 1.5px dashed #cbd5e1;
        }

        .avatar-wrap {
            position: relative;
            display: inline-block;
            margin-bottom: 8px;
        }

        .avatar-frame {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            border: 2.5px solid #17524A;
            background-color: #f8fafc;
            overflow: hidden;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(23, 82, 74, 0.2), 0 0 0 2.5px rgba(229, 190, 30, 0.6);
            text-align: center;
        }

        .avatar-img {
            width: 84px;
            height: 84px;
            object-fit: cover;
            border-radius: 50%;
        }

        .avatar-empty {
            padding-top: 18px;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 800;
            line-height: 1.2;
        }

        .role-chip-tag {
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #17524A 0%, #1f6b61 100%);
            color: #FFE600;
            font-size: 8px;
            font-weight: 900;
            padding: 2.5px 9px;
            border-radius: 10px;
            border: 1px solid #FFE600;
            white-space: nowrap;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        /* Participant Name */
        .participant-name-title {
            font-size: 15px;
            font-weight: 900;
            color: #0d3832;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            line-height: 1.2;
            margin-top: 8px;
            margin-bottom: 6px;
        }

        /* BIB / Registration Number Box */
        .bib-container {
            background: linear-gradient(135deg, #103c35 0%, #17524A 100%);
            border: 1.5px solid #FFE600;
            border-radius: 10px;
            padding: 5px 12px;
            display: inline-block;
            box-shadow: 0 3px 10px rgba(23, 82, 74, 0.25);
            margin-bottom: 8px;
        }

        .bib-label {
            font-size: 7.5px;
            font-weight: 800;
            color: #a7f3d0;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: block;
        }

        .bib-number {
            font-size: 15px;
            font-weight: 950;
            color: #FFE600;
            font-family: 'Courier New', Courier, monospace;
            letter-spacing: 1.2px;
            line-height: 1.1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* Competition Division Banner */
        .competition-pill {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            color: #78350f;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 9.5px;
            font-weight: 900;
            letter-spacing: 0.4px;
            display: inline-block;
            text-transform: uppercase;
        }

        /* Credentials Metadata Grid */
        .badge-meta-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #ffffff;
            font-size: 9.5px;
        }

        .meta-row td {
            padding: 3.5px 16px;
            vertical-align: top;
        }

        .meta-lbl {
            width: 95px;
            color: #64748b;
            font-weight: 800;
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .meta-cln {
            width: 8px;
            color: #94a3b8;
            font-weight: 700;
            text-align: center;
        }

        .meta-val {
            color: #0f172a;
            font-weight: 800;
            font-size: 9.5px;
        }

        /* Rapid Checkpoint Barcode & QR Access Section */
        .badge-scan-section {
            background-color: #f8fafc;
            border-top: 1.5px dashed #cbd5e1;
            padding: 10px 14px 8px;
            text-align: center;
        }

        .scan-table {
            width: 100%;
            border-collapse: collapse;
        }

        .scan-qr-td {
            width: 75px;
            vertical-align: middle;
            text-align: center;
        }

        .scan-barcode-td {
            vertical-align: middle;
            text-align: center;
            padding-left: 10px;
        }

        .qr-box-pass {
            display: inline-block;
            background: #ffffff;
            padding: 4px;
            border-radius: 8px;
            border: 1.2px solid #17524A;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        }

        .barcode-wrap-pass {
            width: 100%;
            text-align: center;
        }

        .barcode-code-pass {
            font-size: 7.5px;
            font-family: 'Courier New', monospace;
            font-weight: 800;
            color: #17524A;
            margin-top: 1px;
        }

        .status-chip-event {
            margin-top: 4px;
            display: inline-block;
            background: linear-gradient(135deg, #17524A 0%, #1f6b61 100%);
            color: #ffffff;
            font-size: 8px;
            font-weight: 900;
            padding: 2.5px 10px;
            border-radius: 10px;
            border: 1px solid #E5BE1E;
            letter-spacing: 0.6px;
            text-transform: uppercase;
        }

        /* Hologram / Security Footer Strip */
        .badge-footer {
            background: linear-gradient(180deg, #12433c 0%, #0c332d 100%);
            color: #e2e8f0;
            padding: 8px 14px;
            border-top: 2px solid #E5BE1E;
            text-align: center;
            font-size: 7.5px;
            line-height: 1.35;
        }

        .footer-stamp-text {
            color: #FFE600;
            font-weight: 900;
            letter-spacing: 0.8px;
            font-size: 8.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        /* PRINT STYLESHEET (Scaled to ~1/3 of A4 page) */
        @media print {
            html, body {
                background: none !important;
                background-color: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: auto !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .toolbar {
                display: none !important;
            }

            .badge-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .badge-wrapper {
                width: 86mm !important;
                max-width: 86mm !important;
                border: 2px solid #17524A !important;
                border-radius: 14px !important;
                box-shadow: none !important;
                margin: 0 auto !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .print-guide {
                display: block !important;
                width: 86mm !important;
                margin: 6px auto 0 !important;
                text-align: center !important;
                font-size: 7pt !important;
                color: #64748b !important;
                font-style: italic !important;
            }

            .lanyard-bar {
                padding: 6px 0 4px !important;
            }

            .lanyard-slot {
                width: 34px !important;
                height: 4px !important;
            }

            .badge-header {
                padding: 8px 10px 7px !important;
                border-bottom: 2.5px solid #E5BE1E !important;
            }

            .header-logo-wrap {
                margin-bottom: 2px !important;
            }

            .header-logo-img {
                height: 18px !important;
                max-width: 100px !important;
                margin-bottom: 1px !important;
            }

            .event-tagline {
                font-size: 6.5pt !important;
                letter-spacing: 1px !important;
            }

            .event-title {
                font-size: 14pt !important;
            }

            .event-edition-pill {
                font-size: 6.5pt !important;
                padding: 1px 5px !important;
            }

            .event-org {
                font-size: 6.5pt !important;
            }

            .access-tier-ribbon {
                font-size: 7.5pt !important;
                padding: 3px 8px !important;
            }

            .badge-hero {
                padding: 8px 10px 6px !important;
            }

            .avatar-wrap {
                margin-bottom: 4px !important;
            }

            .avatar-frame, .avatar-img {
                width: 58px !important;
                height: 58px !important;
                border-width: 2px !important;
            }

            .avatar-empty {
                padding-top: 10px !important;
                font-size: 7pt !important;
            }

            .role-chip-tag {
                font-size: 6.5pt !important;
                padding: 1.5px 6px !important;
                bottom: -4px !important;
            }

            .participant-name-title {
                font-size: 10.5pt !important;
                margin-top: 6px !important;
                margin-bottom: 4px !important;
            }

            .bib-container {
                padding: 3px 8px !important;
                margin-bottom: 5px !important;
                border-width: 1px !important;
            }

            .bib-label {
                font-size: 5.5pt !important;
            }

            .bib-number {
                font-size: 11pt !important;
                letter-spacing: 1px !important;
            }

            .competition-pill {
                font-size: 7.5pt !important;
                padding: 2px 8px !important;
            }

            .badge-meta-table {
                font-size: 7pt !important;
            }

            .meta-row td {
                padding: 2px 10px !important;
            }

            .meta-lbl {
                width: 75px !important;
                font-size: 6.5pt !important;
            }

            .meta-val {
                font-size: 7pt !important;
            }

            .badge-scan-section {
                padding: 6px 10px 5px !important;
            }

            .scan-qr-td {
                width: 55px !important;
            }

            .qr-box-pass {
                padding: 2px !important;
            }

            .qr-box-pass svg {
                width: 48px !important;
                height: 48px !important;
            }

            .barcode-wrap-pass svg {
                height: 20px !important;
            }

            .barcode-code-pass {
                font-size: 6pt !important;
            }

            .status-chip-event {
                font-size: 6pt !important;
                padding: 1.5px 6px !important;
                margin-top: 2px !important;
            }

            .badge-footer {
                padding: 5px 8px !important;
                font-size: 5.5pt !important;
                line-height: 1.2 !important;
            }

            .footer-stamp-text {
                font-size: 6pt !important;
            }
        }
    </style>
</head>
<body>

    @if(empty($isPdf))
    <!-- Floating Web Action Toolbar -->
    <div class="toolbar">
        <div class="toolbar-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E5BE1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>OMATIQ {{ $participant->event_year ?? 2026 }} Pass</span>
        </div>
        <div>
            <button class="btn-print" onclick="window.print()" title="Cetak langsung atau Simpan sebagai PDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Unduh / Cetak PDF</span>
            </button>
        </div>
    </div>
    @endif

    <!-- Official Event Lanyard Badge Container -->
    <div class="badge-container">
        <div class="badge-wrapper">
            <!-- Top Lanyard Slot -->
            <div class="lanyard-bar">
                <div class="lanyard-slot"></div>
            </div>

            <!-- Event Branding Header -->
            <div class="badge-header">
                <div class="header-logo-wrap">
                    <img src="{{ asset('assets/images/LOGO OMATIQ-Fav.png') }}" alt="OMATIQ" class="header-logo-img">
                </div>
                <div class="event-tagline">&bull; OFFICIAL PARTICIPANT CREDENTIAL &bull;</div>
                <div class="event-title">OMATIQ {{ $participant->event_year ?? 2026 }}</div>
                <div>
                    <span class="event-edition-pill">&#9889; AI &amp; Future Talent Edition</span>
                </div>
                <div class="event-org">Olimpiade Matematika &amp; Al-Qur'an &bull; Laznas Yatim Mandiri</div>
            </div>

            <!-- Access Category Ribbon -->
            <div class="access-tier-ribbon">
                OFFICIAL PASS &bull; <span>{{ $student?->is_binaan ? 'BINAAN SANGGAR' : 'PESERTA UMUM' }}</span>
            </div>

            <!-- Hero Section: Avatar, Big Name, BIB Number -->
            <div class="badge-hero">
                <div class="avatar-wrap">
                    <div class="avatar-frame">
                        @if(!empty($student->photo_url))
                            <img src="{{ $student->photo_url }}" alt="Foto Peserta" class="avatar-img">
                        @else
                            <div class="avatar-empty">
                                <div style="font-size: 20px; margin-bottom: 2px;">👤</div>
                                <div>PAS FOTO</div>
                                <div style="font-size: 7.5px; color: #94a3b8;">3 &times; 4 cm</div>
                            </div>
                        @endif
                    </div>
                    <span class="role-chip-tag">
                        {{ $student?->is_binaan ? 'Peserta Binaan' : 'Peserta Umum' }}
                    </span>
                </div>

                <!-- Participant Name -->
                <div class="participant-name-title">
                    {{ strtoupper($student->full_name ?? $participant->user?->name ?? '-') }}
                </div>

                <!-- Massive Marathon/Event BIB Code -->
                <div class="bib-container">
                    <span class="bib-label">REGISTRATION / BIB NO.</span>
                    <span class="bib-number">{{ $participant->registration_number }}</span>
                </div>

                <!-- Competition Category Banner -->
                <div>
                    <span class="competition-pill">
                        &#127942; {{ $participant->olimpiade?->name ?? 'OMATIQ' }}
                        @if($participant->olimpiade?->category)
                            ({{ $participant->olimpiade->category }})
                        @endif
                    </span>
                </div>
            </div>

            <!-- Credentials / Metadata Grid -->
            <table class="badge-meta-table">
                <tr class="meta-row">
                    <td class="meta-lbl">NIK / NIS</td>
                    <td class="meta-cln">:</td>
                    <td class="meta-val">
                        <span>{{ $student->nik ?? '-' }}</span>
                        @if(!empty($student->nis))
                            <span style="color: #64748b; font-weight: normal;"> / NIS: {{ $student->nis }}</span>
                        @endif
                    </td>
                </tr>
                <tr class="meta-row">
                    <td class="meta-lbl">Asal Sekolah</td>
                    <td class="meta-cln">:</td>
                    <td class="meta-val">{{ $student->school_name ?? '-' }}</td>
                </tr>
                <tr class="meta-row">
                    <td class="meta-lbl">Jenjang &amp; Kelas</td>
                    <td class="meta-cln">:</td>
                    <td class="meta-val">
                        {{ $student->school_level ?? 'SD/MI' }} &bull; Kelas {{ $student->grade ?? '-' }}
                    </td>
                </tr>
                <tr class="meta-row">
                    <td class="meta-lbl">Cabang / Wilayah</td>
                    <td class="meta-cln">:</td>
                    <td class="meta-val">
                        {{ $student->regency?->name ?? $participant->branch ?? $participant->penyaluran_sanggar_name ?? '-' }}
                    </td>
                </tr>
                <tr class="meta-row">
                    <td class="meta-lbl">Guru Pendamping</td>
                    <td class="meta-cln">:</td>
                    <td class="meta-val">
                        {{ $participant->mentor?->name ?? $student->mentor_name ?? '-' }}
                    </td>
                </tr>
            </table>

            <!-- Checkpoint Barcode & QR Access Scanning -->
            <div class="badge-scan-section">
                <table class="scan-table">
                    <tr>
                        <td class="scan-qr-td">
                            <div class="qr-box-pass">
                                {!! $qrCodeSvg !!}
                            </div>
                        </td>
                        <td class="scan-barcode-td">
                            <div class="barcode-wrap-pass">
                                {!! $barcodeSvg !!}
                                <div class="barcode-code-pass">{{ $participant->registration_number }}</div>
                            </div>
                            <div>
                                <span class="status-chip-event">
                                    &#10003; TERVERIFIKASI &bull; ACCESS GRANTED
                                </span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Security / Hologram Event Footer -->
            <div class="badge-footer">
                <div class="footer-stamp-text">&bull; OMATIQ OFFICIAL COMPETITOR PASS &bull;</div>
                <div>Wajib dikenakan/dibawa selama rangkaian perlombaan. Barcode &amp; QR Code digunakan untuk validasi registrasi ulang dan absensi digital panitia.</div>
            </div>
        </div>

        <div class="print-guide">
            ✂ Gunting mengikuti garis tepi kartu (Ukuran ID Card / Lanyard Event)
        </div>
    </div>

</body>
</html>
