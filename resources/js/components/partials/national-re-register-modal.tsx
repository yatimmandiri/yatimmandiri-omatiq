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
import { Textarea } from '@/components/ui/textarea';
import participants from '@/routes/admin/companies/participants';
import { confirmAction } from '@/utils/sweetalert';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Download,
    FileCheck2,
    FileText,
    Loader2,
    UploadCloud,
    UserX,
} from 'lucide-react';
import React, { useState } from 'react';

export const NATIONAL_DECLINE_CATEGORIES = [
    { value: 'Sakit / Kondisi Medis', label: 'Sakit / Kondisi Medis' },
    { value: 'Jadwal Sekolah / Ujian Bentrok', label: 'Jadwal Sekolah / Ujian Bentrok' },
    { value: 'Kendala Jarak / Transportasi / Perjalanan', label: 'Kendala Jarak / Transportasi / Perjalanan' },
    { value: 'Urgensi / Musibah Keluarga', label: 'Urgensi / Musibah Keluarga' },
    { value: 'Tidak Diizinkan Orang Tua / Wali', label: 'Tidak Diizinkan Orang Tua / Wali' },
    { value: 'Lainnya', label: 'Alasan Lainnya' },
];

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
        national?: {
            status?: string;
            decline_category?: string;
            decline_reason?: string;
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
    const [actionType, setActionType] = useState<'register' | 'decline'>('register');
    const [file, setFile] = useState<File | null>(null);
    const [declineCategory, setDeclineCategory] = useState<string>('Sakit / Kondisi Medis');
    const [declineReason, setDeclineReason] = useState<string>('');
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

    const handleRegisterSubmit = (e: React.FormEvent) => {
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

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declineReason.trim()) {
            setError('Silakan isi penjelasan / alasan pengunduran diri santri binaan.');
            return;
        }

        if (declineReason.trim().length < 5) {
            setError('Penjelasan alasan minimal 5 karakter.');
            return;
        }

        setProcessing(true);
        setError(null);

        const declineUrl = (participants as any).nationalDeclineBinaan
            ? (participants as any).nationalDeclineBinaan(participant.id).url
            : `/admin/companies/participants/${participant.id}/national-decline-binaan`;

        router.post(
            declineUrl,
            {
                decline_category: declineCategory,
                decline_reason: declineReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setDeclineReason('');
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (errs) => {
                    setProcessing(false);
                    const msg =
                        errs.decline_reason ||
                        errs.decline_category ||
                        Object.values(errs)[0] ||
                        'Terjadi kesalahan saat mencatat pengunduran diri.';
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
                            {actionType === 'register' ? (
                                <FileText className="size-5 text-emerald-700 dark:text-emerald-300" />
                            ) : (
                                <UserX className="size-5 text-rose-600 dark:text-rose-400" />
                            )}
                        </span>
                        <div>
                            <DialogTitle className="text-lg font-bold">
                                {actionType === 'register'
                                    ? 'Daftar Ulang Santri Binaan'
                                    : 'Konfirmasi Pengunduran Diri'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Babak Final Nasional OMATIQ 2026
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tab Switcher: Daftar Ulang vs Mengundurkan Diri */}
                <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => {
                            setActionType('register');
                            setError(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                            actionType === 'register'
                                ? 'bg-background text-emerald-700 shadow-xs dark:text-emerald-400'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <FileCheck2 className="size-3.5" />
                        Bersedia Hadir (Daftar)
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActionType('decline');
                            setError(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                            actionType === 'decline'
                                ? 'bg-background text-rose-700 shadow-xs dark:text-rose-400'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <UserX className="size-3.5" />
                        Mengundurkan Diri
                    </button>
                </div>

                {/* Ringkasan Data Santri */}
                <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-muted-foreground">Nama Santri:</span>
                            <p className="font-bold">{studentName}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">No. Registrasi:</span>
                            <p className="font-mono font-semibold">
                                {participant.registration_number}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Cabang / Wilayah:</span>
                            <p className="font-medium">{participant.branch || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Cabang Lomba:</span>
                            <p className="font-medium">{participant.olimpiade?.name || '-'}</p>
                        </div>
                    </div>
                </div>

                {actionType === 'register' ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2 text-[11px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            ✨ Santri Binaan <strong>100% Gratis</strong> tanpa biaya pendaftaran ulang. Kantor Cabang cukup mengunggah Surat Kesediaan Hadir.
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
                                                {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti
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
                ) : (
                    <form onSubmit={handleDeclineSubmit} className="space-y-4">
                        <div className="rounded-lg border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                            <p className="font-semibold text-rose-950 dark:text-rose-100">
                                Pernyataan Pengunduran Diri Santri Binaan
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                                Pilih kategori dan cantumkan alasan mengapa santri binaan berhalangan hadir ke Babak Final Nasional OMATIQ 2026. Laporan ini akan tersimpan dan langsung diteruskan kepada Panitia Pusat.
                            </p>
                        </div>

                        {/* Kategori Alasan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="decline_category" className="text-xs font-semibold">
                                Kategori Alasan <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="decline_category"
                                value={declineCategory}
                                onChange={(e) => setDeclineCategory(e.target.value)}
                                disabled={processing}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {NATIONAL_DECLINE_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Penjelasan Detail */}
                        <div className="space-y-1.5">
                            <Label htmlFor="decline_reason" className="text-xs font-semibold">
                                Penjelasan / Alasan Lengkap <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="decline_reason"
                                rows={3}
                                placeholder="Contoh: Santri sedang menjalani pengobatan medis / Jadwal ujian sekolah bentrok dan orang tua tidak mengizinkan bepergian jauh..."
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                disabled={processing}
                                className="text-xs"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Minimal 5 karakter. Berikan keterangan yang jelas untuk dokumentasi Panitia Pusat.
                            </p>
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
                                variant="destructive"
                                disabled={processing || !declineReason.trim()}
                                className="gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <UserX className="size-4" />
                                        Konfirmasi Pengunduran Diri
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
