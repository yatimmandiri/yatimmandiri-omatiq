import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import participants from '@/routes/admin/companies/participants';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Download,
    FileCheck2,
    FileText,
    Loader2,
    UploadCloud,
} from 'lucide-react';
import React, { useState } from 'react';

interface NationalReRegisterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participant: {
        id: number;
        registration_number: string;
        student?: {
            full_name?: string;
            is_binaan?: boolean;
        };
        user?: {
            name?: string;
        };
        branch?: string;
        olimpiade?: {
            name?: string;
        };
    } | null;
    onSuccess?: () => void;
}

export function NationalReRegisterModal({
    open,
    onOpenChange,
    participant,
    onSuccess,
}: NationalReRegisterModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    if (!participant) return null;

    const studentName =
        participant.student?.full_name ??
        participant.user?.name ??
        'Santri Binaan';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const selected = e.target.files?.[0];
        if (!selected) return;

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
        ];
        if (!allowedTypes.includes(selected.type)) {
            setError('Format file harus berupa PDF, JPG, atau PNG.');
            return;
        }

        if (selected.size > 4 * 1024 * 1024) {
            setError('Ukuran file maksimal 4MB.');
            return;
        }

        setFile(selected);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Silakan pilih file Surat Kesediaan Hadir terlebih dahulu.');
            return;
        }

        setProcessing(true);
        setError(null);

        router.post(
            participants.nationalReRegisterBinaan(participant.id).url,
            {
                availability_letter: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setFile(null);
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (errs) => {
                    setProcessing(false);
                    const msg =
                        errs.availability_letter ||
                        Object.values(errs)[0] ||
                        'Terjadi kesalahan saat mengunggah surat kesediaan.';
                    setError(String(msg));
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                            <FileText className="size-5 text-emerald-700 dark:text-emerald-300" />
                        </span>
                        <div>
                            <DialogTitle className="text-lg font-bold">
                                Daftar Ulang Santri Binaan
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Babak Final Nasional OMATIQ 2026
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Ringkasan Data Santri */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-muted-foreground">
                                    Nama Santri:
                                </span>
                                <p className="font-bold">{studentName}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    No. Registrasi:
                                </span>
                                <p className="font-mono font-semibold">
                                    {participant.registration_number}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Cabang / Wilayah:
                                </span>
                                <p className="font-medium">
                                    {participant.branch || '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Cabang Lomba:
                                </span>
                                <p className="font-medium">
                                    {participant.olimpiade?.name || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2.5 rounded-lg border border-emerald-300 bg-white/80 p-2 text-[11px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            ✨ Santri Binaan <strong>100% Gratis</strong> tanpa
                            biaya pendaftaran ulang. Kantor Cabang cukup
                            mengunggah Surat Kesediaan Hadir.
                        </div>
                    </div>

                    {/* Download Link Template */}
                    <div className="flex items-center justify-between rounded-xl border border-amber-300/80 bg-amber-50/80 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/40">
                        <div className="space-y-0.5">
                            <p className="font-semibold text-amber-900 dark:text-amber-200">
                                Format Surat Kesediaan Resmi
                            </p>
                            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                                Unduh dan cetak formulir untuk ditandatangani
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 gap-1.5 border-amber-400 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200"
                        >
                            <a
                                href="https://link.yatimmandiri.org/SuratKesediaanOMATIQ"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="size-3.5" />
                                Unduh Template
                            </a>
                        </Button>
                    </div>

                    {/* Upload File Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="availability_letter"
                            className="text-xs font-semibold"
                        >
                            Unggah Surat Kesediaan Hadir (Bertanda Tangan){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-50/30 p-4 transition-colors hover:bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20">
                            <input
                                id="availability_letter"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                disabled={processing}
                            />
                            {file ? (
                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                                    <FileCheck2 className="size-6 text-emerald-600" />
                                    <div className="text-left">
                                        <p className="max-w-[260px] truncate text-xs font-semibold">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB •
                                            Klik untuk mengganti
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <UploadCloud className="mx-auto size-7 text-emerald-600 dark:text-emerald-400" />
                                    <p className="mt-1 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                                        Pilih atau seret file ke sini
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Format PDF, JPG, atau PNG (Maks. 4MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !file}
                            className="gap-2 bg-[#17524A] text-white hover:bg-[#17524A]/90"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FileCheck2 className="size-4" />
                                    Simpan & Konfirmasi Daftar Ulang
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
