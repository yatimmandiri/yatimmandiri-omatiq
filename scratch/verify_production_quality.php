<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');

echo 'Front card dimensions: '.imagesx($imF).' x '.imagesy($imF)."\n";
echo 'Back card dimensions:  '.imagesx($imB).' x '.imagesy($imB)."\n";

// 1. Check Front Card Mascot - Card Border junction (y=1018..1026, x=720..1080)
$junctionNonMint = 0;
for ($y = 1024; $y <= 1030; $y++) {
    for ($x = 720; $x <= 1080; $x++) {
        $c = imagecolorat($imF, $x, $y);
        if (($c & 0xFFFFFF) !== 0xF0FEFC) {
            $junctionNonMint++;
        }
    }
}
echo "Front card data box non-mint pixels at y=1024..1030: $junctionNonMint (MUST BE 0)\n";

// 2. Check Back Card Zakki & QR Clearance
$maxZakkiX = 0;
for ($y = 750; $y < 1600; $y++) {
    for ($x = 0; $x < 261; $x++) {
        $c = imagecolorat($imB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 220 || $g < 235 || $b < 235) {
            if ($x > $maxZakkiX) {
                $maxZakkiX = $x;
            }
        }
    }
}
echo "Zakki Back Card: rightmost pixel = $maxZakkiX px (QR starts at 261 px, clearance = ".(261 - $maxZakkiX)." px)\n";

// 3. Check Back Card Amila & QR Clearance
$minAmilaX = 1224;
for ($y = 750; $y < 1600; $y++) {
    for ($x = 960; $x < 1224; $x++) {
        $c = imagecolorat($imB, $x, $y);
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
echo "Amila Back Card: leftmost pixel = $minAmilaX px (QR ends at 960 px, clearance = ".($minAmilaX - 960)." px)\n";

// 4. Check QR center purity (x=300..920, y=750..1280)
$nonWhiteInQR = 0;
for ($y = 750; $y <= 1280; $y++) {
    for ($x = 300; $x <= 920; $x++) {
        $c = imagecolorat($imB, $x, $y);
        if (($c & 0xFFFFFF) !== 0xFFFFFF) {
            $nonWhiteInQR++;
        }
    }
}
echo "Non-white pixels in center QR card: $nonWhiteInQR (MUST BE 0)\n";
