import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    InfoIcon,
    KeyRound,
    Mail,
    MapPin,
    Phone,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';

export default function DetailPage() {
    const { user: rawUser, teacher: rawTeacher, stats, auth } = usePage<{
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
        isSuperAdmin ||
        (auth?.user?.permissions ?? []).includes('update-user');

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

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {user?.penyaluran_id && (
                            <span>ID Penyaluran: {user.penyaluran_id}</span>
                        )}
                        {user?.penyaluran_id && user?.branch && <span>•</span>}
                        {user?.branch && <span>Cabang: {user.branch}</span>}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href={teachers.index().url}>
                            <ArrowLeft className="mr-1.5 size-4" /> Kembali
                        </Link>
                    </Button>
                    {canResetPassword && (
                        <Button variant="secondary" onClick={handleResetPassword}>
                            <KeyRound className="mr-1.5 size-4" />
                            Reset Password
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Badges & Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Status Akun
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <Badge
                                variant={isVerified ? 'default' : 'secondary'}
                                className="text-xs"
                            >
                                {isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                            {isProfileComplete ? (
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs"
                                >
                                    Lengkap
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs">
                                    Belum Lengkap
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Sanggar Binaan
                        </p>
                        <p className="text-lg font-bold">
                            {sanggars.length || (stats?.sanggars_count ?? 0)}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Sanggar
                            </span>
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Santri Terbina
                        </p>
                        <p className="text-lg font-bold">
                            {stats?.students_count ?? 0}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Santri
                            </span>
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <UserCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Peserta Olimpiade
                        </p>
                        <p className="text-lg font-bold">
                            {stats?.participants_count ?? 0}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                Peserta
                            </span>
                        </p>
                    </div>
                </Card>
            </div>

            {/* Main Content Details */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Biodata & Akun */}
                <Card className="space-y-4 p-5 md:p-6">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <InfoIcon className="size-5 text-primary" />
                        <h2 className="text-base font-semibold">
                            Informasi Profil & Akun
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Detail label="Nama Lengkap" value={user?.name} />
                        <Detail
                            label="Email"
                            value={
                                user?.email ? (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="size-3.5 text-muted-foreground" />
                                        <span>{user.email}</span>
                                    </div>
                                ) : (
                                    '-'
                                )
                            }
                        />
                        <Detail
                            label="No. Telepon / WhatsApp"
                            value={
                                user?.phone ? (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-muted-foreground" />
                                        <span>{user.phone}</span>
                                    </div>
                                ) : (
                                    '-'
                                )
                            }
                        />
                        <Detail
                            label="Kantor Cabang"
                            value={
                                user?.branch || user?.kantor_name ? (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5 text-muted-foreground" />
                                        <span>
                                            {user.branch || user.kantor_name}
                                        </span>
                                    </div>
                                ) : (
                                    '-'
                                )
                            }
                        />
                        <Detail
                            label="Role Akun"
                            value={
                                Array.isArray(user?.roles)
                                    ? user.roles.join(', ') || 'Teacher'
                                    : user?.roles?.[0]?.name || 'Teacher'
                            }
                        />
                        {user?.penyaluran_id && (
                            <Detail
                                label="ID Penyaluran"
                                value={user.penyaluran_id}
                            />
                        )}
                        {user?.nik && <Detail label="NIK" value={user.nik} />}
                        {user?.gender && (
                            <Detail
                                label="Jenis Kelamin"
                                value={
                                    user.gender === 'male' || user.gender === 'L'
                                        ? 'Laki-laki'
                                        : user.gender === 'female' || user.gender === 'P'
                                          ? 'Perempuan'
                                          : user.gender
                                }
                            />
                        )}
                        {user?.address && (
                            <div className="sm:col-span-2">
                                <Detail label="Alamat" value={user.address} />
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
                </Card>

                {/* Daftar Sanggar Binaan */}
                <Card className="space-y-4 p-5 md:p-6">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Building2 className="size-5 text-primary" />
                            <h2 className="text-base font-semibold">
                                Sanggar Binaan ({sanggars.length})
                            </h2>
                        </div>
                    </div>

                    {sanggars.length > 0 ? (
                        <div className="space-y-3">
                            {sanggars.map((s: any, idx: number) => {
                                const sanggarName =
                                    s.name ||
                                    s.nama ||
                                    s.sanggar_name ||
                                    `Sanggar #${idx + 1}`;
                                const sanggarType =
                                    s.type || s.tipe || 'Sanggar Binaan';
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
                                        className="flex flex-col gap-2 rounded-lg border p-3.5 text-sm transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {sanggarName}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px]"
                                                >
                                                    {sanggarType}
                                                </Badge>
                                                <span>• {sanggarKantor}</span>
                                            </div>
                                        </div>
                                        {santriCount !== null && (
                                            <div className="text-left sm:text-right">
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    {santriCount} Santri
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <BookOpen className="mb-2 size-8 opacity-40" />
                            <p className="text-sm">
                                Belum ada sanggar binaan yang terhubung.
                            </p>
                        </div>
                    )}
                </Card>
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

const Detail = ({ label, value }: { label: string; value?: any }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <div className="mt-1 text-sm font-medium">{value ?? '-'}</div>
    </div>
);
