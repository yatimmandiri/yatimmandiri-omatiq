<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Kartu-Pendamping-OMATIQ-{{ $chaperoneIdFormatted }}-{{ $chaperone->name }}</title>
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
            background: linear-gradient(135deg, #fefce8 0%, #fffbeb 40%, #fef9c3 100%);
            color: #7a6400;
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
            border: 1px solid rgba(122, 100, 0, 0.2);
            box-shadow: 0 10px 30px rgba(122, 100, 0, 0.08);
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
            color: #7a6400;
            letter-spacing: -0.2px;
            line-height: 1.25;
        }

        .toolbar-subtitle {
            font-size: 11px;
            color: #9c8210;
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
            border: 1px solid rgba(122, 100, 0, 0.25);
            background: #ffffff;
            color: #7a6400;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-view-mode.active, .btn-view-mode:hover {
            background: #7a6400;
            color: #ffffff;
            border-color: #7a6400;
            box-shadow: 0 4px 12px rgba(122, 100, 0, 0.25);
        }

        .btn-print {
            padding: 8px 18px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 800;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #7a6400 0%, #9c8210 100%);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(122, 100, 0, 0.35);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #685500 0%, #856f00 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(122, 100, 0, 0.4);
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

        /* ================= VIRTUAL 3D CHAPERONE PASS STAGE ================= */
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
            background: linear-gradient(90deg, #7a6400 0%, #a18200 50%, #685500 100%);
            box-shadow: 0 4px 14px rgba(122, 100, 0, 0.4);
            border-radius: 4px 4px 0 0;
            position: relative;
        }

        .lanyard-strap::after {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.12) 3px, rgba(255, 255, 255, 0.12) 6px);
        }

        .lanyard-clip {
            width: 28px;
            height: 32px;
            background: linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 35%, #94a3b8 70%, #64748b 100%);
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
            box-shadow: 0 25px 60px rgba(122, 100, 0, 0.18), 0 6px 18px rgba(0, 0, 0, 0.1);
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
            width: 52px;
            height: 14px;
            background: #ffffff;
            border-radius: 7px;
            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.8);
            border: 2px solid rgba(122, 100, 0, 0.35);
            z-index: 20;
            pointer-events: none;
        }

        .badge-punch-slot::after {
            content: '';
            position: absolute;
            inset: 2px 4px;
            background: #0f172a;
            border-radius: 4px;
            box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.8);
        }

        /* Dynamic Parallax Glare Highlight Overlay */
        .card-glare {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 15;
            background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%);
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
            border: 1px solid rgba(122, 100, 0, 0.2);
            box-shadow: 0 10px 30px rgba(122, 100, 0, 0.1);
            flex-wrap: wrap;
            max-width: 95vw;
        }

        .side-switcher {
            display: flex;
            align-items: center;
            background: #fffdf5;
            padding: 3px;
            border-radius: 12px;
            border: 1px solid rgba(122, 100, 0, 0.18);
            gap: 2px;
        }

        .side-pill {
            padding: 6px 14px;
            border-radius: 9px;
            font-size: 11.5px;
            font-weight: 700;
            border: none;
            background: transparent;
            color: #7a6400;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .side-pill.active {
            background: #7a6400;
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(122, 100, 0, 0.3);
        }

        .side-pill-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #cbd5e1;
        }

        .side-pill.active .side-pill-dot {
            background: #fde047;
        }

        .btn-flip-primary {
            padding: 8px 16px;
            border-radius: 11px;
            font-size: 12px;
            font-weight: 800;
            border: 1px solid #7a6400;
            background: linear-gradient(135deg, #7a6400 0%, #9c8210 100%);
            color: #ffffff;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(122, 100, 0, 0.3);
            transition: all 0.2s ease;
        }

        .btn-flip-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(122, 100, 0, 0.4);
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
            background: rgba(122, 100, 0, 0.2);
        }

        .zoom-group {
            display: flex;
            align-items: center;
            background: #fffdf5;
            border-radius: 12px;
            padding: 3px;
            border: 1px solid rgba(122, 100, 0, 0.18);
            gap: 3px;
        }

        .btn-zoom {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: none;
            background: #ffffff;
            color: #7a6400;
            font-size: 13px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .btn-zoom:hover {
            background: #7a6400;
            color: #ffffff;
        }

        .zoom-badge {
            font-size: 11px;
            font-weight: 800;
            color: #7a6400;
            min-width: 44px;
            text-align: center;
            font-family: monospace;
        }

        .virtual-hint-chip {
            margin-top: 12px;
            font-size: 11px;
            color: #7a6400;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.75);
            padding: 5px 12px;
            border-radius: 20px;
            border: 1px solid rgba(122, 100, 0, 0.15);
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

        /* Front & Back Background Templates (Menggunakan bg-pendamping.png dengan adaptasi gradasi) */
        .card-front, .card-back {
            background-color: #fdfaf2;
            background-image:
                linear-gradient(180deg, #fdfaf2 0%, #fdfaf2 16%, rgba(253, 250, 242, 0.3) 35%, rgba(253, 250, 242, 0) 50%),
                url("{{ asset('assets/images/bg-pendamping.png') }}");
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

        /* Front: Label Pendamping (Gradient Horizontal Banner Typography) */
        .committee-badge-pill {
            position: absolute;
            top: 96px;
            left: 0;
            right: 0;
            width: 100%;
            height: 44px;
            background: linear-gradient(90deg, rgba(255, 253, 210, 0) 0%, rgba(255, 253, 210, 0.45) 10%, #fffdd2 22%, #fffdd2 78%, rgba(255, 253, 210, 0.45) 90%, rgba(255, 253, 210, 0) 100%);
            color: #7a6400;
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
            filter: drop-shadow(0 2px 4px rgba(122, 100, 0, 0.25));
        }

        /* Front: Transparent Frosted Glass Chaperone Data Box */
        .committee-data-box {
            position: absolute;
            top: 316px;
            left: 50%;
            transform: translateX(-50%);
            width: 90.0%;
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
            padding: 16px 14px 12px;
            box-shadow: 0 10px 30px rgba(122, 100, 0, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.8);
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
            color: #7a6400;
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
            color: #8c7300;
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
            color: #7a6400;
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
            color: #9c8210;
            letter-spacing: 1.2px;
            text-align: center;
            margin-top: 2px;
            font-family: 'Courier New', Courier, monospace;
        }

        .data-divider {
            width: 84%;
            height: 1px;
            background: rgba(122, 100, 0, 0.2);
            margin: 6px auto 5px;
        }

        /* Front: Sponsors Bar (HD Assets) */
        .card-sponsors-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            margin-top: 2px;
        }

        .sponsors-label {
            font-size: 7.5px;
            font-weight: 800;
            color: #7a6400;
            margin-bottom: 4px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            opacity: 0.9;
        }

        .sponsors-grid {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px 10px;
            max-width: 95%;
        }

        .sponsor-logo {
            height: 14px;
            width: auto;
            max-width: 58px;
            object-fit: contain;
            filter: contrast(1.05);
        }

        /* Front: Official Website URL at Bottom */
        .card-front-web {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            color: #7a6400;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.85);
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
            filter: drop-shadow(0 2px 4px rgba(122, 100, 0, 0.25));
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
            box-shadow: 0 12px 32px rgba(122, 100, 0, 0.22);
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
            background: rgba(255, 255, 255, 0.92);
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
            font-size: 28px;
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
            line-height: 1.25;
            margin-top: 2px;
            max-width: 140px;
        }

        /* Back: Official Website URL */
        .card-back-web {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #7a6400;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.85);
            z-index: 5;
            white-space: nowrap;
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
            box-shadow: 0 16px 45px rgba(122, 100, 0, 0.12);
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

        .sheet-sub-toolbar {
            display: none;
            gap: 8px;
            margin-bottom: 14px;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }

        .sheet-sub-toolbar.is-visible {
            display: flex;
        }

        .btn-sub-mode {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 700;
            border: 1px solid rgba(122, 100, 0, 0.25);
            background: #ffffff;
            color: #7a6400;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-sub-mode.active, .btn-sub-mode:hover {
            background: #7a6400;
            color: #ffffff;
            border-color: #7a6400;
        }

        /* Print Instructions Card (Screen Only) */
        .print-instruction-note {
            display: none;
            max-width: 820px;
            margin-top: 18px;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(122, 100, 0, 0.2);
            border-radius: 14px;
            padding: 12px 18px;
            font-size: 11.5px;
            color: #7a6400;
            line-height: 1.5;
            box-shadow: 0 4px 14px rgba(122, 100, 0, 0.06);
        }

        .print-instruction-note.is-visible {
            display: block;
        }

        .print-instruction-note strong {
            color: #685500;
        }

        /* Mobile Adjustments */
        @media screen and (max-width: 640px) {
            body {
                padding: 10px 8px 36px;
            }

            .toolbar {
                padding: 10px 12px;
                border-radius: 14px;
                gap: 8px;
            }

            .toolbar-title {
                font-size: 12px;
            }

            .toolbar-subtitle {
                font-size: 10px;
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

        /* ================= STRICT PRINT STYLES ================= */
        @media print {
            body {
                background: #ffffff !important;
                background-image: none !important;
                padding: 0 !important;
                margin: 0 !important;
                min-height: auto !important;
                display: block !important;
            }

            .toolbar, .status-banner, .virtual-stage, .sheet-sub-toolbar, .print-instruction-note {
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
                display: flex !important;
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

            .card-corner-pattern {
                width: 28mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }


            .badge-punch-slot {
                top: 2.5mm !important;
                width: 12mm !important;
                height: 3.2mm !important;
                border-radius: 1.6mm !important;
                border-width: 0.5mm !important;
            }

            .badge-punch-slot::after {
                inset: 0.5mm 1mm !important;
                border-radius: 1mm !important;
            }

            .badge-unverified-overlay {
                width: 78.4mm !important;
                top: 3.5mm !important;
                font-size: 5.5pt !important;
                padding: 1.2mm 2mm !important;
            }

            .card-header-logo {
                top: 7.0mm !important;
                gap: 1.8mm !important;
            }

            .card-header-logo img {
                height: 9.2mm !important;
            }

            .committee-badge-pill {
                top: 22.0mm !important;
                height: 10.2mm !important;
                font-size: 15.5pt !important;
                letter-spacing: 0.3mm !important;
                color: #7a6400 !important;
                background: linear-gradient(90deg, rgba(255, 253, 210, 0) 0%, rgba(255, 253, 210, 0.45) 10%, #fffdd2 22%, #fffdd2 78%, rgba(255, 253, 210, 0.45) 90%, rgba(255, 253, 210, 0) 100%) !important;
            }

            .card-title-wrap {
                top: 35.5mm !important;
                width: 84% !important;
            }

            .card-title-img {
                max-width: 71.5mm !important;
            }

            .committee-data-box {
                width: 77.4mm !important;
                top: 73.0mm !important;
                border-radius: 5.5mm !important;
                padding: 3.8mm 3.2mm 2.8mm !important;
                border-width: 0.4mm !important;
            }

            .card-mascot-corner {
                right: 4.6mm !important;
                margin-bottom: -2.3mm !important;
            }

            .card-mascot-img {
                width: 24.2mm !important;
            }

            .committee-name {
                font-size: 12.5pt !important;
                margin-bottom: 0.5mm !important;
                color: #7a6400 !important;
            }

            .committee-meta {
                font-size: 6.8pt !important;
                color: #8c7300 !important;
            }

            .committee-branch {
                font-size: 6.8pt !important;
                color: #7a6400 !important;
                margin-top: 0.3mm !important;
            }

            .committee-id-badge {
                font-size: 5.8pt !important;
                color: #9c8210 !important;
                margin-top: 0.5mm !important;
            }

            .data-divider {
                margin: 1.4mm auto 1.2mm !important;
                background: rgba(122, 100, 0, 0.25) !important;
            }

            .sponsors-label {
                font-size: 4.5pt !important;
                color: #7a6400 !important;
                margin-bottom: 0.9mm !important;
            }

            .sponsors-grid {
                gap: 1.4mm 2.2mm !important;
            }

            .sponsor-logo {
                height: 3.2mm !important;
                max-width: 13.4mm !important;
            }

            .card-front-web {
                bottom: 2.8mm !important;
                font-size: 5.8pt !important;
                color: #7a6400 !important;
                text-shadow: none !important;
            }

            .card-back-title-wrap {
                top: 11.0mm !important;
                width: 82% !important;
            }

            .card-back-title-img {
                max-width: 68.0mm !important;
            }

            .mascot-back-zakki {
                bottom: 25.4mm !important;
                left: -1.8mm !important;
                width: 31.4mm !important;
            }

            .mascot-back-amila {
                bottom: 24.2mm !important;
                right: -2.8mm !important;
                width: 31.4mm !important;
            }

            .committee-qr-box {
                top: 52.2mm !important;
                width: 50.0mm !important;
                height: 50.0mm !important;
            }

            .qr-svg-wrapper {
                max-width: 50.0mm !important;
                max-height: 50.0mm !important;
                border-radius: 5.5mm !important;
                padding: 2.8mm !important;
            }

            .qr-void-banner {
                top: 3.2mm !important;
                font-size: 5pt !important;
                padding: 0.7mm 0 !important;
            }

            .lock-badge-icon {
                font-size: 16pt !important;
            }

            .lock-badge-title {
                font-size: 6.5pt !important;
            }

            .lock-badge-subtitle {
                font-size: 4.5pt !important;
                max-width: 32mm !important;
            }

            .card-back-web {
                bottom: 4.6mm !important;
                font-size: 6pt !important;
                color: #7a6400 !important;
                text-shadow: none !important;
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
                <div class="toolbar-title">OMATIQ 2026 &bull; Kartu Tanda Pengenal Pendamping</div>
                <div class="toolbar-subtitle">{{ $chaperoneIdFormatted }} &bull; {{ $chaperone->name }}</div>
            </div>
        </div>

        <div class="toolbar-actions">
            <!-- View Mode Switcher -->
            <button type="button" class="btn-view-mode active" id="btnViewVirtual" onclick="switchView('virtual')" title="Tampilan Kartu Virtual 3D Interaktif (Responsif)">
                <span>🪪 Kartu Virtual 3D</span>
            </button>
            <button type="button" class="btn-view-mode" id="btnViewSheet" onclick="switchView('sheet')" title="Tampilan Lembar Cetak Kertas A4 (Lipat/Duplex)">
                <span>📄 Lembar Cetak A4</span>
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
                <strong>&#9203; MENUNGGU PERSETUJUAN RESMI</strong> &mdash; Kartu pendamping sedang dalam proses verifikasi admin pusat.
            </div>
            <div>STATUS: MENUNGGU VERIFIKASI</div>
        </div>
    @else
        <div class="status-banner verified">
            <div>
                <strong>&#10003; KARTU PENDAMPING RESMI TERVERIFIKASI</strong> &mdash; Akses resmi pendamping Babak Final Nasional aktif.
            </div>
            <div>STATUS: TERVERIFIKASI RESMI</div>
        </div>
    @endif
    @endif

    <!-- Cards Container Stage -->
    <div class="cards-stage">

        @if(empty($isPdf))
        <!-- ================= VIRTUAL 3D CHAPERONE PASS STAGE ================= -->
        <div class="virtual-stage" id="virtualStage">
            <!-- Lanyard Ribbon & Clip Graphic (Deep Teal / Tech Theme) -->
            <div class="lanyard-mount">
                <div class="lanyard-strap"></div>
                <div class="lanyard-clip"></div>
            </div>

            <!-- 3D Scene Viewport with Interactive Tilt & Parallax -->
            <div class="card-3d-scene" id="cardScene" title="Klik atau geser untuk membalik sisi kartu">
                <div class="card-scale-container" id="cardScaleContainer">
                    <div class="card-3d-flipper" id="cardFlipper">
                        
                        <!-- SISI DEPAN (FRONT FACE) -->
                        <div class="card-face card-front-face omatiq-card card-front">
                            <!-- Decorative Tech Corner Patterns -->
                            <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                            <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">
                            <div class="badge-punch-slot"></div>
                            <div class="card-glare" id="glareFront"></div>

                            <!-- Warning Badge: Hanya ditampilkan jika pendamping belum terverifikasi -->
                            @if(empty($isVerified))
                            <div class="badge-unverified-overlay">
                                PENDAMPING NASIONAL • MENUNGGU VERIFIKASI
                            </div>
                            @endif

                            <!-- Center Header YM Logo -->
                            <div class="card-header-logo">
                                <img src="{{ asset('assets/images/icon-omatiq.png') }}" alt="OMATIQ">
                                <img src="{{ asset('assets/images/icon-ym.png') }}" alt="Yatim Mandiri">
                            </div>

                            <!-- Label Pendamping (Gradient Horizontal Banner) -->
                            <div class="committee-badge-pill">
                                Pendamping
                            </div>

                            <!-- Official HD Title -->
                            <div class="card-title-wrap">
                                <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" alt="OMATIQ 2026 Building Future Innovator" class="card-title-img">
                            </div>

                            <!-- Center Frosted Data Box: Nama & Data Pendamping -->
                            <div class="committee-data-box">
                                <!-- Mascot Top-Right Corner -->
                                <div class="card-mascot-corner">
                                    <img src="{{ asset('assets/images/Zakki Amila Atas.png') }}" alt="Zakki & Amila" class="card-mascot-img">
                                </div>

                                <div class="committee-name" title="{{ $chaperone->name }}">
                                    {{ $chaperone->name }}
                                </div>
                                <div class="committee-meta">
                                    {{ $chaperone->position ?? 'Guru Pembimbing Cabang' }}
                                </div>
                                <div class="committee-branch">
                                    CABANG {{ strtoupper($chaperone->branch ?? $chaperone->regency?->name ?? 'KANTOR PUSAT') }}
                                </div>
                                <div class="committee-id-badge">
                                    {{ $chaperoneIdFormatted }}
                                </div>

                                <div class="data-divider"></div>

                                <!-- Supported by: HD Sponsors Bar -->
                                <div class="card-sponsors-wrap">
                                    <div class="sponsors-label">Supported by:</div>
                                    <div class="sponsors-grid">
                                        <img src="{{ asset('assets/images/sponsor/telkomsel.png') }}" alt="Telkomsel" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/telkom-indonesia.png') }}" alt="Telkom Indonesia" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/chickin.png') }}" alt="Chickin" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/bankaltimtara.png') }}" alt="Bankaltimtara" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/bank-bjb.png') }}" alt="Bank BJB" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/ybm-pln.png') }}" alt="YBM PLN" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/bmt-tumang.png') }}" alt="BMT Tumang" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/link-aja.png') }}" alt="LinkAja" class="sponsor-logo">
                                        <img src="{{ asset('assets/images/sponsor/link-aja-syariah.png') }}" alt="LinkAja Syariah" class="sponsor-logo">
                                    </div>
                                </div>
                            </div>

                            <!-- Website URL at Bottom -->
                            <div class="card-front-web">www.omatiq.com</div>
                        </div>

                        <!-- SISI BELAKANG (BACK FACE) -->
                        <div class="card-face card-back-face omatiq-card card-back">
                            <!-- Decorative Tech Corner Patterns -->
                            <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                            <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">
                            <div class="badge-punch-slot"></div>
                            <div class="card-glare" id="glareBack"></div>

                            <!-- Back Title OMATIQ 2026 -->
                            <div class="card-back-title-wrap">
                                <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" alt="OMATIQ 2026 Building Future Innovator" class="card-back-title-img">
                            </div>

                            <!-- Mascots Left & Right -->
                            <img src="{{ asset('assets/images/Zakki Window Hi.png') }}" alt="Zakki" class="mascot-back-zakki">
                            <img src="{{ asset('assets/images/Amila Window Hi.png') }}" alt="Amila" class="mascot-back-amila">

                            <!-- Center QR Code Scanner -->
                            <div class="committee-qr-box">
                                <div class="qr-svg-wrapper">
                                    {!! $qrCodeSvg !!}

                                    @if(empty($isVerified))
                                    <!-- Security Lock Overlay if Unverified -->
                                    <div class="qr-lock-container">
                                        <div class="qr-void-banner">⛔ BELUM TERVERIFIKASI ⛔</div>
                                        <div class="lock-badge-icon">🔒</div>
                                        <div class="lock-badge-title">SCAN TERKUNCI</div>
                                        <div class="lock-badge-subtitle">Barcode otomatis aktif setelah disetujui resmi admin</div>
                                    </div>
                                    @endif
                                </div>
                            </div>

                            <!-- Website URL at Bottom -->
                            <div class="card-back-web">www.omatiq.com</div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Virtual Floating Controls Dock -->
            <div class="virtual-controls-dock">
                <!-- Side Switcher Tabs -->
                <div class="side-switcher">
                    <button type="button" class="side-pill active" id="pillFront" onclick="flipCardTo('front')" title="Tampilkan Sisi Depan">
                        <span class="side-pill-dot"></span> Sisi Depan
                    </button>
                    <button type="button" class="side-pill" id="pillBack" onclick="flipCardTo('back')" title="Tampilkan Sisi Belakang (QR Scan)">
                        <span class="side-pill-dot"></span> Sisi Belakang
                    </button>
                </div>

                <!-- Primary Flip Action -->
                <button type="button" class="btn-flip-primary" onclick="toggleFlip()" title="Balik Kartu (Spasi / Klik Kartu)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                        <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                    </svg>
                    <span>Balik Kartu</span>
                </button>

                <div class="dock-divider"></div>

                <!-- Zoom In / Out Controls -->
                <div class="zoom-group">
                    <button type="button" class="btn-zoom" onclick="adjustZoom(-0.15)" title="Perkecil (−)">−</button>
                    <span class="zoom-badge" id="zoomBadge">100%</span>
                    <button type="button" class="btn-zoom" onclick="adjustZoom(0.15)" title="Perbesar (+)">+</button>
                    <button type="button" class="btn-zoom" onclick="resetZoom()" title="Reset Ukuran (100%)">↺</button>
                </div>
            </div>

            <!-- Hint Chip -->
            <div class="virtual-hint-chip">
                <span>💡 <strong>Sentuh &amp; geser (swipe)</strong> atau klik untuk membalik kartu &bull; Arahkan kursor untuk efek 3D kilau</span>
            </div>
        </div>
        @endif

        <!-- ================= SHEET MODE SUB-TOOLBAR ================= -->
        @if(empty($isPdf))
        <div class="sheet-sub-toolbar" id="sheetSubToolbar">
            <button type="button" class="btn-sub-mode active" id="btnFoldMode" onclick="setPrintMode('fold')" title="Cetak Depan-Belakang berdampingan di 1 lembar A4 untuk dilipat">
                <span>📄 Mode Lipat A4 (1 Lembar)</span>
            </button>
            <button type="button" class="btn-sub-mode" id="btnDuplexMode" onclick="setPrintMode('duplex')" title="Cetak bolak-balik printer duplex (2 halaman)">
                <span>📑 Mode 2 Halaman Duplex</span>
            </button>
        </div>
        @endif

        <!-- ================= PRINT SHEET (FLAT DUPLEX / FOLDING PASS) ================= -->
        <div class="print-sheet {{ !empty($isPdf) ? 'is-visible' : '' }}" id="printSheet">
            
            <!-- SISI DEPAN (FRONT CARD) -->
            <div class="omatiq-card card-front">
                <!-- Decorative Tech Corner Patterns -->
                <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">
                <div class="badge-punch-slot"></div>

                <!-- Warning Badge: Hanya ditampilkan jika pendamping belum terverifikasi -->
                @if(empty($isVerified))
                <div class="badge-unverified-overlay">
                    PENDAMPING NASIONAL • MENUNGGU VERIFIKASI
                </div>
                @endif

                <!-- Center Header YM Logo -->
                <div class="card-header-logo">
                    <img src="{{ asset('assets/images/icon-omatiq.png') }}" alt="OMATIQ">
                    <img src="{{ asset('assets/images/icon-ym.png') }}" alt="Yatim Mandiri">
                </div>

                <!-- Label Pendamping (Gradient Horizontal Banner) -->
                <div class="committee-badge-pill">
                    Pendamping
                </div>

                <!-- Official HD Title -->
                <div class="card-title-wrap">
                    <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" alt="OMATIQ 2026 Building Future Innovator" class="card-title-img">
                </div>

                <!-- Center Frosted Data Box: Nama & Data Pendamping -->
                <div class="committee-data-box">
                    <!-- Mascot Top-Right Corner -->
                    <div class="card-mascot-corner">
                        <img src="{{ asset('assets/images/Zakki Amila Atas.png') }}" alt="Zakki & Amila" class="card-mascot-img">
                    </div>

                    <div class="committee-name" title="{{ $chaperone->name }}">
                        {{ $chaperone->name }}
                    </div>
                    <div class="committee-meta">
                        {{ $chaperone->position ?? 'Guru Pembimbing Cabang' }}
                    </div>
                    <div class="committee-branch">
                        CABANG {{ strtoupper($chaperone->branch ?? $chaperone->regency?->name ?? 'KANTOR PUSAT') }}
                    </div>
                    <div class="committee-id-badge">
                        {{ $chaperoneIdFormatted }}
                    </div>

                    <div class="data-divider"></div>

                    <!-- Supported by: HD Sponsors Bar -->
                    <div class="card-sponsors-wrap">
                        <div class="sponsors-label">Supported by:</div>
                        <div class="sponsors-grid">
                            <img src="{{ asset('assets/images/sponsor/telkomsel.png') }}" alt="Telkomsel" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/telkom-indonesia.png') }}" alt="Telkom Indonesia" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/chickin.png') }}" alt="Chickin" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/bankaltimtara.png') }}" alt="Bankaltimtara" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/bank-bjb.png') }}" alt="Bank BJB" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/ybm-pln.png') }}" alt="YBM PLN" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/bmt-tumang.png') }}" alt="BMT Tumang" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/link-aja.png') }}" alt="LinkAja" class="sponsor-logo">
                            <img src="{{ asset('assets/images/sponsor/link-aja-syariah.png') }}" alt="LinkAja Syariah" class="sponsor-logo">
                        </div>
                    </div>
                </div>

                <!-- Website URL at Bottom -->
                <div class="card-front-web">www.omatiq.com</div>
            </div>

            <!-- Central Fold / Cut Guide Line -->
            <div class="fold-divider">
                <span class="fold-label">GARIS LIPAT / POTONG</span>
            </div>

            <!-- SISI BELAKANG (BACK CARD) -->
            <div class="omatiq-card card-back">
                <!-- Decorative Tech Corner Patterns -->
                <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-top-left" alt="" aria-hidden="true">
                <img src="{{ asset('assets/images/elect-pendamping.png') }}" class="card-corner-pattern pattern-bottom-right" alt="" aria-hidden="true">
                <div class="badge-punch-slot"></div>

                <!-- Back Title OMATIQ 2026 -->
                <div class="card-back-title-wrap">
                    <img src="{{ asset('assets/images/Tulisan Omatiq.png') }}" alt="OMATIQ 2026 Building Future Innovator" class="card-back-title-img">
                </div>

                <!-- Mascots Left & Right -->
                <img src="{{ asset('assets/images/Zakki Window Hi.png') }}" alt="Zakki" class="mascot-back-zakki">
                <img src="{{ asset('assets/images/Amila Window Hi.png') }}" alt="Amila" class="mascot-back-amila">

                <!-- Center QR Code Scanner -->
                <div class="committee-qr-box">
                    <div class="qr-svg-wrapper">
                        {!! $qrCodeSvg !!}

                        @if(empty($isVerified))
                        <!-- Security Lock Overlay if Unverified -->
                        <div class="qr-lock-container">
                            <div class="qr-void-banner">⛔ BELUM TERVERIFIKASI ⛔</div>
                            <div class="lock-badge-icon">🔒</div>
                            <div class="lock-badge-title">SCAN TERKUNCI</div>
                            <div class="lock-badge-subtitle">Barcode otomatis aktif setelah disetujui resmi admin</div>
                        </div>
                        @endif
                    </div>
                </div>

                <!-- Website URL at Bottom -->
                <div class="card-back-web">www.omatiq.com</div>
            </div>

        </div>

        @if(empty($isPdf))
        <!-- Instruction Note for Printing -->
        <div class="print-instruction-note" id="printInstruction">
            <strong>Petunjuk Pencetakan:</strong> Gunakan kertas <em>Art Paper / Brief Card 210-260 gsm</em> ukuran A4. Pilih skala <strong>100% (Actual Size)</strong> pada jendela cetak printer untuk hasil dimensi kartu standar lanyard (86 mm &times; 136.5 mm). Lipat mengikuti garis tengah atau potong rapi untuk dimasukkan ke dalam plastik mika / holder ID card.
        </div>
        @endif

    </div>

    @if(empty($isPdf))
    <script>
        // State variables
        let isFlipped = false;
        let currentScale = 1.0;
        let isAutoScaled = true;

        const flipper = document.getElementById('cardFlipper');
        const scene = document.getElementById('cardScene');
        const scaleContainer = document.getElementById('cardScaleContainer');
        const glareFront = document.getElementById('glareFront');
        const glareBack = document.getElementById('glareBack');
        const pillFront = document.getElementById('pillFront');
        const pillBack = document.getElementById('pillBack');
        const zoomBadge = document.getElementById('zoomBadge');
        const virtualStage = document.getElementById('virtualStage');
        const printSheet = document.getElementById('printSheet');
        const btnViewVirtual = document.getElementById('btnViewVirtual');
        const btnViewSheet = document.getElementById('btnViewSheet');
        const sheetSubToolbar = document.getElementById('sheetSubToolbar');
        const printInstruction = document.getElementById('printInstruction');

        // Card flip toggler
        function toggleFlip() {
            isFlipped = !isFlipped;
            updateFlipState();
        }

        function flipCardTo(side) {
            isFlipped = (side === 'back');
            updateFlipState();
        }

        function updateFlipState() {
            if (isFlipped) {
                flipper.classList.add('is-flipped');
                pillFront.classList.remove('active');
                pillBack.classList.add('active');
            } else {
                flipper.classList.remove('is-flipped');
                pillBack.classList.remove('active');
                pillFront.classList.add('active');
            }
        }

        // View Switcher (3D Virtual Pass vs A4 Print Sheet)
        function switchView(mode) {
            if (mode === 'virtual') {
                virtualStage.style.display = 'flex';
                printSheet.classList.remove('is-visible');
                sheetSubToolbar.classList.remove('is-visible');
                printInstruction.classList.remove('is-visible');
                btnViewVirtual.classList.add('active');
                btnViewSheet.classList.remove('active');
                handleResponsiveScale();
            } else {
                virtualStage.style.display = 'none';
                printSheet.classList.add('is-visible');
                sheetSubToolbar.classList.add('is-visible');
                printInstruction.classList.add('is-visible');
                btnViewSheet.classList.add('active');
                btnViewVirtual.classList.remove('active');
            }
        }

        // Print Mode Options (Fold vs Duplex)
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

        // Zoom & Scaling Engine
        function adjustZoom(delta) {
            isAutoScaled = false;
            currentScale = Math.min(Math.max(currentScale + delta, 0.5), 1.6);
            applyScale();
        }

        function resetZoom() {
            isAutoScaled = true;
            handleResponsiveScale();
        }

        function applyScale() {
            if (scaleContainer) {
                scaleContainer.style.transform = `scale(${currentScale})`;
                if (zoomBadge) {
                    zoomBadge.textContent = `${Math.round(currentScale * 100)}%`;
                }
            }
        }

        // Auto-scale on mobile screen
        function handleResponsiveScale() {
            if (!isAutoScaled || !virtualStage || virtualStage.style.display === 'none') return;
            const screenWidth = window.innerWidth;
            const availableWidth = screenWidth - 28;
            const baseCardWidth = 372;

            if (availableWidth < baseCardWidth) {
                currentScale = Math.max(availableWidth / baseCardWidth, 0.65);
            } else {
                currentScale = 1.0;
            }
            applyScale();
        }

        window.addEventListener('resize', handleResponsiveScale);
        document.addEventListener('DOMContentLoaded', handleResponsiveScale);

        // 3D Mouse Parallax & Dynamic Glare
        if (scene) {
            scene.addEventListener('mousemove', (e) => {
                const rect = scene.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -12;
                const rotateY = ((x - centerX) / centerX) * 12;

                const baseRotation = isFlipped ? 180 : 0;
                flipper.style.transform = `rotateY(${baseRotation + rotateY}deg) rotateX(${rotateX}deg)`;

                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                const targetGlare = isFlipped ? glareBack : glareFront;
                if (targetGlare) {
                    targetGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`;
                }
            });

            scene.addEventListener('mouseleave', () => {
                flipper.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                if (glareFront) glareFront.style.background = '';
                if (glareBack) glareBack.style.background = '';
            });

            // Click on scene flips card
            scene.addEventListener('click', (e) => {
                if (!e.target.closest('a') && !e.target.closest('button')) {
                    toggleFlip();
                }
            });

            // Touch Swipe Gesture on Mobile
            let touchStartX = 0;
            let touchStartY = 0;

            scene.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            scene.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                const touchEndY = e.changedTouches[0].screenY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    toggleFlip();
                }
            }, { passive: true });
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault();
                toggleFlip();
            } else if (e.code === 'KeyP' && (e.ctrlKey || e.metaKey)) {
                // native print
            } else if (e.code === 'Digit1') {
                switchView('virtual');
            } else if (e.code === 'Digit2') {
                switchView('sheet');
            } else if (e.code === 'Escape') {
                resetZoom();
            }
        });
    </script>
    @endif

</body>
</html>