import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import periods from '@/routes/admin/companies/periods';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Pencil,
    Trophy,
    Users,
    XCircle,
} from 'lucide-react';

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

export default function ShowPage() {
    const { period } = usePage<{ period: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Periode</h1>
                    <p className="text-sm text-muted-foreground">
                        {period.name} ({period.year})
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                    <Button
                        onClick={() =>
                            router.visit(periods.edit(period.id).url)
                        }
                    >
                        <Pencil className="size-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <Card className="space-y-5 p-6">
                    <div className="flex items-center gap-2 border-b pb-4">
                        <CalendarDays className="size-5 text-primary" />
                        <h2 className="text-lg font-semibold">
                            Informasi Periode
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Detail label="Nama Periode" value={period.name} />
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Tahun Event
                            </p>
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className="text-sm font-bold"
                                >
                                    {period.year}
                                </Badge>
                            </div>
                        </div>
                        <Detail
                            label="Tanggal Mulai"
                            value={formatDate(period.start_date)}
                        />
                        <Detail
                            label="Tanggal Selesai"
                            value={formatDate(period.end_date)}
                        />
                    </div>

                    <Detail
                        label="Deskripsi / Catatan"
                        value={period.description}
                    />
                </Card>

                <Card className="h-fit space-y-5 p-6">
                    <h2 className="border-b pb-4 text-lg font-semibold">
                        Status & Statistik
                    </h2>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Status Aktivasi
                        </p>
                        <div className="mt-2">
                            <Badge
                                variant={
                                    period.is_active ? 'default' : 'secondary'
                                }
                                className="gap-1"
                            >
                                {period.is_active ? (
                                    <CheckCircle2 className="size-3.5" />
                                ) : (
                                    <XCircle className="size-3.5" />
                                )}
                                {period.is_active
                                    ? 'Periode Aktif'
                                    : 'Nonaktif'}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Trophy className="size-4 text-primary" />
                                <span>Total Olimpiade</span>
                            </div>
                            <span className="text-base font-bold">
                                {period.olimpiades_count ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4 text-primary" />
                                <span>Total Peserta</span>
                            </div>
                            <span className="text-base font-bold">
                                {period.participants_count ?? 0}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
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
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">
            {value || '-'}
        </p>
    </div>
);
