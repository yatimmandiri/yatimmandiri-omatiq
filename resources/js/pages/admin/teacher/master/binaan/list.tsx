import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes/admin';
import masterBinaan from '@/routes/admin/teacher/master/binaan';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ListPage() {
    const { sanggars = [], selected_sanggar_id: initialSanggarId } = usePage<{
        sanggars?: Array<{ id: number | string; name: string }>;
        selected_sanggar_id?: number | string | null;
    }>().props;

    const [filterValue, setFilterValue] = useState<any>(() =>
        initialSanggarId ? { sanggar_id: String(initialSanggarId) } : {},
    );
    const [refreshData] = useState(false);

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
            header: 'Status OMATIQ',
            accessorKey: 'is_registered',
            cell: (info: any) => {
                const row = info.row.original;
                if (!row.is_registered) return <Badge variant="secondary">Belum Terdaftar</Badge>;
                return <Badge>Terdaftar</Badge>;
            },
            enableSorting: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={() => {}}
                    urlFetchData={masterBinaan.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            NIK: item.nik,
                            Nama: item.full_name,
                            Sekolah: item.school_name,
                            Kelas: item.grade,
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
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Binaan', href: masterBinaan.index().url },
    ],
};
