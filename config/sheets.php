<?php

return [
    'spreadsheet_id' => env('GSHEETS_SPREADSHEET_ID'),
    'sheet_name' => env('GSHEETS_SHEET', 'Data Peserta'),
    'credentials' => env('GSHEETS_CREDENTIALS', storage_path('app/google/credentials.json')),
    'enabled' => env('GSHEETS_SYNC_ENABLED', false),
];
