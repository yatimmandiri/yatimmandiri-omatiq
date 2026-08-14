import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ExternalLink, Users } from 'lucide-react';

export default function Dashboard() {
    const { studentCount } = usePage<{ studentCount: number }>().props;

    return (
        <>
            <Head title="Dashboard Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Guru</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola data murid binaan Anda
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex items-center gap-4 p-5">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <Users className="size-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{studentCount}</p>
                            <p className="text-sm text-muted-foreground">Total Murid</p>
                        </div>
                    </Card>

                    <Link href={teacherStudents.index().url} prefetch>
                        <Card className="flex items-center gap-4 p-5 transition-colors hover:bg-accent">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="size-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Kelola Murid</p>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    Lihat daftar murid <ExternalLink className="size-3" />
                                </p>
                            </div>
                        </Card>
                    </Link>
                </div>
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