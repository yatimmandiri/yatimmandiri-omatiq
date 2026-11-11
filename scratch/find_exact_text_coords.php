<?php

$imF = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png');
$imB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');

// Find text in front card around y=610..640:
$foundF = [];
for ($y = 610; $y < 645; $y++) {
    for ($x = 130; $x < 280; $x++) {
        $c = imagecolorat($imF, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Text is darker than the surrounding diamond facet
        // Facet is R>160, G>220, B>220. Text has R<140 or G<200 or B<200
        if ($r < 150 && $g < 210 && $b < 210) {
            $foundF[] = ['x' => $x, 'y' => $y];
        }
    }
}

if (! empty($foundF)) {
    $minX = min(array_column($foundF, 'x'));
    $maxX = max(array_column($foundF, 'x'));
    $minY = min(array_column($foundF, 'y'));
    $maxY = max(array_column($foundF, 'y'));
    echo "Front text: x=[$minX, $maxX], y=[$minY, $maxY]\n";
} else {
    echo "Front text not found with this threshold\n";
}

// In back card:
$foundB = [];
for ($y = 485; $y < 530; $y++) {
    for ($x = 130; $x < 280; $x++) {
        $c = imagecolorat($imB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 150 && $g < 210 && $b < 210) {
            $foundB[] = ['x' => $x, 'y' => $y];
        }
    }
}

if (! empty($foundB)) {
    $minX = min(array_column($foundB, 'x'));
    $maxX = max(array_column($foundB, 'x'));
    $minY = min(array_column($foundB, 'y'));
    $maxY = max(array_column($foundB, 'y'));
    echo "Back text: x=[$minX, $maxX], y=[$minY, $maxY]\n";
}
