import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import olimpiades from '@/routes/admin/companies/olimpiades';
import participants from '@/routes/admin/companies/participants';
import teachers from '@/routes/admin/companies/teachers';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    ExternalLink,
    GraduationCap,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

export default function Dashboard() {
    const {
        participantCount = 0,
        verifiedParticipantCount = 0,
        submittedParticipantCount = 0,
        teacherCount = 0,
        studentCount = 0,
        olimpiadeCount = 0,
    } = usePage<{
        participantCount?: number;
        verifiedParticipantCount?: number;
        submittedParticipantCount?: number;
        teacherCount?: number;
        studentCount?: number;
        olimpiadeCount?: number;
    }>().props;

    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="rounded-3xl border bg-gradient-to-br from-background via-orange-50/70 to-sky-50 p-5 shadow-sm lg:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                <Trophy className="size-4" />
                                Ringkasan Operasional
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                Dashboard Admin
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Pantau peserta, guru, binaan, dan kategori
                                olimpiade dalam tampilan yang ringkas.
                            </p>
                        </div>

                        <Link href={participants.index().url} prefetch>
                            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                                Kelola Peserta
                                <ExternalLink className="size-4" />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <MetricCard
                        icon={<Users className="size-6" />}
                        label="Total Peserta"
                        value={participantCount}
                        description="Seluruh pendaftaran OMATIQ"
                    />
                    <MetricCard
                        icon={<CheckCircle2 className="size-6" />}
                        label="Peserta Terverifikasi"
                        value={verifiedParticipantCount}
                        description="Pendaftaran yang sudah divalidasi"
                    />
                    <MetricCard
                        icon={<ClipboardList className="size-6" />}
                        label="Menunggu Verifikasi"
                        value={submittedParticipantCount}
                        description="Perlu ditinjau oleh admin"
                    />
                    <MetricCard
                        icon={<UserCheck className="size-6" />}
                        label="Total Guru"
                        value={teacherCount}
                        description="Akun guru yang terhubung"
                    />
                    <MetricCard
                        icon={<GraduationCap className="size-6" />}
                        label="Total Binaan"
                        value={studentCount}
                        description="Binaan yang tersimpan di sistem"
                    />
                    <MetricCard
                        icon={<Trophy className="size-6" />}
                        label="Total Olimpiade"
                        value={olimpiadeCount}
                        description="Kategori/event olimpiade"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <QuickLink
                        title="Data Peserta"
                        description="Validasi status dan kelengkapan pendaftaran."
                        href={participants.index().url}
                    />
                    <QuickLink
                        title="Data Guru"
                        description="Lihat akun guru dan koneksi Penyaluran."
                        href={teachers.index().url}
                    />
                    <QuickLink
                        title="Olimpiade"
                        description="Kelola kategori, konten, dan jadwal OMATIQ."
                        href={olimpiades.index().url}
                    />
                </div>
            </div>
        </>
    );
}

const MetricCard = ({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
}) => (
    <Card className="rounded-3xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                    {value.toLocaleString('id-ID')}
                </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {icon}
            </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {description}
        </p>
    </Card>
);

const QuickLink = ({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href: string;
}) => (
    <Link href={href} prefetch>
        <Card className="h-full rounded-3xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-accent hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-bold">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </div>
        </Card>
    </Link>
);

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
