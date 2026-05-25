import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { UseDataTable } from './hooks/useDataTables';
import { DataTableButtons } from './partials/dataTable-buttons';
import { DataTableInfo } from './partials/dataTable-info';
import { DataTablePageSize } from './partials/dataTable-pageSize';
import { DataTablePagination } from './partials/dataTable-pagination';
import { DataTableGlobalSearch } from './partials/dataTable-search';

export const DataTableComponent = ({
    buttonActive,
}: {
    buttonActive?: any;
}) => {
    const { columns, table, isLoading }: any = UseDataTable();

    const rows = table.getRowModel().rows;

    const hasData = rows.length > 0;
    const isEmpty = !isLoading && !hasData;

    return (
        <div className="flex flex-col space-y-4 p-4 md:p-6">
            <DataTableButtons buttonsActive={buttonActive} />
            <div className="flex flex-row items-center justify-between">
                <DataTablePageSize />
                <div className="w-fit">
                    <DataTableGlobalSearch />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="animate-spin text-muted-foreground" />
                                        <span>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                <DataTableInfo />
                <DataTablePagination />
            </div>
        </div>
    );
};
