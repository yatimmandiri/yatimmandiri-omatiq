import type { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Default custom class styles matching OMATIQ brand
const defaultCustomClass = {
    popup: 'rounded-2xl border border-border shadow-2xl p-6 bg-card text-card-foreground dark:bg-zinc-900 dark:border-zinc-800',
    title: 'text-lg font-bold text-foreground tracking-tight dark:text-zinc-100',
    htmlContainer: 'text-sm text-muted-foreground mt-2 dark:text-zinc-400',
    confirmButton:
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-5 py-2 rounded-lg text-sm bg-[#17524A] text-white hover:bg-[#13453e] shadow-sm cursor-pointer mx-1',
    cancelButton:
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-5 py-2 rounded-lg text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm cursor-pointer mx-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700',
    actions: 'mt-6 gap-2 flex-wrap justify-end',
};

// Default custom styled SweetAlert instance
const brandSwal = Swal.mixin({
    customClass: defaultCustomClass,
    buttonsStyling: false,
});

export interface ConfirmDialogOptions {
    title?: string;
    text?: string;
    html?: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isDanger?: boolean;
    showCancelButton?: boolean;
    reverseButtons?: boolean;
}

/**
 * Universal SweetAlert confirmation dialog returning a boolean promise
 */
export const confirmAction = async ({
    title = 'Apakah Anda yakin?',
    text = '',
    html,
    icon = 'warning',
    confirmButtonText = 'Ya, Lanjutkan',
    cancelButtonText = 'Batal',
    isDanger = false,
    showCancelButton = true,
    reverseButtons = true,
}: ConfirmDialogOptions = {}): Promise<boolean> => {
    const dangerConfirmClass =
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-5 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer mx-1';

    const customOptions: SweetAlertOptions = {
        title,
        icon,
        showCancelButton,
        confirmButtonText,
        cancelButtonText,
        reverseButtons,
        focusCancel: isDanger,
    };

    if (html) {
        customOptions.html = html;
    } else if (text) {
        customOptions.text = text;
    }

    if (isDanger) {
        customOptions.customClass = {
            ...defaultCustomClass,
            confirmButton: dangerConfirmClass,
        };
    }

    const result = await brandSwal.fire(customOptions);

    return result.isConfirmed;
};

/**
 * Confirmation dialog specialized for resetting teacher/user password to default
 */
export const confirmResetPassword = async (options?: {
    userName?: string;
    title?: string;
    text?: string;
    confirmButtonText?: string;
}): Promise<boolean> => {
    const userLabel = options?.userName
        ? ` untuk <strong>${options.userName}</strong>`
        : '';

    return confirmAction({
        title: options?.title ?? 'Reset Password Akun?',
        html:
            options?.text ??
            `Password akun${userLabel} akan direset kembali ke password bawaan: <br/><code class="mt-2 inline-block px-2.5 py-1 bg-muted rounded-md text-primary font-mono font-bold text-sm border border-border">password</code><br/><span class="mt-2 block text-xs text-muted-foreground">Pengguna disarankan untuk segera memperbarui password setelah login.</span>`,
        icon: 'warning',
        confirmButtonText: options?.confirmButtonText ?? 'Ya, Reset Password',
        cancelButtonText: 'Batal',
        isDanger: false,
    });
};

/**
 * Confirmation dialog specialized for deleting resources
 */
export const confirmDelete = async (options?: {
    title?: string;
    text?: string;
    html?: string;
    itemName?: string;
    confirmButtonText?: string;
}): Promise<boolean> => {
    const itemLabel = options?.itemName
        ? ` "<strong>${options.itemName}</strong>"`
        : '';

    return confirmAction({
        title: options?.title ?? 'Konfirmasi Hapus Data',
        html:
            options?.html ??
            (options?.text ||
                `Apakah Anda yakin ingin menghapus data${itemLabel}? Tindakan ini tidak dapat dibatalkan.`),
        icon: 'warning',
        confirmButtonText: options?.confirmButtonText ?? 'Ya, Hapus',
        cancelButtonText: 'Batal',
        isDanger: true,
    });
};

/**
 * Show modern SweetAlert notifications
 */
export const showSuccessAlert = (title: string, text?: string) => {
    return brandSwal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonText: 'Selesai',
    });
};

export const showErrorAlert = (title: string, text?: string) => {
    return brandSwal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Tutup',
    });
};

export const showWarningAlert = (title: string, text?: string) => {
    return brandSwal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'Mengerti',
    });
};

export default brandSwal;
