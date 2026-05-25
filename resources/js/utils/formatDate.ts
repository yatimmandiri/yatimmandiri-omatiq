import moment from 'moment-timezone';

const TZ = 'Asia/Jakarta';

export const formatDate = (
    value: any,
    format:
        | 'date'
        | 'datetime'
        | 'time'
        | 'long'
        | 'short'
        | 'iso'
        | 'relative'
        | 'custom'
        | string = 'date',
) => {
    if (!value) return '-';

    const m = moment(value).tz(TZ);

    switch (format) {
        // 12 May 2026
        case 'date':
            return m.format('DD MMM YYYY');

        // 12 May 2026 14:30
        case 'datetime':
            return m.format('DD MMM YYYY HH:mm');

        // 14:30
        case 'time':
            return m.format('HH:mm');

        // Tuesday, 12 May 2026
        case 'long':
            return m.format('dddd, DD MMMM YYYY');

        // 12/05/2026
        case 'short':
            return m.format('DD/MM/YYYY');

        // ISO format
        case 'iso':
            return m.toISOString();

        // 2 hours ago
        case 'relative':
            return m.fromNow();

        case 'custom':
            return m.format('YYYY-MM-DD');

        default:
            return m.format(format);
    }
};
