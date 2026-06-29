import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import olimpiadeSchedules from '@/routes/admin/companies/olimpiade-schedules';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

export default function ShowPage() {
    const { schedule } = usePage<{ schedule: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Jadwal Olimpiade</h1>
                    <p className="text-sm text-muted-foreground">{schedule.title}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button onClick={() => router.visit(olimpiadeSchedules.edit(schedule.id).url)}>
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="max-w-4xl space-y-5 p-5">
                <Detail label="Judul" value={schedule.title} />
                <Detail label="Olimpiade" value={schedule.olimpiade?.name} />
                <div className="grid gap-5 sm:grid-cols-3">
                    <Detail label="Fase" value={schedule.phase} />
                    <Detail label="Mulai" value={formatDate(schedule.start_date)} />
                    <Detail label="Selesai" value={formatDate(schedule.end_date)} />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                    <Detail label="Lokasi" value={schedule.location} />
                    <Detail label="Urutan" value={schedule.sort_order} />
                    <Detail label="Status" value={schedule.status ? 'Aktif' : 'Nonaktif'} />
                </div>
                <Detail label="Deskripsi" value={schedule.description} />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail label="Label CTA" value={schedule.action_label} />
                    <Detail label="URL CTA" value={schedule.action_url} />
                </div>
            </Card>
        </div>
    );
}

const Detail = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">{value ?? '-'}</p>
    </div>
);
