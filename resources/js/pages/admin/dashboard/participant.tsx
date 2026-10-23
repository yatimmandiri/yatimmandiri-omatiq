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
import { document as studentDocument, paymentProof } from '@/routes/student';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ExternalLink, Eye, FileText, Loader2, Printer, Upload } from 'lucide-react';
import { useState } from 'react';

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
    const { participant } = usePage<{ participant: Record<string, any> }>()
        .props;
    const [openProof, setOpenProof] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [openDocumentModal, setOpenDocumentModal] = useState(false);

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

