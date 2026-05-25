import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { DatePickerComponent } from '@/components/partials/datePicker-component';
import activities from '@/routes/admin/logs/activities';
import { formatDate } from '@/utils/formatDate';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const [filterValue, setFilterValue] = useState({
        filterDate: formatDate(new Date(), 'custom'),
    });

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Name'),
            accessorKey: 'log_name',
        },
        {
            id: 'causer',
            header: (info: any) => renderRowHeader(info, 'User'),
            accessorFn: (row: any) => row.causer?.name ?? '-',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Subject Type'),
            accessorKey: 'subject_type',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Action Event'),
            accessorKey: 'event',
        },
        {
            header: (info: any) => renderRowHeader(info, 'Attribute Changes'),
            accessorKey: 'attribute_changes',
            cell: (info: any) => renderRowJson(info.getValue()),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Properties'),
            accessorKey: 'properties',
            cell: (info: any) => renderRowJson(info.getValue()),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Created At'),
            accessorKey: 'created_at',
            cell: (info: any) => renderRowDate(info.getValue()),
        },
        {
            header: (info: any) => renderRowHeader(info, 'Updated At'),
            accessorKey: 'updated_at',
            cell: (info: any) => renderRowDate(info.getValue()),
        },
    ];

    const renderRowJson = (value: any) => {
        return (
            <span className="max-w-125 text-sm wrap-break-word whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
            </span>
        );
    };

    const formatDataExport = (data: any) => {
        return data.map((item: any, i: number) => ({
            No: i + 1,
            Name: item.name,
            'Created At': formatDate(item.created_at, 'datetime'),
            'Updated At': formatDate(item.updated_at, 'datetime'),
        }));
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={activities.data().url}
                    formatDataExport={formatDataExport}
                    withActions={false}
                >
                    <div className="flex flex-col space-y-4 px-4 pt-8 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <DatePickerComponent
                                label="Date"
                                value={filterValue.filterDate}
                                handleOnChange={(value: any) =>
                                    setFilterValue({
                                        ...filterValue,
                                        filterDate: formatDate(value, 'custom'),
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ export: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}
