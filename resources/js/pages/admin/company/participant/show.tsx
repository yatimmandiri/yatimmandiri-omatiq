import { NationalReRegisterModal } from '@/components/partials/national-re-register-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProofModal } from '@/components/ui/proof-modal';
import { dashboard } from '@/routes/admin';
import participants from '@/routes/admin/companies/participants';
import { confirmAction, showWarningAlert } from '@/utils/sweetalert';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Building2,
    Calendar,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Eye,
    FileCheck2,
    FileText,
    GraduationCap,
    MapPin,
    Pencil,
    Phone,
    Printer,
    RotateCcw,
    School,
    Trophy,
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
    const [openLetterProof, setOpenLetterProof] = useState(false);
    const [openNationalPayProof, setOpenNationalPayProof] = useState(false);
    const [openReRegisterModal, setOpenReRegisterModal] = useState(false);

    const handleToggleNational = async () => {
        const isCurrentlyQualified = !!participant.national;

        // Proteksi: Cabang tidak boleh membatalkan peserta yang sudah daftar ulang nasional
        if (
            isCurrentlyQualified &&
            !isAdmin &&
            participant.national?.status !== 'unconfirmed'
        ) {
            await showWarningAlert(
                'Akses Dibatasi',
                'Peserta ini sudah melakukan pendaftaran ulang Babak Nasional. Pembatalan peserta nasional hanya dapat dilakukan oleh Panitia Pusat (Administrator).',
            );
            return;
        }

        const isConfirmed = await confirmAction({
            title: isCurrentlyQualified
                ? 'Batalkan Kelolosan Nasional?'
                : 'Loloskan ke Babak Nasional?',
            html: isCurrentlyQualified
                ? `Apakah Anda yakin ingin membatalkan status lolos nasional untuk <strong>${fullName}</strong> (${participant.registration_number})?`
                : `Apakah Anda yakin ingin meloloskan <strong>${fullName}</strong> (${participant.registration_number}) ke Babak Final OMATIQ Nasional 2026?`,
            icon: isCurrentlyQualified ? 'warning' : 'question',
            confirmButtonText: isCurrentlyQualified
                ? 'Ya, Batalkan Lolos'
                : 'Ya, Loloskan ke Nasional',
            cancelButtonText: 'Kembali',
            isDanger: isCurrentlyQualified,
        });

        if (isConfirmed) {
            router.post(
                participants.nationalQualify(participant.id).url,
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleVerifyNational = async (
        newStatus: 'verified' | 'rejected' | 'unconfirmed',
    ) => {
        const isApprove = newStatus === 'verified';
        const isReset = newStatus === 'unconfirmed';
        const isConfirmed = await confirmAction({
            title: isApprove
                ? 'Verifikasi Finalis Nasional?'
                : isReset
                  ? 'Batalkan Status Mengundurkan Diri?'
                  : 'Tolak Berkas Nasional?',
            html: isApprove
                ? `Setujui berkas pendaftaran ulang babak nasional untuk <strong>${fullName}</strong>? Status akan menjadi <strong>Terverifikasi</strong> dan pembayaran Lunas.`
                : isReset
                  ? `Batalkan status mundur dan buka kembali akses daftar ulang babak nasional untuk <strong>${fullName}</strong>?`
                  : `Apakah Anda yakin ingin menolak berkas daftar ulang babak nasional untuk <strong>${fullName}</strong>?`,
            icon: isApprove ? 'question' : isReset ? 'warning' : 'warning',
            confirmButtonText: isApprove
                ? 'Ya, Verifikasi'
                : isReset
                  ? 'Ya, Buka Akses Kembali'
                  : 'Ya, Tolak Berkas',
            cancelButtonText: 'Kembali',
            isDanger: newStatus === 'rejected',
        });

        if (isConfirmed) {
            router.post(
                participants.nationalVerify(participant.id).url,
                {
                    status: newStatus,
                    payment_status: isApprove ? 'paid' : 'unpaid',
                },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const userRoles = auth?.user?.roles ?? [];
    const isKeuangan = userRoles.includes('Keuangan');
    const isCabang = userRoles.includes('Cabang');
    const isAdmin = userRoles.includes('Administrators');
    const canUpdate =
        (auth?.user?.permissions ?? []).includes('update-participant') ||
        isAdmin ||
        isCabang;

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
                    {participant.national?.status === 'verified' && (
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
                    )}
                    {canUpdate &&
                        participant.national &&
                        isBinaan &&
                        participant.national.status === 'unconfirmed' && (
                            <Button
                                onClick={() => setOpenReRegisterModal(true)}
                                className="gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 font-bold text-white shadow hover:from-emerald-800 hover:to-teal-800"
                            >
                                <FileCheck2 className="size-4" />
                                Daftarkan Ulang Binaan
                            </Button>
                        )}
                    {isAdmin && (
                        <Button
                            variant={
                                participant.national ? 'outline' : 'default'
                            }
                            onClick={handleToggleNational}
                            className={
                                participant.national
                                    ? 'gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400'
                                    : 'gap-2 bg-[#17524A] text-white hover:bg-[#17524A]/90'
                            }
                        >
                            <Trophy className="size-4 text-amber-500" />
                            {participant.national
                                ? 'Batalkan Lolos Nasional'
                                : 'Loloskan ke Babak Nasional'}
                        </Button>
                    )}
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
                    {canUpdate && !isKeuangan && !isCabang && (
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

            {/* Babak Nasional Finalist Card */}
            {participant.national && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/20 p-5 shadow-sm sm:p-6 dark:border-amber-500/60 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-amber-900/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                                    <Badge variant="destructive" className="bg-rose-600 text-white hover:bg-rose-700">
                                        Mengundurkan Diri
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-amber-500 text-amber-800 dark:text-amber-300">
                                        Belum Daftar Ulang
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-lg font-extrabold text-amber-950 dark:text-amber-100 sm:text-xl">
                                Status Finalis Babak Nasional
                            </h3>
                            <p className="max-w-2xl text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/80 sm:text-sm">
                                {participant.national.status === 'verified'
                                    ? 'Peserta telah terverifikasi resmi sebagai finalis Babak Nasional OMATIQ 2026. Lanyard pass nasional resmi aktif.'
                                    : participant.national.status === 'declined'
                                      ? 'Peserta telah tercatat mengundurkan diri dari Babak Nasional OMATIQ 2026.'
                                      : participant.national.status === 'waiting_confirmation'
                                        ? 'Peserta telah mengunggah berkas daftar ulang dan menunggu verifikasi panitia pusat / keuangan.'
                                        : isBinaan
                                          ? 'Santri binaan telah diloloskan ke Babak Nasional. Kantor Cabang dapat mendaftarkan ulang dengan mengunggah Surat Kesediaan Hadir.'
                                          : 'Peserta umum telah diloloskan ke Babak Nasional, menunggu peserta melakukan daftar ulang mandiri di dashboard.'}
                            </p>
                        </div>

                        {/* Admin / Cabang Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {canUpdate &&
                                participant.national.status === 'unconfirmed' &&
                                isBinaan && (
                                    <Button
                                        size="sm"
                                        onClick={() => setOpenReRegisterModal(true)}
                                        className="gap-1.5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow hover:from-emerald-800 hover:to-teal-800"
                                    >
                                        <FileCheck2 className="size-4" />
                                        Daftarkan Ulang Binaan
                                    </Button>
                                )}
                            {canUpdate && participant.national.status === 'declined' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerifyNational('unconfirmed')}
                                    className="gap-1.5 border-rose-300 bg-white text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-300"
                                >
                                    <RotateCcw className="size-4" />
                                    Buka Akses / Batalkan Mundur
                                </Button>
                            )}
                            {canUpdate && participant.national.status !== 'verified' && participant.national.status !== 'declined' && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => handleVerifyNational('verified')}
                                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Setujui & Verifikasi Nasional
                                    </Button>
                                    {participant.national.status === 'waiting_confirmation' && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleVerifyNational('rejected')}
                                            className="gap-1.5"
                                        >
                                            <XCircle className="size-4" />
                                            Tolak Berkas
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Informasi Pengunduran Diri */}
                    {participant.national.status === 'declined' && (
                        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50/90 p-4 text-xs text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-rose-200/80 p-2 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                    <XCircle className="size-5 shrink-0" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-rose-900 dark:text-rose-100">
                                            Kategori Pengunduran Diri:
                                        </span>
                                        <Badge variant="outline" className="border-rose-300 bg-white font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                            {participant.national.decline_category || 'Tidak ditentukan'}
                                        </Badge>
                                        {participant.national.declined_at && (
                                            <span className="text-[11px] text-rose-700 dark:text-rose-400">
                                                (Dicatat:{' '}
                                                {new Date(participant.national.declined_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })})
                                            </span>
                                        )}
                                    </div>
                                    <p className="whitespace-pre-line text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                                        {participant.national.decline_reason || 'Tidak ada keterangan tambahan.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dokumen Babak Nasional */}
                    {(participant.national.availability_letter_url || participant.national.payment_proof_url) && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-amber-300/60 pt-3 dark:border-amber-700/50">
                            {participant.national.availability_letter_url && (
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 border-amber-400 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-200"
                                        onClick={() => setOpenLetterProof(true)}
                                    >
                                        <ExternalLink className="size-3.5" />
                                        Lihat Surat Kesediaan Hadir
                                    </Button>
                                    <ProofModal
                                        href={participant.national.availability_letter_url}
                                        open={openLetterProof}
                                        onOpenChange={setOpenLetterProof}
                                        title="Surat Kesediaan Hadir Babak Nasional"
                                    />
                                </div>
                            )}
                            {participant.national.payment_proof_url && (
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 border-amber-400 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-200"
                                        onClick={() => setOpenNationalPayProof(true)}
                                    >
                                        <ExternalLink className="size-3.5" />
                                        Lihat Bukti Transfer Nasional
                                    </Button>
                                    <ProofModal
                                        href={participant.national.payment_proof_url}
                                        open={openNationalPayProof}
                                        onOpenChange={setOpenNationalPayProof}
                                        title="Bukti Transfer Babak Nasional"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
            {/* Modal Daftar Ulang Binaan oleh Cabang */}
            <NationalReRegisterModal
                open={openReRegisterModal}
                onOpenChange={setOpenReRegisterModal}
                participant={participant as any}
            />
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
