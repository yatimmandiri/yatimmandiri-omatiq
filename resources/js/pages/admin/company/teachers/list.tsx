import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Name'),
            accessorKey: 'name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Email'),
            accessorKey: 'email',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Verified'),
            accessorKey: 'email_verified_at',
            cell: (info: any) =>
                info.getValue() ? (
                    <Badge variant="default">Verified</Badge>
                ) : (
                    <Badge variant="secondary">Not Verified</Badge>
                ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Created At'),
            accessorKey: 'created_at',
            cell: (info: any) => renderRowDate(info.getValue()),
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
                    urlFetchData={teachers.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item: any, i: number) => ({
                            No: i + 1,
                            Name: item.name,
                            Email: item.email,
                        }))
                    }
                >
                    <DataTableComponent buttonActive={{ create: true }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

ListPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Guru',
            href: teachers.index().url,
        },
    ],
};
