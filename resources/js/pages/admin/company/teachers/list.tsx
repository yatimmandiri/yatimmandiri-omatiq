import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { router, usePage } from '@inertiajs/react';
import { Eye, Filter, MapPin, RotateCcw } from 'lucide-react';
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
            header: (info: any) => renderRowHeader(info, 'Name'),
            accessorKey: 'name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Email'),
            accessorKey: 'email',
        },
        {
            header: (info: any) => renderRowHeader(info, 'No. Telepon'),
            accessorKey: 'phone',
            cell: (info: any) => (
                <span className="text-xs">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Kantor Cabang'),
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;

                return row.branch ?? row.kantor_name ?? '-';
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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
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
                    <div className="flex flex-col gap-4 px-4 pt-8 md:px-8">
                        {userBranch && (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MapPin className="size-3.5" />
                                Menampilkan data guru wilayah:{' '}
                                <strong>{userBranch}</strong>
                            </div>
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
                                            Gunakan filter server-side untuk memfilter guru berdasarkan kantor cabang.
                                        </p>
                                    </div>
                                    {hasActiveFilter && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFilterValue({})}
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
