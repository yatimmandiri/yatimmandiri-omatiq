<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Kartu-Peserta-OMATIQ-{{ $participant->registration_number }}-{{ $student->full_name ?? $participant->user?->name ?? "Peserta" }}</title>
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
            background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 40%, #ccfbf1 100%);
            color: #0f766e;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 12px 48px;
            overflow-x: hidden;
        }

        /* Ambient Glass Toolbar */
        .toolbar {
            width: 100%;
            max-width: 820px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.94);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            padding: 12px 18px;
            border-radius: 18px;
            border: 1px solid rgba(13, 148, 136, 0.2);
            box-shadow: 0 10px 30px rgba(13, 148, 136, 0.08);
            gap: 12px;
            flex-wrap: wrap;
        }

        .toolbar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .toolbar-brand img {
            height: 32px;
            width: auto;
        }

        .toolbar-title {
            font-weight: 800;
            font-size: 13.5px;
            color: #0f766e;
            letter-spacing: -0.2px;
            line-height: 1.25;
        }

        .toolbar-subtitle {
            font-size: 11px;
            color: #0d9488;
            font-weight: 600;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .btn-view-mode {
            padding: 7px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid rgba(13, 148, 136, 0.25);
            background: #ffffff;
            color: #0f766e;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-view-mode.active, .btn-view-mode:hover {
            background: #09767a;
            color: #ffffff;
            border-color: #09767a;
            box-shadow: 0 4px 12px rgba(9, 118, 122, 0.25);
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
            box-shadow: 0 4px 14px rgba(9, 118, 122, 0.35);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #07595c 0%, #0b7a70 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(9, 118, 122, 0.4);
        }

        /* Status Notice Banner */
        .status-banner {
            width: 100%;
            max-width: 820px;
            margin-bottom: 16px;
            padding: 10px 16px;
            border-radius: 14px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
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
            position: relative;
        }

        /* ================= VIRTUAL 3D COMMITTEE PASS STAGE ================= */
        .virtual-stage {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 0 20px;
            user-select: none;
            -webkit-user-select: none;
        }

        /* Lanyard Ribbon & Metallic Clasp (Deep Teal / Tech Accent) */
        .lanyard-mount {
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 25;
            margin-bottom: -18px;
            pointer-events: none;
        }

        .lanyard-strap {
            width: 38px;
            height: 52px;
            background: linear-gradient(90deg, #07595c 0%, #0d9488 50%, #07595c 100%);
            box-shadow: 0 4px 14px rgba(9, 118, 122, 0.4);
            border-radius: 4px 4px 0 0;
            position: relative;
        }

        .lanyard-strap::after {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(45, 212, 191, 0.18) 3px, rgba(45, 212, 191, 0.18) 6px);
        }

        .lanyard-clip {
            width: 28px;
            height: 32px;
            background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 35%, #94a3b8 70%, #64748b 100%);
            border-radius: 6px 6px 12px 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: -3px;
            border: 1px solid #cbd5e1;
        }

        .lanyard-clip::before {
            content: '';
            width: 12px;
            height: 6px;
            background: #475569;
            border-radius: 2px;
            position: absolute;
            top: 4px;
        }

        .lanyard-clip::after {
            content: '';
            width: 14px;
            height: 14px;
            border: 2.5px solid #334155;
            border-radius: 4px;
            background: transparent;
            margin-top: 4px;
        }

        /* 3D Scene Viewport */
        .card-3d-scene {
            perspective: 1200px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            cursor: grab;
            touch-action: pan-y;
            padding: 0;
            margin: 0 auto;
            position: relative;
        }

        .card-3d-scene:active {
            cursor: grabbing;
        }

        /* Responsive Scale Container (dynamically scaled for mobile) */
        .card-scale-container {
            width: 372px;
            height: 590px;
            transform-origin: top center;
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
            position: relative;
            flex-shrink: 0;
        }

        /* 3D Rotating Flipper */
        .card-3d-flipper {
            width: 372px;
            height: 590px;
            position: relative;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            transition: transform 0.65s cubic-bezier(0.34, 1.25, 0.64, 1);
            transform-origin: center center;
        }

        .card-3d-flipper.is-flipped {
            transform: rotateY(180deg);
        }

        /* Card Faces (Front & Back) - Strictly Absolute so both faces stack exactly */
        .card-3d-flipper .card-face,
        .card-face {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            backface-visibility: hidden !important;
            -webkit-backface-visibility: hidden !important;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 25px 60px rgba(9, 118, 122, 0.22), 0 6px 18px rgba(0, 0, 0, 0.1);
            margin: 0 !important;
        }

        .card-front-face {
            transform: rotateY(0deg);
        }

        .card-back-face {
            transform: rotateY(180deg);
        }

        /* Decorative Tech Corner Accent Pattern */
        .card-corner-pattern {
            position: absolute;
            width: 120px;
            height: auto;
            pointer-events: none;
            z-index: 3;
            user-select: none;
        }

        .pattern-top-left {
            top: 0;
            left: 0;
        }

        .pattern-bottom-right {
            bottom: 0;
            right: 0;
            transform: rotate(180deg);
        }

        /* Punch Slot Hole (Lanyard Pass Slot) */
        .badge-punch-slot {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 8.5px;
            background: #042f2e;
            border-radius: 8px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 255, 255, 0.6);
            z-index: 15;
            pointer-events: none;
        }

        /* Specular Gloss & Reflection */
        .card-glare {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 20;
            border-radius: 18px;
            background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%);
            opacity: 0;
            mix-blend-mode: overlay;
            transition: opacity 0.3s ease;
        }

        /* Virtual Floating Controls Dock */
        .virtual-controls-dock {
            margin-top: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.94);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            padding: 8px 16px;
            border-radius: 16px;
            border: 1px solid rgba(13, 148, 136, 0.2);
            box-shadow: 0 10px 30px rgba(13, 148, 136, 0.1);
            flex-wrap: wrap;
            max-width: 95vw;
        }

        .side-switcher {
            display: flex;
            align-items: center;
            background: #f0fdfa;
            padding: 3px;
            border-radius: 12px;
            border: 1px solid rgba(13, 148, 136, 0.18);
            gap: 2px;
        }

        .side-pill {
            padding: 6px 14px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 700;
            border: none;
            background: transparent;
            color: #0f766e;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .side-pill.active {
            background: #09767a;
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(9, 118, 122, 0.3);
        }

        .side-pill-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #cbd5e1;
        }

        .side-pill.active .side-pill-dot {
            background: #2dd4bf;
        }

        .btn-flip-primary {
            padding: 8px 16px;
            border-radius: 11px;
            font-size: 12px;
            font-weight: 800;
            border: 1px solid #09767a;
            background: linear-gradient(135deg, #09767a 0%, #0d9488 100%);
            color: #ffffff;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(9, 118, 122, 0.3);
            transition: all 0.2s ease;
        }

        .btn-flip-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(9, 118, 122, 0.4);
        }

        .btn-flip-primary svg {
            transition: transform 0.4s ease;
        }

        .btn-flip-primary:hover svg {
            transform: rotate(180deg);
        }

        .dock-divider {
            width: 1px;
            height: 24px;
            background: rgba(13, 148, 136, 0.2);
        }

        .zoom-group {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #f0fdfa;
            padding: 3px 6px;
            border-radius: 12px;
            border: 1px solid rgba(13, 148, 136, 0.18);
        }

        .btn-zoom {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid rgba(13, 148, 136, 0.15);
            background: #ffffff;
            color: #0f766e;
            font-size: 14px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .btn-zoom:hover {
            background: #09767a;
            color: #ffffff;
        }

        .zoom-badge {
            font-size: 11px;
            font-weight: 800;
            color: #0f766e;
            min-width: 44px;
            text-align: center;
            font-family: monospace;
        }

        .virtual-hint-chip {
            margin-top: 12px;
            font-size: 11px;
            color: #0d9488;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.75);
            padding: 5px 12px;
            border-radius: 20px;
            border: 1px solid rgba(13, 148, 136, 0.15);
            text-align: center;
        }

        /* ================= BASE CARD ELEMENTS (Front & Back) ================= */
        .omatiq-card {
            width: 372px;
            height: 590px;
            position: relative;
            border-radius: 18px;
            overflow: hidden;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: center;
            flex-shrink: 0;
        }

        /* Front & Back Background Templates (Menggunakan bg-peserta.png dengan adaptasi gradasi) */
        .card-front, .card-back {
            background-color: #ffffff;
            background-image:
                linear-gradient(180deg, #ffffff 0%, #ffffff 18%, rgba(255, 255, 255, 0.4) 38%, rgba(255, 255, 255, 0) 52%),
                url("{{ asset('assets/images/bg-peserta.png') }}");
            background-repeat: no-repeat;
            background-position: center bottom;
            background-size: 100% auto;
        }

        /* Front: Inactive / Suspended Warning Badge Overlay */
        .badge-unverified-overlay {
            position: absolute;
            top: 2.5%;
            left: 50%;
            transform: translateX(-50%);
            width: 91.2%;
            padding: 6.5px 10px;
            border-radius: 20px;
            background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
            border: 1.5px solid #fed7aa;
            color: #ffffff;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.4px;
            text-align: center;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(180, 83, 9, 0.35);
            z-index: 8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Front: Centered Header YM Logo */
        .card-header-logo {
            position: absolute;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            z-index: 5;
        }

        .card-header-logo img {
            height: 40px;
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }

        /* Front: Label Panitia (Gradient Horizontal Banner Typography) */
        .committee-badge-pill {
            position: absolute;
            top: 96px;
            left: 0;
            right: 0;
            width: 100%;
            height: 44px;
            background: linear-gradient(90deg, rgba(9, 118, 122, 0) 0%, rgba(9, 118, 122, 0.65) 10%, #09767a 20%, #09767a 80%, rgba(9, 118, 122, 0.65) 90%, rgba(9, 118, 122, 0) 100%);
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 0;
            box-shadow: none;
            z-index: 5;
            white-space: nowrap;
        }

        /* Status Kepesertaan Badge Ribbon Variants */
        .committee-badge-pill.status-yatim {
            background: linear-gradient(90deg, rgba(9, 118, 122, 0) 0%, rgba(9, 118, 122, 0.65) 10%, #09767a 20%, #09767a 80%, rgba(9, 118, 122, 0.65) 90%, rgba(9, 118, 122, 0) 100%);
            color: #ffffff;
        }

        .committee-badge-pill.status-yatim_piatu {
            background: linear-gradient(90deg, rgba(201, 251, 254, 0) 0%, rgba(201, 251, 254, 0.75) 10%, #c9fbfe 20%, #c9fbfe 80%, rgba(201, 251, 254, 0.75) 90%, rgba(201, 251, 254, 0) 100%);
            color: #ffffff;
            text-shadow: 0 1px 3px rgba(9, 118, 122, 0.95), 0 0 2px rgba(0, 50, 60, 0.8);
        }

        .committee-badge-pill.status-dhuafa {
            background: linear-gradient(90deg, rgba(46, 49, 141, 0) 0%, rgba(46, 49, 141, 0.65) 10%, #2e318d 20%, #2e318d 80%, rgba(46, 49, 141, 0.65) 90%, rgba(46, 49, 141, 0) 100%);
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        }

        .committee-badge-pill.status-umum {
            background: linear-gradient(90deg, rgba(255, 222, 0, 0) 0%, rgba(255, 222, 0, 0.75) 10%, #ffde00 20%, #ffde00 80%, rgba(255, 222, 0, 0.75) 90%, rgba(255, 222, 0, 0) 100%);
            color: #ffffff;
            text-shadow: 0 1px 3px rgba(122, 100, 0, 0.95), 0 0 2px rgba(80, 60, 0, 0.7);
        }

        /* Front: Official HD Title (Tulisan Omatiq.png) */
        .card-title-wrap {
            position: absolute;
            top: 154px;
            left: 50%;
            transform: translateX(-50%);
            width: 84%;
            display: flex;
            justify-content: center;
            z-index: 5;
            pointer-events: none;
        }

        .card-title-img {
            max-width: 310px;
            height: auto;
            object-fit: contain;
        }

        /* Front: Transparent Frosted Glass Committee Data Box (ID & Biodata) */
        .committee-data-box {
            position: absolute;
            top: 308px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            background: rgba(255, 255, 255, 0.30);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(255, 255, 255, 0.70);
            border-radius: 24px;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 16px 14px 14px;
            box-shadow: 0 10px 30px rgba(4, 47, 46, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        /* Front: Sponsor Box (Second Frosted Glass Box below Data Box) */
        .committee-sponsors-box {
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            background: rgba(255, 255, 255, 0.30);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(255, 255, 255, 0.70);
            border-radius: 20px;
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 10px 8px;
            box-shadow: 0 10px 30px rgba(4, 47, 46, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        /* Front: Mascots Peeking at Top-Right Corner Outside the Box */
        .card-mascot-corner {
            position: absolute;
            bottom: 100%;
            right: 20px;
            margin-bottom: -10px;
            z-index: 6;
            pointer-events: none;
            line-height: 0;
        }

        .card-mascot-img {
            width: 105px;
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
        }

        .committee-name {
            font-size: 22px;
            font-weight: 900;
            color: #09767a;
            letter-spacing: -0.3px;
            line-height: 1.2;
            text-align: center;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .committee-meta {
            font-size: 11px;
            font-weight: 700;
            color: #065f46;
            letter-spacing: -0.1px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            line-height: 1.25;
        }

        .committee-branch {
            font-size: 11px;
            font-weight: 800;
            color: #0f766e;
            text-align: center;
            margin-top: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .committee-id-badge {
            font-size: 9.5px;
            font-weight: 800;
            color: #0d9488;
            letter-spacing: 1.2px;
            text-align: center;
            margin-top: 2px;
            font-family: 'Courier New', Courier, monospace;
        }

        .data-divider {
            width: 84%;
            height: 1px;
            background: rgba(255, 255, 255, 0.6);
            margin: 6px auto 5px;
        }

        /* Front: Sponsors Bar (HD Assets) */
        .card-sponsors-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .sponsors-label {
            font-size: 7.5px;
            font-weight: 800;
            color: #042f2e;
            margin-bottom: 4px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            opacity: 0.9;
        }

        .sponsors-row {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .sponsors-row-1 {
            gap: 7px;
            margin-bottom: 3px;
        }

        .sponsors-row-1 img {
            max-height: 32px;
            max-width: 48px;
            width: auto;
            object-fit: contain;
            filter: contrast(1.05);
        }

        .sponsors-row-2 {
            gap: 6px;
        }

        .sponsors-row-2 img {
            max-height: 32px;
            max-width: 36px;
            width: auto;
            object-fit: contain;
            filter: contrast(1.05);
        }

        /* Front: Official Website URL at Bottom */
        .card-front-web {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
            z-index: 5;
            white-space: nowrap;
        }

        /* Back: Title OMATIQ 2026 */
        .card-back-title-wrap {
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            width: 82%;
            display: flex;
            justify-content: center;
            z-index: 5;
            pointer-events: none;
        }

        .card-back-title-img {
            max-width: 295px;
            height: auto;
            object-fit: contain;
        }

        /* Back: HD Mascots Left & Right (Single Instance, Zero Double Image) */
        .mascot-back-zakki {
            position: absolute;
            bottom: 110px;
            left: -8px;
            width: 136px;
            height: auto;
            z-index: 5;
            pointer-events: none;
            filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.24));
        }

        .mascot-back-amila {
            position: absolute;
            bottom: 105px;
            right: -12px;
            width: 136px;
            height: auto;
            z-index: 5;
            pointer-events: none;
            filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.24));
        }

        /* Back: QR Code Center Container (Clean, centered between mascots) */
        .committee-qr-box {
            position: absolute;
            top: 226px;
            left: 50%;
            transform: translateX(-50%);
            width: 216px;
            height: 216px;
            z-index: 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
            overflow: visible;
        }

        .qr-svg-wrapper {
            width: 100%;
            height: 100%;
            max-width: 216px;
            max-height: 216px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            background: #ffffff;
            padding: 12px;
            box-shadow: 0 12px 32px rgba(4, 47, 46, 0.22);
        }

        /* Back: Official Website URL */
        .card-back-web {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
            z-index: 6;
            white-space: nowrap;
        }

        .qr-svg-wrapper svg {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }

        /* Inactive Security Lock & Watermark Over QR */
        .qr-lock-container {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px;
            text-align: center;
            z-index: 10;
        }

        .qr-void-banner {
            position: absolute;
            top: 14px;
            left: -20px;
            right: -20px;
            background: #dc2626;
            color: #ffffff;
            font-size: 7.5px;
            font-weight: 900;
            padding: 2.5px 0;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            transform: rotate(-12deg);
            box-shadow: 0 2px 6px rgba(220, 38, 38, 0.4);
            white-space: nowrap;
        }

        .lock-badge-icon {
            font-size: 24px;
            margin-bottom: 2px;
            color: #b45309;
        }

        .lock-badge-title {
            font-size: 10.5px;
            font-weight: 900;
            color: #b45309;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }

        .lock-badge-subtitle {
            font-size: 7px;
            font-weight: 700;
            color: #64748b;
            line-height: 1.2;
            margin-top: 2px;
            max-width: 130px;
        }

        /* ================= PRINT SHEET PREVIEW (SCREEN ONLY) ================= */
        .print-sheet {
            display: none;
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
            max-width: 100%;
            overflow-x: auto;
        }

        .print-sheet.is-visible {
            display: flex;
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
            flex-shrink: 0;
        }

        .fold-label {
            position: absolute;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            white-space: nowrap;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            transform: rotate(-90deg);
        }

        .cut-guide-border {
            position: relative;
            padding: 6px;
            background: #ffffff;
            border: 1px dashed #cbd5e1;
            border-radius: 20px;
        }

        /* Print Instructions Panel */
        .print-instructions {
            width: 100%;
            max-width: 820px;
            margin-top: 16px;
            background: #ffffff;
            border: 1px solid rgba(13, 148, 136, 0.2);
            border-radius: 16px;
            padding: 14px 18px;
            display: none;
            box-shadow: 0 6px 20px rgba(9, 118, 122, 0.06);
        }

        .print-instructions.is-visible {
            display: block;
        }

        .inst-title {
            font-size: 12.5px;
            font-weight: 800;
            color: #0f766e;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        .inst-list {
            font-size: 11.5px;
            color: #334155;
            line-height: 1.6;
            padding-left: 18px;
        }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
            body {
                padding: 10px 8px 36px;
                background-attachment: scroll;
            }

            .toolbar {
                padding: 10px 14px;
                border-radius: 14px;
            }

            .toolbar-actions {
                width: 100%;
                justify-content: space-between;
            }

            .btn-view-mode, .btn-print {
                flex: 1;
                justify-content: center;
                padding: 7px 10px;
                font-size: 11.5px;
            }

            .virtual-controls-dock {
                padding: 6px 10px;
                gap: 8px;
                border-radius: 14px;
            }

            .side-pill {
                padding: 5px 10px;
                font-size: 11px;
            }

            .btn-flip-primary {
                padding: 7px 12px;
                font-size: 11.5px;
            }

            .virtual-hint-chip {
                font-size: 10px;
                padding: 4px 10px;
            }
        }

        /* ================= PRINT MEDIA STYLES (@media print) ================= */
        @media print {
            body {
                background: #ffffff !important;
                background-image: none !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                min-height: auto !important;
            }

            .toolbar,
            .status-banner,
            .virtual-stage,
            .print-instructions,
            .no-print {
                display: none !important;
            }

            .cards-stage {
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .print-sheet {
                display: flex !important;
                padding: 0 !important;
                margin: 0 auto !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                justify-content: center !important;
                align-items: center !important;
                width: 100% !important;
                page-break-inside: avoid !important;
            }

            /* Duplex printing mode toggle */
            body.print-mode-duplex .print-sheet {
                display: block !important;
            }

            body.print-mode-duplex .cut-guide-border {
                margin: 0 auto 0 !important;
                page-break-after: always !important;
                border: 0.5px dashed #cbd5e1 !important;
            }

            body.print-mode-duplex .fold-divider {
                display: none !important;
            }

            /* Physical Event Lanyard Size (86mm x 136.5mm each) */
            .cut-guide-border {
                border: 0.5px dashed #94a3b8 !important;
                padding: 0 !important;
                border-radius: 4mm !important;
            }

            .omatiq-card {
                width: 86mm !important;
                height: 136.5mm !important;
                border-radius: 4mm !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .card-corner-pattern {
                width: 28mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }


            .card-front, .card-back {
                background-color: #ffffff !important;
                background-image:
                    linear-gradient(180deg, #ffffff 0%, #ffffff 18%, rgba(255, 255, 255, 0.4) 38%, rgba(255, 255, 255, 0) 52%),
                    url("{{ asset('assets/images/bg-peserta.png') }}") !important;
                background-repeat: no-repeat !important;
                background-position: center bottom !important;
                background-size: 100% auto !important;
            }

            .fold-divider {
                height: 136.5mm !important;
                border-left: 1px dashed #94a3b8 !important;
                margin: 0 4mm !important;
            }

            .fold-label {
                font-size: 7pt !important;
                padding: 1mm 2mm !important;
            }

            /* Print scaling for Front elements */
            .card-header-logo {
                top: 6.5mm !important;
                gap: 2mm !important;
            }

            .card-header-logo img {
                height: 9mm !important;
                width: auto !important;
            }

            .committee-badge-pill {
                top: 21.5mm !important;
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                height: 10mm !important;
                background: linear-gradient(90deg, rgba(9, 118, 122, 0) 0%, rgba(9, 118, 122, 0.65) 10%, #09767a 20%, #09767a 80%, rgba(9, 118, 122, 0.65) 90%, rgba(9, 118, 122, 0) 100%) !important;
                color: #ffffff !important;
                font-size: 15pt !important;
                font-weight: 800 !important;
                letter-spacing: 0.3mm !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .committee-badge-pill.status-yatim {
                background: linear-gradient(90deg, rgba(9, 118, 122, 0) 0%, rgba(9, 118, 122, 0.65) 10%, #09767a 20%, #09767a 80%, rgba(9, 118, 122, 0.65) 90%, rgba(9, 118, 122, 0) 100%) !important;
                color: #ffffff !important;
            }

            .committee-badge-pill.status-yatim_piatu {
                background: linear-gradient(90deg, rgba(201, 251, 254, 0) 0%, rgba(201, 251, 254, 0.75) 10%, #c9fbfe 20%, #c9fbfe 80%, rgba(201, 251, 254, 0.75) 90%, rgba(201, 251, 254, 0) 100%) !important;
                color: #ffffff !important;
                text-shadow: 0 0.3mm 0.8mm rgba(9, 118, 122, 0.95), 0 0 0.5mm rgba(0, 50, 60, 0.8) !important;
            }

            .committee-badge-pill.status-dhuafa {
                background: linear-gradient(90deg, rgba(46, 49, 141, 0) 0%, rgba(46, 49, 141, 0.65) 10%, #2e318d 20%, #2e318d 80%, rgba(46, 49, 141, 0.65) 90%, rgba(46, 49, 141, 0) 100%) !important;
                color: #ffffff !important;
                text-shadow: 0 0.3mm 0.5mm rgba(0, 0, 0, 0.35) !important;
            }

            .committee-badge-pill.status-umum {
                background: linear-gradient(90deg, rgba(255, 222, 0, 0) 0%, rgba(255, 222, 0, 0.75) 10%, #ffde00 20%, #ffde00 80%, rgba(255, 222, 0, 0.75) 90%, rgba(255, 222, 0, 0) 100%) !important;
                color: #ffffff !important;
                text-shadow: 0 0.3mm 0.8mm rgba(122, 100, 0, 0.95), 0 0 0.5mm rgba(80, 60, 0, 0.7) !important;
            }

            .card-title-wrap {
                top: 34mm !important;
                width: 84% !important;
            }

            .card-title-img {
                max-width: 70mm !important;
            }

            .committee-data-box {
                top: 71mm !important;
                width: 78mm !important;
                padding: 3.5mm 2.5mm 3mm !important;
                border-radius: 4.5mm !important;
            }

            .card-mascot-corner {
                right: 4.5mm !important;
                margin-bottom: -2.2mm !important;
            }

            .card-mascot-img {
                width: 24mm !important;
            }

            .committee-name {
                font-size: 13pt !important;
                margin-bottom: 0.5mm !important;
            }

            .committee-meta {
                font-size: 7.5pt !important;
                line-height: 1.2 !important;
            }

            .committee-branch {
                font-size: 7.5pt !important;
            }

            .committee-id-badge {
                font-size: 6pt !important;
                margin-top: 0.5mm !important;
            }

            .data-divider {
                width: 82% !important;
                margin: 1.5mm auto 1mm !important;
            }

            /* Sponsor box print overrides */
            .committee-sponsors-box {
                bottom: 8mm !important;
                width: 78mm !important;
                padding: 2mm 2.5mm !important;
                border-radius: 4mm !important;
            }

            .sponsors-label {
                font-size: 5pt !important;
                margin-bottom: 0.8mm !important;
            }

            .sponsors-row-1 {
                gap: 1.8mm !important;
                margin-bottom: 0.8mm !important;
            }

            .sponsors-row-1 img {
                max-height: 7mm !important;
                max-width: 13mm !important;
            }

            .sponsors-row-2 {
                gap: 1.5mm !important;
            }

            .sponsors-row-2 img {
                max-height: 7mm !important;
                max-width: 11mm !important;
            }

            .card-front-web {
                bottom: 2mm !important;
                font-size: 6pt !important;
            }

            /* Print scaling for Back elements */
            .card-back-title-wrap {
                top: 11mm !important;
                width: 82% !important;
            }

            .card-back-title-img {
                max-width: 66mm !important;
            }

            .mascot-back-zakki {
                bottom: 24mm !important;
                width: 30mm !important;
                left: -1mm !important;
            }

            .mascot-back-amila {
                bottom: 23mm !important;
                width: 30mm !important;
                right: -1mm !important;
            }

            .committee-qr-box {
                top: 50mm !important;
                width: 48mm !important;
                height: 48mm !important;
            }

            .qr-svg-wrapper {
                max-width: 48mm !important;
                max-height: 48mm !important;
                border-radius: 5mm !important;
                padding: 2.5mm !important;
            }

            .card-back-web {
                bottom: 4.5mm !important;
                font-size: 6.5pt !important;
            }
                bottom: 8mm !important;
                font-size: 7pt !important;
            }

            .badge-punch-slot {
                border: 0.5px solid rgba(255, 255, 255, 0.4) !important;
            }
        }
    </style>
</head>
<body>
@php
    $socialStatusKey = strtolower((string) ($participant->social_status ?? 'yatim'));
    $statusClass = match($socialStatusKey) {
        'yatim_piatu' => 'status-yatim_piatu',
        'dhuafa' => 'status-dhuafa',
        'umum' => 'status-umum',
        default => 'status-yatim',
    };
@endphp

    @if(empty($isPdf))
    <!-- Ambient Glass Toolbar -->
    <header class="toolbar no-print">
        <div class="toolbar-brand">
            <img src="{{ asset('assets/images/LOGO OMATIQ.png') }}" alt="Logo OMATIQ 2026">
            <div>
                <div class="toolbar-title">Kartu Peserta • OMATIQ 2026 {{ !empty($isNational) ? '(Babak Final Nasional)' : '' }}</div>
                <div class="toolbar-subtitle">{{ $student->full_name ?? $participant->user?->name ?? 'Peserta' }} ({{ $participant->registration_number }})</div>
            </div>
        </div>

        <div class="toolbar-actions">
            <!-- View Mode Switcher -->
            <button type="button" class="btn-view-mode active" id="btnModeVirtual" onclick="switchViewMode('virtual')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Kartu Virtual 3D
            </button>

            <button type="button" class="btn-view-mode" id="btnModePrint" onclick="switchViewMode('print')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                Lembar Cetak A4
            </button>

            <!-- Direct Print / Download PDF -->
            <button type="button" class="btn-print" onclick="window.print()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Cetak / Unduh PDF
            </button>
        </div>
    </header>

    <!-- Status Banner Notice -->
    @if(!empty($isVerified))
    <div class="status-banner verified no-print">
        <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span><strong>KARTU PESERTA RESMI TERVERIFIKASI:</strong> Akses resmi kompetisi OMATIQ 2026 {{ !empty($isNational) ? 'Babak Final Nasional' : '' }} aktif.</span>
        </div>
        <span style="font-size: 11px; font-weight: 800; color: #047857; background: rgba(16, 185, 129, 0.2); padding: 3px 8px; border-radius: 6px;">
            TERVERIFIKASI
        </span>
    </div>
    @else
    <div class="status-banner pending no-print">
        <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span><strong>BUKTI PENDAFTARAN SEMENTARA:</strong> Pendaftaran sedang menunggu verifikasi panitia/administrator.</span>
        </div>
        <span style="font-size: 11px; font-weight: 800; color: #b45309; background: rgba(245, 158, 11, 0.2); padding: 3px 8px; border-radius: 6px;">
            MENUNGGU VERIFIKASI ADMIN
        </span>
    </div>
    @endif
    @endif

    <!-- Cards Main Stage -->
    <main class="cards-stage">

        <!-- ================= 1. VIRTUAL 3D COMMITTEE PASS STAGE ================= -->
        <div class="virtual-stage" id="virtualStage">

            <!-- Lanyard Mount (Strap + Metallic Clasp) -->
            <div class="lanyard-mount">
                <div class="lanyard-strap"></div>
                <div class="lanyard-clip"></div>
            </div>

            <!-- 3D Scene Viewport -->
            <div class="card-3d-scene" id="card3dScene">
                <div class="card-scale-container" id="cardScaleContainer">
                    <div class="card-3d-flipper" id="cardFlipper">

                        <!-- FRONT FACE -->
                        <div class="card-face card-front-face">
                            <div class="omatiq-card card-front">
                                <!-- Decorative Tech Corner Patterns -->
                                <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                                <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">

                                <!-- Punch slot for lanyard pass -->
                                <div class="badge-punch-slot"></div>

                                @if(! $isVerified)
                                <div class="badge-unverified-overlay">
                                    BUKTI PENDAFTARAN SEMENTARA &bull; MENUNGGU VERIFIKASI
                                </div>
                                @endif

                                <!-- Centered Header YM Logo -->
                                <div class="card-header-logo">
                                    <img src="{{ asset('assets/images/icon-omatiq.png') }}" alt="Logo OMATIQ 2026" class="logo-omatiq">
                                    <img src="{{ asset('assets/images/icon-ym.png') }}" alt="Yatim Mandiri" class="logo-ym">
                                </div>

                                <!-- Label Panitia (Vector Banner Typography) -->
                                <div class="committee-badge-pill {{ $statusClass }}">Peserta</div>

                                <!-- Official Title OMATIQ 2026 -->
                                <div class="card-title-wrap">
                                    <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" class="card-title-img" alt="OMATIQ 2026">
                                </div>

                                <!-- Transparent Glass Data Box (ID & Biodata) -->
                                <div class="committee-data-box">
                                    <!-- Mascots Peeking at Top-Right Corner Outside the Box -->
                                    <div class="card-mascot-corner">
                                        <img src="{{ asset('assets/images/Zakki Amila Atas.png') }}" class="card-mascot-img" alt="Zakki &amp; Amila">
                                    </div>

                                    <div class="committee-name">{{ ucwords(strtolower($student->full_name ?? $participant->user?->name ?? 'Peserta')) }}</div>
                                    <div class="committee-id-badge" style="font-size:9px; letter-spacing:0.8px; margin:3px 0 6px;">REGISTRATION / BIB: &nbsp;{{ $participant->registration_number }}</div>

                                    <div class="data-divider"></div>

                                    <div style="text-align:left; width:100%; padding:0 4px;">
                                        <table style="width:100%; border-collapse:collapse; font-size:10px; line-height:1.65;">
                                            <tr>
                                                <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px; vertical-align:top;">Asal Sekolah</td>
                                                <td style="color:#065f46; font-weight:600; padding:0 4px; vertical-align:top;">:</td>
                                                <td style="color:#065f46; font-weight:600;">{{ $student->school_name ?? '-' }}</td>
                                            </tr>
                                            @if(!empty($student->school_level) || !empty($student->grade))
                                            <tr>
                                                <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Jenjang &amp; Kelas</td>
                                                <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                                <td style="color:#065f46; font-weight:600;">{{ $student->school_level ?? 'SD/MI' }} &bull; Kelas {{ $student->grade ?? '-' }}</td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Cabang / Wilayah</td>
                                                <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                                <td style="color:#065f46; font-weight:600;">{{ $participant->branch ?? $student->regency?->name ?? 'Pusat' }}</td>
                                            </tr>
                                            @if(!empty($student->parent_name))
                                            <tr>
                                                <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Orang Tua / Wali</td>
                                                <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                                <td style="color:#065f46; font-weight:600;">{{ $student->parent_name }}</td>
                                            </tr>
                                            @endif
                                        </table>
                                    </div>
                                </div>

                                <!-- Sponsor Box (Second Frosted Glass Box) -->
                                <div class="committee-sponsors-box">
                                    <div class="card-sponsors-wrap">
                                        <div class="sponsors-label">Supported by:</div>
                                        <div class="sponsors-row sponsors-row-1">
                                            <img src="{{ asset('assets/images/sponsor/telkomsel.png') }}" alt="Telkomsel" title="Telkomsel">
                                            <img src="{{ asset('assets/images/sponsor/telkom.png') }}" alt="Telkom Indonesia" title="Telkom Indonesia">
                                            <img src="{{ asset('assets/images/sponsor/chickin.png') }}" alt="Chickin" title="Chickin">
                                            <img src="{{ asset('assets/images/sponsor/bankaltimtara.png') }}" alt="bankaltimtara" title="bankaltimtara">
                                        </div>
                                        <div class="sponsors-row sponsors-row-2">
                                            <img src="{{ asset('assets/images/sponsor/bankbjb.png') }}" alt="bank bjb" title="bank bjb">
                                            <img src="{{ asset('assets/images/sponsor/ybmpln.png') }}" alt="YBM PLN" title="YBM PLN">
                                            <img src="{{ asset('assets/images/sponsor/nurulhidayah.png') }}" alt="Nurul Hidayah" title="Nurul Hidayah">
                                            <img src="{{ asset('assets/images/sponsor/linkaja.png') }}" alt="LinkAja" title="LinkAja">
                                            <img src="{{ asset('assets/images/sponsor/linkaja-syariah.png') }}" alt="LinkAja Syariah" title="LinkAja Syariah">
                                        </div>
                                    </div>
                                </div>

                                <!-- Official Website URL on Front -->
                                <div class="card-front-web">www.omatiq.com</div>

                                <!-- Specular Glare -->
                                <div class="card-glare" id="cardGlareFront"></div>
                            </div>
                        </div>

                        <!-- BACK FACE -->
                        <div class="card-face card-back-face">
                            <div class="omatiq-card card-back">
                                <!-- Decorative Tech Corner Patterns -->
                                <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                                <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">

                                <!-- Punch slot for lanyard pass -->
                                <div class="badge-punch-slot"></div>

                                <!-- Title OMATIQ 2026 -->
                                <div class="card-back-title-wrap">
                                    <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" class="card-back-title-img" alt="OMATIQ 2026">
                                </div>

                                <!-- HD Mascots on Left & Right (Single Instance, Zero Double Image) -->
                                <img src="{{ asset('assets/images/Zakki Window Hi.png') }}" class="mascot-back-zakki" alt="Zakki">
                                <img src="{{ asset('assets/images/Amila Window Hi.png') }}" class="mascot-back-amila" alt="Amila">

                                <!-- Centered QR Container -->
                                <div class="committee-qr-box">
                                    <div class="qr-svg-wrapper">
                                        {!! $qrCodeSvg !!}

                                        @if(! $isVerified)
                                        <div class="qr-lock-container">
                                            <div class="qr-void-banner">SECURITY VOID • INACTIVE</div>
                                            <div class="lock-badge-icon">🔒</div>
                                            <div class="lock-badge-title">AKSES TERKUNCI</div>
                                            <div class="lock-badge-subtitle">Menunggu verifikasi pendaftaran oleh Administrator</div>
                                        </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Official Website URL -->
                                <div class="card-back-web">www.omatiq.com</div>

                                <!-- Specular Glare -->
                                <div class="card-glare" id="cardGlareBack"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Virtual Floating Controls Dock -->
            <div class="virtual-controls-dock no-print">
                <div class="side-switcher">
                    <button type="button" class="side-pill active" id="pillFront" onclick="setCardSide(false)">
                        <span class="side-pill-dot"></span>
                        Sisi Depan
                    </button>
                    <button type="button" class="side-pill" id="pillBack" onclick="setCardSide(true)">
                        <span class="side-pill-dot"></span>
                        Sisi Belakang
                    </button>
                </div>

                <button type="button" class="btn-flip-primary" onclick="toggleCardFlip()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    Balik Kartu
                </button>

                <div class="dock-divider"></div>

                <div class="zoom-group">
                    <button type="button" class="btn-zoom" onclick="adjustZoom(-0.1)" title="Zoom Out">-</button>
                    <span class="zoom-badge" id="zoomBadge">100%</span>
                    <button type="button" class="btn-zoom" onclick="adjustZoom(0.1)" title="Zoom In">+</button>
                    <button type="button" class="btn-zoom" onclick="resetZoom()" title="Reset Skala">↺</button>
                </div>
            </div>

            <div class="virtual-hint-chip no-print">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Geser (Swipe) atau klik tombol Balik Kartu untuk melihat QR scanner verifikasi
            </div>

        </div>

        <!-- ================= 2. PRINT SHEET PREVIEW (A4 Folding Pass) ================= -->
        <div class="print-sheet" id="printSheet">

            <!-- FRONT CARD (Left Side in Folding Layout) -->
            <div class="cut-guide-border">
                <div class="omatiq-card card-front">
                    <!-- Decorative Tech Corner Patterns -->
                    <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                    <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">

                    <!-- Punch slot for lanyard pass -->
                    <div class="badge-punch-slot"></div>

                    @if(! $isVerified)
                    <div class="badge-unverified-overlay">
                        BUKTI PENDAFTARAN SEMENTARA &bull; MENUNGGU VERIFIKASI
                    </div>
                    @endif

                    <!-- Centered Header YM Logo -->
                    <div class="card-header-logo">
                        <img src="{{ asset('assets/images/icon-omatiq.png') }}" alt="Logo OMATIQ 2026" class="logo-omatiq">
                        <img src="{{ asset('assets/images/icon-ym.png') }}" alt="Yatim Mandiri" class="logo-ym">
                    </div>

                    <!-- Label Panitia (Vector Banner Typography) -->
                    <div class="committee-badge-pill {{ $statusClass }}">Peserta</div>

                    <!-- Official Title OMATIQ 2026 -->
                    <div class="card-title-wrap">
                        <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" class="card-title-img" alt="OMATIQ 2026">
                    </div>

                    <!-- Transparent Glass Data Box (ID & Biodata) -->
                    <div class="committee-data-box">
                        <!-- Mascots Peeking at Top-Right Corner Outside the Box -->
                        <div class="card-mascot-corner">
                            <img src="{{ asset('assets/images/Zakki Amila Atas.png') }}" class="card-mascot-img" alt="Zakki &amp; Amila">
                        </div>

                        <div class="committee-name">{{ ucwords(strtolower($student->full_name ?? $participant->user?->name ?? 'Peserta')) }}</div>
                        <div class="committee-id-badge" style="font-size:9px; letter-spacing:0.8px; margin:3px 0 6px;">REGISTRATION / BIB: &nbsp;{{ $participant->registration_number }}</div>

                        <div class="data-divider"></div>

                        <div style="text-align:left; width:100%; padding:0 4px;">
                            <table style="width:100%; border-collapse:collapse; font-size:10px; line-height:1.65;">
                                <tr>
                                    <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px; vertical-align:top;">Asal Sekolah</td>
                                    <td style="color:#065f46; font-weight:600; padding:0 4px; vertical-align:top;">:</td>
                                    <td style="color:#065f46; font-weight:600;">{{ $student->school_name ?? '-' }}</td>
                                </tr>
                                @if(!empty($student->school_level) || !empty($student->grade))
                                <tr>
                                    <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Jenjang &amp; Kelas</td>
                                    <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                    <td style="color:#065f46; font-weight:600;">{{ $student->school_level ?? 'SD/MI' }} &bull; Kelas {{ $student->grade ?? '-' }}</td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Cabang / Wilayah</td>
                                    <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                    <td style="color:#065f46; font-weight:600;">{{ $participant->branch ?? $student->regency?->name ?? 'Pusat' }}</td>
                                </tr>
                                @if(!empty($student->parent_name))
                                <tr>
                                    <td style="color:#065f46; font-weight:700; white-space:nowrap; padding-right:4px;">Orang Tua / Wali</td>
                                    <td style="color:#065f46; font-weight:600; padding:0 4px;">:</td>
                                    <td style="color:#065f46; font-weight:600;">{{ $student->parent_name }}</td>
                                </tr>
                                @endif
                            </table>
                        </div>
                    </div>

                    <!-- Sponsor Box (Second Frosted Glass Box) -->
                    <div class="committee-sponsors-box">
                        <div class="card-sponsors-wrap">
                            <div class="sponsors-label">Supported by:</div>
                            <div class="sponsors-row sponsors-row-1">
                                <img src="{{ asset('assets/images/sponsor/telkomsel.png') }}" alt="Telkomsel" title="Telkomsel">
                                <img src="{{ asset('assets/images/sponsor/telkom.png') }}" alt="Telkom Indonesia" title="Telkom Indonesia">
                                <img src="{{ asset('assets/images/sponsor/chickin.png') }}" alt="Chickin" title="Chickin">
                                <img src="{{ asset('assets/images/sponsor/bankaltimtara.png') }}" alt="bankaltimtara" title="bankaltimtara">
                            </div>
                            <div class="sponsors-row sponsors-row-2">
                                <img src="{{ asset('assets/images/sponsor/bankbjb.png') }}" alt="bank bjb" title="bank bjb">
                                <img src="{{ asset('assets/images/sponsor/ybmpln.png') }}" alt="YBM PLN" title="YBM PLN">
                                <img src="{{ asset('assets/images/sponsor/nurulhidayah.png') }}" alt="Nurul Hidayah" title="Nurul Hidayah">
                                <img src="{{ asset('assets/images/sponsor/linkaja.png') }}" alt="LinkAja" title="LinkAja">
                                <img src="{{ asset('assets/images/sponsor/linkaja-syariah.png') }}" alt="LinkAja Syariah" title="LinkAja Syariah">
                            </div>
                        </div>
                    </div>

                    <!-- Official Website URL on Front -->
                    <div class="card-front-web">www.omatiq.com</div>
                </div>
            </div>

            <!-- FOLD GUIDE DIVIDER -->
            <div class="fold-divider">
                <div class="fold-label">Garis Lipat Tengah</div>
            </div>

            <!-- BACK CARD (Right Side in Folding Layout) -->
            <div class="cut-guide-border">
                <div class="omatiq-card card-back">
                    <!-- Decorative Tech Corner Patterns -->
                    <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                    <img src="{{ asset('assets/images/elect-non-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">

                    <!-- Punch slot for lanyard pass -->
                    <div class="badge-punch-slot"></div>

                    <!-- Title OMATIQ 2026 -->
                    <div class="card-back-title-wrap">
                        <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" class="card-back-title-img" alt="OMATIQ 2026">
                    </div>

                    <!-- HD Mascots on Left & Right (Single Instance, Zero Double Image) -->
                    <img src="{{ asset('assets/images/Zakki Window Hi.png') }}" class="mascot-back-zakki" alt="Zakki">
                    <img src="{{ asset('assets/images/Amila Window Hi.png') }}" class="mascot-back-amila" alt="Amila">

                    <!-- Centered QR Container -->
                    <div class="committee-qr-box">
                        <div class="qr-svg-wrapper">
                            {!! $qrCodeSvg !!}

                            @if(! $isVerified)
                            <div class="qr-lock-container">
                                <div class="qr-void-banner">SECURITY VOID • INACTIVE</div>
                                <div class="lock-badge-icon">🔒</div>
                                <div class="lock-badge-title">AKSES TERKUNCI</div>
                                <div class="lock-badge-subtitle">Menunggu verifikasi pendaftaran oleh Administrator</div>
                            </div>
                            @endif
                        </div>
                    </div>

                    <!-- Official Website URL -->
                    <div class="card-back-web">www.omatiq.com</div>
                </div>
            </div>

        </div>

        <!-- Print Instructions Panel -->
        <div class="print-instructions no-print" id="printInstructions">
            <div class="inst-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Petunjuk Cetak Lembar Kartu Tanda Peserta (A4 Pass):
            </div>
            <ol class="inst-list">
                <li>Gunakan kertas A4 tebal berjenis <strong>Brief Card (BC), Karton Concorde, atau Art Paper 210-260 gsm</strong> untuk ketahanan maksimal.</li>
                <li>Pada dialog cetak browser (<code>Ctrl + P</code> / <code>Cmd + P</code>), pilih ukuran kertas <strong>A4</strong> dengan orientasi <strong>Portrait</strong>.</li>
                <li>Atur margin ke <strong>None / Minimum</strong> dan pastikan opsi <strong>Background Graphics (Grafis Latar Belakang) dicentang</strong>.</li>
                <li>Setel Scale / Skala ke <strong>100% (Default)</strong> agar dimensi kartu presisi 86 mm × 136.5 mm per sisi.</li>
                <li>Gunting mengikuti garis putus-putus luar, lalu lipat tepat pada garis tengah untuk dimasukkan ke dalam plastik mika ID Pass Lanyard panitia.</li>
            </ol>
        </div>

    </main>

    @if(empty($isPdf))
    <script>
        (function() {
            // State
            let isFlipped = false;
            let currentZoom = 1.0;
            let baseScale = 1.0;
            let isDragging = false;
            let startX = 0;
            let startY = 0;
            let currentRotateX = 0;
            let currentRotateY = 0;
            let targetRotateX = 0;
            let targetRotateY = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            let lastTouchFlipTime = 0;

            const flipper = document.getElementById('cardFlipper');
            const scaleContainer = document.getElementById('cardScaleContainer');
            const scene = document.getElementById('card3dScene');
            const glareFront = document.getElementById('cardGlareFront');
            const glareBack = document.getElementById('cardGlareBack');
            const pillFront = document.getElementById('pillFront');
            const pillBack = document.getElementById('pillBack');
            const zoomBadge = document.getElementById('zoomBadge');
            const virtualStage = document.getElementById('virtualStage');
            const printSheet = document.getElementById('printSheet');
            const printInstructions = document.getElementById('printInstructions');
            const btnModeVirtual = document.getElementById('btnModeVirtual');
            const btnModePrint = document.getElementById('btnModePrint');

            // Responsive auto-scaler for mobile devices
            function updateResponsiveScale() {
                if (!scaleContainer) return;
                const viewportWidth = window.innerWidth;
                const horizontalPadding = 32;
                const availableWidth = viewportWidth - horizontalPadding;
                const cardWidth = 372;

                if (availableWidth < cardWidth) {
                    baseScale = Math.max(0.68, availableWidth / cardWidth);
                } else {
                    baseScale = 1.0;
                }
                applyTransform();
            }

            function applyTransform() {
                if (!scaleContainer) return;
                const effectiveScale = baseScale * currentZoom;
                scaleContainer.style.transform = 'scale(' + effectiveScale + ')';
                if (zoomBadge) {
                    zoomBadge.textContent = Math.round(currentZoom * 100) + '%';
                }
            }

            // Public Toggle Functions
            window.toggleCardFlip = function() {
                isFlipped = !isFlipped;
                syncFlipState();
            };

            window.setCardSide = function(flipToBack) {
                isFlipped = flipToBack;
                syncFlipState();
            };

            function syncFlipState() {
                if (!flipper) return;
                if (isFlipped) {
                    flipper.classList.add('is-flipped');
                    if (pillBack) pillBack.classList.add('active');
                    if (pillFront) pillFront.classList.remove('active');
                } else {
                    flipper.classList.remove('is-flipped');
                    if (pillFront) pillFront.classList.add('active');
                    if (pillBack) pillBack.classList.remove('active');
                }
            }

            window.adjustZoom = function(delta) {
                currentZoom = Math.min(1.5, Math.max(0.6, currentZoom + delta));
                applyTransform();
            };

            window.resetZoom = function() {
                currentZoom = 1.0;
                applyTransform();
            };

            window.switchViewMode = function(mode) {
                if (mode === 'virtual') {
                    if (virtualStage) virtualStage.style.display = 'flex';
                    if (printSheet) printSheet.classList.remove('is-visible');
                    if (printInstructions) printInstructions.classList.remove('is-visible');
                    if (btnModeVirtual) btnModeVirtual.classList.add('active');
                    if (btnModePrint) btnModePrint.classList.remove('active');
                    updateResponsiveScale();
                } else {
                    if (virtualStage) virtualStage.style.display = 'none';
                    if (printSheet) printSheet.classList.add('is-visible');
                    if (printInstructions) printInstructions.classList.add('is-visible');
                    if (btnModeVirtual) btnModeVirtual.classList.remove('active');
                    if (btnModePrint) btnModePrint.classList.add('active');
                }
            };

            // Parallax Tilt & Specular Shine on Mouse Move
            if (scene) {
                scene.addEventListener('mousemove', function(e) {
                    const rect = scene.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Calculate tilt angles (-12deg to 12deg)
                    targetRotateY = ((x - centerX) / centerX) * 12;
                    targetRotateX = -((y - centerY) / centerY) * 12;

                    // Specular Glare position
                    const activeGlare = isFlipped ? glareBack : glareFront;
                    if (activeGlare) {
                        const px = (x / rect.width) * 100;
                        const py = (y / rect.height) * 100;
                        activeGlare.style.opacity = '0.55';
                        activeGlare.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 65%)';
                    }
                });

                scene.addEventListener('mouseleave', function() {
                    targetRotateX = 0;
                    targetRotateY = 0;
                    if (glareFront) glareFront.style.opacity = '0';
                    if (glareBack) glareBack.style.opacity = '0';
                });

                // Mobile Swipe & Tap Gestures with Debounce
                scene.addEventListener('touchstart', function(e) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }, { passive: true });

                scene.addEventListener('touchend', function(e) {
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    const deltaX = touchEndX - touchStartX;
                    const deltaY = touchEndY - touchStartY;

                    // Horizontal swipe detected
                    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                        lastTouchFlipTime = Date.now();
                        toggleCardFlip();
                    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                        // Quick tap on card flips it
                        lastTouchFlipTime = Date.now();
                        toggleCardFlip();
                    }
                }, { passive: true });

                // Click on card flipper to flip (debounced to avoid duplicate trigger after touch)
                scene.addEventListener('click', function(e) {
                    if (Date.now() - lastTouchFlipTime < 650) return;
                    toggleCardFlip();
                });
            }

            // Smooth Interpolation Loop for Tilt Physics
            function renderTilt() {
                currentRotateX += (targetRotateX - currentRotateX) * 0.12;
                currentRotateY += (targetRotateY - currentRotateY) * 0.12;

                if (flipper) {
                    const flipBase = isFlipped ? 180 : 0;
                    const totalY = flipBase + (isFlipped ? -currentRotateY : currentRotateY);
                    flipper.style.transform = 'rotateX(' + currentRotateX.toFixed(2) + 'deg) rotateY(' + totalY.toFixed(2) + 'deg)';
                }
                requestAnimationFrame(renderTilt);
            }
            renderTilt();

            // Auto-scale on load and resize
            window.addEventListener('resize', updateResponsiveScale);
            window.addEventListener('orientationchange', function() {
                setTimeout(updateResponsiveScale, 200);
            });
            updateResponsiveScale();

            // Font-size auto-shrinker for long names
            const nameEl = document.querySelector('.committee-name');
            if (nameEl && nameEl.textContent.trim().length > 18) {
                const len = nameEl.textContent.trim().length;
                if (len > 25) {
                    nameEl.style.fontSize = '16px';
                } else {
                    nameEl.style.fontSize = '18.5px';
                }
            }
        })();
    </script>
    @endif

</body>
</html>
