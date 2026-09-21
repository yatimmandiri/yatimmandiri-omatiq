import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ProofModal } from '@/components/ui/proof-modal';
import { dashboard } from '@/routes/teacher';
import dataPeserta from '@/routes/teacher/data-peserta';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    Building2,
    CheckCircle2,
    Clock3,
    ExternalLink,
    GraduationCap,
    MapPin,
    Phone,
    Printer,
    School,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const labels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    submitted: 'Menunggu Verifikasi',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
};

export default function ShowPage() {
    const { participant } = usePage<{ participant: Record<string, any> }>()
        .props;
    const isBinaan =
        !!participant.student?.is_binaan ||
        !!participant.student?.penyaluran_id;
    const [openProof, setOpenProof] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(dataPeserta.destroy(participant.id).url, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const fullName = participant.student?.full_name ?? participant.nik ?? '-';
    const initial = String(fullName).charAt(0).toUpperCase();
    const status = participant.status;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0 rounded-xl"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                            Detail Peserta
                        </h1>
                        <p className="font-mono text-sm text-muted-foreground">
                            {participant.registration_number} • {fullName}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {participant.status !== 'rejected' && (
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-[#17524A] text-[#17524A] hover:bg-[#17524A]/10"
                        >
                            <a
                                href={`/teacher/data-peserta/${participant.id}/card`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="size-4" />
                                {participant.status === 'verified'
                                    ? 'Cetak Kartu'
                                    : 'Cetak Bukti'}
                            </a>
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={() => setOpenDelete(true)}
                        className="gap-2"
                    >
                        <Trash2 className="size-4" />
                        Batalkan Pendaftaran
                    </Button>
                </div>
            </div>

            {/* Hero */}
            <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] via-[#1e6a5e] to-[#2a8a7d] p-6 text-white shadow-sm lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur lg:size-20">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold lg:text-2xl">{fullName}</h2>
                            <p className="mt-1 text-sm text-white/80">
                                {participant.student?.nik ?? participant.nik} •{' '}
                                {labels[participant.student?.gender ?? ''] ?? participant.student?.gender ?? '-'}
                            </p>
                            <p className="mt-1 text-xs text-white/70">
                                {participant.olimpiade?.name ?? '-'} • Event {participant.event_year}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-end">
                        {status === 'verified' ? (
                            <Badge className="gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="size-3.5" /> Terverifikasi
                            </Badge>
                        ) : status === 'rejected' ? (
                            <Badge variant="destructive" className="gap-1.5 rounded-full px-3 py-1.5">
                                <XCircle className="size-3.5" /> Ditolak
                            </Badge>
                        ) : (
                            <Badge className="gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900">
                                <Clock3 className="size-3.5" /> Menunggu
                            </Badge>
                        )}
                        <span className="rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold tracking-wide backdrop-blur">
                            {participant.registration_number}
                        </span>
                    </div>
                </div>
            </div>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Pendaftaran Peserta</DialogTitle>
                        <DialogDescription className="space-y-2 pt-2">
                            <p>
                                Apakah Anda yakin ingin membatalkan pendaftaran
                                untuk{' '}
                                <strong>
                                    {participant.student?.full_name ??
                                        participant.nik}
                                </strong>{' '}
                                ({participant.registration_number})?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Data binaan tidak akan terhapus dan dapat
                                didaftarkan kembali ke olimpiade jika
                                pendaftaran masih dibuka.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDelete(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? 'Membatalkan...'
                                : 'Batalkan Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                <User className="size-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base">Data Peserta</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Biodata santri terdaftar
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail
                                label="NIK"
                                value={participant.student?.nik ?? participant.nik}
                                mono
                            />
                            <Detail
                                label="Nama Lengkap"
                                value={participant.student?.full_name}
                                highlight
                            />
                            {!isBinaan && (
                                <Detail
                                    label="Nama Panggilan"
                                    value={participant.student?.nickname}
                                />
                            )}
                            <Detail
                                label="Jenis Kelamin"
                                value={labels[participant.student?.gender ?? ''] ?? participant.student?.gender}
                            />
                            {isBinaan ? (
                                <>
                                    <Detail
                                        label="NIS"
                                        value={participant.student?.nis}
                                    />
                                    <Detail
                                        label="Tanggal Lahir"
                                        value={
                                            participant.student?.birth_date?.slice(
                                                0,
                                                10,
                                            ) ?? '-'
                                        }
                                    />
                                    <Detail
                                        label="Jenjang"
                                        value={participant.student?.school_level}
                                    />
                                </>
                            ) : (
                                <Detail
                                    label="Tempat, Tanggal Lahir"
                                    value={`${participant.student?.birth_place ?? '-'} • ${participant.student?.birth_date?.slice(0, 10) ?? '-'}`}
                                />
                            )}
                            <Detail
                                icon={<School className="size-3.5" />}
                                label="Sekolah"
                                value={participant.student?.school_name}
                            />
                            <Detail
                                label="Kelas"
                                value={participant.student?.grade}
                            />
                            {!isBinaan && (
                                <>
                                    <Detail
                                        icon={<MapPin className="size-3.5" />}
                                        label="Provinsi"
                                        value={participant.student?.province?.name}
                                    />
                                    <Detail
                                        label="Kota/Kabupaten"
                                        value={participant.student?.regency?.name}
                                    />
                                    <Detail
                                        icon={<Phone className="size-3.5" />}
                                        label="HP Orang Tua/Wali"
                                        value={participant.student?.parent_phone}
                                    />
                                </>
                            )}
                            {isBinaan && participant.penyaluran_sanggar_name && (
                                <Detail
                                    icon={<Building2 className="size-3.5" />}
                                    label="Sanggar"
                                    value={participant.penyaluran_sanggar_name}
                                />
                            )}
                            <Detail
                                label="Status"
                                value={
                                    <Badge
                                        className={
                                            status === 'verified'
                                                ? 'bg-emerald-600 text-white'
                                                : status === 'rejected'
                                                  ? 'bg-destructive text-white'
                                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                        }
                                    >
                                        {labels[status] ?? status}
                                    </Badge>
                                }
                            />
                        </div>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Detail
                                label="ID Penyaluran"
                                value={participant.student?.penyaluran_id ?? '-'}
                                mono
                            />
                            {!isBinaan && (
                                <Detail
                                    icon={<MapPin className="size-3.5" />}
                                    label="Alamat"
                                    value={participant.student?.address}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="size-4 text-[#17524A]" />
                                <CardTitle className="text-base">Kategori & Dokumen</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Detail
                                icon={<GraduationCap className="size-3.5" />}
                                label="Olimpiade"
                                value={participant.olimpiade?.name}
                                highlight
                            />
                            <Detail
                                label="Guru / Pendamping"
                                value={participant.student?.mentor_name}
                            />
                            <Detail
                                icon={<Phone className="size-3.5" />}
                                label="HP Pendamping"
                                value={participant.student?.mentor_phone}
                            />
                            {(participant.branch || participant.kantor_name) && (
                                <Detail
                                    icon={<Building2 className="size-3.5" />}
                                    label="Kantor Cabang"
                                    value={participant.branch ?? participant.kantor_name}
                                />
                            )}
                            {participant.payment_proof_url && (
                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Bukti Pembayaran
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full justify-center gap-2"
                                        onClick={() => setOpenProof(true)}
                                    >
                                        Lihat Bukti <ExternalLink className="size-4" />
                                    </Button>
                                    <ProofModal
                                        href={participant.payment_proof_url}
                                        open={openProof}
                                        onOpenChange={setOpenProof}
                                    />
                                </div>
                            )}
                            <DetailFile
                                label="Kartu Pelajar"
                                url={participant.student?.student_card_url}
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl bg-muted/30 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">Prestasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {participant.achievements || (
                                    <span className="text-muted-foreground">Tidak ada catatan prestasi.</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Data Peserta',
            href: dataPeserta.index().url,
        },
        {
            title: 'Detail Peserta',
            href: '#',
        },
    ],
};

const Detail = ({
    label,
    value,
    icon,
    highlight = false,
    mono = false,
}: {
    label: string;
    value?: any;
    icon?: React.ReactNode;
    highlight?: boolean;
    mono?: boolean;
}) => (
    <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </p>
        <div
            className={`mt-1 text-sm leading-6 whitespace-pre-wrap ${highlight ? 'font-bold' : ''} ${mono ? 'font-mono' : ''}`}
        >
            {value ?? '-'}
        </div>
    </div>
);

const DetailFile = ({ label, url }: { label: string; url?: string | null }) => (
    <div className="rounded-xl border bg-card p-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        {url ? (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17524A] underline underline-offset-4 hover:text-[#12423b]"
            >
                Lihat file <ExternalLink className="size-3.5" />
            </a>
        ) : (
            <p className="mt-1 text-sm text-muted-foreground">Tidak tersedia</p>
        )}
    </div>
);
