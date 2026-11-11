<?php

$cropF = imagecreatefrompng('scratch/verify_front_cube.png');
$cropB = imagecreatefrompng('scratch/verify_back_cube.png');

// Check if any pixels in the text region of front crop have text color (dark/white sharp contrast)
echo "Checking front cube inpaint...\n";
// The text was at card x=480..741, y=1881..1905.
// In cropF (x=400, y=1820): cropX = 80..341, cropY = 61..85.
$minL = 255;
$maxL = 0;
for ($y = 55; $y <= 90; $y++) {
    for ($x = 75; $x <= 345; $x++) {
        $c = imagecolorat($cropF, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        $lum = (int) (0.299 * $r + 0.587 * $g + 0.114 * $b);
        if ($lum < $minL) {
            $minL = $lum;
        }
        if ($lum > $maxL) {
            $maxL = $lum;
        }
    }
}
echo "Front cube text region luminance range: $minL .. $maxL (smooth if no extreme spikes)\n";

echo "Checking back cube inpaint...\n";
$minL = 255;
$maxL = 0;
for ($y = 35; $y <= 95; $y++) {
    for ($x = 65; $x <= 350; $x++) {
        $c = imagecolorat($cropB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        $lum = (int) (0.299 * $r + 0.587 * $g + 0.114 * $b);
        if ($lum < $minL) {
            $minL = $lum;
        }
        if ($lum > $maxL) {
            $maxL = $lum;
        }
    }
}
echo "Back cube text region luminance range: $minL .. $maxL\n";
