import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes/admin';
import dataPeserta from '@/routes/admin/guru/data-peserta';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Eye,
    MoreHorizontal,
    Printer,
    Trash2,
    XCircle,
} from 'lucide-react';
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

                return (
                    row.student?.regency?.name ??
                    row.penyaluran_sanggar_name ??
                    '-'
                );
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
                    ? new Date(v).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                      })
                    : '-';
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => (
                <RowAction
                    row={info.row.original}
                    onDeleted={() => setRefreshData(true)}
                />
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
                            Wilayah:
                                item.student?.regency?.name ??
                                item.penyaluran_sanggar_name ??
                                '-',
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
                                    {
                                        value: 'verified',
                                        label: 'Terverifikasi',
                                    },
                                    { value: 'rejected', label: 'Ditolak' },
                                ]}
                                dataSelected={filterValue.status}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({
                                        ...prev,
                                        status: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Olimpiade"
                                placeholder="Semua olimpiade..."
                                data={filterOptions?.olimpiades ?? []}
                                dataSelected={filterValue.olimpiade_id}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({
                                        ...prev,
                                        olimpiade_id: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Tahun Event"
                                placeholder="Semua tahun..."
                                data={filterOptions?.eventYears ?? []}
                                dataSelected={filterValue.event_year}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({
                                        ...prev,
                                        event_year: value,
                                    }))
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

const RowAction = ({ row, onDeleted }: { row: any; onDeleted: () => void }) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const name = row.student?.full_name ?? row.full_name ?? 'Peserta';

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(dataPeserta.destroy(row.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false);
                setIsDeleting(false);
                onDeleted();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu aksi</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi Peserta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() =>
                            router.visit(dataPeserta.show(row.id).url)
                        }
                    >
                        <Eye className="mr-2 size-4" /> Detail
                    </DropdownMenuItem>
                    {row.status === 'verified' && (
                        <DropdownMenuItem asChild>
                            <a
                                href={dataPeserta.card(row.id).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center"
                            >
                                <Printer className="mr-2 size-4 text-[#17524A]" />
                                <span>Cetak Kartu</span>
                            </a>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setOpenDelete(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 size-4 text-destructive" />
                        <span>Batalkan Pendaftaran</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Pendaftaran Peserta</DialogTitle>
                        <DialogDescription className="space-y-2 pt-2">
                            <p>
                                Apakah Anda yakin ingin membatalkan pendaftaran
                                untuk <strong>{name}</strong> (
                                {row.registration_number})?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Data binaan tidak akan terhapus dan dapat
                                didaftarkan kembali ke olimpiade jika
                                pendaftaran masih dibuka.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDelete(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? 'Membatalkan...'
                                : 'Batalkan Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

ListPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Data Peserta',
            href: dataPeserta.index().url,
        },
    ],
};
