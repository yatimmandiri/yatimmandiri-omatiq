import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import participants from '@/routes/admin/companies/participants';
import { router } from '@inertiajs/react';
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
            header: (info: any) => renderRowHeader(info, 'Peserta'),
            accessorKey: 'student.full_name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = row.penyaluran_student_name ?? info.getValue() ?? row.full_name ?? '-';
                return (
                    <div className="space-y-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.registration_number}
                        </p>
                    </div>
                );
            },
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade',
            cell: (info: any) => info.getValue()?.name ?? '-',
        },
        {
            header: 'Sekolah',
            accessorKey: 'student.school_name',
            cell: (info: any) => {
                const row = info.row.original;
                return row.penyaluran_student_school_name ?? row.student?.school_name ?? info.getValue() ?? '-';
            },
        },
        {
            header: 'Wilayah',
            accessorKey: 'student.regency',
            cell: (info: any) => {
                const row = info.row.original;
                return info.getValue()?.name ?? row.penyaluran_sanggar_name ?? row.penyaluran_student_school_name ?? '-';
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();
                const Icon = status === 'verified' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3;
                const row = info.row.original;

                const updateStatus = (newStatus: string) => {
                    router.put(
                        participants.status(row.id).url,
                        { status: newStatus },
                        {
                            preserveScroll: true,
                            onSuccess: () => setRefreshData((v) => !v),
                        },
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge variant={statusVariant(status) as any} className="cursor-pointer">
                                <Icon />
                                {statusLabels[status] ?? status}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => updateStatus('submitted')}>
                                <Clock3 /> Submitted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus('verified')}>
                                <CheckCircle2 /> Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus('rejected')}>
                                <XCircle /> Rejected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                    urlFetchData={participants.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Registrasi: item.registration_number,
                            Nama: item.penyaluran_student_name ?? item.student?.full_name ?? item.full_name ?? '-',
                            Olimpiade: item.olimpiade?.name || '-',
                            Sekolah: item.penyaluran_student_school_name ?? item.student?.school_name ?? '-',
                            Status: statusLabels[item.status] ?? item.status,
                        }))
                    }
                >
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}
