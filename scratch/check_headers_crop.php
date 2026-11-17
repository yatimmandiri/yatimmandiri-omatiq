<?php

$cropPesF = imagecrop(imagecreatefrompng('public/assets/images/cards/card-bg-front.png'), ['x' => 400, 'y' => 90, 'width' => 424, 'height' => 150]);
imagepng($cropPesF, 'scratch/crop_header_peserta.png');

$cropPenF = imagecrop(imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-front.png'), ['x' => 400, 'y' => 90, 'width' => 424, 'height' => 150]);
imagepng($cropPenF, 'scratch/crop_header_pendamping.png');

echo "Saved crop_header_peserta.png and crop_header_pendamping.png\n";
