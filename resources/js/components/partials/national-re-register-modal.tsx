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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import participants from '@/routes/admin/companies/participants';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CreditCard,
    Download,
    FileCheck2,
    FileText,
    Loader2,
    Shirt,
    UploadCloud,
    UserX,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const SHIRT_SIZES = [
    { value: 'XS', label: 'XS (Extra Small / Anak)' },
    { value: 'S', label: 'S (Small)' },
    { value: 'M', label: 'M (Medium)' },
    { value: 'L', label: 'L (Large)' },
    { value: 'XL', label: 'XL (Extra Large)' },
    { value: 'XXL', label: 'XXL (Double Extra Large)' },
    { value: 'XXXL', label: 'XXXL (3XL)' },
];

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
            shirt_size?: string;
            decline_category?: string;
            decline_reason?: string;
            availability_letter_path?: string;
            payment_proof_path?: string;
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
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [shirtSize, setShirtSize] = useState<string>('');
    const [declineCategory, setDeclineCategory] = useState<string>('Sakit / Kondisi Medis');
    const [declineReason, setDeclineReason] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (participant?.national?.shirt_size) {
            setShirtSize(participant.national.shirt_size);
        } else {
            setShirtSize('');
        }
        setFile(null);
        setPaymentProofFile(null);
        setError(null);
    }, [participant, open]);

    if (!participant) return null;

    const isBinaan = Boolean(participant.student?.is_binaan);
    const studentName =
        participant.student?.full_name ??
        participant.user?.name ??
        (isBinaan ? 'Santri Binaan' : 'Peserta Umum');

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
            setError('Format surat kesediaan harus berupa PDF, JPG, atau PNG.');
            return;
        }

        if (selected.size > 4 * 1024 * 1024) {
            setError('Ukuran surat kesediaan maksimal 4MB.');
            return;
        }

        setFile(selected);
    };

    const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setError('Format bukti pembayaran harus berupa PDF, JPG, atau PNG.');
            return;
        }

        if (selected.size > 4 * 1024 * 1024) {
            setError('Ukuran bukti pembayaran maksimal 4MB.');
            return;
        }

        setPaymentProofFile(selected);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shirtSize) {
            setError(`Silakan pilih ukuran kaos / baju ${isBinaan ? 'santri' : 'peserta'} terlebih dahulu.`);
            return;
        }

        const hasLetter = Boolean(participant.national?.availability_letter_path);
        if (!file && !hasLetter) {
            setError('Silakan pilih file Surat Kesediaan Hadir terlebih dahulu.');
            return;
        }

        const hasPaymentProof = Boolean(participant.national?.payment_proof_path);
        if (!isBinaan && !paymentProofFile && !hasPaymentProof) {
            setError('Silakan unggah Bukti Transfer / Pembayaran Babak Nasional untuk peserta umum.');
            return;
        }

        setProcessing(true);
        setError(null);

        const payload: Record<string, any> = {
            shirt_size: shirtSize,
        };

        if (file) {
            payload.availability_letter = file;
        }
        if (paymentProofFile) {
            payload.national_payment_proof = paymentProofFile;
        }

        router.post(
            participants.nationalReRegisterBinaan(participant.id).url,
            payload,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setFile(null);
                    setPaymentProofFile(null);
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (errs) => {
                    setProcessing(false);
                    const msg =
                        errs.national_payment_proof ||
                        errs.availability_letter ||
                        errs.shirt_size ||
                        Object.values(errs)[0] ||
                        'Terjadi kesalahan saat menyimpan pendaftaran ulang.';
                    setError(String(msg));
                },
            },
        );
    };

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declineReason.trim()) {
            setError(`Silakan isi penjelasan / alasan pengunduran diri ${isBinaan ? 'santri binaan' : 'peserta umum'}.`);
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

    const hasLetter = Boolean(participant.national?.availability_letter_path);
    const hasPaymentProof = Boolean(participant.national?.payment_proof_path);

    const isSubmitDisabled =
        processing ||
        !shirtSize ||
        (!file && !hasLetter) ||
        (!isBinaan && !paymentProofFile && !hasPaymentProof);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
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
                                    ? isBinaan
                                        ? 'Daftar Ulang Santri Binaan'
                                        : 'Bantu Daftar Ulang Peserta Umum'
                                    : isBinaan
                                      ? 'Konfirmasi Pengunduran Diri Santri'
                                      : 'Konfirmasi Pengunduran Diri Peserta'}
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

                {/* Ringkasan Data Peserta */}
                <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-muted-foreground">{isBinaan ? 'Nama Santri:' : 'Nama Peserta:'}</span>
                            <p className="font-bold">{studentName}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">No. Registrasi:</span>
                            <p className="font-mono font-semibold">
                                {participant.registration_number}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Kategori Jalur:</span>
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                {isBinaan ? 'Santri Binaan Yatim Mandiri' : 'Peserta Umum'}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Cabang / Wilayah:</span>
                            <p className="font-medium">{participant.branch || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Cabang Lomba:</span>
                            <p className="font-medium">{participant.olimpiade?.name || '-'}</p>
                        </div>
                    </div>
                </div>

                {actionType === 'register' ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        {isBinaan ? (
                            <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                ✨ Santri Binaan <strong>100% Gratis</strong> tanpa biaya pendaftaran ulang. Kantor Cabang cukup mengunggah Surat Kesediaan Hadir.
                            </div>
                        ) : (
                            <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2.5 text-[11px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200">
                                ✨ Bantuan Kantor Cabang untuk <strong>Peserta Umum</strong>: Unggah Surat Kesediaan Hadir dan Bukti Transfer biaya Babak Nasional agar panitia pusat / verifikator keuangan dapat memproses verifikasi.
                            </div>
                        )}

                        {/* Download Link Template Surat Kesediaan */}
                        <div className="flex items-center justify-between rounded-xl border border-amber-300/80 bg-amber-50/80 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/40">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-amber-900 dark:text-amber-200">
                                    Format Surat Kesediaan Resmi
                                </p>
                                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                                    Unduh formulir untuk ditandatangani orang tua / wali
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

                        {/* Ukuran Kaos / Baju */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="shirt_size"
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                            >
                                <Shirt className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Ukuran Kaos / Baju {isBinaan ? 'Santri' : 'Peserta'} <span className="text-destructive">*</span>
                            </Label>
                            <Select value={shirtSize} onValueChange={setShirtSize}>
                                <SelectTrigger id="shirt_size" className="h-9 w-full text-xs">
                                    <SelectValue placeholder={`Pilih ukuran baju ${isBinaan ? 'santri' : 'peserta'}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHIRT_SIZES.map((size) => (
                                        <SelectItem key={size.value} value={size.value} className="text-xs">
                                            {size.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Ukuran ini akan digunakan panitia pusat untuk seragam kontingen finalis Babak Nasional.
                            </p>
                        </div>

                        {/* Upload Surat Kesediaan */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="availability_letter"
                                className="text-xs font-semibold"
                            >
                                Unggah Surat Kesediaan Hadir (Bertanda Tangan){' '}
                                {!hasLetter && <span className="text-destructive">*</span>}
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
                                            Pilih atau seret surat kesediaan ke sini
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Format PDF, JPG, atau PNG (Maks. 4MB)
                                        </p>
                                        {hasLetter && (
                                            <p className="mt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                                ✓ Surat kesediaan sudah pernah diunggah (opsional jika tidak diganti)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Bukti Pembayaran (Peserta Umum Saja) */}
                        {!isBinaan && (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="national_payment_proof"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <CreditCard className="size-3.5 text-amber-600 dark:text-amber-400" />
                                    Unggah Bukti Transfer / Pembayaran Babak Nasional{' '}
                                    {!hasPaymentProof && <span className="text-destructive">*</span>}
                                </Label>
                                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-50/30 p-4 transition-colors hover:bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
                                    <input
                                        id="national_payment_proof"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handlePaymentProofChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        disabled={processing}
                                    />
                                    {paymentProofFile ? (
                                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                                            <FileCheck2 className="size-6 text-amber-600" />
                                            <div className="text-left">
                                                <p className="max-w-[260px] truncate text-xs font-semibold">
                                                    {paymentProofFile.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {(paymentProofFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="mx-auto size-7 text-amber-600 dark:text-amber-400" />
                                            <p className="mt-1 text-xs font-medium text-amber-900 dark:text-amber-200">
                                                Pilih atau seret bukti transfer ke sini
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Format PDF, JPG, atau PNG (Maks. 4MB)
                                            </p>
                                            {hasPaymentProof && (
                                                <p className="mt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                                    ✓ Bukti transfer sudah pernah diunggah (opsional jika tidak diganti)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                disabled={isSubmitDisabled}
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
                                        {isBinaan
                                            ? 'Simpan & Konfirmasi Daftar Ulang'
                                            : 'Simpan Pendaftaran Ulang Umum'}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <form onSubmit={handleDeclineSubmit} className="space-y-4">
                        <div className="rounded-lg border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                            <p className="font-semibold text-rose-950 dark:text-rose-100">
                                Pernyataan Pengunduran Diri {isBinaan ? 'Santri Binaan' : 'Peserta Umum'}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                                Pilih kategori dan cantumkan alasan mengapa {isBinaan ? 'santri binaan' : 'peserta umum'} berhalangan hadir ke Babak Final Nasional OMATIQ 2026. Laporan ini akan tersimpan dan langsung diteruskan kepada Panitia Pusat.
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
                                placeholder="Contoh: Peserta sedang menjalani masa pemulihan medis / Jadwal ujian sekolah bentrok dan orang tua tidak mengizinkan bepergian jauh..."
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
