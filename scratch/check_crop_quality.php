<?php

// Check verify_front_peeking.png:
$im = imagecreatefrompng('scratch/verify_front_peeking.png');
// In this crop:
// y in front card was 780..1080.
// So card border y=1020 is at crop y = 1020 - 780 = 240!
// Let's check rows 230 to 250 in this crop:
echo "Peeking crop rows around card border (y=230..250 in crop, corresponds to y=1010..1030 in card):\n";
for ($y = 230; $y <= 250; $y++) {
    $nonBg = 0;
    for ($x = 50; $x < 450; $x++) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Check if skin or clothes tone
        if ($r < 235 && ($g < 250 || $b < 245)) {
            $nonBg++;
        }
    }
    printf("crop y=%d (card y=%d): non-bg pixels = %d\n", $y, $y + 780, $nonBg);
}

// Check Zakki back crop:
$imZ = imagecreatefrompng('scratch/verify_back_zakki.png');
// In this crop:
// x=0..450 (card x=0..450)
// QR box starts at x = 261!
// Does Zakki touch x=261?
$maxZakkiX = 0;
for ($y = 0; $y < imagesy($imZ); $y++) {
    for ($x = 0; $x < 261; $x++) {
        $c = imagecolorat($imZ, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Is this mascot pixel? (not background #d0..ff)
        if ($r < 220 || $g < 235 || $b < 235) {
            if ($x > $maxZakkiX) {
                $maxZakkiX = $x;
            }
        }
    }
}
echo "Zakki max X = $maxZakkiX (QR box starts at x=261, clearance = ".(261 - $maxZakkiX)." px)\n";

// Check Amila back crop:
$imA = imagecreatefrompng('scratch/verify_back_amila.png');
// In this crop: x=774..1224 (width 450).
// QR box ends at card x=960, which is crop x = 960 - 774 = 186.
// Where is Amila's leftmost pixel?
$minAmilaX = 450;
for ($y = 0; $y < imagesy($imA); $y++) {
    for ($x = 186; $x < 450; $x++) {
        $c = imagecolorat($imA, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 220 || $g < 235 || $b < 235) {
            if ($x < $minAmilaX) {
                $minAmilaX = $x;
            }
        }
    }
}
$amilaCardX = $minAmilaX + 774;
echo "Amila min X in card = $amilaCardX (QR box ends at x=960, clearance = ".($amilaCardX - 960)." px)\n";

// Check QR Box purity:
$imBack = imagecreatefrompng('scratch/test_bg_back.png');
$nonWhiteInQR = 0;
for ($y = 705; $y <= 1320; $y++) {
    for ($x = 270; $x <= 950; $x++) {
        $c = imagecolorat($imBack, $x, $y);
        if (($c & 0xFFFFFF) !== 0xFFFFFF) {
            $nonWhiteInQR++;
        }
    }
}
echo "Non-white pixels in QR box: $nonWhiteInQR (MUST BE 0)\n";
