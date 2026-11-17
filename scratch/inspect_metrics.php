<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

$W = 408;
$H = 648;

echo "=== FRONT METRICS (% of 408 x 648) ===\n";

// 1. Top Logo (YM)
// Let's find YM logo height & width:
$ymMinX = $W;
$ymMaxX = 0;
$ymMinY = $H;
$ymMaxY = 0;
for ($y = 15; $y < 95; $y++) {
    for ($x = 100; $x < 300; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if (abs($r - 165) > 30 || abs($g - 230) > 30) {
            $ymMinX = min($ymMinX, $x);
            $ymMaxX = max($ymMaxX, $x);
            $ymMinY = min($ymMinY, $y);
            $ymMaxY = max($ymMaxY, $y);
        }
    }
}
echo "YM Logo: y = $ymMinY..$ymMaxY (".round($ymMinY / $H * 100, 1).'% .. '.round($ymMaxY / $H * 100, 1).'%), h = '.($ymMaxY - $ymMinY).'px, w = '.($ymMaxX - $ymMinX)."px\n";

// 2. Panitia Bar
// Bounds: y = 102..150, x = 79..329
echo 'Panitia Bar: y = 102..150 ('.round(102 / $H * 100, 1).'% .. '.round(150 / $H * 100, 1).'%), w = 250px ('.round(250 / $W * 100, 1)."%), h = 48px\n";

// 3. Title (OMATIQ 2026)
// Let's find white text bounds:
$tMinY = $H;
$tMaxY = 0;
$tMinX = $W;
$tMaxX = 0;
for ($y = 160; $y < 280; $y++) {
    for ($x = 30; $x < $W - 30; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r > 220 && $g > 230 && $b > 230) {
            $tMinY = min($tMinY, $y);
            $tMaxY = max($tMaxY, $y);
            $tMinX = min($tMinX, $x);
            $tMaxX = max($tMaxX, $x);
        }
    }
}
echo "Title block: y = $tMinY..$tMaxY (".round($tMinY / $H * 100, 1).'% .. '.round($tMaxY / $H * 100, 1).'%), w = '.($tMaxX - $tMinX).'px ('.round(($tMaxX - $tMinX) / $W * 100, 1)."%)\n";

// 4. Mascots Zakki & Amila Atas:
echo 'Mascots Atas: x = 240..345 (right corner!), y = 285..340, width = '.(345 - 240).'px ('.round((345 - 240) / $W * 100, 1)."%)\n";

// 5. Container Box:
// Top is at y = 340 (52.5%), Left = 17 (4.2%), Right = 391 (95.8%), Width = 374 (91.7%)
// Let's find where container bottom is:
$boxBottomY = 0;
for ($y = 550; $y < 620; $y++) {
    $rgb = imagecolorat($front, 100, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    // Check border
    if ($r > 190 && $g > 220 && $b > 220) {
        $boxBottomY = $y;
    }
}
echo 'Container Box: top = 340 ('.round(340 / $H * 100, 1)."%), bottom = $boxBottomY (".round($boxBottomY / $H * 100, 1).'%), h = '.($boxBottomY - 340)."px\n";

// 6. Web url at bottom:
echo "\n=== BACK METRICS (% of 408 x 648) ===\n";
// 1. Back Title (OMATIQ 2026)
$btMinY = $H;
$btMaxY = 0;
$btMinX = $W;
$btMaxX = 0;
for ($y = 120; $y < 230; $y++) {
    for ($x = 30; $x < $W - 30; $x++) {
        $rgb = imagecolorat($back, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r > 220 && $g > 230 && $b > 230) {
            $btMinY = min($btMinY, $y);
            $btMaxY = max($btMaxY, $y);
            $btMinX = min($btMinX, $x);
            $btMaxX = max($btMaxX, $x);
        }
    }
}
echo "Back Title block: y = $btMinY..$btMaxY (".round($btMinY / $H * 100, 1).'% .. '.round($btMaxY / $H * 100, 1).'%), w = '.($btMaxX - $btMinX)."px\n";
echo 'Back QR box: y = 242..454 ('.round(242 / $H * 100, 1).'% .. '.round(454 / $H * 100, 1).'%), w = 233px ('.round(233 / $W * 100, 1)."%), h = 212px\n";

// Bottom web url:
for ($y = 610; $y < 645; $y++) {
    $hasWhite = false;
    for ($x = 150; $x < 260; $x++) {
        $rgb = imagecolorat($back, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r > 230 && $g > 230 && $b > 230) {
            $hasWhite = true;
            break;
        }
    }
    if ($hasWhite) {
        echo "Back 'www.omatiq.com' detected at y = $y (".round($y / $H * 100, 1)."%)\n";
        break;
    }
}
