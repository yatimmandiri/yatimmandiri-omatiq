<?php

$rawF = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png');
// On front card, where is the card box and where were the old peeking mascots?
// Let's check y=270..360 (in 3x: 810..1080)
$found = [];
for ($y = 270; $y < 350; $y++) {
    for ($x = 200; $x < 370; $x++) {
        $c = imagecolorat($rawF, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 220 || $g < 240 || $b < 240) {
            $found[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($found) {
    echo 'Raw front peeking mascot bbox: x='.min(array_column($found, 'x')).'..'.max(array_column($found, 'x')).
         ', y='.min(array_column($found, 'y')).'..'.max(array_column($found, 'y'))."\n";
}

// Where does the student data card start?
// In raw front, find the top border of the student data box around y=330..360
for ($y = 330; $y < 360; $y++) {
    $c = imagecolorat($rawF, 204, $y);
    printf("y=%d: #%06x\n", $y, $c & 0xFFFFFF);
}
