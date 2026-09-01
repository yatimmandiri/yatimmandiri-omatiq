import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import dataPeserta from '@/routes/admin/guru/data-peserta';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, Clock3, Eye, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { filterOptions } = usePage<{
        filterOptions: {
            olimpiades: Array<{ value: string; label: string }>;
            eventYears: Array<{ value: string; label: string }>;
        };
    }>().props;

    const [filterValue, setFilterValue] = useState<any>({});
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Peserta'),
            accessorKey: 'student.full_name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = row.student?.full_name ?? row.full_name ?? '-';
                const regNo = row.registration_number ?? '-';
                
                return (
                    <div className="space-y-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">{regNo}</p>
                    </div>
                );
            },
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade.name',
            cell: (info: any) => info.row.original.olimpiade?.name ?? '-',
        },
        {
            header: 'Tahun',
            accessorKey: 'event_year',
            cell: (info: any) => info.getValue() ?? '-',
        },
        {
            header: 'Sekolah',
            accessorKey: 'student.school_name',
            cell: (info: any) => info.row.original.student?.school_name ?? '-',
        },
        {
            header: 'Wilayah',
            accessorKey: 'student.regency',
            cell: (info: any) => {
                const row = info.row.original;

                return row.student?.regency?.name ?? row.penyaluran_sanggar_name ?? '-';
            },
            enableSorting: false,
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();

                if (status === 'verified') {
                    return (
                        <Badge>
                            <CheckCircle2 className="size-3" />
                            Terverifikasi
                        </Badge>
                    );
                }

                if (status === 'rejected') {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="size-3" />
                            Ditolak
                        </Badge>
                    );
                }

                return (
                    <Badge variant="secondary">
                        <Clock3 className="size-3" />
                        Menunggu
                    </Badge>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Tanggal Daftar'),
            accessorKey: 'created_at',
            cell: (info: any) => {
                const v = info.getValue();

                return v
                    ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '-';
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => <RowAction row={info.row.original} />,
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={dataPeserta.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Registrasi: item.registration_number,
                            Nama: item.student?.full_name ?? '-',
                            NIK: item.student?.nik ?? '-',
                            Olimpiade: item.olimpiade?.name ?? '-',
                            Tahun: item.event_year ?? '-',
                            Sekolah: item.student?.school_name ?? '-',
                            Wilayah: item.student?.regency?.name ?? item.penyaluran_sanggar_name ?? '-',
                            Status: item.status,
                        }))
                    }
                >
                    <div className="flex flex-col space-y-4 px-4 pt-8 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <SelectComponent
                                label="Status"
                                placeholder="Semua status..."
                                data={[
                                    { value: 'submitted', label: 'Menunggu' },
                                    { value: 'verified', label: 'Terverifikasi' },
                                    { value: 'rejected', label: 'Ditolak' },
                                ]}
                                dataSelected={filterValue.status}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({ ...prev, status: value }))
                                }
                            />
                            <SelectComponent
                                label="Olimpiade"
                                placeholder="Semua olimpiade..."
                                data={filterOptions?.olimpiades ?? []}
                                dataSelected={filterValue.olimpiade_id}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({ ...prev, olimpiade_id: value }))
                                }
                            />
                            <SelectComponent
                                label="Tahun Event"
                                placeholder="Semua tahun..."
                                data={filterOptions?.eventYears ?? []}
                                dataSelected={filterValue.event_year}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({ ...prev, event_year: value }))
                                }
                            />
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

const RowAction = ({ row }: { row: any }) => {
    return (
        <Button size="sm" variant="outline" onClick={() => router.visit(dataPeserta.show(row.id).url)}>
            <Eye className="size-4" />
            Detail
        </Button>
    );
};

ListPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Data Peserta',
            href: dataPeserta.index().url,
        },
    ],
};
