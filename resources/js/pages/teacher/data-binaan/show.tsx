import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/teacher';
import binaanRoute from '@/routes/teacher/data-binaan';
import dataPeserta from '@/routes/teacher/data-peserta';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Clock3,
    Eye,
    GraduationCap,
    MapPin,
    Pencil,
    RefreshCcw,
    School,
    User,
    UserPlus,
    XCircle,
} from 'lucide-react';

export default function ShowPage() {
    const {
        binaan,
        registration,
        registration_binaan_open = true,
    } = usePage<{
        binaan: Record<string, any>;
        registration?: Record<string, any> | null;
        registration_binaan_open?: boolean;
    }>().props;

    const fullName = binaan.full_name ?? binaan.name ?? '-';
    const isRegistered = !!binaan.is_registered;
    const status = binaan.registration_status ?? registration?.status ?? null;
    const initial = String(fullName).charAt(0).toUpperCase();

    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
        verified: {
            label: 'Terverifikasi',
            className: 'bg-emerald-600 text-white hover:bg-emerald-700',
            icon: CheckCircle2,
        },
        submitted: {
            label: 'Menunggu Verifikasi',
            className: 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300',
            icon: Clock3,
        },
        rejected: {
            label: 'Ditolak',
            className: 'bg-destructive text-destructive-foreground',
            icon: XCircle,
        },
    };

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
                            Detail Binaan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Data santri binaan — sinkron langsung dari Penyaluran
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(binaanRoute.edit(binaan.student_id ?? binaan.id).url)}
                    >
                        <Pencil className="size-4" />
                        Edit Data
                    </Button>
                    {(!isRegistered || status === 'rejected') &&
                    registration_binaan_open ? (
                        <Button
                            className="bg-[#17524A] text-white hover:bg-[#12423b]"
                            onClick={() =>
                                router.visit(
                                    dataPeserta.create({
                                        query: {
                                            student_id: String(
                                                binaan.student_id ?? binaan.id,
                                            ),
                                            ...(binaan.sanggar_ids?.[0]
                                                ? {
                                                      sanggar_id: String(
                                                          binaan.sanggar_ids[0],
                                                      ),
                                                  }
                                                : binaan.sanggar_id
                                                  ? {
                                                        sanggar_id: String(
                                                            binaan.sanggar_id,
                                                        ),
                                                    }
                                                  : {}),
                                        },
                                    }).url,
                                )
                            }
                        >
                            {status === 'rejected' ? (
                                <RefreshCcw className="size-4" />
                            ) : (
                                <UserPlus className="size-4" />
                            )}
                            {status === 'rejected'
                                ? 'Daftarkan Ulang'
                                : 'Daftarkan ke OMATIQ'}
                        </Button>
                    ) : (
                        registration?.id && (
                            <Button
                                variant="outline"
                                className="border-[#17524A] text-[#17524A] hover:bg-[#17524A]/10"
                                onClick={() =>
                                    router.visit(
                                        dataPeserta.show(registration.id).url,
                                    )
                                }
                            >
                                <Eye className="size-4" />
                                Detail Pendaftaran
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Hero */}
            <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] via-[#1e6a5e] to-[#2a8a7d] p-6 text-white shadow-sm lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur lg:size-20 lg:text-2xl">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold lg:text-2xl">{fullName}</h2>
                            <p className="mt-1 text-sm text-white/80">
                                {binaan.nickname ? `"${binaan.nickname}" • ` : ''}
                                {binaan.nik &&
                                String(binaan.nik).trim() !== '' &&
                                String(binaan.nik).trim() !== '-'
                                    ? binaan.nik
                                    : 'NIK belum diisi'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(binaan.sanggar_names ?? []).length ? (
                                    binaan.sanggar_names.map((n: string) => (
                                        <span
                                            key={n}
                                            className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur"
                                        >
                                            {n}
                                        </span>
                                    ))
                                ) : binaan.sanggar_name ? (
                                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
                                        {binaan.sanggar_name}
                                    </span>
                                ) : null}
                                {binaan.kantor_name && (
                                    <span className="rounded-full bg-[#E5BE1E] px-2.5 py-1 text-xs font-bold text-[#17524A]">
                                        {binaan.kantor_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                        {status ? (
                            <Badge
                                className={`gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig[status]?.className ?? ''}`}
                            >
                                {(() => {
                                    const Icon = statusConfig[status]?.icon ?? Clock3;

                                    return <Icon className="size-3.5" />;
                                })()}
                                {statusConfig[status]?.label ?? status} {binaan.olimpiade_name ? `• ${binaan.olimpiade_name}` : ''}
                            </Badge>
                        ) : (
                            <Badge
                                variant="secondary"
                                className="rounded-full bg-white/15 px-3 py-1.5 text-white hover:bg-white/20"
                            >
                                Belum Terdaftar OMATIQ
                            </Badge>
                        )}
                        {binaan.registration_number && (
                            <span className="rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold tracking-wide backdrop-blur">
                                {binaan.registration_number}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Biodata */}
                <Card className="rounded-2xl shadow-sm lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                <User className="size-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base">Biodata Binaan</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Sumber: Penyaluran API — edit untuk sinkronisasi 2-arah
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Detail
                                icon={<User className="size-3.5" />}
                                label="NIK"
                                value={
                                    binaan.nik &&
                                    String(binaan.nik).trim() !== '' &&
                                    String(binaan.nik).trim() !== '-' ? (
                                        <span className="font-mono font-medium">{binaan.nik}</span>
                                    ) : (
                                        <span className="font-medium text-amber-600 dark:text-amber-400">
                                            Belum diisi di Penyaluran
                                        </span>
                                    )
                                }
                            />
                            <Detail icon={<GraduationCap className="size-3.5" />} label="NIS" value={binaan.nis} />
                            <Detail label="Nama Lengkap" value={fullName} highlight />
                            <Detail label="Nama Panggilan" value={binaan.nickname} />
                            <Detail label="Jenis Kelamin" value={formatGender(binaan.gender)} />
                            <Detail
                                label="Tempat, Tanggal Lahir"
                                value={`${binaan.birth_place ?? '-'} • ${binaan.birth_date ? String(binaan.birth_date).slice(0, 10) : '-'}`}
                            />
                            <Detail icon={<School className="size-3.5" />} label="Sekolah" value={binaan.school_name} />
                            <Detail label="Jenjang" value={binaan.school_level} />
                            <Detail label="Kelas" value={binaan.class ?? binaan.grade} />
                            <Detail
                                icon={<MapPin className="size-3.5" />}
                                label="Alamat"
                                value={binaan.address}
                                className="md:col-span-2"
                            />
                            <Detail
                                label="Wali"
                                value={`${binaan.guardian_name ?? '-'} ${binaan.guardian_phone ? `• ${binaan.guardian_phone}` : ''}`}
                            />
                            <Detail
                                icon={<Building2 className="size-3.5" />}
                                label="Sanggar"
                                value={
                                    (binaan.sanggar_names ?? []).join(', ') ||
                                    binaan.sanggar_name ||
                                    '-'
                                }
                            />
                            <Detail label="Kantor Cabang" value={binaan.kantor_name} />
                            <Detail label="ID Penyaluran" value={binaan.student_id ?? binaan.id} mono />
                        </div>
                    </CardContent>
                </Card>

                {/* Status */}
                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Status OMATIQ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {status === 'verified' ? (
                                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                                    <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                                        <CheckCircle2 className="size-4" /> Terverifikasi
                                    </div>
                                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                                        {binaan.olimpiade_name ?? 'OMATIQ'} — pendaftaran binaan telah diverifikasi.
                                    </p>
                                </div>
                            ) : status === 'rejected' ? (
                                <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-950/30">
                                    <div className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-300">
                                        <XCircle className="size-4" /> Ditolak
                                    </div>
                                    <p className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                                        Pengajuan ditolak — silakan cek alasan dan daftar ulang.
                                    </p>
                                </div>
                            ) : status === 'submitted' ? (
                                <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
                                    <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                                        <Clock3 className="size-4" /> Menunggu
                                    </div>
                                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                        Menunggu verifikasi admin.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="text-sm font-medium">Belum Terdaftar</p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Binaan belum didaftarkan ke OMATIQ. Klik “Daftarkan ke OMATIQ” untuk mendaftar.
                                    </p>
                                </div>
                            )}

                            {binaan.registration_number && (
                                <div className="rounded-xl border bg-card px-3 py-2.5">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        No. Registrasi
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-bold">{binaan.registration_number}</p>
                                </div>
                            )}
                            {registration?.olimpiade?.name && (
                                <div className="rounded-xl border bg-card px-3 py-2.5">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Olimpiade
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">{registration.olimpiade.name}</p>
                                </div>
                            )}
                            {binaan.olimpiade_name && !registration?.olimpiade?.name && (
                                <div className="rounded-xl border bg-card px-3 py-2.5">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Olimpiade
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">{binaan.olimpiade_name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-dashed bg-muted/20 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Butuh bantuan?
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                Jika NIK belum terisi, lengkapi terlebih dahulu di Penyaluran atau edit data binaan sebelum mendaftar.
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
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Binaan', href: binaanRoute.index().url },
        { title: 'Detail Binaan', href: '#' },
    ],
};

function formatGender(g: string | null | undefined): string {
    if (!g) {
return '-';
}

    if (g === 'male' || g === 'L') {
return 'Laki-laki';
}

    if (g === 'female' || g === 'P') {
return 'Perempuan';
}

    return g;
}

const Detail = ({
    label,
    value,
    className = '',
    icon,
    highlight = false,
    mono = false,
}: {
    label: string;
    value?: any;
    className?: string;
    icon?: React.ReactNode;
    highlight?: boolean;
    mono?: boolean;
}) => (
    <div className={className}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </p>
        <p
            className={`mt-1 text-sm leading-relaxed whitespace-pre-wrap ${highlight ? 'font-bold text-foreground' : ''} ${mono ? 'font-mono' : ''}`}
        >
            {value ?? '-'}
        </p>
    </div>
);
