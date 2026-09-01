import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import binaan from '@/routes/admin/guru/data-binaan';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    Building2,
    CheckCircle2,
    ExternalLink,
    UserPlus,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

export default function Dashboard() {
    const {
        studentCount,
        penyaluranTotal,
        sanggarCount,
        registeredCount,
    } = usePage<{
        studentCount: number;
        penyaluranTotal?: number | null;
        sanggarCount?: number;
        registeredCount?: number;
    }>().props;

    const totalBinaan = penyaluranTotal ?? studentCount;
    const totalRegistered = registeredCount ?? 0;
    const unregisteredCount = Math.max(totalBinaan - totalRegistered, 0);

    return (
        <>
            <Head title="Dashboard Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="rounded-3xl border bg-gradient-to-br from-background via-orange-50/70 to-sky-50 p-5 shadow-sm lg:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                <BookOpenCheck className="size-4" />
                                Ringkasan OMATIQ
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                Dashboard Guru
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Pantau jumlah binaan, sanggar, dan progress
                                pendaftaran OMATIQ dari satu tampilan yang
                                ringkas.
                            </p>
                        </div>

                        <Link href={binaan.index().url} prefetch>
                            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                                Kelola Binaan
                                <ExternalLink className="size-4" />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={<Users className="size-6" />}
                        label="Total Binaan"
                        value={totalBinaan}

                    />
                    <MetricCard
                        icon={<Building2 className="size-6" />}
                        label="Total Sanggar"
                        value={sanggarCount ?? 0}
                    />
                    <MetricCard
                        icon={<CheckCircle2 className="size-6" />}
                        label="Sudah Terdaftar"
                        value={totalRegistered}
                    />
                    <MetricCard
                        icon={<UserPlus className="size-6" />}
                        label="Belum Terdaftar"
                        value={unregisteredCount}
                    />
                </div>

                <Card className="rounded-3xl p-5 shadow-sm lg:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold">
                                Langkah Berikutnya
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Buka daftar binaan untuk melihat status dan
                                mendaftarkan anak ke kategori olimpiade.
                            </p>
                        </div>
                        <Link href={binaan.index().url} prefetch>
                            <div className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-accent">
                                Lihat Daftar Binaan
                                <ExternalLink className="size-4" />
                            </div>
                        </Link>
                    </div>
                </Card>
            </div>
        </>
    );
}

const MetricCard = ({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
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
    </Card>
);

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
