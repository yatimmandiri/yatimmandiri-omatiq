<?php

// Let's inspect raw_1b8f3562 and raw_3ae89431 completely
// We can check y from 0 to 648 in steps of 40
function scan_card($file, $label)
{
    $im = imagecreatefrompng($file);
    echo "=== $label ===\n";
    for ($y = 20; $y < 640; $y += 30) {
        $c = imagecolorsforindex($im, imagecolorat($im, 204, $y));
        $cL = imagecolorsforindex($im, imagecolorat($im, 50, $y));
        $cR = imagecolorsforindex($im, imagecolorat($im, 350, $y));
        echo sprintf("y=%3d: C(%3d,%3d,%3d) L(%3d,%3d,%3d) R(%3d,%3d,%3d)\n",
            $y,
            $c['red'], $c['green'], $c['blue'],
            $cL['red'], $cL['green'], $cL['blue'],
            $cR['red'], $cR['green'], $cR['blue']
        );
    }
}

scan_card('scratch/raw_1b8f3562.png', 'raw_1b8f3562');
scan_card('scratch/raw_3ae89431.png', 'raw_3ae89431');
