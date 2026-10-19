/**
 * Format string dengan inisial string petik satu (') untuk keperluan export Excel/CSV
 * agar string numerik panjang seperti NIK (16 digit) dan No HP tidak terpotong (limit 15 digit IEEE-754)
 * atau kehilangan angka 0 di depan saat dibuka di Microsoft Excel.
 */
export const formatExportString = (value?: string | number | null): string => {
    if (value === null || value === undefined) {
        return '-';
    }
    const str = String(value).trim();
    if (!str || str === '-') {
        return '-';
    }
    return str.startsWith("'") ? str : `'${str}`;
};

export const arrayToCSV = (data: any[]) => {
    if (!data.length) {
        return '';
    }

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
        headers
            .map((key) => {
                const value = row[key] ?? '';

                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csv: string, filename = 'export.csv') => {
    // Menambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel langsung mengenali encoding UTF-8
    const blob = new Blob(['\uFEFF' + csv], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

