import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dashboard } from '@/routes/teacher';
import binaan from '@/routes/teacher/data-binaan';
import dataPeserta from '@/routes/teacher/data-peserta';
import sanggarRoute from '@/routes/teacher/data-sanggar';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpenCheck,
    Building2,
    CheckCircle2,
    GraduationCap,
    MapPin,
    Sparkles,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

type PageProps = {
    studentCount: number;
    penyaluranTotal?: number | null;
    sanggarCount?: number;
    sanggarSum?: number | null;
    overlapCount?: number | null;
    registeredCount?: number;
    biodata?: Record<string, any>;
    biodataCompleteness?: {
        percent: number;
        is_complete: boolean;
        filled: number;
        total: number;
        missing: string[];
    };
    penyaluranProfile?: Record<string, any> | null;
    sanggars?: Array<{
        id: string | number;
        name: string;
        type?: string;
        total_students?: number;
    }>;
    penyaluranStudents?: Array<{
        student_id?: string | number;
        id?: string | number;
        name: string;
        school_name?: string;
        sanggar_name?: string;
        status?: string;
    }>;
    auth?: { user?: { name?: string } };
};

export default function Dashboard() {
    const {
        studentCount,
        penyaluranTotal,
        sanggarCount,
        sanggarSum,
        registeredCount,
        biodata,
        biodataCompleteness,
        penyaluranProfile,
        sanggars = [],
        penyaluranStudents = [],
        auth,
    } = usePage<PageProps>().props;

    const totalBinaan = penyaluranTotal ?? studentCount;
    const totalRegistered = registeredCount ?? 0;
    const unregisteredCount = Math.max(totalBinaan - totalRegistered, 0);
    const percent = biodataCompleteness?.percent ?? 0;
    const userName =
        (auth as any)?.user?.name ??
        biodata?.name ??
        penyaluranProfile?.name ??
        'Guru';
    const hour = new Date().getHours();
    const greeting =
        hour < 11
            ? 'Selamat Pagi'
            : hour < 15
              ? 'Selamat Siang'
              : hour < 19
                ? 'Selamat Sore'
                : 'Selamat Malam';
    const registrationRate = totalBinaan
        ? Math.round((totalRegistered / totalBinaan) * 100)
        : 0;

    return (
        <>
            <Head title="Dashboard Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero — brand gradient #17524A → #0f3d36 */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17524A] via-[#13423c] to-[#0e2e28] p-6 text-white shadow-xl lg:p-8">
                    <div className="absolute -top-16 -right-16 size-72 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                    <div className="absolute -bottom-20 -left-16 size-80 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(229,190,30,0.14),transparent_52%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                            <div className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur md:flex">
                                <GraduationCap className="size-7 text-[#E5BE1E]" />
                            </div>
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
                                    <Sparkles className="size-4 text-[#E5BE1E]" />
                                    {greeting}, {userName}!
                                </p>
                                <h1 className="mt-1 text-2xl font-black tracking-tight lg:text-3xl">
                                    Dashboard Guru
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                                    Kelola binaan, pantau sanggar, dan
                                    selesaikan pendaftaran OMATIQ 2026 dalam
                                    satu tempat.
                                    {penyaluranProfile?.kantor_name
                                        ? ` • ${penyaluranProfile.kantor_name}`
                                        : ''}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                                        <Building2 className="size-3.5" />{' '}
                                        {sanggarCount ?? 0} Sanggar
                                        {sanggarSum != null
                                            ? ` • ${sanggarSum} santri`
                                            : ''}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5BE1E] px-3 py-1 text-xs font-black text-[#17524A]">
                                        <Users className="size-3.5" />{' '}
                                        {totalBinaan} Binaan
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                                        <CheckCircle2 className="size-3.5 text-emerald-300" />{' '}
                                        {registrationRate}% terdaftar
                                    </span>
                                </div>
                                {/* mini progress */}
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/15">
                                        <div
                                            className="h-full rounded-full bg-[#E5BE1E] transition-all"
                                            style={{
                                                width: `${registrationRate}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-[#E5BE1E]">
                                        {totalRegistered}/{totalBinaan}{' '}
                                        terdaftar
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                            <Link
                                href={binaan.index().url}
                                prefetch
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E5BE1E] px-5 py-3 text-sm font-black text-[#17524A] shadow-lg shadow-black/10 transition hover:translate-y-[-1px] hover:bg-[#d9b01c]"
                            >
                                Kelola Binaan <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/teacher/biodata"
                                prefetch
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                            >
                                <BookOpenCheck className="size-4" />{' '}
                                {percent === 100
                                    ? 'Lihat Biodata'
                                    : 'Lengkapi Biodata'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<Users />}
                        label="Total Binaan"
                        value={totalBinaan}
                        hint={
                            penyaluranTotal != null
                                ? 'Sinkron Penyaluran'
                                : 'Data lokal'
                        }
                        accent="#17524A"
                    />
                    <StatCard
                        icon={<Building2 />}
                        label="Total Sanggar"
                        value={sanggarCount ?? 0}
                        hint={
                            sanggarSum != null
                                ? `${sanggarSum} santri total`
                                : 'Unit binaan'
                        }
                        accent="#E5BE1E"
                        darkText
                    />
                    <StatCard
                        icon={<CheckCircle2 />}
                        label="Sudah Terdaftar"
                        value={totalRegistered}
                        hint={`${registrationRate}% dari total`}
                        accent="#22c55e"
                    />
                    <StatCard
                        icon={<Award />}
                        label="Belum Terdaftar"
                        value={unregisteredCount}
                        hint="Perlu didaftarkan"
                        accent="#f97316"
                    />
                </div>

                {/* Biodata completeness */}
                {biodataCompleteness && (
                    <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 shadow-sm dark:bg-zinc-900">
                        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
                            <div className="flex gap-5">
                                <div className="relative size-20 shrink-0">
                                    <svg
                                        className="size-20 -rotate-90"
                                        viewBox="0 0 100 100"
                                    >
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="42"
                                            fill="none"
                                            stroke="currentColor"
                                            className="text-zinc-100 dark:text-zinc-800"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="42"
                                            fill="none"
                                            stroke="currentColor"
                                            className={
                                                percent === 100
                                                    ? 'text-[#17524A]'
                                                    : 'text-[#E5BE1E]'
                                            }
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${percent * 2.64} 264`}
                                            style={{
                                                transition:
                                                    'stroke-dasharray 0.6s ease',
                                            }}
                                        />
                                    </svg>
                                    <span className="absolute inset-0 grid place-items-center text-sm font-black">
                                        {percent}%
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base font-black">
                                        Kelengkapan Biodata
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {biodataCompleteness.is_complete
                                            ? 'Biodata lengkap! Kamu bisa fokus mendaftarkan binaan.'
                                            : `Masih ${biodataCompleteness.total - biodataCompleteness.filled} field lagi — lengkapi biar pendaftaran lancar.`}
                                    </p>
                                    <div className="mt-3">
                                        <Progress
                                            value={percent}
                                            className="h-1.5"
                                        />
                                    </div>
                                    {!biodataCompleteness.is_complete &&
                                        biodataCompleteness.missing.length >
                                            0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {biodataCompleteness.missing
                                                    .slice(0, 5)
                                                    .map((f) => (
                                                        <Badge
                                                            key={f}
                                                            variant="secondary"
                                                            className="rounded-full text-[10px] capitalize"
                                                        >
                                                            {f
                                                                .replace(
                                                                    '_id',
                                                                    '',
                                                                )
                                                                .replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                        </Badge>
                                                    ))}
                                                {biodataCompleteness.missing
                                                    .length > 5 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full text-[10px]"
                                                    >
                                                        +
                                                        {biodataCompleteness
                                                            .missing.length -
                                                            5}{' '}
                                                        lagi
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center gap-3 rounded-2xl bg-[#17524A]/[0.06] p-4 dark:bg-white/5">
                                <p className="text-sm font-bold">Aksi cepat</p>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href="/teacher/biodata"
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#17524A] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#14463f]"
                                    >
                                        {percent === 100
                                            ? 'Perbarui Biodata'
                                            : 'Lengkapi Sekarang'}{' '}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <Link
                                        href={binaan.index().url}
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700"
                                    >
                                        Lihat Binaan
                                    </Link>
                                </div>
                                <p className="text-xs leading-4 text-muted-foreground">
                                    Data tersinkron langsung ke Penyaluran —
                                    single source of truth. Foto & NIK valid
                                    mempercepat verifikasi.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    {/* Recent binaan */}
                    <Card className="rounded-[1.75rem] p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-black">
                                <Users className="size-4 text-[#17524A]" />{' '}
                                Binaan Terbaru
                            </h2>
                            <Link
                                href={binaan.index().url}
                                className="text-xs font-bold text-[#17524A] hover:underline"
                            >
                                Lihat semua →
                            </Link>
                        </div>
                        {penyaluranStudents.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A]">
                                    <GraduationCap className="size-6" />
                                </div>
                                <p className="mt-3 text-sm font-bold">
                                    Belum ada data Penyaluran
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Pastikan token Penyaluran valid atau
                                    tambahkan binaan manual.
                                </p>
                                <Link
                                    href={binaan.create().url}
                                    className="mt-4 inline-flex rounded-xl bg-[#17524A] px-4 py-2 text-sm font-bold text-white"
                                >
                                    Tambah Binaan
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-3">
                                {penyaluranStudents
                                    .slice(0, 5)
                                    .map((s: any, i: number) => (
                                        <div
                                            key={`${s.student_id ?? s.id ?? i}-${i}`}
                                            className="flex items-center justify-between gap-3 rounded-2xl border p-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#17524A] to-[#0e2e28] text-xs font-black text-white">
                                                    {(s.name ?? '?')
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold">
                                                        {s.name}
                                                    </p>
                                                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                        <MapPin className="size-3 shrink-0" />{' '}
                                                        {s.sanggar_name ??
                                                            s.school_name ??
                                                            '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 rounded-full"
                                            >
                                                {s.status ?? 'aktif'}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </Card>

                    {/* Sanggar & quick actions */}
                    <div className="flex flex-col gap-6">
                        <Card className="rounded-[1.75rem] bg-gradient-to-br from-[#E5BE1E]/15 via-transparent to-[#17524A]/5 p-6">
                            <h2 className="flex items-center gap-2 text-base font-black">
                                <Building2 className="size-4 text-[#17524A]" />{' '}
                                Sanggar
                            </h2>
                            {sanggars.length === 0 ? (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Belum ada sanggar terhubung.
                                </p>
                            ) : (
                                <div className="mt-4 grid gap-2">
                                    {sanggars.slice(0, 3).map((sg) => (
                                        <div
                                            key={String(sg.id)}
                                            className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-sm dark:bg-zinc-900"
                                        >
                                            <span className="font-semibold">
                                                {sg.name}
                                            </span>
                                            <span className="rounded-full bg-[#17524A]/10 px-2.5 py-1 text-xs font-bold text-[#17524A]">
                                                {sg.total_students != null
                                                    ? `${sg.total_students} santri`
                                                    : (sg.type ?? 'sanggar')}
                                            </span>
                                        </div>
                                    ))}
                                    {sanggars.length > 3 && (
                                        <p className="text-xs text-muted-foreground">
                                            +{sanggars.length - 3} sanggar
                                            lainnya
                                        </p>
                                    )}
                                </div>
                            )}
                            <Link
                                href={sanggarRoute.index().url}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17524A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f3d36]"
                            >
                                Lihat Sanggar <ArrowRight className="size-4" />
                            </Link>
                        </Card>

                        <Card className="rounded-[1.75rem] border-dashed p-6">
                            <h3 className="font-black">Aksi Cepat</h3>
                            <div className="mt-4 grid gap-3">
                                <QuickAction
                                    title="Daftarkan Binaan"
                                    desc="Pilih binaan → olimpiade"
                                    href={dataPeserta.create().url}
                                    icon={<BookOpenCheck className="size-4" />}
                                    accent="#17524A"
                                />
                                <QuickAction
                                    title="Data Peserta"
                                    desc="Cek status pendaftaran"
                                    href={dataPeserta.index().url}
                                    icon={<CheckCircle2 className="size-4" />}
                                    accent="#E5BE1E"
                                    dark
                                />
                                <QuickAction
                                    title="Absensi"
                                    desc="Rekap kehadiran santri"
                                    href="/admin/absensi"
                                    icon={<Award className="size-4" />}
                                    accent="#0ea5e9"
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Next step CTA */}
                <Card className="rounded-[1.75rem] border-dashed bg-gradient-to-br from-[#E5BE1E]/10 via-transparent to-[#17524A]/5 p-6 lg:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#17524A] text-white">
                                <BookOpenCheck className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-black">
                                    Siap daftarkan binaan?
                                </h2>
                                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                                    Pilih binaan yang{' '}
                                    <span className="font-semibold text-[#17524A]">
                                        belum terdaftar
                                    </span>
                                    , pilih kategori olimpiade, dan submit —
                                    status otomatis{' '}
                                    <span className="font-semibold text-emerald-600">
                                        verified
                                    </span>{' '}
                                    karena sudah terverifikasi Penyaluran.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={binaan.index().url}
                            prefetch
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17524A] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#0f3d36]"
                        >
                            Buka Daftar Binaan <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </Card>
            </div>
        </>
    );
}

const StatCard = ({
    icon,
    label,
    value,
    hint,
    accent,
    darkText,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    hint: string;
    accent: string;
    darkText?: boolean;
}) => (
    <Card className="group relative overflow-hidden rounded-[1.5rem] border-0 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900">
        <div
            className="absolute top-0 right-0 size-24 rounded-full opacity-10 blur-2xl"
            style={{ background: accent }}
        />
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                    {value.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {hint}
                </p>
            </div>
            <div
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{
                    background: accent,
                    color: darkText ? '#17524A' : 'white',
                }}
            >
                <span className="[&>svg]:size-6">{icon}</span>
            </div>
        </div>
    </Card>
);

const QuickAction = ({
    title,
    desc,
    href,
    icon,
    accent,
    dark,
}: {
    title: string;
    desc: string;
    href: string;
    icon: ReactNode;
    accent: string;
    dark?: boolean;
}) => (
    <Link
        href={href}
        prefetch
        className="group flex items-center gap-3 rounded-2xl border bg-white p-3 transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
        <div
            className="flex size-10 items-center justify-center rounded-xl text-white"
            style={{ background: accent, color: dark ? '#17524A' : 'white' }}
        >
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-[#17524A]" />
    </Link>
);

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
    ],
};
