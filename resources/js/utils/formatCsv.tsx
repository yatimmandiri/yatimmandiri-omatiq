export const arrayToCSV = (data: any[]) => {
    if (!data.length) return '';

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
    const blob = new Blob([csv], {
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
