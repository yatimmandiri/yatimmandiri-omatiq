<?php

// Check if bg-pendamping.png has text or logos or if it's a card template without text
$im = imagecreatefrompng('public/assets/images/bg-pendamping.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's sample along horizontal lines to see if there are sharp edges (text/logos) or smooth gradients
$sharpEdges = 0;
for ($y = 10; $y < $h - 10; $y += 5) {
    for ($x = 10; $x < $w - 10; $x += 2) {
        $c1 = imagecolorat($im, $x, $y);
        $c2 = imagecolorat($im, $x + 2, $y);
        $diff = abs((($c1 >> 16) & 0xFF) - (($c2 >> 16) & 0xFF)) +
                abs((($c1 >> 8) & 0xFF) - (($c2 >> 8) & 0xFF)) +
                abs(($c1 & 0xFF) - ($c2 & 0xFF));
        if ($diff > 80) {
            $sharpEdges++;
        }
    }
}
echo "bg-pendamping.png sharp edges count: $sharpEdges\n";
