export interface WhatsappContact {
    name: string;
    number: string;
}

/**
 * Normalizes phone number into international WhatsApp format (e.g. 628123456789)
 */
export function normalizeWhatsappNumber(raw: string): string {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) return '';

    if (cleaned.startsWith('62')) {
        return cleaned;
    }
    if (cleaned.startsWith('0')) {
        return '62' + cleaned.slice(1);
    }
    return '62' + cleaned;
}

/**
 * Parses raw whatsapp setting (can be JSON array string, comma-separated numbers, or single number string)
 * into a structured array of WhatsappContact
 */
export function parseWhatsappContacts(raw?: string | null): WhatsappContact[] {
    if (!raw || typeof raw !== 'string') {
        return [];
    }

    const trimmed = raw.trim();
    if (!trimmed) {
        return [];
    }

    // Try parsing as JSON array: [{ name: "...", number: "..." }] or ["..."]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item, idx) => {
                        if (typeof item === 'string') {
                            return {
                                name: `Admin ${idx + 1}`,
                                number: item.trim(),
                            };
                        }
                        if (item && typeof item === 'object') {
                            const name = (item.name || item.label || `Admin ${idx + 1}`).trim();
                            const number = (item.number || item.phone || item.whatsapp || '').toString().trim();
                            return { name, number };
                        }
                        return null;
                    })
                    .filter((c): c is WhatsappContact => Boolean(c && c.number));
            }
        } catch {
            // fallback to string parsing below
        }
    }

    // Handle multiline or comma separated text
    const lines = trimmed.split(/[\r\n,]+/).map((l) => l.trim()).filter(Boolean);
    const contacts: WhatsappContact[] = [];

    lines.forEach((line, idx) => {
        // Check if format is "Label: Number" or "Label - Number"
        const colonMatch = line.match(/^([^:\-]+)[:\-]\s*(.+)$/);
        if (colonMatch) {
            const label = colonMatch[1].trim();
            const number = colonMatch[2].trim();
            if (number) {
                contacts.push({ name: label, number });
                return;
            }
        }

        contacts.push({
            name: lines.length > 1 ? `Admin ${idx + 1}` : 'Admin OMATIQ',
            number: line,
        });
    });

    return contacts.filter((c) => Boolean(c.number));
}

/**
 * Generates official WhatsApp click-to-chat URL with pre-filled message
 */
export function buildWhatsappUrl(number: string, message?: string): string {
    const normalized = normalizeWhatsappNumber(number);
    if (!normalized) return '#';

    const defaultMsg = message || 'Halo Admin OMATIQ, saya ingin bertanya seputar pendaftaran olimpiade.';
    return `https://wa.me/${normalized}?text=${encodeURIComponent(defaultMsg)}`;
}
