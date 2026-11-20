<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');
$w = imagesx($front);

// 1. Check top header logos:
// Let's scan x at y = 50 across width 0 to $w
echo "Header at y=50:\n";
$logoMinX = $w;
$logoMaxX = 0;
for ($x = 0; $x < $w; $x++) {
    $rgb = imagecolorat($front, $x, 50);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    // Look for non-background colors (background is cyan/mint #a6e7e6 ~ rgb(166, 230, 230))
    if (abs($r - 166) > 20 || abs($g - 230) > 20 || abs($b - 230) > 20) {
        $logoMinX = min($logoMinX, $x);
        $logoMaxX = max($logoMaxX, $x);
    }
}
echo "Header logo bounds at y=50: x = $logoMinX..$logoMaxX (center = ".(($logoMinX + $logoMaxX) / 2).")\n";

// Let's check full bounds of the top header logo (y: 20 to 90):
$lX1 = $w;
$lX2 = 0;
$lY1 = 100;
$lY2 = 0;
for ($y = 20; $y < 95; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if (abs($r - 166) > 25 || abs($g - 230) > 25 || abs($b - 230) > 25) {
            $lX1 = min($lX1, $x);
            $lX2 = max($lX2, $x);
            $lY1 = min($lY1, $y);
            $lY2 = max($lY2, $y);
        }
    }
}
echo "Top logo total bounds: x = $lX1..$lX2, y = $lY1..$lY2 (width = ".($lX2 - $lX1).', height = '.($lY2 - $lY1).")\n";

// 2. Check the "Panitia" bar (y: 95 to 160):
$pX1 = $w;
$pX2 = 0;
$pY1 = 160;
$pY2 = 0;
for ($y = 95; $y < 165; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // Dark teal banner: r < 40, g > 50, b > 50
        if ($r < 50 && $g > 60 && $g < 140 && $b > 60 && $b < 140) {
            $pX1 = min($pX1, $x);
            $pX2 = max($pX2, $x);
            $pY1 = min($pY1, $y);
            $pY2 = max($pY2, $y);
        }
    }
}
echo "Panitia banner bounds: x = $pX1..$pX2, y = $pY1..$pY2 (width = ".($pX2 - $pX1).', height = '.($pY2 - $pY1).")\n";

// 3. Check Mascots Zakki & Amila peeking above container box:
$mX1 = $w;
$mX2 = 0;
$mY1 = 340;
$mY2 = 0;
for ($y = 260; $y < 345; $y++) {
    for ($x = 180; $x < 370; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // mascot colors (not background)
        // Background around y=300 is r:75..85, g:155..170, b:160..175
        $diff = abs($r - 80) + abs($g - 162) + abs($b - 167);
        if ($diff > 35) {
            $mX1 = min($mX1, $x);
            $mX2 = max($mX2, $x);
            $mY1 = min($mY1, $y);
            $mY2 = max($mY2, $y);
        }
    }
}
echo "Mascots Zakki & Amila bounds: x = $mX1..$mX2, y = $mY1..$mY2 (width = ".($mX2 - $mX1).', height = '.($mY2 - $mY1).")\n";
echo "Mascots relative to card width ($w): left = ".round($mX1 / $w * 100, 1).'%, right = '.round($mX2 / $w * 100, 1)."%\n";

// 4. Check the Container Box bounds:
// Let's find top, bottom, left, right of the box
// Box top is at y = 340
// Box corners have rounded borders
$bX1 = $w;
$bX2 = 0;
$bY1 = $h;
$bY2 = 0;
for ($y = 338; $y < 590; $y++) {
    for ($x = 10; $x < $w - 10; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // The bright white/cyan border line of the box: r > 210, g > 240, b > 240
        if ($r > 200 && $g > 230 && $b > 230) {
            $bX1 = min($bX1, $x);
            $bX2 = max($bX2, $x);
            $bY1 = min($bY1, $y);
            $bY2 = max($bY2, $y);
        }
    }
}
echo "Container box border bounds: x = $bX1..$bX2, y = $bY1..$bY2 (width = ".($bX2 - $bX1).', height = '.($bY2 - $bY1).")\n";
echo 'Container box relative: top = '.round($bY1 / 648 * 100, 1).'%, bottom = '.round($bY2 / 648 * 100, 1).'%, width = '.round(($bX2 - $bX1) / $w * 100, 1)."%\n";
