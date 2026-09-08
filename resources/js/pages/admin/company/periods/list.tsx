import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import periods from '@/routes/admin/companies/periods';
import { formatDate } from '@/utils/formatDate';
import { router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Trophy,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const formatDisplayDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const [filterValue] = useState({});

    const toggleStatus = (url: string) => {
        router.put(
            url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRefreshData(true),
            },
        );
    };

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Tahun'),
            accessorKey: 'year',
            cell: (info: any) => (
                <Badge
                    variant="outline"
                    className="px-2.5 py-1 text-sm font-bold"
                >
                    <CalendarDays className="mr-1 size-3.5" />
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Nama Periode'),
            accessorKey: 'name',
            cell: (info: any) => {
                const row = info.row.original;

                return (
                    <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">
                            {row.name}
                        </p>
                        {row.description && (
                            <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                                {row.description}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Rentang Waktu',
            accessorKey: 'start_date',
            cell: (info: any) => {
                const row = info.row.original;

                if (!row.start_date && !row.end_date) {
                    return (
                        <span className="text-sm text-muted-foreground">-</span>
                    );
                }

                return (
                    <span className="text-sm font-medium">
                        {formatDisplayDate(row.start_date)}
                        {row.end_date
                            ? ` s/d ${formatDisplayDate(row.end_date)}`
                            : ''}
                    </span>
                );
            },
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiades_count',
            cell: (info: any) => (
                <Badge variant="secondary" className="gap-1 font-medium">
                    <Trophy className="size-3" />
                    {info.getValue() ?? 0}
                </Badge>
            ),
        },
        {
            header: 'Peserta',
            accessorKey: 'participants_count',
            cell: (info: any) => (
                <Badge variant="secondary" className="gap-1 font-medium">
                    <Users className="size-3" />
                    {info.getValue() ?? 0}
                </Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Status Aktivasi'),
            accessorKey: 'is_active',
            cell: (info: any) => (
                <Badge
                    variant={info.getValue() ? 'default' : 'secondary'}
                    className="cursor-pointer gap-1"
                    onClick={() =>
                        toggleStatus(periods.status(info.row.original.id).url)
                    }
                >
                    {info.getValue() ? (
                        <CheckCircle2 className="size-3.5" />
                    ) : (
                        <XCircle className="size-3.5" />
                    )}
                    {info.getValue() ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
    ];

    const formatDataExport = (items: any[]) =>
        items.map((item, index) => ({
            No: index + 1,
            Tahun: item.year,
            Nama: item.name,
            Mulai: formatDisplayDate(item.start_date),
            Selesai: formatDisplayDate(item.end_date),
            Olimpiade: item.olimpiades_count ?? 0,
            Peserta: item.participants_count ?? 0,
            Status: item.is_active ? 'Aktif' : 'Nonaktif',
            Dibuat: formatDate(item.created_at),
        }));

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={periods.data().url}
                    formatDataExport={formatDataExport}
                >
                    <DataTableComponent />
                </DataTableProvider>
            </div>
        </div>
    );
}
