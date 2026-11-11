<?php

$rawB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');
$w = imagesx($rawB);
$h = imagesy($rawB);
echo "rawB size: $w x $h\n";

// Where is the old Zakki on the left?
$foundL = [];
for ($y = 250; $y < 550; $y++) {
    for ($x = 0; $x < 130; $x++) {
        $c = imagecolorat($rawB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // background is #e0..ff
        if ($r < 200 || $g < 235 || $b < 235) {
            $foundL[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($foundL) {
    echo 'Old Zakki bbox: x='.min(array_column($foundL, 'x')).'..'.max(array_column($foundL, 'x')).
         ', y='.min(array_column($foundL, 'y')).'..'.max(array_column($foundL, 'y'))."\n";
}

// Where is the old Amila on the right?
$foundR = [];
for ($y = 250; $y < 550; $y++) {
    for ($x = 280; $x < $w; $x++) {
        $c = imagecolorat($rawB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 200 || $g < 235 || $b < 235) {
            $foundR[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($foundR) {
    echo 'Old Amila bbox: x='.min(array_column($foundR, 'x')).'..'.max(array_column($foundR, 'x')).
         ', y='.min(array_column($foundR, 'y')).'..'.max(array_column($foundR, 'y'))."\n";
}

// Where is the white QR box on the back?
// Inside rawB, the QR box is white: #ffffff
$foundQR = [];
for ($y = 200; $y < 460; $y++) {
    for ($x = 80; $x < 330; $x++) {
        $c = imagecolorat($rawB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r > 250 && $g > 250 && $b > 250) {
            $foundQR[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($foundQR) {
    echo 'QR white box bbox: x='.min(array_column($foundQR, 'x')).'..'.max(array_column($foundQR, 'x')).
         ', y='.min(array_column($foundQR, 'y')).'..'.max(array_column($foundQR, 'y'))."\n";
}
