<?php

echo "=== CHECKING EXACT COORDINATES FOR 1224 x 1944 ===\n";

$targetW = 1224;
$targetH = 1944;

// 1. Header Icon Placement:
// Target: y = 110..220 (height ~110px)
// icon-omatiq.png (659x653, ratio ~1:1) -> 110x110
// icon-ym.png (1056x1056 or cropped) -> 110x110 (or proportional)
// Combined width: 110 + 24 (gap) + 110 = 244px
// Centered: startX = (1224 - 244) / 2 = 490px
// icon-omatiq at x = 490, y = 110
// icon-ym at x = 624, y = 110

echo "Icon Omatiq: x=490, y=110, w=110, h=110\n";
echo "Icon YM:     x=624, y=110, w=110, h=110\n";

// 2. Data Box Placement in Front Cards:
// In 408x648, the name box is between y: 340 and y: 440
// Scaled to 1944: y = (340/648)*1944 = 1020, to (440/648)*1944 = 1320
// Height = 300px
// x is between (30/408)*1224 = 90 and (378/408)*1224 = 1134 (Width = 1044px)
echo "Data Box Front: x=90..1134, y=1020..1320 (w=1044, h=300)\n";

// 3. QR Placement in Back Cards:
// In 408x648, the QR is between y: 245 and y: 435 (Height = 190, Width = 190)
// Scaled to 1944: y = (250/648)*1944 = 750, to (430/648)*1944 = 1290 (Height = 540)
// Centered: startX = (1224 - 540) / 2 = 342px
// Zakki is at x < 280, Amila is at x > 940.
// QR box at x = 342..882 leaves plenty of breathing room (62px on left, 58px on right) so Zakki and Amila are 100% UNTOUCHED!
echo "QR Placement Back: x=342..882, y=750..1290 (540x540)\n";
