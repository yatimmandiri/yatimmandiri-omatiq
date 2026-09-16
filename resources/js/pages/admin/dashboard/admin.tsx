import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import olimpiades from '@/routes/admin/companies/olimpiades';
import participants from '@/routes/admin/companies/participants';
import teachers from '@/routes/admin/companies/teachers';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Sparkles,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

export default function Dashboard() {
    const {
        pageTitle = 'Dashboard Admin',
        branchName,
        participantCount = 0,
        verifiedParticipantCount = 0,
        submittedParticipantCount = 0,
        teacherCount = 0,
        studentCount = 0,
        olimpiadeCount = 0,
    } = usePage<{
        pageTitle?: string;
        branchName?: string | null;
        participantCount?: number;
        verifiedParticipantCount?: number;
        submittedParticipantCount?: number;
        teacherCount?: number;
        studentCount?: number;
        olimpiadeCount?: number;
    }>().props;

    const verificationRate = participantCount
        ? Math.round((verifiedParticipantCount / participantCount) * 100)
        : 0;

    return (
        <>
            <Head title={pageTitle} />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17524A] via-[#13423c] to-[#0e2e28] p-6 text-white shadow-xl lg:p-8">
                    <div className="absolute -top-20 -right-20 size-72 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
                                <Sparkles className="size-4 text-[#E5BE1E]" />{' '}
                                {branchName ? `Cabang ${branchName}` : 'Kontrol OMATIQ 2026'}
                            </p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">
                                {pageTitle}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                {branchName
                                    ? `Pantau pendaftaran santri, verifikasi peserta, dan guru binaan wilayah ${branchName}.`
                                    : 'Pantau pendaftaran, verifikasi, guru, dan olimpiade — semua dalam satu command center.'}
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                                    <div
                                        className="h-full rounded-full bg-[#E5BE1E]"
                                        style={{
                                            width: `${verificationRate}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-[#E5BE1E]">
                                    {verificationRate}% terverifikasi
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={participants.index().url}
                                prefetch
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#E5BE1E] px-6 py-3 text-sm font-black text-[#17524A] shadow-lg hover:bg-[#d9b01c]"
                            >
                                Kelola Peserta <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href={teachers.index().url}
                                prefetch
                                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                            >
                                Data Guru
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <Metric
                        label="Total Peserta"
                        value={participantCount}
                        sub="Semua pendaftaran"
                        icon={<Users />}
                        accent="#17524A"
                    />
                    <Metric
                        label="Terverifikasi"
                        value={verifiedParticipantCount}
                        sub={`${verificationRate}% dari total`}
                        icon={<CheckCircle2 />}
                        accent="#22c55e"
                    />
                    <Metric
                        label="Menunggu Verifikasi"
                        value={submittedParticipantCount}
                        sub="Perlu ditinjau"
                        icon={<ClipboardList />}
                        accent="#f59e0b"
                    />
                    <Metric
                        label="Total Guru"
                        value={teacherCount}
                        sub="Akun terhubung"
                        icon={<UserCheck />}
                        accent="#0ea5e9"
                    />
                    <Metric
                        label="Total Binaan"
                        value={studentCount}
                        sub="Is_binaan = true"
                        icon={<GraduationCap />}
                        accent="#8b5cf6"
                    />
                    <Metric
                        label="Olimpiade"
                        value={olimpiadeCount}
                        sub="Kategori aktif"
                        icon={<Trophy />}
                        accent="#E5BE1E"
                        dark
                    />
                </div>

                {/* Quick links */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Quick
                        title="Data Peserta"
                        desc="Validasi pembayaran & status pendaftaran."
                        href={participants.index().url}
                        icon={<Users className="size-5" />}
                    />
                    <Quick
                        title="Data Guru"
                        desc="Koneksi Penyaluran & reset password."
                        href={teachers.index().url}
                        icon={<GraduationCap className="size-5" />}
                    />
                    <Quick
                        title="Olimpiade"
                        desc="Kategori, jadwal, dan konten."
                        href={olimpiades.index().url}
                        icon={<Trophy className="size-5" />}
                    />
                </div>
            </div>
        </>
    );
}

const Metric = ({
    label,
    value,
    sub,
    icon,
    accent,
    dark,
}: {
    label: string;
    value: number;
    sub: string;
    icon: ReactNode;
    accent: string;
    dark?: boolean;
}) => (
    <Card className="group relative overflow-hidden rounded-[1.5rem] border-0 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900">
        <div
            className="absolute top-0 right-0 size-28 rounded-full opacity-[0.08] blur-2xl"
            style={{ background: accent }}
        />
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                    {value.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {sub}
                </p>
            </div>
            <div
                className="flex size-11 items-center justify-center rounded-2xl text-white shadow"
                style={{ background: accent, color: dark ? '#17524A' : '#fff' }}
            >
                <span className="[&>svg]:size-5">{icon}</span>
            </div>
        </div>
    </Card>
);

const Quick = ({
    title,
    desc,
    href,
    icon,
}: {
    title: string;
    desc: string;
    href: string;
    icon: ReactNode;
}) => (
    <Link href={href} prefetch className="group">
        <Card className="flex h-full flex-col justify-between rounded-[1.5rem] bg-white p-5 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md dark:bg-zinc-900">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A] group-hover:bg-[#17524A] group-hover:text-white">
                    {icon}
                </div>
                <h3 className="font-black">{title}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {desc}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#17524A] group-hover:gap-2">
                Buka <ArrowRight className="size-4" />
            </span>
        </Card>
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
