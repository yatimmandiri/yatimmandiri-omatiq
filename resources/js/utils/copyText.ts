import { notification } from './toast';

export const copyText = (value: string) => {
    navigator.clipboard.writeText(value);
    notification({ message: 'Berhasil Copy Text', type: 'success' });
};
