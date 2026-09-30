import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { router, usePage } from '@inertiajs/react';
import { Eye, Filter, GraduationCap, MapPin, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const { userBranch, filterOptions, auth } = usePage<{
        userBranch?: string | null;
        filterOptions?: {
            branches?: Array<{ value: string; label: string }>;
        };
        auth?: any;
    }>().props;

    const isCabang =
        (auth?.user?.roles ?? []).includes('Cabang') || Boolean(userBranch);
    const showBranchFilter =
        !isCabang && !userBranch && (filterOptions?.branches?.length ?? 0) > 0;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Guru'),
            accessorKey: 'name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = info.getValue() ?? '-';
                const initial = String(name).charAt(0).toUpperCase();

                return (
                    <button
                        type="button"
                        onClick={() => router.visit(teachers.show(row.id).url)}
                        className="group flex items-center gap-3 rounded-xl text-left"
                        title={`Lihat detail ${name}`}
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#17524A]/10 text-sm font-bold text-[#17524A] transition group-hover:bg-[#17524A] group-hover:text-white dark:bg-[#17524A]/20 dark:text-emerald-300">
                            {initial}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-semibold underline-offset-4 group-hover:underline">
                                {name}
                            </span>
                            <span className="block truncate font-mono text-xs text-muted-foreground">
                                {row.penyaluran_id
                                    ? `ID ${row.penyaluran_id}`
                                    : (row.email ?? '-')}
                            </span>
                        </span>
                    </button>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Email'),
            accessorKey: 'email',
            cell: (info: any) => (
                <span className="block max-w-55 truncate text-xs">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'No. Telepon'),
            accessorKey: 'phone',
            cell: (info: any) => (
                <span className="text-xs">{info.getValue() || '-'}</span>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Kantor Cabang'),
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;
                const branch = row.branch ?? row.kantor_name;

                if (!branch) {
                    return <span className="text-muted-foreground">-</span>;
                }

                return (
                    <Badge
                        variant="outline"
                        className="max-w-45 truncate rounded-full px-2.5 py-1 text-xs font-medium"
                        title={branch}
                    >
                        {branch}
                    </Badge>
                );
            },
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
        <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">
            <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-sm">
                        <GraduationCap className="size-5" />
                    </span>
                    Data Guru
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Data guru read-only dari Penyaluran. Buka Detail untuk
                    melihat sanggar binaan dan kelola reset password.
                </p>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={teachers.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item: any, i: number) => ({
                            No: i + 1,
                            Name: item.name,
                            Email: item.email,
                            'No. Telepon': item.phone || '-',
                            'Kantor Cabang':
                                item.branch ?? item.kantor_name ?? '-',
                        }))
                    }
                >
                    {(userBranch || showBranchFilter) && (
                        <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-5 md:px-6">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Filter Data
                            </p>
                            {userBranch && (
                                <Card className="flex items-center gap-2 rounded-2xl border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <MapPin className="size-3.5 shrink-0" />
                                    Menampilkan data guru wilayah:{' '}
                                    <strong>{userBranch}</strong>
                                </Card>
                            )}

                            {showBranchFilter && (
                                <>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <Filter className="size-4 text-primary" />
                                                Filter Guru
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Gunakan filter server-side untuk
                                                memfilter guru berdasarkan
                                                kantor cabang.
                                            </p>
                                        </div>
                                        {hasActiveFilter && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setFilterValue({})
                                                }
                                            >
                                                <RotateCcw />
                                                Reset Filter
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <SelectComponent
                                            label="Kantor Cabang"
                                            placeholder="Semua kantor cabang..."
                                            data={filterOptions?.branches ?? []}
                                            dataSelected={filterValue.branch}
                                            handleOnChange={(value: string) =>
                                                setFilterValue((prev) => ({
                                                    ...prev,
                                                    branch: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </>
                            )}
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
