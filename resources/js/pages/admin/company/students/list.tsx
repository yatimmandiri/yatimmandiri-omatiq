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
    DialogOverlay,
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
import students from '@/routes/admin/companies/students';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    MapPin,
    MoreHorizontal,
    Pencil,
    Power,
    RotateCcw,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { mentors, userBranch } = usePage<{
        mentors?: Array<{ id: number; name: string }>;
        userBranch?: string | null;
    }>().props;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Binaan'),
            accessorKey: 'full_name',
            cell: (info: any) => {
                const row = info.row.original;

                return (
                    <div className="space-y-1">
                        <p className="font-semibold">{info.getValue()}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.nik} {row.nis ? `• ${row.nis}` : ''}
                        </p>
                        {row.nickname && (
                            <p className="text-xs text-muted-foreground">
                                Panggilan: {row.nickname}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Sekolah',
            accessorKey: 'school_name',
            cell: (info: any) => {
                const row = info.row.original;

                return (
                    <div className="space-y-1">
                        <p className="text-sm">{row.school_name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.school_level ?? ''}{' '}
                            {row.grade ? `• ${row.grade}` : ''}
                        </p>
                    </div>
                );
            },
        },
        {
            header: 'Wilayah',
            accessorKey: 'regency',
            cell: (info: any) => {
                const row = info.row.original;

                return row.regency?.name ?? row.province?.name ?? '-';
            },
        },
        {
            header: 'Mentor',
            accessorKey: 'mentor',
            cell: (info: any) => info.getValue()?.name ?? '-',
        },
        {
            header: 'Jenis',
            accessorKey: 'is_binaan',
            cell: (info: any) =>
                info.getValue() ? (
                    <Badge>Binaan</Badge>
                ) : (
                    <Badge variant="secondary">Umum</Badge>
                ),
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: (info: any) => {
                const row = info.row.original;
                const active = info.getValue();
                const toggle = () => {
                    router.put(
                        students.status(row.id).url,
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () => setRefreshData((v) => !v),
                        },
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge
                                variant={active ? 'default' : 'destructive'}
                                className="cursor-pointer"
                            >
                                {active ? (
                                    <CheckCircle2 className="size-3" />
                                ) : (
                                    <XCircle className="size-3" />
                                )}
                                {active ? 'Aktif' : 'Non-aktif'}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={toggle}>
                                <Power className="size-4" />{' '}
                                {active ? 'Non-aktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            header: 'Peserta',
            accessorKey: 'participants_count',
            cell: (info: any) => (
                <Badge variant="outline">{info.getValue() ?? 0} peserta</Badge>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Tgl Daftar'),
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
                    setRefreshData={setRefreshData}
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
                    urlFetchData={students.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            NIK: item.nik,
                            NIS: item.nis ?? '-',
                            Nama: item.full_name,
                            Sekolah: item.school_name ?? '-',
                            Jenjang: item.school_level ?? '-',
                            Wilayah:
                                item.regency?.name ??
                                item.province?.name ??
                                '-',
                            Mentor: item.mentor?.name ?? '-',
                            Jenis: item.is_binaan ? 'Binaan' : 'Umum',
                            Status: item.is_active ? 'Aktif' : 'Non-aktif',
                            Peserta: item.participants_count ?? 0,
                        }))
                    }
                >
                    <div className="flex flex-col gap-4 px-4 pt-8 md:px-8">
                        {userBranch && (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MapPin className="size-3.5" />
                                Menampilkan data santri wilayah:{' '}
                                <strong>{userBranch}</strong>
                            </div>
                        )}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Filter className="size-4 text-primary" />
                                    Filter Students
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Server-side filter untuk Data Students
                                    keseluruhan (binaan + umum).
                                </p>
                            </div>
                            {hasActiveFilter && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilterValue({})}
                                >
                                    <RotateCcw /> Reset Filter
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SelectComponent
                                label="Mentor"
                                placeholder="Semua mentor..."
                                data={(mentors ?? []).map((m: any) => ({
                                    value: String(m.id),
                                    label: m.name,
                                }))}
                                dataSelected={filterValue.mentor_id}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        mentor_id: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Jenis"
                                placeholder="Semua jenis..."
                                data={[
                                    { value: '1', label: 'Binaan' },
                                    { value: '0', label: 'Umum' },
                                ]}
                                dataSelected={filterValue.is_binaan}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        is_binaan: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Status Aktif"
                                placeholder="Semua status..."
                                data={[
                                    { value: '1', label: 'Aktif' },
                                    { value: '0', label: 'Non-aktif' },
                                ]}
                                dataSelected={filterValue.is_active}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        is_active: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Jenjang"
                                placeholder="Semua jenjang..."
                                data={[
                                    { value: 'SD', label: 'SD' },
                                    { value: 'SMP', label: 'SMP' },
                                    { value: 'SMA', label: 'SMA' },
                                    { value: 'SMK', label: 'SMK' },
                                ]}
                                dataSelected={filterValue.school_level}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        school_level: value,
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

const RowAction = ({
    row,
    setRefreshData,
}: {
    row: any;
    setRefreshData: (val: any) => void;
}) => {
    const { auth } = usePage<any>().props;
    const isCabang = (auth?.user?.roles ?? []).includes('Cabang');
    const userPermissions: string[] = auth?.user?.permissions ?? [];
    const isSuperAdmin = (auth?.user?.roles ?? []).includes('Administrators');

    const canEdit = !isCabang && (isSuperAdmin || userPermissions.includes('update-student'));
    const canDelete = !isCabang && (isSuperAdmin || userPermissions.includes('delete-student'));

    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleDelete = () => {
        router.delete(students.destroy(row.id).url, {
            onSuccess: () => {
                setOpenDeleteModal(false);
                setRefreshData((v: any) => !v);
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
                    <DropdownMenuLabel>Aksi Student</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => router.visit(students.show(row.id).url)}
                    >
                        <Eye className="mr-2 size-4" /> Detail
                    </DropdownMenuItem>
                    {canEdit && (
                        <DropdownMenuItem
                            onClick={() => router.visit(students.edit(row.id).url)}
                        >
                            <Pencil className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setOpenDeleteModal(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 size-4" /> Hapus
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {canDelete && openDeleteModal && (
                <Dialog
                    open={openDeleteModal}
                    onOpenChange={setOpenDeleteModal}
                >
                    <DialogOverlay className="fixed inset-0 bg-black/40" />
                    <DialogContent>
                        <DialogTitle className="text-lg font-semibold">
                            Hapus Data Student / Binaan
                        </DialogTitle>
                        <DialogDescription className="mt-2">
                            Apakah Anda yakin ingin menghapus data{' '}
                            <strong>{row.full_name}</strong>? Tindakan ini tidak
                            dapat dibatalkan.
                        </DialogDescription>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpenDeleteModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Hapus
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Students', href: students.index().url },
    ],
};
