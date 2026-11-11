import type { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Default custom class styles matching OMATIQ brand
const defaultCustomClass = {
    container: 'z-[99999] pointer-events-auto',
    popup: 'rounded-2xl border border-border shadow-2xl p-6 bg-card text-card-foreground dark:bg-zinc-900 dark:border-zinc-800 pointer-events-auto',
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
        heightAuto: false,
        didOpen: (popup) => {
            const container = popup.closest('.swal2-container') as HTMLElement | null;
            if (container) {
                container.style.zIndex = '99999';
                container.style.pointerEvents = 'auto';
            }
            popup.style.pointerEvents = 'auto';
        },
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

    return confirmTwoStepDelete({
        titleStep1: options?.title ?? 'Konfirmasi Hapus Data',
        htmlStep1:
            options?.html ??
            (options?.text ||
                `Apakah Anda yakin ingin menghapus data${itemLabel}?`),
        confirmTextStep1: 'Lanjut ke Konfirmasi Akhir →',
        titleStep2: '⚠️ Konfirmasi Terakhir Hapus Data',
        htmlStep2: `<div class="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs leading-relaxed text-left mb-3 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800">
            <strong>PERINGATAN:</strong> Anda akan menghapus data${itemLabel}. Pastikan Anda benar-benar yakin sebelum melanjutkan.
        </div>
        Apakah Anda yakin 100% ingin menghapus data ini sekarang?`,
        confirmTextStep2: options?.confirmButtonText ?? 'Ya, Hapus Sekarang',
        cancelTextStep2: 'Batal (Simpan Data)',
    });
};

export interface TwoStepDeleteOptions {
    titleStep1?: string;
    htmlStep1?: string;
    confirmTextStep1?: string;
    cancelTextStep1?: string;
    titleStep2?: string;
    htmlStep2?: string;
    confirmTextStep2?: string;
    cancelTextStep2?: string;
    itemName?: string;
}

/**
 * Professional Two-Step (Double Confirmation) Dialog for high-impact / destructive actions.
 * Guarantees that accidental single clicks or Enter keys never delete or disqualify data.
 * The user MUST explicitly confirm a second time before any action is executed.
 */
export const confirmTwoStepDelete = async (
    options?: TwoStepDeleteOptions,
): Promise<boolean> => {
    const itemLabel = options?.itemName
        ? ` "<strong>${options.itemName}</strong>"`
        : '';

    // Step 1: Contextual Warning Dialog
    const step1Confirmed = await confirmAction({
        title: options?.titleStep1 ?? 'Konfirmasi Tindakan',
        html:
            options?.htmlStep1 ??
            `Apakah Anda yakin ingin memproses penghapusan data${itemLabel}? Silakan konfirmasi untuk melanjutkan ke verifikasi akhir.`,
        icon: 'warning',
        confirmButtonText:
            options?.confirmTextStep1 ?? 'Lanjut ke Konfirmasi Akhir →',
        cancelButtonText: options?.cancelTextStep1 ?? 'Batal',
        isDanger: true,
        reverseButtons: true,
    });

    if (!step1Confirmed) {
        return false;
    }

    // Step 2: Final Verification Dialog (High-Impact Destructive Confirmation)
    const step2Confirmed = await confirmAction({
        title: options?.titleStep2 ?? '⚠️ Konfirmasi Terakhir (Langkah 2 dari 2)',
        html:
            options?.htmlStep2 ??
            `<div class="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs leading-relaxed text-left mb-3 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800">
                <strong>PERINGATAN TINGKAT TINGGI:</strong> Tindakan ini bersifat permanen atau merubah status penting data${itemLabel}. Sistem memerlukan konfirmasi kedua untuk mencegah kesalahan klik.
            </div>
            Apakah Anda benar-benar yakin 100% ingin melanjutkan proses ini?`,
        icon: 'error',
        confirmButtonText:
            options?.confirmTextStep2 ?? 'Ya, Saya Yakin 100% (Proses Sekarang)',
        cancelButtonText: options?.cancelTextStep2 ?? 'Batal (Jangan Hapus)',
        isDanger: true,
        reverseButtons: true,
    });

    return step2Confirmed;
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
