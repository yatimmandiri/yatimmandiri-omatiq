import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import masterBinaan from '@/routes/admin/teacher/master/binaan';
import { usePage } from '@inertiajs/react';

export default function ShowPage() {
    const { binaan } = usePage<{ binaan: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Card className="space-y-4 p-6">
                <h2 className="text-lg font-bold">Detail Binaan</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Nama</p>
                        <p className="text-sm">{binaan.name ?? binaan.full_name ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">NIK</p>
                        <p className="text-sm">{binaan.nik ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">NIS</p>
                        <p className="text-sm">{binaan.nis ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Sekolah</p>
                        <p className="text-sm">{binaan.school_name ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Kelas</p>
                        <p className="text-sm">{binaan.class ?? binaan.grade ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Jenis Kelamin</p>
                        <p className="text-sm">{binaan.gender ?? '-'}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Binaan', href: masterBinaan.index().url },
        { title: 'Detail Binaan', href: '#' },
    ],
};
