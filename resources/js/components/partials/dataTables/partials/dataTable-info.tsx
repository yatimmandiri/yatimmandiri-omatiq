import { UseDataTable } from '../hooks/useDataTables';

export const DataTableInfo = () => {
    const { pagination, table }: any = UseDataTable();

    const selectedCount = table.getSelectedRowModel().rows.length;
    const total = pagination?.total ?? 0;
    const from =
        pagination?.from ??
        (total === 0
            ? 0
            : ((pagination?.page ?? 1) - 1) * (pagination?.perPage ?? 10) + 1);
    const to =
        pagination?.to ??
        (total === 0
            ? 0
            : Math.min(
                  (pagination?.page ?? 1) * (pagination?.perPage ?? 10),
                  total,
              ));

    return (
        <span className="text-sm text-muted-foreground">
            Showing {from} to {to} of {total} entries
            {selectedCount > 0 && ` | ${selectedCount} data selected`}
        </span>
    );
};
