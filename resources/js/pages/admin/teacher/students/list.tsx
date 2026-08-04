import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader, RowActions } from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useState } from 'react';

const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

const statusVariant = (status: string) =>
    status === 'verified' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Siswa'),
            accessorKey: 'student.full_name',
            cell: (info: any) => (
                <div className="space-y-1">
                    <p className="font-semibold">{info.getValue()}</p>
                    <p className="text-xs text-muted-foreground">
                        {info.row.original.registration_number}
                    </p>
                </div>
            ),
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade',
            cell: (info: any) => info.getValue()?.name ?? '-',
        },
        {
            header: 'NIK',
            accessorKey: 'student.nik',
        },
        {
            header: 'Sekolah',
            accessorKey: 'student.school_name',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();
                const Icon = status === 'verified' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3;

                return (
                    <Badge variant={statusVariant(status) as any}>
                        <Icon />
                        {statusLabels[status] ?? status}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <RowActions info={info} setRefreshData={setRefreshData} />
                </div>
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
                    urlFetchData={teacherStudents.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Registrasi: item.registration_number,
                            NIK: item.student?.nik,
                            Nama: item.full_name,
                            Olimpiade: item.olimpiade?.name || '-',
                            Sekolah: item.student?.school_name,
                            Status: statusLabels[item.status] ?? item.status,
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
            title: 'Siswa',
            href: teacherStudents.index().url,
        },
    ],
};
