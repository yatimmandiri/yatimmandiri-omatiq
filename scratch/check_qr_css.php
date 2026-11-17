<?php

foreach (['participant-card.blade.php', 'chaperone-card.blade.php', 'committee-card.blade.php'] as $f) {
    $c = file_get_contents('resources/views/cards/'.$f);
    echo "=== $f ===\n";
    preg_match_all('/(\.[a-zA-Z0-9_-]*(?:qr|barcode)[a-zA-Z0-9_-]*\s*\{[^}]+\})/i', $c, $m);
    foreach ($m[0] as $css) {
        echo $css."\n";
    }
}
