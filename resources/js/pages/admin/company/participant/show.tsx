import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProofModal } from '@/components/ui/proof-modal';
import { dashboard } from '@/routes/admin';
import participants from '@/routes/admin/companies/participants';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Building2,
    Calendar,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    GraduationCap,
    MapPin,
    Pencil,
    Phone,
    Printer,
    School,
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
    const { participant, auth } = usePage<{
        participant: Record<string, any>;
        auth?: {
            user?: {
                permissions?: string[];
                roles?: string[];
            };
        };
    }>().props;
    const isBinaan =
        !!participant.student?.is_binaan ||
        !!participant.student?.penyaluran_id ||
        participant.registration_type === 'teacher';
    const [openProof, setOpenProof] = useState(false);

    const userRoles = auth?.user?.roles ?? [];
    const isKeuangan = userRoles.includes('Keuangan');
    const canUpdate =
        (auth?.user?.permissions ?? []).includes('update-participant') ||
        userRoles.includes('Administrators');

    const fullName =
        participant.student?.full_name ??
        participant.user?.name ??
        participant.nik ??
        'Peserta';
    const initial = String(fullName).charAt(0).toUpperCase();
    const status = participant.status;

    // Region concatenation
    const fullAddressParts = [
        participant.student?.address,
        participant.student?.village?.name
            ? `Desa/Kel. ${participant.student.village.name}`
            : null,
        participant.student?.district?.name
            ? `Kec. ${participant.student.district.name}`
            : null,
        participant.student?.regency?.name,
        participant.student?.province?.name,
    ].filter(Boolean);
    const fullAddress = fullAddressParts.join(', ');

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header / Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Kembali"
                        className="size-9 shrink-0 rounded-xl"
                        onClick={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                router.visit(participants.index().url);
                            }
                        }}
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
                                href={`/admin/companies/participants/${participant.id}/card`}
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
                    {canUpdate && !isKeuangan && (
                        <Button
                            className="gap-2 bg-[#17524A] font-semibold text-white hover:bg-[#17524A]/90"
                            onClick={() =>
                                router.visit(
                                    participants.edit(participant.id).url,
                                )
                            }
                        >
                            <Pencil className="size-4" />
                            Edit Peserta
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero / Banner Info Peserta */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#134e45] via-[#17524A] to-[#258a7c] p-5 text-white shadow-md sm:p-6">
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 font-bold text-white shadow-inner sm:size-16 sm:text-2xl">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold sm:text-xl">
                                    {fullName}
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="border-white/30 bg-white/10 text-xs font-semibold text-white"
                                >
                                    {isBinaan
                                        ? 'Santri Binaan'
                                        : 'Peserta Mandiri'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-white/80">
                                {labels[participant.student?.gender ?? ''] ??
                                    participant.student?.gender ??
                                    '-'}{' '}
                                • {participant.olimpiade?.name ?? '-'}
                            </p>
                            <p className="mt-0.5 text-xs text-white/70">
                                No. Registrasi:{' '}
                                <span className="font-mono font-bold tracking-wider">
                                    {participant.registration_number}
                                </span>{' '}
                                • Cabang:{' '}
                                <span className="font-semibold">
                                    {participant.branch ?? '-'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex items-center gap-2">
                            {status === 'verified' ? (
                                <Badge className="gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                                    <CheckCircle2 className="size-3.5" />{' '}
                                    Terverifikasi
                                </Badge>
                            ) : status === 'rejected' ? (
                                <Badge
                                    variant="destructive"
                                    className="gap-1.5 rounded-full px-3 py-1 shadow-sm"
                                >
                                    <XCircle className="size-3.5" /> Ditolak
                                </Badge>
                            ) : (
                                <Badge className="gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
                                    <Clock3 className="size-3.5" /> Menunggu
                                    Verifikasi
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-white/70">
                            Event Tahun: {participant.event_year ?? '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Alert jika pendaftaran ditolak */}
            {status === 'rejected' && participant.notes && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 size-5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold">
                                Catatan Penolakan Admin:
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-destructive/90">
                                {participant.notes}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Konten Detail */}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                {/* Kolom Kiri: Biodata Lengkap Peserta */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                <User className="size-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base font-bold">
                                    Biodata Peserta
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Informasi data diri dan kontak santri /
                                    peserta
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail
                                label="Nama Lengkap"
                                value={participant.student?.full_name}
                                highlight
                            />
                            <Detail
                                label="Nama Panggilan"
                                value={participant.student?.nickname}
                            />
                            <Detail
                                label="NIK"
                                value={
                                    participant.student?.nik ?? participant.nik
                                }
                                mono
                            />
                            <Detail
                                label="Jenis Kelamin"
                                value={
                                    labels[
                                        participant.student?.gender ?? ''
                                    ] ?? participant.student?.gender
                                }
                            />
                            {isBinaan ? (
                                <>
                                    <Detail
                                        label="NIS"
                                        value={participant.student?.nis}
                                        mono
                                    />
                                    <Detail
                                        label="Jenjang Pendidikan"
                                        value={
                                            participant.student?.school_level
                                        }
                                    />
                                </>
                            ) : null}
                            <Detail
                                label="Tempat, Tanggal Lahir"
                                icon={<Calendar className="size-3.5" />}
                                value={
                                    participant.student?.birth_place ||
                                    participant.student?.birth_date
                                        ? `${participant.student?.birth_place ?? '-'}, ${participant.student?.birth_date?.slice(0, 10) ?? '-'}`
                                        : '-'
                                }
                            />
                            <Detail
                                label="Sekolah"
                                icon={<School className="size-3.5" />}
                                value={participant.student?.school_name}
                            />
                            <Detail
                                label="Kelas"
                                value={participant.student?.grade}
                            />
                            <Detail
                                label="No. HP Orang Tua / Wali"
                                icon={<Phone className="size-3.5" />}
                                value={
                                    participant.parent_phone ??
                                    participant.student?.parent_phone
                                }
                            />
                            {isBinaan && participant.student?.penyaluran_id && (
                                <Detail
                                    label="ID Santri Penyaluran"
                                    value={participant.student.penyaluran_id}
                                    mono
                                />
                            )}
                        </div>

                        <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Detail
                                    label="Provinsi"
                                    icon={<MapPin className="size-3.5" />}
                                    value={participant.student?.province?.name}
                                />
                                <Detail
                                    label="Kota / Kabupaten"
                                    value={participant.student?.regency?.name}
                                />
                                <Detail
                                    label="Kecamatan"
                                    value={participant.student?.district?.name}
                                />
                                <Detail
                                    label="Kelurahan / Desa"
                                    value={participant.student?.village?.name}
                                />
                            </div>
                            <div className="mt-3 border-t pt-3">
                                <Detail
                                    label="Alamat Domisili"
                                    value={
                                        fullAddress ||
                                        participant.student?.address
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Kolom Kanan: Olimpiade, Pendamping, Dokumen & Pembayaran */}
                <div className="space-y-6">
                    {/* Kategori Olimpiade & Pendamping */}
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="size-4 text-[#17524A]" />
                                <CardTitle className="text-base font-bold">
                                    Olimpiade & Pendamping
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Detail
                                label="Cabang Olimpiade"
                                icon={<GraduationCap className="size-3.5" />}
                                value={participant.olimpiade?.name}
                                highlight
                            />
                            <Detail
                                label="Kategori"
                                value={participant.olimpiade?.category}
                            />
                            <Detail
                                label="Guru / Pendamping"
                                value={
                                    participant.mentor?.name ??
                                    participant.student?.mentor_name
                                }
                            />
                            <Detail
                                label="No. HP Pendamping"
                                icon={<Phone className="size-3.5" />}
                                value={
                                    participant.companion_phone ??
                                    participant.mentor?.phone ??
                                    participant.student?.mentor_phone
                                }
                            />
                            {isBinaan &&
                                participant.penyaluran_sanggar_name && (
                                    <Detail
                                        label="Sanggar Binaan"
                                        icon={
                                            <Building2 className="size-3.5" />
                                        }
                                        value={
                                            participant.penyaluran_sanggar_name
                                        }
                                    />
                                )}
                            <Detail
                                label="Kantor Cabang"
                                icon={<Building2 className="size-3.5" />}
                                value={
                                    participant.branch ??
                                    participant.kantor_name
                                }
                            />
                            <Detail
                                label="Sumber Referensi"
                                value={participant.referral_source}
                            />
                        </CardContent>
                    </Card>

                    {/* Dokumen Peserta (Modal Viewer yang sama dengan Bukti Bayar) */}
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-[#17524A]" />
                                <CardTitle className="text-base font-bold">
                                    Dokumen & Berkas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FileViewerCard
                                label="Kartu Pelajar / Dokumen Identitas"
                                href={participant.student?.student_card_url}
                            />

                            <div className="grid gap-3 pt-1 sm:grid-cols-2">
                                <Detail
                                    label="Tanda Tangan Peserta"
                                    value={
                                        participant.participant_signature_name
                                    }
                                />
                                <Detail
                                    label="Tanda Tangan Wali"
                                    value={participant.guardian_signature_name}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Pembayaran & Bukti Transfer */}
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">
                                Pembayaran & Verifikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Status Bayar
                                    </p>
                                    <div className="mt-1">
                                        <Badge
                                            className={
                                                participant.payment_status ===
                                                'paid'
                                                    ? 'bg-emerald-600 text-white'
                                                    : participant.payment_status ===
                                                        'waiting_confirmation'
                                                      ? 'bg-amber-500 text-white'
                                                      : 'bg-muted text-foreground'
                                            }
                                        >
                                            {participant.payment_status ===
                                            'paid'
                                                ? 'Lunas'
                                                : participant.payment_status ===
                                                    'waiting_confirmation'
                                                  ? 'Menunggu Konfirmasi'
                                                  : 'Belum Bayar'}
                                        </Badge>
                                    </div>
                                </div>
                                <Detail
                                    label="Nominal Pembayaran"
                                    value={
                                        participant.payment_amount
                                            ? `Rp ${Number(participant.payment_amount).toLocaleString('id-ID')}`
                                            : '-'
                                    }
                                />
                            </div>

                            {participant.payment_proof_url ? (
                                <FileViewerCard
                                    label="Bukti Transfer Pembayaran"
                                    href={participant.payment_proof_url}
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
                                    Belum ada bukti pembayaran yang diunggah
                                </div>
                            )}

                            {participant.payment_note && (
                                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        Catatan Pembayaran:{' '}
                                    </span>
                                    {participant.payment_note}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Riwayat & Prestasi */}
                    {(participant.achievements ||
                        participant.has_joined_before) && (
                        <Card className="rounded-2xl shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">
                                    Pengalaman & Prestasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Detail
                                    label="Pernah Ikut OMATIQ"
                                    value={
                                        participant.has_joined_before
                                            ? `Ya (${participant.previous_year ?? 'Tahun Sebelumnya'})`
                                            : 'Tidak'
                                    }
                                />
                                {participant.achievements && (
                                    <Detail
                                        label="Catatan Prestasi"
                                        value={participant.achievements}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

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
    <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </p>
        <div
            className={`mt-1 text-sm leading-6 break-words whitespace-pre-wrap ${highlight ? 'font-bold text-[#17524A] dark:text-emerald-400' : ''} ${mono ? 'font-mono' : ''}`}
        >
            {value ?? '-'}
        </div>
    </div>
);

const FileViewerCard = ({
    label,
    href,
}: {
    label: string;
    href?: string | null;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border bg-card p-3 shadow-xs">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            {href ? (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full justify-center gap-1.5 font-semibold text-[#17524A] hover:bg-[#17524A]/10 hover:text-[#17524A]"
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
                <p className="mt-1 text-sm text-muted-foreground">
                    Tidak tersedia
                </p>
            )}
        </div>
    );
};

ShowPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Peserta',
            href: participants.index().url,
        },
        {
            title: 'Detail Peserta',
            href: '#',
        },
    ],
};
