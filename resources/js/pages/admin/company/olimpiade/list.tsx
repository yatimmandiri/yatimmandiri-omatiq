import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import olimpiades from '@/routes/admin/companies/olimpiades';
import { formatDate } from '@/utils/formatDate';
import { router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Filter,
    RotateCcw,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const imageUrl = (value?: string | null) => {
    if (!value) {
        return null;
    }

    return value.startsWith('http://') || value.startsWith('https://')
        ? value
        : '/storage/' + value;
};

type PeriodItem = {
    id: number;
    name: string;
    year: number;
    is_active: boolean;
};

export default function ListPage() {
    const { filterOptions } = usePage<{
        filterOptions?: {
            periods?: PeriodItem[];
            currentYear?: number;
        };
    }>().props;

    const [refreshData, setRefreshData] = useState(false);
    const [filterValue, setFilterValue] = useState<Record<string, string>>({});

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const toggle = (url: string) => {
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
            accessorKey: 'event_year',
            cell: (info: any) => (
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-xs font-semibold"
                >
                    <CalendarDays className="mr-1 size-3" />
                    {info.getValue() || info.row.original.period?.year || '-'}
                </Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Nama'),
            accessorKey: 'name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Kategori'),
            accessorKey: 'category',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Gambar'),
            accessorKey: 'featured_image',
            cell: (info: any) => {
                const url = imageUrl(info.getValue());

                return url ? (
                    <img
                        src={url}
                        alt={info.row.original.name}
                        className="h-12 w-16 rounded-md object-cover"
                    />
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Status'),
            accessorKey: 'status',
            cell: (info: any) => (
                <Badge
                    variant={info.getValue() ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() =>
                        toggle(olimpiades.status(info.row.original.id).url)
                    }
                >
                    {info.getValue() ? <CheckCircle2 /> : <XCircle />}
                    {info.getValue() ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Rekomendasi'),
            accessorKey: 'recommended',
            cell: (info: any) => (
                <Badge
                    variant={info.getValue() ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                        toggle(olimpiades.recommended(info.row.original.id).url)
                    }
                >
                    {info.getValue() ? 'Ya' : 'Tidak'}
                </Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Urutan'),
            accessorKey: 'sort_order',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Dibuat'),
            accessorKey: 'created_at',
            cell: (info: any) => renderRowDate(info.getValue()),
        },
    ];

    const formatDataExport = (items: any[]) =>
        items.map((item, index) => ({
            No: index + 1,
            Tahun: item.event_year ?? item.period?.year ?? '-',
            Nama: item.name,
            Kategori: item.category,
            Status: item.status ? 'Aktif' : 'Nonaktif',
            Rekomendasi: item.recommended ? 'Ya' : 'Tidak',
            Dibuat: formatDate(item.created_at),
        }));

    const periodOptions = (filterOptions?.periods ?? []).map((p) => ({
        value: String(p.year),
        label: `${p.name} (${p.year})${p.is_active ? ' • Aktif' : ''}`,
    }));

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {periodOptions.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Filter className="size-4 text-primary" />
                            <span>Filter Periode:</span>
                        </div>
                        <div className="w-64">
                            <SelectComponent
                                placeholder="Semua Periode"
                                options={periodOptions}
                                value={filterValue.event_year ?? ''}
                                onValueChange={(val: string) => {
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        event_year: val,
                                    }));
                                    setRefreshData(true);
                                }}
                            />
                        </div>
                        {hasActiveFilter && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterValue({});
                                    setRefreshData(true);
                                }}
                                className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="size-3.5" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={olimpiades.data().url}
                    formatDataExport={formatDataExport}
                >
                    <DataTableComponent />
                </DataTableProvider>
            </div>
        </div>
    );
}
