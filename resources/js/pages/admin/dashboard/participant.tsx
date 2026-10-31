import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProofModal } from '@/components/ui/proof-modal';
import { dashboard } from '@/routes/admin';
import { document as studentDocument, nationalReRegistration, paymentProof } from '@/routes/student';
import { confirmAction } from '@/utils/sweetalert';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Download, ExternalLink, Eye, FileText, Loader2, Printer, Trophy, Upload, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';

const NATIONAL_DECLINE_CATEGORIES = [
    { value: 'Sakit / Kondisi Medis', label: 'Sakit / Kondisi Medis' },
    { value: 'Jadwal Sekolah / Ujian Bentrok', label: 'Jadwal Sekolah / Ujian Bentrok' },
    { value: 'Kendala Jarak / Transportasi / Perjalanan', label: 'Kendala Jarak / Transportasi / Perjalanan' },
    { value: 'Urgensi / Musibah Keluarga', label: 'Urgensi / Musibah Keluarga' },
    { value: 'Kendala Finansial / Biaya Perjalanan', label: 'Kendala Finansial / Biaya Perjalanan' },
    { value: 'Lainnya', label: 'Alasan Lainnya' },
];

const labels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

const statusVariant = (status: string) =>
    status === 'verified'
        ? 'default'
        : status === 'rejected'
          ? 'destructive'
          : 'secondary';

export default function Dashboard() {
    const { participant, settings } = usePage<{
        participant: Record<string, any>;
        settings?: Record<string, any>;
    }>().props;
    const [openProof, setOpenProof] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [openDocumentModal, setOpenDocumentModal] = useState(false);
    const [openNationalModal, setOpenNationalModal] = useState(false);
    const [openDeclineModal, setOpenDeclineModal] = useState(false);
    const [declineCategory, setDeclineCategory] = useState('Sakit / Kondisi Medis');
    const [declineReason, setDeclineReason] = useState('');
    const [declineProcessing, setDeclineProcessing] = useState(false);
    const [declineError, setDeclineError] = useState<string | null>(null);

    const isBinaan = Boolean(participant?.student?.is_binaan);
    const isNationalOpen = settings?.registration_national_open ?? true;

    // Kunci unggah ulang jika status sudah terverifikasi atau pembayaran sudah lunas
    const isPaymentLocked =
        participant?.payment_status === 'paid' ||
        participant?.status === 'verified';
    const isDocumentLocked = participant?.status === 'verified';

    const uploadForm = useForm<{ payment_proof: File | null }>({
        payment_proof: null,
    });

    const documentForm = useForm<{ student_card: File | null }>({
        student_card: null,
    });

    const nationalForm = useForm<{
        availability_letter: File | null;
        national_payment_proof: File | null;
    }>({
        availability_letter: null,
        national_payment_proof: null,
    });

    const handleNationalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nationalForm.data.availability_letter) return;
        if (!isBinaan && !nationalForm.data.national_payment_proof) return;

        nationalForm.post(nationalReRegistration.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpenNationalModal(false);
                nationalForm.reset();
            },
        });
    };

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declineReason.trim()) {
            setDeclineError('Silakan isi alasan pengunduran diri Anda.');
            return;
        }

        if (declineReason.trim().length < 5) {
            setDeclineError('Alasan pengunduran diri minimal 5 karakter.');
            return;
        }

        setDeclineProcessing(true);
        setDeclineError(null);

        router.post(
            '/student/national-decline',
            {
                decline_category: declineCategory,
                decline_reason: declineReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeclineProcessing(false);
                    setOpenDeclineModal(false);
                    setDeclineReason('');
                },
                onError: (errs) => {
                    setDeclineProcessing(false);
                    const msg =
                        errs.decline_reason ||
                        errs.decline_category ||
                        Object.values(errs)[0] ||
                        'Terjadi kesalahan saat mencatat pengunduran diri.';
                    setDeclineError(String(msg));
                },
            },
        );
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.data.payment_proof || isPaymentLocked) return;

        uploadForm.post(paymentProof.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpenUploadModal(false);
                uploadForm.reset();
            },
        });
    };

    const handleDocumentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentForm.data.student_card || isDocumentLocked) return;

        documentForm.post(studentDocument.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpenDocumentModal(false);
                documentForm.reset();
            },
        });
    };

    if (!participant) {
        return (
            <>
                <Head title="Dashboard Partisipan" />
                <div className="flex h-full flex-1 items-center justify-center p-4">
                    <Card className="max-w-md p-8 text-center">
                        <h2 className="mb-2 text-xl font-bold">
                            Belum Terdaftar
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Akun Anda belum terhubung dengan data peserta.
                            Silakan hubungi admin.
                        </p>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard Partisipan" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Saya</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {participant.registration_number} —{' '}
                                {participant.student?.full_name ??
                                    participant.user?.name}
                            </p>
                            <Badge
                                variant={
                                    statusVariant(participant.status) as any
                                }
                            >
                                {labels[participant.status] ??
                                    participant.status}
                            </Badge>
                        </div>
                    </div>
                    {participant.status !== 'rejected' && (
                        <div>
                            <Button
                                asChild
                                className="gap-2 bg-[#17524A] font-bold text-white hover:bg-[#17524A]/90"
                            >
                                <a
                                    href={`/pendaftaran/kartu/${participant.registration_number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="size-4" />
                                    {participant.status === 'verified'
                                        ? 'Cetak Kartu Peserta'
                                        : 'Cetak Bukti Pendaftaran'}
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

                {participant.status === 'rejected' && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">
                                        Status Pendaftaran / Pembayaran: Ditolak
                                    </p>
                                    <p className="text-xs leading-relaxed text-destructive/90">
                                        {participant.notes ||
                                            'Bukti transfer atau berkas yang diunggah belum sesuai. Silakan unggah bukti transfer atau dokumen terbaru yang valid agar dapat diverifikasi ulang oleh tim panitia/keuangan.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                {!isPaymentLocked && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="shrink-0 gap-1.5"
                                        onClick={() => setOpenUploadModal(true)}
                                    >
                                        <Upload className="size-4" />
                                        Unggah Bukti Baru
                                    </Button>
                                )}
                                {!isDocumentLocked && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                                        onClick={() => setOpenDocumentModal(true)}
                                    >
                                        <FileText className="size-4" />
                                        Perbarui Dokumen
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {participant.national && (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/20 p-5 shadow-sm md:p-6 dark:border-amber-500/60 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-amber-900/30">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm dark:bg-amber-600">
                                        <Trophy className="size-3.5" />
                                        BABAK NASIONAL OMATIQ 2026
                                    </span>
                                    {participant.national.status === 'verified' ? (
                                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                                            Terverifikasi Finalis Resmi
                                        </Badge>
                                    ) : participant.national.status === 'waiting_confirmation' ? (
                                        <Badge variant="outline" className="border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            Menunggu Verifikasi Pusat
                                        </Badge>
                                    ) : participant.national.status === 'declined' ? (
                                        <Badge variant="outline" className="border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                                            Mengundurkan Diri
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-amber-500 text-amber-800 dark:text-amber-300">
                                            Belum Daftar Ulang
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-xl font-extrabold tracking-tight text-amber-950 dark:text-amber-100 sm:text-2xl">
                                    {participant.national.status === 'declined'
                                        ? 'Pernyataan Pengunduran Diri Babak Nasional'
                                        : 'Selamat! Anda Lolos ke Babak Nasional OMATIQ 2026!'}
                                </h2>
                                <p className="max-w-2xl text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/80 sm:text-sm">
                                    {participant.national.status === 'verified'
                                        ? 'Pendaftaran ulang babak nasional Anda telah terverifikasi resmi oleh panitia pusat. Silakan unduh dan cetak Kartu Finalis Nasional untuk dibawa saat acara.'
                                        : participant.national.status === 'waiting_confirmation'
                                          ? 'Berkas pendaftaran ulang Babak Nasional Anda telah terkirim dan sedang dalam tahap verifikasi panitia pusat. Mohon pantau status secara berkala.'
                                          : participant.national.status === 'declined'
                                            ? `Anda telah menyatakan mengundurkan diri dari Babak Final Nasional OMATIQ 2026 (${participant.national.decline_category || 'Alasan khusus'}: "${participant.national.decline_reason || participant.national.notes || '-'}"). Terima kasih atas perjuangan dan partisipasi luar biasa Anda hingga babak semifinal/regional!`
                                            : isBinaan
                                              ? 'Selamat! Anda terpilih sebagai delegasi santri binaan yang melaju ke Babak Final OMATIQ Nasional 2026. Pendaftaran ulang dan administrasi kehadiran dikoordinasikan langsung oleh Kantor Cabang Anda.'
                                              : 'Anda terpilih sebagai salah satu peserta terbaik yang melaju ke babak final nasional. Silakan lakukan pendaftaran ulang sekarang.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                                {participant.national.status === 'verified' ? (
                                    <Button
                                        asChild
                                        className="gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 font-bold text-white shadow hover:from-amber-700 hover:to-yellow-700"
                                    >
                                        <a
                                            href={`/pendaftaran/kartu/${participant.registration_number}?stage=national`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Printer className="size-4" />
                                            Cetak Kartu Nasional
                                        </a>
                                    </Button>
                                ) : participant.national.status === 'declined' ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50/80 px-3.5 py-2 text-xs font-semibold text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                                        <UserX className="size-4 text-rose-600" />
                                        <span>Status: Mengundurkan Diri</span>
                                    </div>
                                ) : isBinaan ? (
                                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        ✨ Pendaftaran Ulang Dikelola Kantor Cabang
                                    </div>
                                ) : isNationalOpen ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            onClick={() => setOpenNationalModal(true)}
                                            className="gap-2 bg-[#17524A] font-bold text-white shadow hover:bg-[#17524A]/90"
                                        >
                                            <Upload className="size-4" />
                                            {participant.national.status === 'waiting_confirmation'
                                                ? 'Perbarui Berkas Nasional'
                                                : 'Daftar Ulang Nasional'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setDeclineError(null);
                                                setOpenDeclineModal(true);
                                            }}
                                            className="gap-1.5 border-rose-300 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50"
                                        >
                                            <UserX className="size-3.5 text-rose-600" />
                                            Tidak Dapat Hadir
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                        Pendaftaran ulang: 7 - 11 November 2026
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* File preview jika sudah diunggah */}
                        {(participant.national.availability_letter_url || participant.national.payment_proof_url) && (
                            <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-amber-300/60 pt-3 dark:border-amber-700/50">
                                {participant.national.availability_letter_url && (
                                    <FileLink
                                        label="Surat Kesediaan Hadir"
                                        href={participant.national.availability_letter_url}
                                    />
                                )}
                                {participant.national.payment_proof_url && (
                                    <FileLink
                                        label="Bukti Transfer Biaya Nasional"
                                        href={participant.national.payment_proof_url}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-bold">Biodata</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail
                                label="Nama Lengkap"
                                value={participant.student?.full_name}
                            />
                            <Detail
                                label="NIK"
                                value={participant.student?.nik}
                            />
                            <Detail
                                label="Nama Panggilan"
                                value={participant.student?.nickname}
                            />
                            <Detail
                                label="Jenis Kelamin"
                                value={labels[participant.student?.gender]}
                            />
                            <Detail
                                label="Tempat, Tanggal Lahir"
                                value={`${participant.student?.birth_place ?? ''}, ${participant.student?.birth_date?.slice(0, 10) ?? ''}`}
                            />
                            <Detail
                                label="Sekolah"
                                value={participant.student?.school_name}
                            />
                            <Detail
                                label="Jenjang"
                                value={participant.student?.school_level}
                            />
                            <Detail
                                label="NIS"
                                value={participant.student?.nis}
                            />
                            <Detail
                                label="Kelas"
                                value={participant.student?.grade}
                            />
                            <Detail
                                label="Provinsi"
                                value={participant.student?.province?.name}
                            />
                            <Detail
                                label="Kota/Kabupaten"
                                value={participant.student?.regency?.name}
                            />
                            <Detail
                                label="HP Orang Tua/Wali"
                                value={participant.student?.parent_phone}
                            />
                        </div>
                        <Detail
                            label="Alamat"
                            value={participant.student?.address}
                        />
                    </Card>

                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-bold">
                            Olimpiade & Pendamping
                        </h2>
                        <Detail
                            label="Cabang Olimpiade"
                            value={participant.olimpiade?.name}
                        />
                        <Detail
                            label="Kategori"
                            value={participant.olimpiade?.category}
                        />
                        <Detail
                            label="Guru / Pendamping"
                            value={participant.student?.mentor_name}
                        />
                        <Detail
                            label="HP Pendamping"
                            value={participant.student?.mentor_phone}
                        />
                        <Detail
                            label="Referensi"
                            value={participant.referral_source}
                        />
                        <Detail label="Cabang" value={participant.branch} />
                    </Card>
                </div>

                <Card className="space-y-5 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-bold">Dokumen</h2>
                        {!isDocumentLocked && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-[#17524A] text-[#17524A] hover:bg-[#17524A]/10"
                                onClick={() => setOpenDocumentModal(true)}
                            >
                                <Upload className="size-4" />
                                {participant.student?.student_card_url
                                    ? 'Unggah Ulang Dokumen'
                                    : 'Unggah Dokumen'}
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FileLink
                            label="Kartu Pelajar / Dokumen Identitas"
                            href={participant.student?.student_card_url}
                        />
                    </div>
                </Card>

                <Card className="space-y-5 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-bold">Pembayaran</h2>
                        {!isPaymentLocked && (
                            <Button
                                size="sm"
                                className="gap-2 bg-[#17524A] font-semibold text-white hover:bg-[#17524A]/90"
                                onClick={() => setOpenUploadModal(true)}
                            >
                                <Upload className="size-4" />
                                {participant.payment_proof_url
                                    ? 'Unggah Ulang Bukti Transfer'
                                    : 'Unggah Bukti Transfer'}
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Detail
                            label="Status Pembayaran"
                            value={
                                participant.payment_status === 'paid'
                                    ? 'Lunas'
                                    : participant.payment_status ===
                                        'waiting_confirmation'
                                      ? 'Menunggu Konfirmasi'
                                      : participant.payment_status ===
                                          'unpaid'
                                        ? 'Belum Bayar'
                                        : (participant.payment_status ??
                                          'Belum Bayar')
                            }
                        />
                        <Detail
                            label="Jumlah"
                            value={
                                participant.payment_amount
                                    ? `Rp ${Number(participant.payment_amount).toLocaleString('id-ID')}`
                                    : null
                            }
                        />
                        {participant.payment_proof_url ? (
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Bukti Bayar
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOpenProof(true)}
                                    >
                                        <Eye className="mr-1.5 size-4" />
                                        Lihat Bukti
                                    </Button>
                                    <ProofModal
                                        href={participant.payment_proof_url}
                                        open={openProof}
                                        onOpenChange={setOpenProof}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Bukti Bayar
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Belum ada bukti bayar
                                </p>
                            </div>
                        )}
                    </div>

                    {participant.payment_note && (
                        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                Catatan Pembayaran:{' '}
                            </span>
                            {participant.payment_note}
                        </div>
                    )}
                </Card>

                <Dialog
                    open={openUploadModal}
                    onOpenChange={setOpenUploadModal}
                >
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleUploadSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {participant.payment_proof_url
                                        ? 'Unggah Ulang Bukti Transfer'
                                        : 'Unggah Bukti Transfer'}
                                </DialogTitle>
                                <DialogDescription>
                                    Unggah foto atau dokumen bukti transfer
                                    pembayaran pendaftaran OMATIQ. Format yang
                                    didukung: JPG, PNG, atau PDF (maksimal 4MB).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_proof">
                                        File Bukti Transfer
                                    </Label>
                                    <Input
                                        id="payment_proof"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        onChange={(e) =>
                                            uploadForm.setData(
                                                'payment_proof',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                        required
                                    />
                                    {uploadForm.errors.payment_proof && (
                                        <p className="text-xs font-medium text-destructive">
                                            {uploadForm.errors.payment_proof}
                                        </p>
                                    )}
                                </div>

                                {participant.status === 'rejected' && (
                                    <p className="rounded-md bg-muted p-2.5 text-xs text-muted-foreground">
                                        Setelah bukti transfer baru diunggah,
                                        status pendaftaran Anda akan otomatis
                                        kembali menjadi{' '}
                                        <strong>Menunggu Verifikasi</strong>{' '}
                                        oleh panitia/keuangan.
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenUploadModal(false)}
                                    disabled={uploadForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#17524A] text-white hover:bg-[#17524A]/90"
                                    disabled={
                                        uploadForm.processing ||
                                        !uploadForm.data.payment_proof ||
                                        isPaymentLocked
                                    }
                                >
                                    {uploadForm.processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Simpan & Unggah
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={openDocumentModal}
                    onOpenChange={setOpenDocumentModal}
                >
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleDocumentSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {participant.student?.student_card_url
                                        ? 'Unggah Ulang Kartu Pelajar / Dokumen'
                                        : 'Unggah Kartu Pelajar / Dokumen'}
                                </DialogTitle>
                                <DialogDescription>
                                    Unggah foto atau scan Kartu Pelajar, KIA, Kartu Keluarga, atau surat keterangan sekolah. Format: JPG, PNG, atau PDF (maksimal 4MB).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="student_card">
                                        File Kartu Pelajar / Dokumen Identitas
                                    </Label>
                                    <Input
                                        id="student_card"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        onChange={(e) =>
                                            documentForm.setData(
                                                'student_card',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                        required
                                    />
                                    {documentForm.errors.student_card && (
                                        <p className="text-xs font-medium text-destructive">
                                            {documentForm.errors.student_card}
                                        </p>
                                    )}
                                </div>

                                {participant.status === 'rejected' && (
                                    <p className="rounded-md bg-muted p-2.5 text-xs text-muted-foreground">
                                        Setelah dokumen baru diunggah, status
                                        pendaftaran Anda akan otomatis kembali
                                        menjadi{' '}
                                        <strong>Menunggu Verifikasi</strong>{' '}
                                        oleh panitia.
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenDocumentModal(false)}
                                    disabled={documentForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#17524A] text-white hover:bg-[#17524A]/90"
                                    disabled={
                                        documentForm.processing ||
                                        !documentForm.data.student_card ||
                                        isDocumentLocked
                                    }
                                >
                                    {documentForm.processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Simpan & Unggah
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Daftar Ulang Babak Nasional */}
                <Dialog
                    open={openNationalModal}
                    onOpenChange={setOpenNationalModal}
                >
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleNationalSubmit}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Trophy className="size-5 text-amber-500" />
                                    Daftar Ulang Babak Nasional 2026
                                </DialogTitle>
                                <DialogDescription>
                                    Lengkapi berkas konfirmasi kehadiran babak final OMATIQ Nasional 2026.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Download Template Surat Kesediaan */}
                                <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3.5 dark:border-amber-700/60 dark:bg-amber-950/30">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-950 dark:text-amber-100">
                                                Template Resmi Surat Kesediaan Hadir
                                            </p>
                                            <p className="text-xs text-amber-800 dark:text-amber-300/90">
                                                Unduh, cetak, isi, tanda tangani, lalu unggah kembali scan/fotonya di bawah ini.
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="shrink-0 gap-1.5 border-amber-400 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:bg-amber-900/60 dark:text-amber-100"
                                        >
                                            <a
                                                href="https://link.yatimmandiri.org/SuratKesediaanOMATIQ"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Download className="size-3.5" />
                                                Unduh Format
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Upload Surat Kesediaan */}
                                <div className="space-y-2">
                                    <Label htmlFor="availability_letter" className="font-semibold">
                                        Upload Surat Kesediaan Hadir <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="availability_letter"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        onChange={(e) =>
                                            nationalForm.setData(
                                                'availability_letter',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                        required
                                    />
                                    {nationalForm.errors.availability_letter && (
                                        <p className="text-xs font-medium text-destructive">
                                            {nationalForm.errors.availability_letter}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Format: PDF, JPG, atau PNG (maksimal 4MB).
                                    </p>
                                </div>

                                {/* Bagian Biaya / Bukti Transfer */}
                                {isBinaan ? (
                                    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <span>
                                            Peserta <strong>Santri Binaan</strong> mendapatkan fasilitas pendaftaran babak nasional secara <strong>GRATIS (100% didukung Yatim Mandiri)</strong>.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3.5">
                                        <div className="space-y-1">
                                            <Label htmlFor="national_payment_proof" className="font-semibold">
                                                Bukti Transfer Biaya Babak Nasional <span className="text-destructive">*</span>
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Khusus peserta umum, biaya registrasi babak nasional ditransfer ke rekening resmi panitia Yatim Mandiri.
                                            </p>
                                        </div>
                                        <Input
                                            id="national_payment_proof"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            onChange={(e) =>
                                                nationalForm.setData(
                                                    'national_payment_proof',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                            required={!isBinaan}
                                        />
                                        {nationalForm.errors.national_payment_proof && (
                                            <p className="text-xs font-medium text-destructive">
                                                {nationalForm.errors.national_payment_proof}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Format: PDF, JPG, atau PNG (maksimal 4MB).
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenNationalModal(false)}
                                    disabled={nationalForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#17524A] text-white hover:bg-[#17524A]/90"
                                    disabled={
                                        nationalForm.processing ||
                                        !nationalForm.data.availability_letter ||
                                        (!isBinaan && !nationalForm.data.national_payment_proof)
                                    }
                                >
                                    {nationalForm.processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Kirim Berkas Daftar Ulang
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Konfirmasi Pengunduran Diri Babak Nasional */}
                <Dialog open={openDeclineModal} onOpenChange={setOpenDeclineModal}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950">
                                    <UserX className="size-5 text-rose-700 dark:text-rose-300" />
                                </span>
                                <div>
                                    <DialogTitle className="text-lg font-bold">
                                        Konfirmasi Pengunduran Diri
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Babak Final Nasional OMATIQ 2026
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleDeclineSubmit} className="space-y-4 pt-2">
                            <div className="rounded-lg border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                                <p className="font-semibold text-rose-950 dark:text-rose-100">
                                    Pernyataan Berhalangan Hadir
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                                    Selamat atas pencapaian ananda yang berhasil lolos hingga tahap ini. Jika ananda berhalangan hadir ke babak final nasional, mohon sampaikan alasan agar kuota finalis dapat dialihkan oleh panitia pusat kepada peserta peringkat berikutnya.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="student_decline_category" className="text-xs font-semibold">
                                    Kategori Alasan <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="student_decline_category"
                                    value={declineCategory}
                                    onChange={(e) => setDeclineCategory(e.target.value)}
                                    disabled={declineProcessing}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {NATIONAL_DECLINE_CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="student_decline_reason" className="text-xs font-semibold">
                                    Alasan / Keterangan Penjelasan <span className="text-destructive">*</span>
                                </Label>
                                <textarea
                                    id="student_decline_reason"
                                    rows={3}
                                    placeholder="Jelaskan alasan ananda berhalangan hadir (misal: jadwal ujian sekolah bentrok / kondisi kesehatan / kendala bepergian luar kota)..."
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    disabled={declineProcessing}
                                    className="w-full rounded-lg border border-input bg-background p-2.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Minimal 5 karakter.
                                </p>
                            </div>

                            {declineError && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{declineError}</span>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenDeclineModal(false)}
                                    disabled={declineProcessing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={declineProcessing || !declineReason.trim()}
                                    className="gap-2"
                                >
                                    {declineProcessing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Mengirim...
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
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}


Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

const Detail = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">
            {value ?? '-'}
        </p>
    </div>
);

const FileLink = ({ label, href }: { label: string; href?: string | null }) => {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            {href ? (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 gap-1.5"
                        onClick={() => setOpen(true)}
                    >
                        <Eye className="size-4" />
                        Lihat {label}
                    </Button>
                    <ProofModal
                        href={href}
                        open={open}
                        onOpenChange={setOpen}
                        title={label}
                    />
                </>
            ) : (
                <p className="mt-1 text-sm text-muted-foreground">-</p>
            )}
        </div>
    );
};

