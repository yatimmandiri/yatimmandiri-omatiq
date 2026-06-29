import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowHeader,
    renderRowParagraph,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import galleries from '@/routes/admin/companies/olimpiade-galleries';
import objectives from '@/routes/admin/companies/olimpiade-objectives';
import videos from '@/routes/admin/companies/olimpiade-videos';
import { router } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

type Kind = 'objective' | 'gallery' | 'video';
const configs = {
    objective: { routes: objectives, description: 'text' },
    gallery: { routes: galleries, description: 'caption' },
    video: { routes: videos, description: 'description' },
};

export function OlimpiadeDocumentationList({ kind }: { kind: Kind }) {
    const [refreshData, setRefreshData] = useState(false);
    const config = configs[kind];
    const columns: any[] = [
        ...(kind === 'gallery'
            ? [
                  {
                      header: 'Gambar',
                      accessorKey: 'image_src',
                      cell: (info: any) => (
                          <img
                              src={info.getValue()}
                              alt={info.row.original.title || 'Gallery'}
                              className="h-12 w-16 rounded-md object-cover"
                          />
                      ),
                  },
              ]
            : []),
        {
            header: (info: any) => renderRowHeader(info, 'Judul'),
            accessorKey: 'title',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade',
            cell: (info: any) =>
                info.getValue()?.name ?? (
                    <span className="text-muted-foreground">
                        Belum ditugaskan
                    </span>
                ),
        },
        {
            header: 'Deskripsi',
            accessorKey: config.description,
            cell: (info: any) => renderRowParagraph(info.getValue() || '-'),
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
                            config.routes.status(info.row.original.id).url,
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
                    urlFetchData={config.routes.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Judul: item.title || '-',
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
