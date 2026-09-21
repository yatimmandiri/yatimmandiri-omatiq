import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes/admin';
import { usePage } from '@inertiajs/react';
import { Building2, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { userBranch } = usePage<{ userBranch?: string | null }>().props;
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Nama Sanggar'),
            accessorKey: 'name',
            cell: (info: any) => {
                const name = info.getValue() ?? '-';

                return (
                    <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        <span className="font-semibold">{name}</span>
                    </div>
                );
            },
        },
        {
            header: 'Tipe',
            accessorKey: 'type',
            cell: (info: any) => (
                <Badge variant="secondary">
                    {info.getValue() ?? 'Sanggar'}
                </Badge>
            ),
        },
        {
            header: 'Kantor Cabang',
            accessorKey: 'kantor_name',
            cell: (info: any) => {
                const val = info.getValue() ?? '-';

                return (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span>{val}</span>
                    </div>
                );
            },
        },
        {
            header: 'Total Peserta',
            accessorKey: 'participant_count',
            cell: (info: any) => {
                const val = info.getValue();

                return val !== undefined && val !== null ? (
                    <span className="font-semibold text-primary">{val}</span>
                ) : (
                    '-'
                );
            },
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
                    urlFetchData="/admin/companies/sanggars/data"
                    formatDataExport={(data: any[]) => data}
                    withActions={false}
                >
                    {userBranch && (
                        <div className="px-4 pt-6 md:px-8">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                <MapPin className="size-3.5" />
                                Menampilkan data sanggar wilayah: <strong>{userBranch}</strong>
                            </div>
                        </div>
                    )}
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Sanggar', href: '/admin/companies/sanggars' },
    ],
};
