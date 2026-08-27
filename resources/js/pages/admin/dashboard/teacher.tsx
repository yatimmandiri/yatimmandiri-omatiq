import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ExternalLink, Users } from 'lucide-react';

export default function Dashboard() {
    const { studentCount, sanggarSum, overlapCount, penyaluranProfile, sanggars, penyaluranStudents } = usePage<{
        studentCount: number;
        sanggarSum?: number | null;
        overlapCount?: number | null;
        penyaluranProfile?: Record<string, any> | null;
        sanggars?: Array<Record<string, any>>;
        penyaluranStudents?: Array<Record<string, any>>;
    }>().props;

    return (
        <>
            <Head title="Dashboard Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Guru</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola data binaan Anda
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex items-center gap-4 p-5">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <Users className="size-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{studentCount}</p>
                            <p className="text-sm text-muted-foreground">
                                Total Binaan (unik)
                            </p>
                            {penyaluranProfile?.kantor_name && (
                                <p className="text-xs text-muted-foreground">
                                    Kantor: {penyaluranProfile.kantor_name}
                                </p>
                            )}
                            {overlapCount !== null && overlapCount > 0 && (
                                <p className="text-xs text-amber-600">
                                    {overlapCount} binaan terdata di &gt;1 sanggar
                                </p>
                            )}
                            {sanggarSum !== null && sanggarSum !== studentCount && (
                                <p className="text-xs text-muted-foreground">
                                    Total di sanggar: {sanggarSum}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Link href={teacherStudents.index().url} prefetch>
                        <Card className="flex items-center gap-4 p-5 transition-colors hover:bg-accent">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="size-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Kelola Binaan</p>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    Lihat daftar binaan{' '}
                                    <ExternalLink className="size-3" />
                                </p>
                            </div>
                        </Card>
                    </Link>

                    {penyaluranProfile && (
                        <Card className="p-5">
                            <p className="text-sm font-semibold">
                                {penyaluranProfile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {penyaluranProfile.code} •{' '}
                                {penyaluranProfile.positions?.[0]?.name ?? '-'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                HP: {penyaluranProfile.phone ?? '-'}
                            </p>
                        </Card>
                    )}
                </div>

                {sanggars && sanggars.length > 0 && (
                    <Card className="p-5">
                        <h3 className="mb-3 font-semibold">Sanggar</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {sanggars.map((s: any) => (
                                <Link
                                    key={s.id}
                                    href={
                                        teacherStudents.index({
                                            query: { sanggar_id: String(s.id) },
                                        }).url
                                    }
                                    prefetch
                                >
                                    <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                                        <p className="font-medium">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {s.type} • {s.kantor_name} •{' '}
                                            {s.total_students} santri
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
