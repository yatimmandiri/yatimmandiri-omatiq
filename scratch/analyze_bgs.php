<?php

function analyze($path)
{
    echo "=== $path ===\n";
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    echo "Size: {$w}x{$h}\n";
    // Check if it's two pages side by side or single page
    // Look at aspect ratio
    $ratio = $w / $h;
    echo 'Aspect ratio (W/H): '.round($ratio, 3)."\n";
    imagedestroy($im);
}

analyze('public/assets/images/bg-pendamping.png');
analyze('public/assets/images/bg-panitia.png');
analyze('public/assets/images/bg-peserta.png');
