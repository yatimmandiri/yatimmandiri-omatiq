import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import { usePage } from '@inertiajs/react';
import { Building2, Filter, MapPin, RotateCcw } from 'lucide-react';
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
            header: (info: any) => renderRowHeader(info, 'Nama Sanggar'),
            accessorKey: 'name',
            cell: (info: any) => {
                const name = info.getValue() ?? '-';

                return (
                    <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        <span className="font-semibold">{name}</span>
                    </div>
                );
            },
        },
        {
            header: 'Tipe',
            accessorKey: 'type',
            cell: (info: any) => (
                <Badge variant="secondary">
                    {info.getValue() ?? 'Sanggar'}
                </Badge>
            ),
        },
        {
            header: 'Kantor Cabang',
            accessorKey: 'kantor_name',
            cell: (info: any) => {
                const val = info.getValue() ?? '-';

                return (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span>{val}</span>
                    </div>
                );
            },
        },
        {
            header: 'Total Peserta',
            accessorKey: 'participant_count',
            cell: (info: any) => {
                const val = info.getValue();

                return val !== undefined && val !== null ? (
                    <span className="font-semibold text-primary">{val}</span>
                ) : (
                    '-'
                );
            },
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
                    urlFetchData="/admin/companies/sanggars/data"
                    formatDataExport={(data: any[]) => data}
                    withActions={false}
                >
                    <div className="flex flex-col gap-4 px-4 pt-8 md:px-8">
                        {userBranch && (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MapPin className="size-3.5" />
                                Menampilkan data sanggar wilayah:{' '}
                                <strong>{userBranch}</strong>
                            </div>
                        )}

                        {showBranchFilter && (
                            <>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Filter className="size-4 text-primary" />
                                            Filter Sanggar
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Gunakan filter server-side untuk memfilter sanggar berdasarkan kantor cabang.
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
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Sanggar', href: '/admin/companies/sanggars' },
    ],
};
