import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { dashboard } from '@/routes/admin';
import students from '@/routes/admin/companies/students';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ListPage() {
    const { mentors } = usePage<any>().props;

    const [filterValue, setFilterValue] = useState<any>({});
    const [refreshData, setRefreshData] = useState(false);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Nama'),
            accessorKey: 'full_name',
            cell: (info: any) => (
                <div className="space-y-1">
                    <p className="font-semibold">{info.row.original.full_name}</p>
                    <p className="text-xs text-muted-foreground">{info.row.original.nik}</p>
                </div>
            ),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Sekolah'),
            accessorKey: 'school_name',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Kelas'),
            accessorKey: 'grade',
        },
        {
            header: 'Guru Pembimbing',
            accessorKey: 'mentor',
            cell: (info: any) => info.getValue()?.name ?? '-',
        },
        {
            header: 'Total Peserta',
            accessorKey: 'participants_count',
            cell: (info: any) => info.getValue() ?? 0,
        },
        {
            header: (info: any) => renderRowHeader(info, 'Dibuat'),
            accessorKey: 'created_at',
            cell: (info: any) => renderRowDate(info.getValue()),
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
                        items.map((item, i) => ({
                            No: i + 1,
                            NIK: item.nik,
                            Nama: item.full_name,
                            Sekolah: item.school_name,
                            Kelas: item.grade,
                            Guru: item.mentor?.name || '-',
                            'Total Peserta': item.participants_count ?? 0,
                            Status: item.is_binaan ? 'Binaan' : 'Umum',
                        }))
                    }
                >
                    <div className="flex flex-col space-y-4 px-4 pt-8 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <SelectComponent
                                label="Guru Pembimbing"
                                placeholder="Filter by Guru Pembimbing..."
                                data={mentors?.map((item: any) => ({
                                    value: item.id.toString(),
                                    label: item.name,
                                }))}
                                dataSelected={filterValue.mentor_id}
                                handleOnChange={(value: any) =>
                                    setFilterValue((prev: any) => ({
                                        ...prev,
                                        mentor_id: value,
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

ListPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Murid',
            href: students.index().url,
        },
    ],
};