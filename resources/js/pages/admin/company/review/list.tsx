import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowHeader,
    renderRowParagraph,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import reviews from '@/routes/admin/companies/reviews';
import { router } from '@inertiajs/react';
import { CheckCircle2, Star, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: 'Avatar',
            accessorKey: 'avatar_url',
            cell: (info: any) =>
                info.getValue() ? (
                    <img
                        src={info.getValue()}
                        alt={info.row.original.name}
                        className="h-12 w-12 rounded-xl object-cover"
                    />
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Nama'),
            accessorKey: 'name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Peran'),
            accessorKey: 'role',
        },
        {
            header: 'Ulasan',
            accessorKey: 'quote',
            cell: (info: any) => renderRowParagraph(info.getValue()),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Rating'),
            accessorKey: 'rating',
            cell: (info: any) => (
                <span className="flex items-center gap-1 font-semibold">
                    {info.getValue()}
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                </span>
            ),
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
                            reviews.status(info.row.original.id).url,
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
        {
            header: (info: any) => renderRowHeader(info, 'Urutan'),
            accessorKey: 'sort_order',
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
                    urlFetchData={reviews.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Nama: item.name,
                            Peran: item.role,
                            Rating: item.rating,
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
