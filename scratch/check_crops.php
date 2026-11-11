<?php

// Check if old mascot is behind Zakki in crop_zakki_back:
$im = imagecreatefrompng('scratch/crop_zakki_back.png');
// In this crop, new Zakki is at x=-50 (so x=0..345).
// Where is the old Zakki?
// The old Zakki was at x=0..309, y=95..743 relative to y=850.
// Is there a second head at x=150..250, y=100..250?
// Let's check!
echo 'Crop Zakki size: '.imagesx($im).'x'.imagesy($im)."\n";

$imBf = imagecreatefrompng('scratch/crop_bottom_front.png');
echo 'Crop Bottom Front size: '.imagesx($imBf).'x'.imagesy($imBf)."\n";

$imPk = imagecreatefrompng('scratch/crop_peeking_front.png');
echo 'Crop Peeking Front size: '.imagesx($imPk).'x'.imagesy($imPk)."\n";
