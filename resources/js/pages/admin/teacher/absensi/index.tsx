import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

export default function AbsensiPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <h1 className="text-2xl font-bold">Absensi</h1>
            <Card className="p-6">
                <p className="text-muted-foreground">Fitur absensi binaan per sanggar — segera hadir.</p>
                <p className="mt-2 text-sm text-muted-foreground">Rencana: rekap kehadiran santri per pertemuan sanggar.</p>
            </Card>
        </div>
    );
}

AbsensiPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Absensi', href: route('admin.teacher.absensi.index') },
    ],
};
