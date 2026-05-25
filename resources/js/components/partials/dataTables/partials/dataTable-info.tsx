import { UseDataTable } from '../hooks/useDataTables';

export const DataTableInfo = () => {
    const { pagination, table }: any = UseDataTable();

    const selectedCount = table.getSelectedRowModel().rows.length;

    return (
        <span className="text-sm text-muted-foreground">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{' '}
            entries
            {selectedCount > 0 && ` | ${selectedCount} data selected`}
        </span>
    );
};
