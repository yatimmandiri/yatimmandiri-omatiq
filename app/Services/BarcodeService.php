<?php

namespace App\Services;

use BaconQrCode\Renderer\Color\Rgb;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\Fill;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class BarcodeService
{
    /**
     * Code 128 patterns (Table B).
     * 107 patterns, each pattern has 6 bar/space widths (values 1 to 4).
     */
    private const PATTERNS = [
        '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
        '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
        '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
        '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
        '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
        '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
        '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
        '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
        '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
        '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
        '114131', '311141', '411131', '211412', '211214', '211232', '2331112', // 106 = stop pattern (7 bars/spaces)
    ];

    /**
     * Generate Code 128 (Subset B) SVG barcode string.
     */
    public function generateCode128Svg(string $text, int $height = 50, float $barWidth = 1.5, string $color = '#17524A'): string
    {
        $text = trim($text);
        if ($text === '') {
            return '';
        }

        // Subset B start code = 104
        $codes = [104];
        $checksum = 104;

        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            $ascii = ord($text[$i]);
            $code = $ascii - 32; // Code 128B maps ASCII 32-127 to values 0-95
            if ($code < 0 || $code > 95) {
                $code = 0; // Space fallback
            }
            $codes[] = $code;
            $checksum += $code * ($i + 1);
        }

        $checksum %= 103;
        $codes[] = $checksum;
        $codes[] = 106; // Stop code

        // Assemble modules
        $modules = '';
        foreach ($codes as $idx => $code) {
            $pattern = self::PATTERNS[$code] ?? self::PATTERNS[0];
            $isBar = true;
            $patLen = strlen($pattern);
            for ($p = 0; $p < $patLen; $p++) {
                $width = (int) $pattern[$p];
                $modules .= str_repeat($isBar ? '1' : '0', $width);
                $isBar = ! $isBar;
            }
        }

        // Add quiet zone (10 modules on each side)
        $quietZone = 10;
        $totalModules = strlen($modules) + ($quietZone * 2);
        $totalWidth = $totalModules * $barWidth;

        $rects = '';
        $currentX = $quietZone * $barWidth;
        $modLen = strlen($modules);

        $i = 0;
        while ($i < $modLen) {
            if ($modules[$i] === '1') {
                $barCount = 0;
                while ($i < $modLen && $modules[$i] === '1') {
                    $barCount++;
                    $i++;
                }
                $rectWidth = $barCount * $barWidth;
                $rects .= sprintf(
                    '<rect x="%.2f" y="0" width="%.2f" height="%d" fill="%s" />',
                    $currentX,
                    $rectWidth,
                    $height,
                    htmlspecialchars($color, ENT_QUOTES)
                );
                $currentX += $rectWidth;
            } else {
                $spaceCount = 0;
                while ($i < $modLen && $modules[$i] === '0') {
                    $spaceCount++;
                    $i++;
                }
                $currentX += $spaceCount * $barWidth;
            }
        }

        return sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.2f %d" width="100%%" height="%d" preserveAspectRatio="none">%s</svg>',
            $totalWidth,
            $height,
            $height,
            $rects
        );
    }

    /**
     * Generate standard QR Code as SVG using BaconQrCode (ISO/IEC 18004 compliant).
     */
    public function generateQrCodeSvg(string $data, int $size = 120, string $color = '#17524A', int $margin = 1): string
    {
        $data = trim($data);
        if ($data === '') {
            return '';
        }

        try {
            $fgColor = $this->hexToRgb($color);
            $bgColor = new Rgb(255, 255, 255);

            $renderer = new ImageRenderer(
                new RendererStyle(
                    $size,
                    $margin,
                    null,
                    null,
                    Fill::uniformColor($bgColor, $fgColor)
                ),
                new SvgImageBackEnd
            );

            $writer = new Writer($renderer);
            $svg = $writer->writeString($data);

            // Strip xml header for clean inline embedding
            $svg = preg_replace('/<\?xml.*?\?>/i', '', $svg);

            return trim((string) $svg);
        } catch (\Throwable) {
            return '';
        }
    }

    private function hexToRgb(string $hex): Rgb
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        if (strlen($hex) !== 6) {
            return new Rgb(0, 0, 0);
        }

        $r = (int) hexdec(substr($hex, 0, 2));
        $g = (int) hexdec(substr($hex, 2, 2));
        $b = (int) hexdec(substr($hex, 4, 2));

        return new Rgb($r, $g, $b);
    }
}
