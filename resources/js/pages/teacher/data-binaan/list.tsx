import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes/teacher';
import binaan from '@/routes/teacher/data-binaan';
import dataPeserta from '@/routes/teacher/data-peserta';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CircleSlash2,
    Clock3,
    Eye,
    GraduationCap,
    MoreHorizontal,
    Pencil,
    RefreshCcw,
    School,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const {
        sanggars = [],
        selected_sanggar_id: initialSanggarId,
        registration_binaan_open = true,
    } = usePage<{
        sanggars?: Array<{ id: number | string; name: string }>;
        selected_sanggar_id?: number | string | null;
        registration_binaan_open?: boolean;
    }>().props;

    const [filterValue, setFilterValue] = useState<any>(() =>
        initialSanggarId ? { sanggar_id: String(initialSanggarId) } : {},
    );
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Binaan'),
            accessorKey: 'full_name',
            cell: (info: any) => {
                const nik = info.row.original.nik;
                const name = info.getValue() ?? '-';
                const hasNik = Boolean(
                    nik &&
                    String(nik).trim() !== '' &&
                    String(nik).trim() !== '-',
                );
                const initial = String(name).charAt(0).toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#17524A]/10 text-sm font-bold text-[#17524A] dark:bg-[#17524A]/20 dark:text-emerald-300">
                            {initial}
                        </span>
                        <div className="space-y-0.5">
                            <p className="font-semibold leading-none">{name}</p>
                            <p
                                className={`text-xs ${
                                    hasNik
                                        ? 'text-muted-foreground'
                                        : 'font-medium text-amber-600 dark:text-amber-400'
                                }`}
                            >
                                {hasNik ? nik : 'NIK belum diisi'}
                            </p>
                        </div>
                    </div>
                );
            },
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
            cell: (info: any) => (
                <RowAction
                    row={info.row.original}
                    registrationOpen={registration_binaan_open}
                    setRefreshData={setRefreshData}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-sm">
                            <Users className="size-5" />
                        </span>
                        Data Binaan
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Kelola roster santri binaan dari Penyaluran. Pantau
                        status pendaftaran OMATIQ dan daftarkan binaan yang
                        belum terdaftar.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="gap-1.5 border-[#17524A]/20 bg-[#17524A]/5 px-3 py-1.5 text-xs font-medium text-[#17524A] dark:text-emerald-300"
                    >
                        <School className="size-3.5" />
                        {sanggars.length} Sanggar
                    </Badge>
                </div>
            </div>

            {/* Info hint */}
            <Card className="flex items-start gap-3 rounded-2xl border-[#E5BE1E]/30 bg-amber-50/60 px-4 py-3 dark:bg-amber-950/20">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">Alur pendaftaran:</span>{' '}
                    klik <em>Daftarkan</em> pada binaan yang belum terdaftar →
                    pilih sanggar & olimpiade → otomatis{' '}
                    <span className="font-semibold">terverifikasi & gratis</span>{' '}
                    untuk jalur binaan. Gunakan filter sanggar & status untuk
                    mempercepat pencarian.
                </p>
            </Card>

            <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
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
                            Sanggar:
                                (item.sanggar_names ?? []).join(', ') || '-',
                            'Terdaftar di': item.sanggar_terdaftar ?? '-',
                            'Status OMATIQ': item.is_registered
                                ? `${item.olimpiade_name ?? 'Terdaftar'} (${item.registration_status ?? '-'})`
                                : item.registration_status === 'rejected'
                                  ? `Ditolak (${item.olimpiade_name ?? '-'})`
                                  : 'Belum Terdaftar',
                        }))
                    }
                >
                    <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-5 md:px-6">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Filter Data
                        </p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {sanggars.length > 0 && (
                                <SelectComponent
                                    label="Sanggar"
                                    placeholder="Semua sanggar..."
                                    data={sanggars.map((s: any) => ({
                                        value: String(s.id),
                                        label: s.name,
                                    }))}
                                    dataSelected={filterValue.sanggar_id}
                                    handleOnChange={(value: any) =>
                                        setFilterValue((prev: any) => ({
                                            ...prev,
                                            sanggar_id: value,
                                        }))
                                    }
                                />
                            )}
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
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

const RegistrationBadge = ({ row }: { row: any }) => {
    if (!row.is_registered && row.registration_status !== 'rejected') {
        return (
            <Badge
                variant="secondary"
                className="gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            >
                <CircleSlash2 className="size-3" />
                Belum Terdaftar
            </Badge>
        );
    }

    const status = row.registration_status;

    if (status === 'verified') {
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge className="gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="size-3" />
                    Terdaftar · {row.olimpiade_name ?? 'OMATIQ'}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                    {row.registration_number}
                </span>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <Badge
                variant="destructive"
                className="gap-1.5 rounded-full px-2.5 py-1"
            >
                <XCircle className="size-3" />
                Ditolak · {row.olimpiade_name ?? 'OMATIQ'}
            </Badge>
        );
    }

    if (row.is_registered) {
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge
                    variant="secondary"
                    className="gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                >
                    <Clock3 className="size-3" />
                    Menunggu · {row.olimpiade_name ?? 'OMATIQ'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {row.registration_number}
                </span>
            </div>
        );
    }

    return (
        <Badge variant="secondary" className="gap-1.5 rounded-full">
            <CircleSlash2 className="size-3" />
            Belum Terdaftar
        </Badge>
    );
};

const RowAction = ({
    row,
    registrationOpen = true,
}: {
    row: any;
    registrationOpen?: boolean;
    setRefreshData: (val: any) => void;
}) => {
    const isRejected = row.registration_status === 'rejected';
    const showDaftarkan =
        (!row.is_registered || isRejected) && registrationOpen;
    const sanggarId = row.sanggar_ids?.[0] ?? row.sanggar_id;

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
                    <DropdownMenuLabel>Aksi Binaan</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => router.visit(binaan.show(row.id).url)}
                    >
                        <Eye className="mr-2 size-4" /> Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.visit(binaan.edit(row.id).url)}
                    >
                        <Pencil className="mr-2 size-4" /> Edit
                    </DropdownMenuItem>
                    {showDaftarkan && (
                        <DropdownMenuItem
                            onClick={() =>
                                router.visit(
                                    dataPeserta.create({
                                        query: {
                                            student_id: String(row.id),
                                            ...(sanggarId
                                                ? {
                                                      sanggar_id:
                                                          String(sanggarId),
                                                  }
                                                : {}),
                                        },
                                    }).url,
                                )
                            }
                        >
                            {isRejected ? (
                                <RefreshCcw className="mr-2 size-4 text-primary" />
                            ) : (
                                <UserPlus className="mr-2 size-4 text-primary" />
                            )}
                            <span className="font-medium text-primary">
                                {isRejected ? 'Daftarkan Ulang' : 'Daftarkan'}
                            </span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Binaan', href: binaan.index().url },
    ],
};
