<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

// Let's check header logos in Front:
// Is there an Omatiq logo on the left or just YM logo in center?
// Let's sample x around y=60:
echo "Front y=60 scan for logos:\n";
$blocks = [];
$inBlock = false;
$start = 0;
for ($x = 0; $x < 408; $x++) {
    $rgb = imagecolorat($front, $x, 60);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    // Non-background
    $isContent = (abs($r - 165) > 20 || abs($g - 228) > 20 || abs($b - 228) > 20);
    if ($isContent && ! $inBlock) {
        $inBlock = true;
        $start = $x;
    } elseif (! $isContent && $inBlock) {
        $inBlock = false;
        $blocks[] = [$start, $x - 1];
    }
}
if ($inBlock) {
    $blocks[] = [$start, 407];
}
print_r($blocks);

// Check "Panitia" bar shape:
// Let's see at y=125 from x=0 to 408:
echo "Panitia bar at y=125:\n";
$pBlocks = [];
$inP = false;
$pStart = 0;
for ($x = 0; $x < 408; $x++) {
    $rgb = imagecolorat($front, $x, 125);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    // Dark green or white text
    $isDark = ($r < 50 && $g > 50 && $b > 50) || ($r > 200 && $g > 200 && $b > 200);
    if ($isDark && ! $inP) {
        $inP = true;
        $pStart = $x;
    } elseif (! $isDark && $inP) {
        $inP = false;
        $pBlocks[] = [$pStart, $x - 1];
    }
}
if ($inP) {
    $pBlocks[] = [$pStart, 407];
}
print_r($pBlocks);
