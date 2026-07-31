import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import olimpiades from '@/routes/admin/companies/olimpiades';
import { formatDate } from '@/utils/formatDate';
import { router } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

const imageUrl = (value?: string | null) => {
    if (!value) {
return null;
}

    return value.startsWith('http://') || value.startsWith('https://')
        ? value
        : '/storage/' + value;
};

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const [filterValue] = useState({});

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
            Nama: item.name,
            Kategori: item.category,
            Status: item.status ? 'Aktif' : 'Nonaktif',
            Rekomendasi: item.recommended ? 'Ya' : 'Tidak',
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
                    urlFetchData={olimpiades.data().url}
                    formatDataExport={formatDataExport}
                >
                    <DataTableComponent />
                </DataTableProvider>
            </div>
        </div>
    );
}
