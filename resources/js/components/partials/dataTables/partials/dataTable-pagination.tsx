import {
    ChevronFirstIcon,
    ChevronLastIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { UseDataTable } from '../hooks/useDataTables';

export const DataTablePagination = () => {
    const { pagination, isLoading, table }: any = UseDataTable();

    const totalPages = Math.ceil(pagination.total / pagination.perPage);

    useEffect(() => {
        table.resetRowSelection();
    }, [pagination.page]);

    return (
        <div className="flex flex-row items-center space-x-2">
            <button
                type="button"
                onClick={() => table.setPageIndex(0)}
                disabled={pagination.page === 1 || isLoading}
                className="cursor-pointer disabled:opacity-50"
            >
                <ChevronFirstIcon className="h-6 w-6" />
            </button>
            <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
                className="cursor-pointer disabled:opacity-50"
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
                className="cursor-pointer disabled:opacity-50"
            >
                <ChevronRightIcon className="h-6 w-6" />
            </button>
            <button
                type="button"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={pagination.page >= totalPages || isLoading}
                className="cursor-pointer disabled:opacity-50"
            >
                <ChevronLastIcon className="h-6 w-6" />
            </button>
        </div>
    );
};
