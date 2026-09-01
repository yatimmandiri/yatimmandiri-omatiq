import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { dashboard } from '@/routes/admin';
import masterSanggar from '@/routes/admin/teacher/master/sanggar';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData] = useState(false);
    const columns = [
        { header: (info: any) => renderRowHeader(info, 'Nama Sanggar'), accessorKey: 'name' },
        { header: 'Tipe', accessorKey: 'type', cell: (info: any) => info.getValue() ?? '-' },
        { header: 'Kantor', accessorKey: 'kantor_name' },
        { header: 'Total Santri', accessorKey: 'total_students' },
    ];
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={{}}
                    refreshData={refreshData}
                    setRefreshData={() => {}}
                    urlFetchData={masterSanggar.data().url}
                >
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Sanggar', href: masterSanggar.index().url },
    ],
};
