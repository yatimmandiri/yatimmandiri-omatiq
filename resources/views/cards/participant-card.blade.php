<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu Peserta OMATIQ - {{ $participant->registration_number }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f1f5f9;
            color: #1e293b;
            padding: 30px 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        .toolbar {
            width: 100%;
            max-width: 780px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .btn-primary {
            background-color: #17524A;
            color: #ffffff;
        }

        .btn-primary:hover {
            background-color: #0f3732;
        }

        .btn-secondary {
            background-color: #f8fafc;
            color: #1e293b;
            border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
            background-color: #e2e8f0;
        }

        /* Card Layout (Landscape standard badge) */
        .card-container {
            width: 100%;
            max-width: 780px;
            background: #ffffff;
            border-radius: 16px;
            border: 2px solid #17524A;
            box-shadow: 0 10px 25px rgba(23, 82, 74, 0.12);
            overflow: hidden;
            position: relative;
        }

        .card-header {
            background: linear-gradient(135deg, #17524A 0%, #1e6b60 100%);
            color: #ffffff;
            padding: 18px 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 4px solid #E5BE1E;
        }

        .header-brand h1 {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #ffffff;
        }

        .header-brand p {
            font-size: 12px;
            color: #E5BE1E;
            font-weight: 700;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header-badge {
            background: #E5BE1E;
            color: #17524A;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .card-body {
            padding: 24px;
            display: grid;
            grid-template-columns: 140px 1fr 170px;
            gap: 20px;
            background: #ffffff;
        }

        /* Photo Column */
        .photo-column {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .photo-box {
            width: 130px;
            height: 160px;
            border-radius: 10px;
            border: 2px solid #cbd5e1;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 700;
            padding: 10px;
        }

        .photo-badge {
            margin-top: 10px;
            font-size: 10px;
            font-weight: 800;
            color: #17524A;
            background: #e6f4f1;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid #17524A;
            text-transform: uppercase;
        }

        /* Detail Column */
        .detail-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .reg-number-banner {
            background: #f0fdf4;
            border-left: 4px solid #17524A;
            padding: 6px 12px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 6px;
        }

        .reg-number-banner .label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .reg-number-banner .value {
            font-size: 17px;
            font-weight: 900;
            color: #17524A;
            font-family: 'Courier New', Courier, monospace;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        .detail-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .detail-table td.label-cell {
            width: 120px;
            color: #64748b;
            font-weight: 600;
        }

        .detail-table td.colon-cell {
            width: 12px;
            color: #64748b;
            font-weight: 600;
        }

        .detail-table td.value-cell {
            color: #1e293b;
            font-weight: 700;
        }

        /* Right Column (Barcode, QR, Status) */
        .scan-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            border-left: 1px dashed #cbd5e1;
            padding-left: 18px;
        }

        .qr-wrapper {
            background: #ffffff;
            padding: 8px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .barcode-wrapper {
            width: 100%;
            margin-top: 10px;
            text-align: center;
        }

        .barcode-svg {
            width: 100%;
            height: 38px;
        }

        .barcode-label {
            font-size: 9px;
            font-family: monospace;
            font-weight: 700;
            color: #17524A;
            margin-top: 2px;
        }

        .status-badge {
            margin-top: 8px;
            background: #17524A;
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* Card Footer */
        .card-footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }

        .card-footer-note {
            max-width: 480px;
            line-height: 1.4;
        }

        .signature-box {
            text-align: center;
            border-left: 1px solid #e2e8f0;
            padding-left: 20px;
        }

        .signature-box .title {
            font-weight: 700;
            color: #17524A;
        }

        .signature-box .stamp {
            color: #E5BE1E;
            font-weight: 900;
            font-size: 11px;
            margin: 4px 0;
            letter-spacing: 1px;
        }

        @media print {
            body {
                background: none;
                padding: 0;
            }

            .toolbar {
                display: none !important;
            }

            .card-container {
                box-shadow: none;
                border: 2px solid #17524A;
                max-width: 100%;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <div class="toolbar">
        <div>
            <span style="font-weight: 700; font-size: 14px; color: #17524A;">Kartu Peserta OMATIQ</span>
            <span style="font-size: 12px; color: #64748b; margin-left: 8px;">Status: Terverifikasi</span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="window.print()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                Cetak Kartu
            </button>
            <a href="?format=pdf" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Unduh PDF
            </a>
        </div>
    </div>

    <div class="card-container">
        <!-- Header -->
        <div class="card-header">
            <div class="header-brand">
                <h1>OMATIQ {{ $participant->event_year ?? 2026 }}</h1>
                <p>Olimpiade Matematika & Al-Qur'an &bull; Yatim Mandiri</p>
            </div>
            <div class="header-badge">
                KARTU TANDA PESERTA
            </div>
        </div>

        <!-- Body -->
        <div class="card-body">
            <!-- Left: Photo -->
            <div class="photo-column">
                <div class="photo-box">
                    @if(!empty($student->photo_url))
                        <img src="{{ $student->photo_url }}" alt="Foto Peserta">
                    @else
                        <div class="photo-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <span>PAS FOTO</span>
                        </div>
                    @endif
                </div>
                <div class="photo-badge">
                    PESERTA RESMI
                </div>
            </div>

            <!-- Middle: Data -->
            <div class="detail-column">
                <div class="reg-number-banner">
                    <div class="label">Nomor Registrasi Peserta</div>
                    <div class="value">{{ $participant->registration_number }}</div>
                </div>

                <table class="detail-table">
                    <tr>
                        <td class="label-cell">Nama Lengkap</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell" style="font-size: 13px; color: #17524A;">{{ strtoupper($student->full_name ?? $participant->user?->name ?? '-') }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">NIK / NIS</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $student->nik ?? '-' }} {{ !empty($student->nis) ? '/ '.$student->nis : '' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Asal Sekolah</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $student->school_name ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Jenjang & Kelas</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $student->school_level ?? 'SD/MI' }} &bull; Kelas {{ $student->grade ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Cabang Olimpiade</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell" style="color: #17524A;">{{ $participant->olimpiade?->name ?? 'OMATIQ' }} ({{ $participant->olimpiade?->category ?? 'Umum' }})</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Wilayah / Cabang</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $student->regency?->name ?? $participant->branch ?? $participant->penyaluran_sanggar_name ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Pendamping / Guru</td>
                        <td class="colon-cell">:</td>
                        <td class="value-cell">{{ $participant->mentor?->name ?? $student->mentor_name ?? '-' }}</td>
                    </tr>
                </table>
            </div>

            <!-- Right: Barcode & QR Code -->
            <div class="scan-column">
                <div class="qr-wrapper">
                    {!! $qrCodeSvg !!}
                </div>

                <div class="barcode-wrapper">
                    <div class="barcode-svg">
                        {!! $barcodeSvg !!}
                    </div>
                    <div class="barcode-label">{{ $participant->registration_number }}</div>
                </div>

                <div class="status-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    TERVERIFIKASI
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
            <div class="card-footer-note">
                <strong>Catatan:</strong> Kartu tanda peserta ini wajib dicetak dan dibawa saat registrasi ulang / pelaksanaan Olimpiade OMATIQ {{ $participant->event_year ?? 2026 }}. Barcode digunakan untuk absensi & verifikasi kehadiran peserta.
            </div>
            <div class="signature-box">
                <div class="title">Panitia Pelaksana</div>
                <div class="stamp">OMATIQ OFFICIAL</div>
                <div style="font-size: 9px; color: #94a3b8;">Yatim Mandiri Pusat</div>
            </div>
        </div>
    </div>

</body>
</html>
