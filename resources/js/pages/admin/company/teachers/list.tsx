import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { router, usePage } from '@inertiajs/react';
import { Eye, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { userBranch } = usePage<{ userBranch?: string | null }>().props;
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Kode Guru'),
            accessorKey: 'penyaluran_code',
            cell: (info: any) => (
                <span className="font-mono text-xs font-semibold text-primary">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Name'),
            accessorKey: 'name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Email'),
            accessorKey: 'email',
        },
        {
            header: (info: any) => renderRowHeader(info, 'No. Telepon'),
            accessorKey: 'phone',
            cell: (info: any) => (
                <span className="text-xs">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Kantor Cabang'),
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;

                return row.branch ?? row.kantor_name ?? '-';
            },
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
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                        router.visit(teachers.show(info.row.original.id).url)
                    }
                >
                    <Eye className="size-4" />
                    Detail
                </Button>
            ),
            enableSorting: false,
            enableHiding: false,
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
                            'Kode Guru': item.penyaluran_code || '-',
                            Name: item.name,
                            Email: item.email,
                            'No. Telepon': item.phone || '-',
                            'Kantor Cabang':
                                item.branch ?? item.kantor_name ?? '-',
                        }))
                    }
                >
                    {userBranch && (
                        <div className="px-4 pt-6 md:px-8">
                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MapPin className="size-3.5" />
                                Menampilkan data guru wilayah:{' '}
                                <strong>{userBranch}</strong>
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
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Guru',
            href: teachers.index().url,
        },
    ],
};
