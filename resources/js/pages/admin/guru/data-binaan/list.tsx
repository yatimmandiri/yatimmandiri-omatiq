import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import binaan from '@/routes/admin/guru/data-binaan';
import dataPeserta from '@/routes/admin/guru/data-peserta';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, CircleSlash2, Clock3, Eye, RefreshCcw, UserPlus, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { sanggars = [], selected_sanggar_id: initialSanggarId } = usePage<{
        sanggars?: Array<{ id: number | string; name: string }>;
        selected_sanggar_id?: number | string | null;
    }>().props;

    const [filterValue, setFilterValue] = useState<any>(() =>
        initialSanggarId ? { sanggar_id: String(initialSanggarId) } : {},
    );
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Binaan'),
            accessorKey: 'full_name',
            cell: (info: any) => (
                <div className="space-y-1">
                    <p className="font-semibold">{info.getValue()}</p>
                    <p className="text-xs text-muted-foreground">{info.row.original.nik}</p>
                </div>
            ),
        },
        { header: 'Sekolah', accessorKey: 'school_name', cell: (info: any) => info.getValue() ?? '-' },
        { header: 'Kelas', accessorKey: 'grade', cell: (info: any) => info.getValue() ?? '-' },
        {
            header: (info: any) => renderRowHeader(info, 'Sanggar'),
            accessorKey: 'sanggar_names',
            cell: (info: any) => {
                const names: string[] = info.row.original.sanggar_names ?? [];
                return names.length ? (
                    <div className="flex flex-wrap gap-1">
                        {names.map((n: string) => (
                            <Badge key={n} variant="outline">
                                {n}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    '-'
                );
            },
            enableSorting: false,
        },
        {
            header: 'Terdaftar di',
            accessorKey: 'sanggar_terdaftar',
            cell: (info: any) => info.row.original.sanggar_terdaftar ?? '-',
            enableSorting: false,
        },
        {
            header: 'Status OMATIQ',
            accessorKey: 'registration_status',
            cell: (info: any) => <RegistrationBadge row={info.row.original} />,
            enableSorting: false,
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
                    urlFetchData={binaan.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            NIK: item.nik,
                            Nama: item.full_name,
                            Sekolah: item.school_name,
                            Kelas: item.grade,
                            Sanggar: (item.sanggar_names ?? []).join(', ') || '-',
                            'Terdaftar di': item.sanggar_terdaftar ?? '-',
                            'Status OMATIQ': item.is_registered
                                ? `${item.olimpiade_name ?? 'Terdaftar'} (${item.registration_status ?? '-'})`
                                : item.registration_status === 'rejected'
                                  ? `Ditolak (${item.olimpiade_name ?? '-'})`
                                  : 'Belum Terdaftar',
                        }))
                    }
                >
                    <div className="flex flex-col space-y-4 px-4 pt-8 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {sanggars.length > 0 && (
                                <SelectComponent
                                    label="Sanggar"
                                    placeholder="Semua sanggar..."
                                    data={sanggars.map((s: any) => ({ value: String(s.id), label: s.name }))}
                                    dataSelected={filterValue.sanggar_id}
                                    handleOnChange={(value: any) => setFilterValue((prev: any) => ({ ...prev, sanggar_id: value }))}
                                />
                            )}
                            <SelectComponent
                                label="Status OMATIQ"
                                placeholder="Semua status..."
                                data={[
                                    { value: 'registered', label: 'Terdaftar' },
                                    { value: 'unregistered', label: 'Belum Terdaftar' },
                                ]}
                                dataSelected={filterValue.registration}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({ ...prev, registration: value }))
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

const RegistrationBadge = ({ row }: { row: any }) => {
    if (!row.is_registered && row.registration_status !== 'rejected') {
        return (
            <Badge variant="secondary">
                <CircleSlash2 className="size-3" />
                Belum Terdaftar
            </Badge>
        );
    }
    const status = row.registration_status;
    if (status === 'verified') {
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge>
                    <CheckCircle2 className="size-3" />
                    Terdaftar · {row.olimpiade_name ?? 'OMATIQ'}
                </Badge>
                <span className="text-xs text-muted-foreground">{row.registration_number}</span>
            </div>
        );
    }
    if (status === 'rejected') {
        return (
            <Badge variant="destructive">
                <XCircle className="size-3" />
                Ditolak · {row.olimpiade_name ?? 'OMATIQ'}
            </Badge>
        );
    }
    if (row.is_registered) {
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge variant="secondary">
                    <Clock3 className="size-3" />
                    Menunggu · {row.olimpiade_name ?? 'OMATIQ'}
                </Badge>
                <span className="text-xs text-muted-foreground">{row.registration_number}</span>
            </div>
        );
    }
    return (
        <Badge variant="secondary">
            <CircleSlash2 className="size-3" />
            Belum Terdaftar
        </Badge>
    );
};

const RowAction = ({ row }: { row: any }) => {
    const isRejected = row.registration_status === 'rejected';
    const showDaftarkan = !row.is_registered || isRejected;

    if (showDaftarkan) {
        const sanggarId = row.sanggar_ids?.[0] ?? row.sanggar_id;
        return (
            <Button
                size="sm"
                onClick={() =>
                    router.visit(
                        dataPeserta.create({
                            query: {
                                student_id: String(row.id),
                                ...(sanggarId ? { sanggar_id: String(sanggarId) } : {}),
                            },
                        }).url,
                    )
                }
            >
                {isRejected ? <RefreshCcw className="size-4" /> : <UserPlus className="size-4" />}
                {isRejected ? 'Daftarkan Ulang' : 'Daftarkan'}
            </Button>
        );
    }

    return (
        <Button size="sm" variant="outline" onClick={() => router.visit(binaan.show(row.id).url)}>
            <Eye className="size-4" />
            Detail
        </Button>
    );
};

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Binaan', href: binaan.index().url },
    ],
};
