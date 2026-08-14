import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowHeader,
    renderRowParagraph,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import sliders from '@/routes/admin/companies/sliders';
import { router } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: 'Gambar',
            accessorKey: 'featured_image_url',
            cell: (info: any) =>
                info.getValue() ? (
                    <img
                        src={info.getValue()}
                        alt={info.row.original.title}
                        className="h-14 w-24 rounded-md object-cover"
                    />
                ) : (
                    '-'
                ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Judul'),
            accessorKey: 'title',
        },
        {
            header: 'Subjudul',
            accessorKey: 'subtitle',
            cell: (info: any) => renderRowParagraph(info.getValue()),
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade',
            cell: (info: any) => info.getValue()?.name ?? '-',
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
                            sliders.status(info.row.original.id).url,
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
                    urlFetchData={sliders.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Judul: item.title,
                            Olimpiade: item.olimpiade?.name || '-',
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
