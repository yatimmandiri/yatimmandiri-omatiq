<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu-Peserta-OMATIQ-{{ $participant->registration_number }}</title>
    <style>
        @page {
            size: a5 portrait;
            margin: 6mm;
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
            background-color: #061210;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(23, 82, 74, 0.45) 0%, transparent 60%),
                radial-gradient(#17524a 0.8px, transparent 0.8px);
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
            max-width: 440px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(13, 40, 36, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 10px 18px;
            border-radius: 16px;
            border: 1px solid rgba(229, 190, 30, 0.35);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        .toolbar-title {
            font-weight: 800;
            font-size: 13px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .toolbar-badge {
            background: #E5BE1E;
            color: #061a17;
            font-size: 10px;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            background: linear-gradient(135deg, #E5BE1E 0%, #d4a713 100%);
            color: #081d1a;
            box-shadow: 0 3px 12px rgba(229, 190, 30, 0.4);
            transition: all 0.2s ease;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #eed04b 0%, #e0b41c 100%);
            transform: translateY(-1px);
        }

        .badge-wrapper {
            width: 100%;
            max-width: 440px;
            background: #ffffff;
            border-radius: 28px;
            border: 3px solid #17524A;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(229, 190, 30, 0.4);
            overflow: hidden;
            position: relative;
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

        .badge-wrapper {
            width: 100%;
            background: #ffffff;
            border-radius: 20px;
            border: 2px solid #17524A;
            overflow: hidden;
        }
        @endif

        /* Top Lanyard Punch Slot Simulation */
        .lanyard-bar {
            background-color: #061916;
            padding: 12px 0 6px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lanyard-slot {
            display: inline-block;
            width: 48px;
            height: 6px;
            background-color: #0b2d28;
            border: 1.5px solid rgba(229, 190, 30, 0.6);
            border-radius: 6px;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        /* Event Header Banner */
        .badge-header {
            background: linear-gradient(145deg, #051815 0%, #0d3832 50%, #17524A 100%);
            color: #ffffff;
            padding: 16px 20px 14px;
            text-align: center;
            position: relative;
            border-bottom: 4px solid #E5BE1E;
        }

        .event-tagline {
            font-size: 9px;
            font-weight: 800;
            color: #E5BE1E;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .event-title {
            font-size: 26px;
            font-weight: 950;
            letter-spacing: 1px;
            color: #ffffff;
            line-height: 1.1;
            text-transform: uppercase;
        }

        .event-edition-pill {
            display: inline-block;
            background-color: #E5BE1E;
            color: #061916;
            font-size: 9px;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 6px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 4px;
        }

        .event-org {
            font-size: 10px;
            color: #a3e3d9;
            font-weight: 600;
            margin-top: 4px;
            letter-spacing: 0.5px;
        }

        /* Hero Access Tier Ribbon */
        .access-tier-ribbon {
            background-color: #0b2824;
            color: #ffffff;
            padding: 6px 15px;
            text-align: center;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-bottom: 1px solid rgba(229, 190, 30, 0.3);
        }

        .access-tier-ribbon span {
            color: #E5BE1E;
        }

        /* Hero Section (Avatar + Big Name + Big BIB) */
        .badge-hero {
            padding: 18px 20px 14px;
            text-align: center;
            background: radial-gradient(circle at 50% 30%, #f0fdf4 0%, #ffffff 70%);
            border-bottom: 1.5px dashed #cbd5e1;
        }

        .avatar-wrap {
            position: relative;
            display: inline-block;
            margin-bottom: 10px;
        }

        .avatar-frame {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid #17524A;
            background-color: #f8fafc;
            overflow: hidden;
            margin: 0 auto;
            box-shadow: 0 6px 16px rgba(23, 82, 74, 0.2), 0 0 0 3px rgba(229, 190, 30, 0.5);
            text-align: center;
        }

        .avatar-img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 50%;
        }

        .avatar-empty {
            padding-top: 25px;
            color: #94a3b8;
            font-size: 10px;
            font-weight: 800;
            line-height: 1.3;
        }

        .role-chip-tag {
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #17524A;
            color: #E5BE1E;
            font-size: 9px;
            font-weight: 900;
            padding: 3px 10px;
            border-radius: 12px;
            border: 1px solid #E5BE1E;
            white-space: nowrap;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        /* Big Participant Name (Event Athlete/VIP feel) */
        .participant-name-title {
            font-size: 17px;
            font-weight: 900;
            color: #0d3832;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.2;
            margin-top: 10px;
            margin-bottom: 8px;
        }

        /* Massive BIB / Registration Number Box */
        .bib-container {
            background-color: #0b2824;
            border: 2px solid #E5BE1E;
            border-radius: 12px;
            padding: 6px 12px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(11, 40, 36, 0.25);
            margin-bottom: 10px;
        }

        .bib-label {
            font-size: 8px;
            font-weight: 800;
            color: #a3e3d9;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: block;
        }

        .bib-number {
            font-size: 18px;
            font-weight: 950;
            color: #E5BE1E;
            font-family: 'Courier New', Courier, monospace;
            letter-spacing: 1.5px;
            line-height: 1.1;
        }

        /* Competition Division Banner */
        .competition-pill {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1.5px solid #f59e0b;
            color: #78350f;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.5px;
            display: inline-block;
            text-transform: uppercase;
        }

        /* Credentials Metadata Grid (Event Pass style) */
        .badge-meta-table {
            width: 100%;
            border-collapse: collapse;
            padding: 12px 20px;
            background-color: #ffffff;
            font-size: 10.5px;
        }

        .meta-row td {
            padding: 4px 20px;
            vertical-align: top;
        }

        .meta-lbl {
            width: 110px;
            color: #64748b;
            font-weight: 800;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .meta-cln {
            width: 10px;
            color: #94a3b8;
            font-weight: 700;
            text-align: center;
        }

        .meta-val {
            color: #0f172a;
            font-weight: 800;
            font-size: 11px;
        }

        /* Rapid Checkpoint Barcode & QR Access Section */
        .badge-scan-section {
            background-color: #f8fafc;
            border-top: 1.5px dashed #cbd5e1;
            padding: 12px 18px 10px;
            text-align: center;
        }

        .scan-table {
            width: 100%;
            border-collapse: collapse;
        }

        .scan-qr-td {
            width: 90px;
            vertical-align: middle;
            text-align: center;
        }

        .scan-barcode-td {
            vertical-align: middle;
            text-align: center;
            padding-left: 12px;
        }

        .qr-box-pass {
            display: inline-block;
            background: #ffffff;
            padding: 6px;
            border-radius: 10px;
            border: 1.5px solid #17524A;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .barcode-wrap-pass {
            width: 100%;
            text-align: center;
        }

        .barcode-code-pass {
            font-size: 8.5px;
            font-family: 'Courier New', monospace;
            font-weight: 800;
            color: #17524A;
            margin-top: 2px;
        }

        .status-chip-event {
            margin-top: 6px;
            display: inline-block;
            background: linear-gradient(135deg, #17524A 0%, #0d3832 100%);
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 900;
            padding: 3px 12px;
            border-radius: 12px;
            border: 1px solid #E5BE1E;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        /* Hologram / Security Footer Strip */
        .badge-footer {
            background-color: #061916;
            color: #94a3b8;
            padding: 10px 18px;
            border-top: 2px solid #E5BE1E;
            text-align: center;
            font-size: 8.5px;
            line-height: 1.35;
        }

        .footer-stamp-text {
            color: #E5BE1E;
            font-weight: 900;
            letter-spacing: 1px;
            font-size: 9px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        @media print {
            body {
                background: none !important;
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .toolbar {
                display: none !important;
            }

            .badge-wrapper {
                box-shadow: none !important;
                border: 2px solid #17524A !important;
                border-radius: 18px !important;
                max-width: 100% !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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

    <!-- Official Event Lanyard Badge -->
    <div class="badge-wrapper">
        <!-- Top Lanyard Slot -->
        <div class="lanyard-bar">
            <div class="lanyard-slot"></div>
        </div>

        <!-- Event Branding Header -->
        <div class="badge-header">
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

</body>
</html>
