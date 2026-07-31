import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowHeader,
    renderRowParagraph,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import faqCompanies from '@/routes/admin/companies/faq-companies';
import { router } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Pertanyaan'),
            accessorKey: 'question',
        },
        {
            header: 'Jawaban',
            accessorKey: 'answer',
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
                            faqCompanies.status(info.row.original.id).url,
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
                    urlFetchData={faqCompanies.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Pertanyaan: item.question,
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
