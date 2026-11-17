<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$imPes = imagecreatefrompng($uploadDir.'media_1794554817796_83d00cd5.png');
$imPen = imagecreatefrompng($uploadDir.'media_1794554817846_fe6706b8.png');

// Check what is on front cards:
// In Peserta Front, what is at y=300..400?
// In Pendamping Front, what is at y=300..400?
echo "=== Peserta Front (83d00cd5) ===\n";
// Let's check where the name box is
// Is there a box in Peserta Front?
for ($y = 300; $y <= 420; $y += 30) {
    $cMid = imagecolorsforindex($imPes, imagecolorat($imPes, 204, $y));
    echo sprintf("Peserta y=%3d: Mid RGB(%3d,%3d,%3d)\n", $y, $cMid['red'], $cMid['green'], $cMid['blue']);
}

echo "=== Pendamping Front (fe6706b8) ===\n";
for ($y = 300; $y <= 420; $y += 30) {
    $cMid = imagecolorsforindex($imPen, imagecolorat($imPen, 204, $y));
    echo sprintf("Pendamping y=%3d: Mid RGB(%3d,%3d,%3d)\n", $y, $cMid['red'], $cMid['green'], $cMid['blue']);
}
