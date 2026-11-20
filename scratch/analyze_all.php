<?php

// Let's examine panitia_1 and panitia_2 text areas
// Where does "Panitia" header appear? In panitia_1 or panitia_2?
// Where does the QR code appear? In panitia_1 or panitia_2?
// Where does the Name Alfia Rahma appear?

function analyze_img($path, $label)
{
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    echo "=== $label ($w x $h) ===\n";

    // Check y=0 to y=100 (Header area)
    // In panitia_1 or 2, does header have dark blue bar or light teal?
    // Let's check color at x=w/2, y=30
    $c30 = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 30));
    echo "y=30: RGB({$c30['red']}, {$c30['green']}, {$c30['blue']})\n";

    // Let's check color at x=w/2, y=60
    $c60 = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 60));
    echo "y=60: RGB({$c60['red']}, {$c60['green']}, {$c60['blue']})\n";

    // Let's check center y=300..400
    $c350 = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 350));
    echo "y=350: RGB({$c350['red']}, {$c350['green']}, {$c350['blue']})\n";
}

analyze_img('scratch/panitia_1.png', 'panitia_1 (6193fbbe)');
analyze_img('scratch/panitia_2.png', 'panitia_2 (213d1826)');
analyze_img('scratch/pendamping_1.png', 'pendamping_1 (7860d125)');
analyze_img('scratch/pendamping_2.png', 'pendamping_2 (f6cbe61c)');
analyze_img('scratch/peserta_1.png', 'peserta_1 (86309bdb)');
analyze_img('scratch/peserta_2.png', 'peserta_2 (ef0bee6a)');
