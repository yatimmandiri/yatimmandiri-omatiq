<?php

namespace App\Services\Company;

use App\Models\Company\EventCommittee;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;
use ZipArchive;

class CommitteeImportService
{
    /**
     * Allowed shirt sizes standard in OMATIQ
     */
    protected const ALLOWED_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    /**
     * Import committee members from an uploaded file or file path.
     *
     * @return array{total: int, imported: int, updated: int, skipped: int, errors: array<int, string>}
     */
    public function import(UploadedFile|string $file, array $options = []): array
    {
        $defaultDivision = $options['default_division'] ?? 'Panitia Pelaksana Babak Final';
        $defaultAccessZone = $options['default_access_zone'] ?? 'All Access';
        $eventYear = (int) ($options['event_year'] ?? 2026);
        $updateExisting = (bool) ($options['update_existing'] ?? true);
        $createdBy = $options['created_by'] ?? auth()->id();

        if ($file instanceof UploadedFile) {
            $filePath = $file->getRealPath();
            $extension = strtolower($file->getClientOriginalExtension());
        } else {
            $filePath = $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        }

        $rawRows = $this->parseFile($filePath, $extension);

        if (empty($rawRows)) {
            return [
                'total' => 0,
                'imported' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => ['File tidak memiliki data atau baris kosong.'],
            ];
        }

        // Detect header row index and column mappings
        $mapping = $this->resolveHeaderMapping($rawRows);
        if ($mapping['header_row_index'] === null || empty($mapping['columns'])) {
            return [
                'total' => 0,
                'imported' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => ['Header kolom tidak dikenali. Pastikan file memiliki kolom Nama Lengkap, Kantor Cabang, NIK, dan Ukuran Kaos.'],
            ];
        }

        $headerIdx = $mapping['header_row_index'];
        $cols = $mapping['columns'];

        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $totalProcessed = 0;

        $dataRows = array_slice($rawRows, $headerIdx + 1);

        DB::beginTransaction();
        try {
            foreach ($dataRows as $offset => $row) {
                $rowNumber = $headerIdx + 2 + $offset;

                // Extract values using resolved column indexes
                $name = isset($cols['name']) && isset($row[$cols['name']]) ? trim((string) $row[$cols['name']]) : '';
                $branch = isset($cols['branch']) && isset($row[$cols['branch']]) ? trim((string) $row[$cols['branch']]) : '';
                $nikRaw = isset($cols['nik']) && isset($row[$cols['nik']]) ? (string) $row[$cols['nik']] : '';
                $shirtRaw = isset($cols['shirt_size']) && isset($row[$cols['shirt_size']]) ? (string) $row[$cols['shirt_size']] : '';
                $division = isset($cols['division']) && isset($row[$cols['division']]) && filled($row[$cols['division']])
                    ? trim((string) $row[$cols['division']])
                    : $defaultDivision;
                $position = isset($cols['position']) && isset($row[$cols['position']]) && filled($row[$cols['position']])
                    ? trim((string) $row[$cols['position']])
                    : 'Anggota Panitia';
                $phone = isset($cols['phone']) && isset($row[$cols['phone']]) ? $this->normalizePhone((string) $row[$cols['phone']]) : null;
                $gender = isset($cols['gender']) && isset($row[$cols['gender']]) ? $this->normalizeGender((string) $row[$cols['gender']]) : 'male';

                // Skip entirely empty row
                if ($name === '' && $nikRaw === '' && $branch === '' && $shirtRaw === '') {
                    continue;
                }

                if ($name === '') {
                    $errors[] = "Baris {$rowNumber}: Nama Lengkap wajib diisi.";
                    $skipped++;

                    continue;
                }

                $cleanNik = $this->normalizeNik($nikRaw);
                $cleanShirtSize = $this->normalizeShirtSize($shirtRaw);

                $totalProcessed++;

                // Deduplication query: find existing committee for this event year
                $existing = null;
                if ($cleanNik !== null) {
                    $existing = EventCommittee::where('event_year', $eventYear)
                        ->where('nik', $cleanNik)
                        ->first();
                }

                if (! $existing) {
                    $existing = EventCommittee::where('event_year', $eventYear)
                        ->whereRaw('LOWER(name) = ?', [strtolower($name)])
                        ->when(filled($branch), fn ($q) => $q->whereRaw('LOWER(branch) = ?', [strtolower($branch)]))
                        ->first();
                }

                if ($existing) {
                    if ($updateExisting) {
                        $updateData = [
                            'name' => $name,
                            'branch' => filled($branch) ? $branch : $existing->branch,
                            'shirt_size' => $cleanShirtSize ?? $existing->shirt_size,
                        ];

                        if ($cleanNik !== null && (! $existing->nik || $existing->nik === '')) {
                            $updateData['nik'] = $cleanNik;
                        }

                        if ($phone && (! $existing->phone || $existing->phone === '')) {
                            $updateData['phone'] = $phone;
                        }

                        if (filled($division) && $existing->division === 'Acara & Lomba' && $division !== 'Acara & Lomba') {
                            $updateData['division'] = $division;
                        }

                        $existing->update($updateData);
                        $updated++;
                    } else {
                        $skipped++;
                    }

                    continue;
                }

                // Create new committee member
                $newCode = EventCommittee::generateCode($eventYear);

                EventCommittee::create([
                    'code' => $newCode,
                    'created_by' => $createdBy,
                    'name' => $name,
                    'branch' => filled($branch) ? $branch : 'Pusat',
                    'nik' => $cleanNik,
                    'gender' => $gender,
                    'phone' => $phone,
                    'division' => $division,
                    'position' => $position,
                    'access_zone' => $defaultAccessZone,
                    'shirt_size' => $cleanShirtSize ?? 'L',
                    'status' => 'active',
                    'event_year' => $eventYear,
                ]);

                $imported++;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Committee import failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [
                'total' => $totalProcessed,
                'imported' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => ['Terjadi kesalahan database saat mengimpor data: '.$e->getMessage()],
            ];
        }

        return [
            'total' => $totalProcessed,
            'imported' => $imported,
            'updated' => $updated,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    /**
     * Parse uploaded file into 2D array of rows.
     *
     * @return array<int, array<int, mixed>>
     */
    public function parseFile(string $filePath, string $extension): array
    {
        if (in_array($extension, ['xlsx', 'xls'], true)) {
            return $this->parseXlsx($filePath);
        }

        return $this->parseCsv($filePath);
    }

    /**
     * Robust CSV / TSV parser with BOM stripping and delimiter auto-detection.
     *
     * @return array<int, array<int, string>>
     */
    protected function parseCsv(string $filePath): array
    {
        if (! file_exists($filePath) || ! is_readable($filePath)) {
            return [];
        }

        $content = file_get_contents($filePath);
        if ($content === false || trim($content) === '') {
            return [];
        }

        // Strip UTF-8 BOM if present
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
        }

        // Auto-detect delimiter from first line
        $firstLine = strtok($content, "\r\n") ?: '';
        $delimiter = ',';
        $commaCount = substr_count($firstLine, ',');
        $semicolonCount = substr_count($firstLine, ';');
        $tabCount = substr_count($firstLine, "\t");

        if ($semicolonCount > $commaCount && $semicolonCount > $tabCount) {
            $delimiter = ';';
        } elseif ($tabCount > $commaCount && $tabCount > $semicolonCount) {
            $delimiter = "\t";
        }

        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $content);
        rewind($stream);

        $rows = [];
        while (($data = fgetcsv($stream, 0, $delimiter)) !== false) {
            $rows[] = array_map(fn ($val) => trim((string) $val), $data);
        }
        fclose($stream);

        return $rows;
    }

    /**
     * Pure PHP XLSX parser utilizing standard ZipArchive and SimpleXMLElement.
     * Zero external package dependency.
     *
     * @return array<int, array<int, string>>
     */
    protected function parseXlsx(string $filePath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($filePath) !== true) {
            return [];
        }

        // 1. Read shared strings
        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml !== false) {
            $xml = @simplexml_load_string($stringsXml);
            if ($xml !== false) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Read first worksheet
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            return [];
        }

        $xml = @simplexml_load_string($sheetXml);
        if ($xml === false || ! isset($xml->sheetData)) {
            return [];
        }

        $rows = [];
        foreach ($xml->sheetData->row as $rowNode) {
            $currentRow = [];
            $lastColIndex = -1;

            foreach ($rowNode->c as $cell) {
                $ref = (string) $cell['r'];
                $colLetters = preg_replace('/[0-9]/', '', $ref);
                $colIndex = $this->columnLetterToIndex($colLetters);

                // Fill gaps if any empty cells were skipped by Excel
                while ($lastColIndex + 1 < $colIndex) {
                    $currentRow[] = '';
                    $lastColIndex++;
                }

                $type = (string) $cell['t'];
                $val = isset($cell->v) ? (string) $cell->v : '';

                if ($type === 's') {
                    // Shared string lookup
                    $idx = (int) $val;
                    $cellValue = $sharedStrings[$idx] ?? '';
                } elseif ($type === 'inlineStr' && isset($cell->is->t)) {
                    $cellValue = (string) $cell->is->t;
                } else {
                    $cellValue = $val;
                }

                $currentRow[] = trim($cellValue);
                $lastColIndex = $colIndex;
            }

            if (! empty($currentRow)) {
                $rows[] = $currentRow;
            }
        }

        return $rows;
    }

    /**
     * Convert Excel column letters (A, B, ..., Z, AA, AB) to 0-based index.
     */
    protected function columnLetterToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $len = strlen($letters);
        $index = 0;
        for ($i = 0; $i < $len; $i++) {
            $index = $index * 26 + (ord($letters[$i]) - 64);
        }

        return max(0, $index - 1);
    }

    /**
     * Resolve header mapping based on header column labels.
     *
     * @param  array<int, array<int, mixed>>  $rows
     * @return array{header_row_index: ?int, columns: array<string, int>}
     */
    protected function resolveHeaderMapping(array $rows): array
    {
        foreach ($rows as $rowIndex => $row) {
            $normalizedRow = array_map(fn ($cell) => strtolower(trim((string) $cell)), $row);

            $cols = [];
            foreach ($normalizedRow as $colIndex => $headerText) {
                if ($headerText === '') {
                    continue;
                }

                // Check for Nama Lengkap
                if (preg_match('/nama(\s+lengkap)?|full\s*name/i', $headerText) && ! isset($cols['name'])) {
                    $cols['name'] = $colIndex;
                }
                // Check for Kantor Cabang
                elseif (preg_match('/(kantor\s*)?cabang|branch|kantor/i', $headerText) && ! isset($cols['branch'])) {
                    $cols['branch'] = $colIndex;
                }
                // Check for NIK
                elseif (preg_match('/nik|no(\.|\s+)?ktp|identitas/i', $headerText) && ! isset($cols['nik'])) {
                    $cols['nik'] = $colIndex;
                }
                // Check for Ukuran Kaos / Baju
                elseif (preg_match('/ukuran\s*(kaos|baju)|shirt(\s*size)?|size|kaos|baju/i', $headerText) && ! isset($cols['shirt_size'])) {
                    $cols['shirt_size'] = $colIndex;
                }
                // Check for Divisi
                elseif (preg_match('/divisi|bidang|division/i', $headerText) && ! isset($cols['division'])) {
                    $cols['division'] = $colIndex;
                }
                // Check for Jabatan / Peran
                elseif (preg_match('/jabatan|peran|position|role/i', $headerText) && ! isset($cols['position'])) {
                    $cols['position'] = $colIndex;
                }
                // Check for No WhatsApp / Phone
                elseif (preg_match('/no(\.|\s+)?(wa|hp|telepon|telp)|phone|whatsapp/i', $headerText) && ! isset($cols['phone'])) {
                    $cols['phone'] = $colIndex;
                }
                // Check for Gender
                elseif (preg_match('/jenis\s*kelamin|gender|jk/i', $headerText) && ! isset($cols['gender'])) {
                    $cols['gender'] = $colIndex;
                }
            }

            // A valid header row MUST match at least Name and (NIK or Shirt Size or Branch)
            if (isset($cols['name']) && (isset($cols['nik']) || isset($cols['shirt_size']) || isset($cols['branch']))) {
                return [
                    'header_row_index' => $rowIndex,
                    'columns' => $cols,
                ];
            }
        }

        return [
            'header_row_index' => null,
            'columns' => [],
        ];
    }

    /**
     * Clean and normalize NIK (16 digits).
     * Handles Excel scientific notation: e.g. 3.51514E+15 -> 3515144704950001
     */
    public function normalizeNik(?string $raw): ?string
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        $raw = trim($raw);

        // Handle scientific notation e.g. 3.51514E+15
        if (preg_match('/^[\d\.]+[eE]\+\d+$/', $raw)) {
            $raw = sprintf('%.0f', (float) $raw);
        }

        // Remove any non-numeric characters
        $digits = preg_replace('/\D/', '', $raw);

        if ($digits === '') {
            return null;
        }

        // Truncate to 16 digits if longer, or keep as is
        return substr($digits, 0, 16);
    }

    /**
     * Clean and normalize Shirt Size (XS, S, M, L, XL, XXL, XXXL).
     */
    public function normalizeShirtSize(?string $raw): ?string
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        $cleaned = strtoupper(trim($raw));
        $cleaned = str_replace([' ', '-', '_'], '', $cleaned);

        // Normalize common abbreviations e.g. 2XL -> XXL, 3XL -> XXXL, 4XL -> XXXL
        $cleaned = match ($cleaned) {
            '2XL' => 'XXL',
            '3XL', '4XL', '5XL' => 'XXXL',
            'EXTRA LARGE' => 'XL',
            'LARGE' => 'L',
            'MEDIUM' => 'M',
            'SMALL' => 'S',
            'EXTRA SMALL' => 'XS',
            default => $cleaned,
        };

        if (in_array($cleaned, self::ALLOWED_SHIRT_SIZES, true)) {
            return $cleaned;
        }

        // Partial match
        foreach (self::ALLOWED_SHIRT_SIZES as $valid) {
            if (str_starts_with($cleaned, $valid)) {
                return $valid;
            }
        }

        return 'L'; // Default fallback
    }

    /**
     * Clean and normalize Phone.
     */
    protected function normalizePhone(?string $raw): ?string
    {
        if (! $raw || trim($raw) === '') {
            return null;
        }

        $digits = preg_replace('/\D/', '', $raw);
        if (str_starts_with($digits, '62')) {
            $digits = '0'.substr($digits, 2);
        } elseif (str_starts_with($digits, '8')) {
            $digits = '0'.$digits;
        }

        return substr($digits, 0, 20);
    }

    /**
     * Normalize gender string.
     */
    protected function normalizeGender(?string $raw): string
    {
        if (! $raw) {
            return 'male';
        }

        $raw = strtolower(trim($raw));
        if (str_starts_with($raw, 'p') || str_contains($raw, 'wanita') || str_contains($raw, 'perempuan') || str_contains($raw, 'female')) {
            return 'female';
        }

        return 'male';
    }

    /**
     * Generate template CSV content matching Google Sheet format.
     */
    public function generateTemplateCsv(): string
    {
        $headers = ['Timestamp', 'Nama Lengkap', 'Kantor Cabang', 'NIK', 'Ukuran Kaos'];
        $samples = [
            ['03/11/2026 14:01:45', 'GRACE PUTRI ARIA', 'Pusat 1', '3515144704950001', 'XXL'],
            ['03/11/2026 14:02:21', 'DAVID MAULANA SUWASGITA', 'Regional', '3513052805020001', 'XXL'],
            ['03/11/2026 14:05:17', 'Anjar Susilo', 'Pusat 1', '3504052204030001', 'M'],
            ['03/11/2026 14:05:37', 'TEDDY ROHMAT SETIAPERMANA', 'Regional', '3211261902880004', 'XL'],
            ['03/11/2026 14:10:00', 'Siti Nurhaliza', 'Surabaya', '3578015502980002', 'L'],
        ];

        $stream = fopen('php://memory', 'r+');
        // Add UTF-8 BOM so Excel opens with proper encoding
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, $headers);
        foreach ($samples as $sample) {
            fputcsv($stream, $sample);
        }
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return $csv ?: '';
    }
}
