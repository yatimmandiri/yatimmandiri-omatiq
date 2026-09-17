import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes/teacher';
import dataPeserta from '@/routes/teacher/data-peserta';
import { confirmAction } from '@/utils/sweetalert';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import {
    Award,
    CheckCircle2,
    Clock3,
    Eye,
    GraduationCap,
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
                const initial = String(name).charAt(0).toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#17524A]/10 text-sm font-bold text-[#17524A] dark:bg-[#17524A]/20 dark:text-emerald-300">
                            {initial}
                        </span>
                        <div className="space-y-0.5">
                            <p className="font-semibold leading-none">{name}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {regNo}
                            </p>
                        </div>
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
            header: 'Kantor Cabang',
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;

                return row.branch ?? row.kantor_name ?? '-';
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();

                if (status === 'verified') {
                    return (
                        <Badge className="gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                            <CheckCircle2 className="size-3" />
                            Terverifikasi
                        </Badge>
                    );
                }

                if (status === 'rejected') {
                    return (
                        <Badge
                            variant="destructive"
                            className="gap-1.5 rounded-full px-2.5 py-1"
                        >
                            <XCircle className="size-3" />
                            Ditolak
                        </Badge>
                    );
                }

                return (
                    <Badge
                        variant="secondary"
                        className="gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                    >
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
        <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-sm">
                            <Award className="size-5" />
                        </span>
                        Data Peserta
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Daftar peserta OMATIQ yang Anda daftarkan. Cetak kartu
                        untuk peserta terverifikasi dan kelola pembatalan jika
                        diperlukan.
                    </p>
                </div>
            </div>

            <Card className="flex items-start gap-3 rounded-2xl border-sky-200/50 bg-sky-50/60 px-4 py-3 dark:border-sky-900/30 dark:bg-sky-950/20">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-400" />
                <p className="text-xs leading-relaxed text-sky-900 dark:text-sky-200">
                    <span className="font-semibold">Tips:</span> Gunakan filter
                    status & olimpiade untuk menyaring peserta per tahun event.
                    Peserta binaan otomatis{' '}
                    <span className="font-semibold">terverifikasi</span> — kartu
                    siap cetak tanpa menunggu admin.
                </p>
            </Card>

            <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
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
                    <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-5 md:px-6">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Filter Data
                        </p>
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
    const name = row.student?.full_name ?? row.full_name ?? 'Peserta';

    const handleDelete = async () => {
        const isConfirmed = await confirmAction({
            title: 'Batalkan Pendaftaran Peserta?',
            html: `Apakah Anda yakin ingin membatalkan pendaftaran untuk <strong>${name}</strong> (${row.registration_number})?<br/><br/><span class="text-xs text-muted-foreground">Data binaan tidak akan terhapus dan dapat didaftarkan kembali ke olimpiade jika pendaftaran masih dibuka.</span>`,
            icon: 'warning',
            confirmButtonText: 'Ya, Batalkan Pendaftaran',
            cancelButtonText: 'Kembali',
            isDanger: true,
        });

        if (isConfirmed) {
            router.delete(dataPeserta.destroy(row.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    onDeleted();
                },
            });
        }
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
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 size-4 text-destructive" />
                        <span>Batalkan Pendaftaran</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
