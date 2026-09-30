import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { formatDate } from '@/utils/formatDate';
import { confirmResetPassword } from '@/utils/sweetalert';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    CheckCircle2,
    CircleAlert,
    KeyRound,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserCheck,
    UserRound,
    Users,
} from 'lucide-react';

export default function DetailPage() {
    const {
        user: rawUser,
        teacher: rawTeacher,
        stats,
        auth,
    } = usePage<{
        user?: any;
        teacher?: any;
        stats?: {
            participants_count?: number;
            students_count?: number;
            sanggars_count?: number;
        };
        auth?: {
            user?: {
                roles?: string[];
                permissions?: string[];
            };
        };
    }>().props;

    const user = rawTeacher || rawUser || {};

    const isSuperAdmin = (auth?.user?.roles ?? []).includes('Administrators');
    const canResetPassword =
        isSuperAdmin || (auth?.user?.permissions ?? []).includes('update-user');

    const handleResetPassword = async () => {
        const isConfirmed = await confirmResetPassword({
            userName: user?.name,
        });

        if (isConfirmed) {
            router.put(
                teachers.resetPassword(user.id).url,
                {},
                { preserveScroll: true },
            );
        }
    };

    const isVerified = Boolean(user?.email_verified_at);
    const isProfileComplete = Boolean(user?.teacher_profile_completed_at);
    const sanggars: any[] = Array.isArray(user?.sanggars) ? user.sanggars : [];
    const displayName = user?.name ?? 'Detail Guru';
    const initials = String(displayName)
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();
    const branchLabel = user?.branch || user?.kantor_name || '-';
    const rolesLabel = Array.isArray(user?.roles)
        ? user.roles.join(', ') || 'Teacher'
        : (user?.roles?.[0]?.name ?? 'Teacher');

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Kembali ke daftar guru"
                        className="size-9 shrink-0 rounded-xl"
                        asChild
                    >
                        <Link href={teachers.index().url}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                            Detail Guru
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Profil guru — sinkron langsung dari Penyaluran
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href={teachers.index().url}>
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                    {canResetPassword && (
                        <Button
                            variant="secondary"
                            onClick={handleResetPassword}
                            className="gap-2"
                        >
                            <KeyRound className="size-4" />
                            Reset Password
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] via-[#1e6a5e] to-[#2a8a7d] p-6 text-white shadow-sm lg:p-8">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -left-12 size-64 rounded-full bg-[#E5BE1E]/15 blur-3xl"
                />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur lg:size-20 lg:text-2xl">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-bold lg:text-2xl">
                                {displayName}
                            </h2>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="size-3.5 opacity-70" />
                                    {user?.email ?? '-'}
                                </span>
                                {user?.phone && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="size-3.5 opacity-70" />
                                        {user.phone}
                                    </span>
                                )}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {user?.penyaluran_id && (
                                    <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur">
                                        ID {user.penyaluran_id}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
                                    <MapPin className="size-3" />
                                    {branchLabel}
                                </span>
                                <span className="rounded-full bg-[#E5BE1E] px-2.5 py-1 text-xs font-bold text-[#17524A]">
                                    {rolesLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                        <div className="flex flex-wrap gap-1.5">
                            <Badge
                                className={`gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    isVerified
                                        ? 'bg-white text-emerald-700 hover:bg-white'
                                        : 'bg-amber-300 text-amber-900 hover:bg-amber-300'
                                }`}
                            >
                                {isVerified ? (
                                    <CheckCircle2 className="size-3.5" />
                                ) : (
                                    <CircleAlert className="size-3.5" />
                                )}
                                {isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <Badge
                                className={`gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    isProfileComplete
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                                        : 'bg-white/15 text-white hover:bg-white/20'
                                }`}
                            >
                                {isProfileComplete
                                    ? 'Profil Lengkap'
                                    : 'Profil Belum Lengkap'}
                            </Badge>
                        </div>
                        {(user?.created_at || user?.updated_at) && (
                            <p className="text-xs text-white/70">
                                Terdaftar{' '}
                                {user?.created_at
                                    ? formatDate(user.created_at)
                                    : '-'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                            Status Akun
                        </p>
                        <p className="truncate text-sm font-bold">
                            {isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                            {' • '}
                            {isProfileComplete ? 'Lengkap' : 'Belum Lengkap'}
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Sanggar Binaan
                        </p>
                        <p className="text-lg leading-6 font-black">
                            {sanggars.length || (stats?.sanggars_count ?? 0)}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Sanggar
                            </span>
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Santri Terbina
                        </p>
                        <p className="text-lg leading-6 font-black">
                            {stats?.students_count ?? 0}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Santri
                            </span>
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <UserCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Peserta Olimpiade
                        </p>
                        <p className="text-lg leading-6 font-black">
                            {stats?.participants_count ?? 0}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Peserta
                            </span>
                        </p>
                    </div>
                </Card>
            </div>

            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A] dark:text-emerald-300">
                                <UserRound className="size-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base">
                                    Informasi Profil & Akun
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Data guru dari Penyaluran — read-only di
                                    OMATIQ
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Detail
                                label="Nama Lengkap"
                                value={user?.name}
                                highlight
                            />
                            <Detail
                                label="Email"
                                value={
                                    user?.email ? (
                                        <span className="inline-flex items-center gap-1.5 break-all">
                                            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                                            {user.email}
                                        </span>
                                    ) : (
                                        '-'
                                    )
                                }
                            />
                            <Detail
                                label="No. Telepon / WhatsApp"
                                value={
                                    user?.phone ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                                            {user.phone}
                                        </span>
                                    ) : (
                                        '-'
                                    )
                                }
                                mono
                            />
                            <Detail
                                label="Kantor Cabang"
                                value={
                                    user?.branch || user?.kantor_name ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                            {user.branch || user.kantor_name}
                                        </span>
                                    ) : (
                                        '-'
                                    )
                                }
                            />
                            <Detail label="Role Akun" value={rolesLabel} />
                            {user?.penyaluran_id && (
                                <Detail
                                    label="ID Penyaluran"
                                    value={user.penyaluran_id}
                                    mono
                                />
                            )}
                            {user?.code || user?.penyaluran_code ? (
                                <Detail
                                    label="Kode Guru"
                                    value={user.code ?? user.penyaluran_code}
                                    mono
                                />
                            ) : null}
                            {user?.nik && (
                                <Detail label="NIK" value={user.nik} mono />
                            )}
                            {user?.gender && (
                                <Detail
                                    label="Jenis Kelamin"
                                    value={
                                        user.gender === 'male' ||
                                        user.gender === 'L'
                                            ? 'Laki-laki'
                                            : user.gender === 'female' ||
                                                user.gender === 'P'
                                              ? 'Perempuan'
                                              : user.gender
                                    }
                                />
                            )}
                            {user?.address && (
                                <div className="sm:col-span-2">
                                    <Detail
                                        label="Alamat"
                                        value={user.address}
                                    />
                                </div>
                            )}
                            <Detail
                                label="Terdaftar Pada"
                                value={formatDate(user?.created_at)}
                            />
                            <Detail
                                label="Terakhir Diperbarui"
                                value={formatDate(user?.updated_at)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="size-4 text-[#17524A]" />
                                    Sanggar Binaan ({sanggars.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sanggars.length > 0 ? (
                                <div className="space-y-3">
                                    {sanggars.map((s: any, idx: number) => {
                                        const sanggarName =
                                            s.name ||
                                            s.nama ||
                                            s.sanggar_name ||
                                            `Sanggar #${idx + 1}`;
                                        const sanggarType =
                                            s.type ||
                                            s.tipe ||
                                            'Sanggar Binaan';
                                        const sanggarKantor =
                                            s.kantor_name ||
                                            s.kantor ||
                                            s.cabang ||
                                            user?.branch ||
                                            '-';
                                        const santriCount =
                                            s.total_students ??
                                            s.santri_count ??
                                            s.students_count ??
                                            null;

                                        return (
                                            <div
                                                key={s.id || idx}
                                                className="flex flex-col gap-2 rounded-2xl border p-3.5 text-sm transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0 space-y-1.5">
                                                    <p className="truncate font-semibold text-foreground">
                                                        {sanggarName}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full text-[10px]"
                                                        >
                                                            {sanggarType}
                                                        </Badge>
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="size-3" />
                                                            {sanggarKantor}
                                                        </span>
                                                    </div>
                                                </div>
                                                {santriCount !== null && (
                                                    <Badge className="w-fit shrink-0 gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-white">
                                                        <Users className="size-3" />
                                                        {santriCount} Santri
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 text-center">
                                    <BookOpen className="mb-2 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-semibold">
                                        Belum ada sanggar terhubung
                                    </p>
                                    <p className="mt-1 max-w-[26ch] text-xs text-muted-foreground">
                                        Guru ini belum memiliki sanggar binaan
                                        di Penyaluran.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-dashed bg-muted/20 shadow-none">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Catatan operasional
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                Data guru read-only dari Penyaluran. Reset
                                password mengembalikan ke default{' '}
                                <span className="font-mono font-semibold">
                                    password
                                </span>{' '}
                                — minta guru segera mengganti setelah login.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

DetailPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Guru',
            href: teachers.index().url,
        },
        {
            title: 'Detail Guru',
            href: '#',
        },
    ],
};

const Detail = ({
    label,
    value,
    highlight = false,
    mono = false,
}: {
    label: string;
    value?: any;
    highlight?: boolean;
    mono?: boolean;
}) => (
    <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <div
            className={`mt-1 text-sm leading-6 break-words whitespace-pre-wrap ${highlight ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}
        >
            {value ?? '-'}
        </div>
    </div>
);
