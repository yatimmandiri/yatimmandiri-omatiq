import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import masterSanggar from '@/routes/admin/teacher/master/sanggar';
import { usePage } from '@inertiajs/react';

export default function ShowPage() {
    const { sanggar } = usePage<{ sanggar: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Card className="space-y-4 p-6">
                <h2 className="text-lg font-bold">Detail Sanggar</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Nama</p>
                        <p className="text-sm">{sanggar.name ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Tipe</p>
                        <p className="text-sm">{sanggar.type ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Kantor</p>
                        <p className="text-sm">{sanggar.kantor_name ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Total Santri</p>
                        <p className="text-sm">{sanggar.total_students ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Alamat</p>
                        <p className="text-sm">{sanggar.address ?? '-'}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Sanggar', href: masterSanggar.index().url },
        { title: 'Detail Sanggar', href: '#' },
    ],
};
