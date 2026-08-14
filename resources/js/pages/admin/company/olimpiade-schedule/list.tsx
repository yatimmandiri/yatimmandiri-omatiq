import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowHeader,
    renderRowParagraph,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import olimpiadeSchedules from '@/routes/admin/companies/olimpiade-schedules';
import { router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

const phaseLabels: Record<string, string> = {
    registration: 'Registrasi',
    technical_meeting: 'Technical Meeting',
    preliminary: 'Penyisihan',
    knockout: 'Knockout',
    semifinal: 'Semifinal',
    final: 'Final',
    announcement: 'Pengumuman',
};

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Jadwal'),
            accessorKey: 'title',
            cell: (info: any) => (
                <div className="space-y-1">
                    <p className="font-semibold">{info.getValue()}</p>
                    <p className="text-xs text-muted-foreground">
                        {info.row.original.olimpiade?.name ?? '-'}
                    </p>
                </div>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Fase'),
            accessorKey: 'phase',
            cell: (info: any) => (
                <Badge variant="secondary">
                    <CalendarDays />
                    {phaseLabels[info.getValue()] ?? info.getValue()}
                </Badge>
            ),
        },
        {
            header: 'Tanggal',
            accessorKey: 'start_date',
            cell: (info: any) => {
                const row = info.row.original;

                return (
                    <span className="text-sm font-medium">
                        {formatDate(row.start_date)}
                        {row.end_date ? ` - ${formatDate(row.end_date)}` : ''}
                    </span>
                );
            },
        },
        {
            header: 'Lokasi',
            accessorKey: 'location',
            cell: (info: any) => renderRowParagraph(info.getValue() ?? '-'),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Urutan'),
            accessorKey: 'sort_order',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Status'),
            accessorKey: 'status',
            cell: (info: any) => (
                <Badge
                    variant={info.getValue() ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() =>
                        router.put(
                            olimpiadeSchedules.status(info.row.original.id).url,
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => setRefreshData(true),
                            },
                        )
                    }
                >
                    {info.getValue() ? <CheckCircle2 /> : <XCircle />}
                    {info.getValue() ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={{}}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={olimpiadeSchedules.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Jadwal: item.title,
                            Olimpiade: item.olimpiade?.name || '-',
                            Fase: phaseLabels[item.phase] ?? item.phase,
                            Mulai: formatDate(item.start_date),
                            Selesai: formatDate(item.end_date),
                            Status: item.status ? 'Aktif' : 'Nonaktif',
                        }))
                    }
                >
                    <DataTableComponent />
                </DataTableProvider>
            </div>
        </div>
    );
}
