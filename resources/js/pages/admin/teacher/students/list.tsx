import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    CircleSlash2,
    Clock3,
    Eye,
    RefreshCcw,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const [filterValue, setFilterValue] = useState<any>({});
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Binaan'),
            accessorKey: 'full_name',
            cell: (info: any) => (
                <div className="space-y-1">
                    <p className="font-semibold">{info.getValue()}</p>
                    <p className="text-xs text-muted-foreground">
                        {info.row.original.nik}
                    </p>
                </div>
            ),
        },
        {
            header: 'Sekolah',
            accessorKey: 'school_name',
            cell: (info: any) => info.getValue() ?? '-',
        },
        {
            header: 'Kelas',
            accessorKey: 'grade',
            cell: (info: any) => info.getValue() ?? '-',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Sanggar'),
            accessorKey: 'created_at',
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
            accessorKey: 'updated_at',
            cell: (info: any) => info.row.original.sanggar_terdaftar ?? '-',
            enableSorting: false,
        },
        {
            header: 'Status OMATIQ',
            accessorKey: 'registration_status',
            cell: (info: any) => {
                const row = info.row.original;

                return <RegistrationBadge row={row} />;
            },
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
                    urlFetchData={teacherStudents.data().url}
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
                                : 'Belum Terdaftar',
                        }))
                    }
                >
                    <div className="flex flex-col space-y-4 px-4 pt-8 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <SelectComponent
                                label="Status OMATIQ"
                                placeholder="Semua status..."
                                data={[
                                    { value: 'registered', label: 'Terdaftar' },
                                    {
                                        value: 'unregistered',
                                        label: 'Belum Terdaftar',
                                    },
                                ]}
                                dataSelected={filterValue.registration}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({
                                        ...prev,
                                        registration: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ create: true }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

const RegistrationBadge = ({ row }: { row: any }) => {
    if (!row.is_registered) {
        return (
            <Badge variant="secondary">
                <CircleSlash2 />
                Belum Terdaftar
            </Badge>
        );
    }

    const status = row.registration_status;

    if (status === 'verified') {
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge>
                    <CheckCircle2 />
                    Terdaftar · {row.olimpiade_name ?? 'OMATIQ'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {row.registration_number}
                </span>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <Badge variant="destructive">
                <XCircle />
                Ditolak · {row.olimpiade_name ?? 'OMATIQ'}
            </Badge>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <Badge variant="secondary">
                <Clock3 />
                Menunggu · {row.olimpiade_name ?? 'OMATIQ'}
            </Badge>
            <span className="text-xs text-muted-foreground">
                {row.registration_number}
            </span>
        </div>
    );
};

const RowAction = ({ row }: { row: any }) => {
    if (!row.is_registered) {
        const sanggarId = row.sanggar_ids?.[0] ?? row.sanggar_id;
        return (
            <Button
                size="sm"
                onClick={() =>
                    router.visit(
                        teacherStudents.create({
                            query: {
                                student_id: String(row.id),
                                ...(sanggarId ? { sanggar_id: String(sanggarId) } : {}),
                            },
                        }).url,
                    )
                }
            >
                <UserPlus />
                Daftarkan
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    router.visit(teacherStudents.show(row.participant_id).url)
                }
            >
                <Eye />
                Detail
            </Button>
            {row.registration_status === 'rejected' && (
                <Button
                    size="sm"
                    onClick={() =>
                        router.visit(
                            teacherStudents.create({
                                query: {
                                    student_id: String(row.id),
                                    ...(row.sanggar_ids?.[0] ? { sanggar_id: String(row.sanggar_ids[0]) } : row.sanggar_id ? { sanggar_id: String(row.sanggar_id) } : {}),
                                },
                            }).url,
                        )
                    }
                >
                    <RefreshCcw />
                    Daftarkan Ulang
                </Button>
            )}
        </div>
    );
};

ListPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Pendaftaran',
            href: teacherStudents.index().url,
        },
    ],
};
