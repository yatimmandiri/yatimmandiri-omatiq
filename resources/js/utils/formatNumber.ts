export const formatNumberWhatsapp = (value: string) => {
    if (!value) return '';

    let number = value.replace(/\D/g, '');

    if (number.startsWith('0')) {
        number = '62' + number.slice(1);
    }

    if (number.startsWith('8')) {
        number = '62' + number;
    }

    return number.startsWith('62') ? number : number;
};

export const formatRupiah = ({ value, prefix = 'Rp' }: FormatRupiahProps) => {
    if (value === null || value === undefined || value === '') return '';

    const number = Number(value);

    if (isNaN(number)) return '';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(number)
        .replace('Rp', '')
        .trim()
        .replace(/^/, prefix + ' ');
};

export const formatNumber = (value: string | number) => {
    if (value === null || value === undefined) return '';

    const cleaned = String(value).replace(/\D/g, '');

    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const onlyNumber = (value: string) => {
    return value.replace(/[^0-9]/g, '');
};

export const parseNumber = (value: string) => {
    if (!value) return 0;

    return Number(value.replace(/\./g, '').replace(/,/g, ''));
};

export const formatCurrency = (
    value: number | string,
    currency = 'IDR',
    locale = 'id-ID',
) => {
    const number = Number(value);

    if (isNaN(number)) return '';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(number);
};

export const formatCompactNumber = (value: number) => {
    if (!value) return '0';

    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
};

export const formatPercent = (value: number | string) => {
    const number = Number(value);

    if (isNaN(number)) return '0%';

    return new Intl.NumberFormat('id-ID', {
        style: 'percent',
        minimumFractionDigits: 0,
    }).format(number / 100);
};

export const clampNumber = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

interface FormatRupiahProps {
    value: number | string;
    prefix?: string;
}
