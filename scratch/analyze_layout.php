<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

$w = imagesx($front);
$h = imagesy($front);

// Let's inspect sections vertically
echo "=== FRONT ANALYSIS ($w x $h) ===\n";

// 1. Where is the logo YM?
// In front image, top has YM logo in center. Let's see rows where YM logo is located.
// 2. Where is "Panitia"?
// In front image, there is a dark green horizontal banner or pill: "Panitia"
// 3. Where is "Olimpiade Matematika dan Qur'an OMATIQ 2026 Building Future Innovator"?
// 4. Where is "Zakki Amila Atas.png"? The user says:
// "contoh misal bagian asset 'Zakki Amila Atas.png' ini posisinya ada di pojok atas luar dari container committee-data-box, dan lain-lainnya sesuaikan juga ya"
// Look at the image! In media_1794895882598_28c9da3c.png:
// Notice where Zakki and Amila are!
// They are NOT centered! They are at the TOP RIGHT corner of the container committee-data-box!
// Let's find the exact bounding box of Zakki and Amila in the front image!

// Let's scan for non-background colors around y = 250..400
for ($y = 200; $y < 450; $y += 5) {
    // sample pixels across x
    $hasMascot = false;
    for ($x = 200; $x < 360; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // Mascot skin / hoodie / hijab colors:
        // Zakki hoodie: dark blue/navy (~ #0f2744: r<30, g<50, b>50)
        // Skin: r > 200, g > 150, b > 120
        if (($r > 200 && $g > 150 && $b > 120) || ($b > $r + 30 && $b > $g + 10 && $b < 100)) {
            $hasMascot = true;
            break;
        }
    }
    if ($hasMascot) {
        echo "Mascot detected at y = $y\n";
    }
}
