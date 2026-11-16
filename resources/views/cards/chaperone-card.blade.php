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
            background: linear-gradient(135deg, #7a6400 0%, #a18200 100%);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(122, 100, 0, 0.35);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }

        .btn-print:hover {
            background: linear-gradient(135deg, #685500 0%, #8c7100 100%);
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

        /* Lanyard Ribbon & Metallic Clasp (Gold Tech Accent) */
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
            background: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255, 230, 0, 0.12) 3px, rgba(255, 230, 0, 0.12) 6px);
        }

        .lanyard-clip {
            width: 28px;
            height: 32px;
            background: linear-gradient(180deg, #fef08a 0%, #cbd5e1 35%, #94a3b8 70%, #64748b 100%);
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
            box-shadow: 0 25px 60px rgba(122, 100, 0, 0.22), 0 6px 18px rgba(0, 0, 0, 0.1);
            margin: 0 !important;
        }

        .card-front-face {
            transform: rotateY(0deg);
        }

        .card-back-face {
            transform: rotateY(180deg);
        }

        /* Punch Slot Hole (Lanyard Pass Slot) */
        .badge-punch-slot {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 8.5px;
            background: #453700;
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
            border: 1px solid rgba(122, 100, 0, 0.2);
            box-shadow: 0 10px 30px rgba(122, 100, 0, 0.1);
            flex-wrap: wrap;
            max-width: 95vw;
        }

        .side-switcher {
            display: flex;
            align-items: center;
            background: #fefce8;
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
            color: #9c8210;
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
            background: #e2e8f0;
        }

        .side-pill.active .side-pill-dot {
            background: #FFE600;
        }

        .btn-flip-primary {
            padding: 8px 16px;
            border-radius: 11px;
            font-size: 12px;
            font-weight: 800;
            border: 1px solid #7a6400;
            background: linear-gradient(135deg, #7a6400 0%, #a18200 100%);
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
            gap: 4px;
            background: #fefce8;
            padding: 3px 6px;
            border-radius: 12px;
            border: 1px solid rgba(122, 100, 0, 0.18);
        }

        .btn-zoom {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid rgba(122, 100, 0, 0.15);
            background: #ffffff;
            color: #7a6400;
            font-size: 14px;
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
            color: #8c7300;
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

        /* Front & Back Background Templates */
        .card-front {
            background-image: url("{{ asset('assets/images/cards/card-chaperone-bg-front.png') }}");
        }

        .card-back {
            background-image: url("{{ asset('assets/images/cards/card-chaperone-bg-back.png') }}");
        }

        /* Front: Unverified Warning Badge Overlay */
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
            z-index: 6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Front: Inner Data Box (Centered over the white/cream box) */
        .chaperone-data-box {
            position: absolute;
            top: 53.5%;
            left: 50%;
            transform: translateX(-50%);
            width: 82.0%;
            height: 14.0%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 2px 10px;
        }

        .chaperone-name {
            font-size: 21px;
            font-weight: 900;
            color: #7a6400;
            letter-spacing: -0.3px;
            line-height: 1.15;
            text-transform: capitalize;
            text-align: center;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .chaperone-branch {
            font-size: 13.5px;
            font-weight: 700;
            color: #7a6400;
            letter-spacing: -0.1px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .chaperone-id-badge {
            font-size: 9.5px;
            font-weight: 800;
            color: #9c8210;
            letter-spacing: 0.5px;
            text-align: center;
            margin-top: 2px;
            font-family: 'Courier New', Courier, monospace;
        }

        /* Back: QR Code Center Container (Inside the white rounded box) */
        .chaperone-qr-box {
            position: absolute;
            top: 38.6%;
            left: 50%;
            transform: translateX(-50%);
            width: 44.0%;
            height: 27.5%;
            z-index: 5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px;
            overflow: hidden;
        }

        .qr-svg-wrapper {
            width: 100%;
            height: 100%;
            max-width: 155px;
            max-height: 155px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(122, 100, 0, 0.15);
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
            cursor: pointer;
            border: 1px solid rgba(122, 100, 0, 0.25);
            background: #ffffff;
            color: #7a6400;
            transition: all 0.2s ease;
        }

        .btn-sub-mode.active, .btn-sub-mode:hover {
            background: #7a6400;
            color: #ffffff;
        }

        /* Print Instruction Note */
        .print-instruction-note {
            margin-top: 16px;
            font-size: 11.5px;
            color: #475569;
            text-align: center;
            display: none;
            align-items: center;
            gap: 6px;
            font-weight: 600;
        }

        .print-instruction-note.is-visible {
            display: flex;
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

            .toolbar-brand img {
                height: 28px;
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

            .badge-unverified-overlay {
                width: 78.4mm !important;
                top: 4.5mm !important;
                font-size: 6pt !important;
                padding: 1.2mm 2mm !important;
            }

            .chaperone-data-box {
                width: 70.5mm !important;
                top: 73.0mm !important;
                height: 19.1mm !important;
                padding: 1mm 2mm !important;
            }

            .chaperone-name {
                font-size: 11pt !important;
                margin-bottom: 1pt !important;
            }

            .chaperone-branch {
                font-size: 7.5pt !important;
            }

            .chaperone-id-badge {
                font-size: 5.8pt !important;
            }

            .chaperone-qr-box {
                width: 37.8mm !important;
                height: 37.5mm !important;
                top: 52.7mm !important;
                padding: 1.5mm !important;
            }

            .qr-svg-wrapper {
                max-width: 35mm !important;
                max-height: 35mm !important;
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
            <!-- Lanyard Ribbon & Clip Graphic (Gold Tech Theme) -->
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
                            <div class="badge-punch-slot"></div>
                            <div class="card-glare" id="glareFront"></div>

                            <!-- Warning Badge: Hanya ditampilkan jika pendamping belum terverifikasi -->
                            @if(empty($isVerified))
                            <div class="badge-unverified-overlay">
                                PENDAMPING NASIONAL • MENUNGGU VERIFIKASI
                            </div>
                            @endif

                            <!-- Center Data Box: Nama & Cabang Pendamping -->
                            <div class="chaperone-data-box">
                                <div class="chaperone-name" title="{{ $chaperone->name }}">
                                    {{ $chaperone->name }}
                                </div>
                                <div class="chaperone-branch">
                                    {{ $chaperone->branch ?? $chaperone->regency?->name ?? 'Cabang / Wilayah' }}
                                </div>
                                <div class="chaperone-id-badge">
                                    ID: {{ $chaperoneIdFormatted }}
                                </div>
                            </div>
                        </div>

                        <!-- SISI BELAKANG (BACK FACE) -->
                        <div class="card-face card-back-face omatiq-card card-back">
                            <div class="badge-punch-slot"></div>
                            <div class="card-glare" id="glareBack"></div>

                            <!-- Center QR Code Scanner: Olive/Gold QR Code -->
                            <div class="chaperone-qr-box">
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
                <!-- Warning Badge: Hanya ditampilkan jika pendamping belum terverifikasi -->
                @if(empty($isVerified))
                <div class="badge-unverified-overlay">
                    PENDAMPING NASIONAL • MENUNGGU VERIFIKASI
                </div>
                @endif

                <!-- Center Data Box: Nama & Cabang Pendamping -->
                <div class="chaperone-data-box">
                    <div class="chaperone-name" title="{{ $chaperone->name }}">
                        {{ $chaperone->name }}
                    </div>
                    <div class="chaperone-branch">
                        {{ $chaperone->branch ?? $chaperone->regency?->name ?? 'Cabang / Wilayah' }}
                    </div>
                    <div class="chaperone-id-badge">
                        ID: {{ $chaperoneIdFormatted }}
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
                <div class="chaperone-qr-box">
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
            </div>

        </div>

        @if(empty($isPdf))
        <div class="print-instruction-note" id="printInstruction">
            <span>💡</span>
            <span><strong>Panduan Cetak:</strong> Pada pengaturan printer, pilih ukuran kertas <strong>A4</strong>, skala <strong>100% (Default)</strong>, dan centang <strong>"Background graphics"</strong> untuk hasil cetak maksimal.</span>
        </div>
        @endif
    </div>

    @if(empty($isPdf))
    <script>
        // State variables
        let isFlipped = false;
        let zoomLevel = 1.0;
        let currentView = 'virtual'; // 'virtual' | 'sheet'

        const flipper = document.getElementById('cardFlipper');
        const scaleContainer = document.getElementById('cardScaleContainer');
        const scene = document.getElementById('cardScene');
        const pillFront = document.getElementById('pillFront');
        const pillBack = document.getElementById('pillBack');
        const zoomBadge = document.getElementById('zoomBadge');
        const glareFront = document.getElementById('glareFront');
        const glareBack = document.getElementById('glareBack');

        const virtualStage = document.getElementById('virtualStage');
        const printSheet = document.getElementById('printSheet');
        const sheetSubToolbar = document.getElementById('sheetSubToolbar');
        const printInstruction = document.getElementById('printInstruction');
        const btnViewVirtual = document.getElementById('btnViewVirtual');
        const btnViewSheet = document.getElementById('btnViewSheet');

        // Calculate base responsive scale for mobile
        function getBaseScale() {
            const viewportW = window.innerWidth;
            const maxAllowedW = Math.min(viewportW - 28, 480);
            if (maxAllowedW < 372) {
                return maxAllowedW / 372;
            }
            return 1.0;
        }

        // Apply scale transform and adjust container height dynamically
        function applyScale() {
            if (!scaleContainer) return;
            const base = getBaseScale();
            const totalScale = base * zoomLevel;
            scaleContainer.style.transform = 'scale(' + totalScale + ')';
            
            // Adjust scene height so it takes the visual space accurately
            const scaledHeight = 590 * totalScale;
            if (scene) {
                scene.style.height = scaledHeight + 'px';
            }
            if (zoomBadge) {
                zoomBadge.textContent = Math.round(zoomLevel * 100) + '%';
            }
        }

        // Switch View: Virtual 3D vs Print Sheet
        function switchView(mode) {
            currentView = mode;
            if (mode === 'virtual') {
                virtualStage.style.display = 'flex';
                printSheet.classList.remove('is-visible');
                sheetSubToolbar.classList.remove('is-visible');
                printInstruction.classList.remove('is-visible');
                btnViewVirtual.classList.add('active');
                btnViewSheet.classList.remove('active');
                applyScale();
            } else {
                virtualStage.style.display = 'none';
                printSheet.classList.add('is-visible');
                sheetSubToolbar.classList.add('is-visible');
                printInstruction.classList.add('is-visible');
                btnViewVirtual.classList.remove('active');
                btnViewSheet.classList.add('active');
            }
        }

        // Flip Card Logic
        function flipCardTo(side) {
            if (side === 'back') {
                isFlipped = true;
                flipper.classList.add('is-flipped');
                pillBack.classList.add('active');
                pillFront.classList.remove('active');
            } else {
                isFlipped = false;
                flipper.classList.remove('is-flipped');
                pillFront.classList.add('active');
                pillBack.classList.remove('active');
            }
            // Reset any tilt residue
            flipper.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
        }

        function toggleFlip() {
            flipCardTo(isFlipped ? 'front' : 'back');
        }

        // Zoom Controls
        function adjustZoom(delta) {
            zoomLevel = Math.min(1.6, Math.max(0.75, +(zoomLevel + delta).toFixed(2)));
            applyScale();
        }

        function resetZoom() {
            zoomLevel = 1.0;
            applyScale();
        }

        // 3D Parallax Tilt & Specular Glare (Desktop Pointer)
        let isTouching = false;
        if (scene) {
            scene.addEventListener('mousemove', function(e) {
                if (isTouching || window.innerWidth < 768) return;
                const rect = scene.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const tiltX = ((y - centerY) / centerY) * -11;
                const tiltY = ((x - centerX) / centerX) * 11;

                if (isFlipped) {
                    flipper.style.transform = 'rotateX(' + tiltX + 'deg) rotateY(' + (180 + tiltY) + 'deg)';
                    const glareX = 100 - (x / rect.width) * 100;
                    const glareY = (y / rect.height) * 100;
                    if (glareBack) {
                        glareBack.style.background = 'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)';
                        glareBack.style.opacity = '1';
                    }
                } else {
                    flipper.style.transform = 'rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
                    const glareX = (x / rect.width) * 100;
                    const glareY = (y / rect.height) * 100;
                    if (glareFront) {
                        glareFront.style.background = 'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)';
                        glareFront.style.opacity = '1';
                    }
                }
            });

            scene.addEventListener('mouseleave', function() {
                flipper.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                if (glareFront) glareFront.style.opacity = '0';
                if (glareBack) glareBack.style.opacity = '0';
            });
        }

        // Click scene to toggle flip (with debounce against synthetic mobile tap)
        let lastTouchFlipTime = 0;

        if (scene) {
            scene.addEventListener('click', function(e) {
                if (Date.now() - lastTouchFlipTime < 650) {
                    return;
                }
                toggleFlip();
            });
        }

        // Mobile Touch Gestures (Swipe to Flip & Tap to Flip)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        if (scene) {
            scene.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }, { passive: true });

            scene.addEventListener('touchend', function(e) {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                const deltaY = e.changedTouches[0].clientY - touchStartY;
                const duration = Date.now() - touchStartTime;

                // Horizontal swipe detected
                if (Math.abs(deltaX) > 32 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    lastTouchFlipTime = Date.now();
                    toggleFlip();
                } else if (Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12 && duration < 350) {
                    // Tap detected
                    lastTouchFlipTime = Date.now();
                    toggleFlip();
                }
            }, { passive: true });
        }

        // Keyboard Shortcut (Space to Flip)
        window.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && currentView === 'virtual') {
                e.preventDefault();
                toggleFlip();
            }
        });

        // Window resize listener for dynamic scale
        window.addEventListener('resize', applyScale);
        window.addEventListener('DOMContentLoaded', applyScale);
        applyScale();

        // Print Mode for Sheet view
        function setPrintMode(mode) {
            const btnFold = document.getElementById('btnFoldMode');
            const btnDuplex = document.getElementById('btnDuplexMode');
            
            if (mode === 'duplex') {
                document.body.classList.add('duplex-mode');
                if (btnDuplex) btnDuplex.classList.add('active');
                if (btnFold) btnFold.classList.remove('active');
            } else {
                document.body.classList.remove('duplex-mode');
                if (btnFold) btnFold.classList.add('active');
                if (btnDuplex) btnDuplex.classList.remove('active');
            }
        }
    </script>
    @endif
</body>
</html>
