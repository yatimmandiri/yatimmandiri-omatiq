import {
    getCoreRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import {
    renderRowActions,
    renderRowDate,
    renderRowHeader,
} from '../utils/dataTable-utils';

interface DataTableProps {
    urlFetchData: string;
    filterValue?: any;
    refreshData?: boolean;
    setRefreshData?: any;
    columns?: any;
    withActions?: boolean;
    formatDataExport: any;
    customButtons?: any;
    rowSelection?: any;
    setRowSelection?: any;
    children: ReactNode;
}

export const DataTableContext = createContext({});

export const UseDataTable = () => {
    const context = useContext(DataTableContext);
    if (!context) {
        throw new Error('useDataTable must be used within DataTableProvider');
    }
    return context;
};

export const DataTableProvider = ({
    urlFetchData,
    filterValue,
    refreshData,
    setRefreshData,
    columns,
    withActions = true,
    formatDataExport,
    customButtons,
    rowSelection,
    setRowSelection,
    children,
}: DataTableProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const [pagination, setPagination] = useState(() => {
        if (typeof window === 'undefined') {
            return {
                page: 1,
                perPage: 10,
                total: 0,
                from: 0,
                to: 0,
            };
        }

        const savedPageSize = localStorage.getItem('pageSize');

        return {
            page: 1,
            perPage:
                savedPageSize && !isNaN(parseInt(savedPageSize))
                    ? parseInt(savedPageSize)
                    : 10,
            total: 0,
            from: 0,
            to: 0,
        };
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        await axios
            .get(urlFetchData, {
                params: {
                    page: pagination.page,
                    perPage: pagination.perPage,
                    globalSearch: globalFilter,
                    orderDirection: sorting[0]?.desc ? 'desc' : 'asc',
                    orderBy: sorting[0]?.id ?? 'id',
                    filterValue: filterValue,
                },
            })
            .then((response) => {
                setData(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    perPage: response.data.per_page,
                    page: response.data.current_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                }));
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [
        pagination.page,
        pagination.perPage,
        globalFilter,
        sorting,
        filterValue,
    ]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pageSize', String(pagination.perPage));
        }
    }, [pagination.perPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const initialColumns = useMemo(() => {
        const baseStartColumns = [
            {
                id: 'select',
                header: ({ table }: any) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value: any) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }: any) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value: any) =>
                            row.toggleSelected(!!value)
                        }
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: () => (
                    <div className="flex cursor-pointer flex-row items-center justify-between">
                        <span>No</span>
                    </div>
                ),
                accessorKey: 'id',
                cell: (info: any) => {
                    const pageIndex = table.getState().pagination.pageIndex; // 0-based
                    const pageSize = table.getState().pagination.pageSize;

                    return pageIndex * pageSize + info.row.index + 1;
                },
            },
        ];

        const baseEndColumns = [
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

        const hasCustomAction = columns.some(
            (col: any) => col.id === 'actions' || col.accessorKey === 'actions',
        );

        // Kolom action default (jika belum ada)
        const defaultActionColumn =
            withActions && !hasCustomAction
                ? {
                      id: 'actions',
                      header: () => <span>Action</span>,
                      cell: (info: any) =>
                          renderRowActions(info, setRefreshData),
                      enableSorting: false,
                      enableHiding: false,
                  }
                : null;

        // Gabungkan baseStart + custom + baseEnd
        const tempColumns = [
            ...baseStartColumns,
            ...columns.filter(
                (c: any) => c.accessorKey !== 'actions' && c.id !== 'actions', // exclude action dulu
            ),
            ...baseEndColumns,
        ];

        // Hilangkan duplikat accessorKey/id (custom replace base)
        const mergedColumns: any[] = [];
        const seen = new Set();

        tempColumns.forEach((col) => {
            const key = col.accessorKey || col.id;
            if (!seen.has(key)) {
                seen.add(key);
                mergedColumns.push(col);
            } else {
                const idx = mergedColumns.findIndex(
                    (c) => (c.accessorKey || c.id) === key,
                );
                mergedColumns[idx] = col; // replace existing
            }
        });

        // Tambahkan kolom Action di paling akhir (custom jika ada, default jika tidak)
        if (hasCustomAction) {
            const customAction = columns.find(
                (c: any) => c.accessorKey === 'actions' || c.id === 'actions',
            );
            mergedColumns.push(customAction);
        } else if (defaultActionColumn) {
            mergedColumns.push(defaultActionColumn);
        }

        return mergedColumns;
    }, [columns]);

    const table = useReactTable({
        data: data ?? [],
        columns: initialColumns ?? [],
        state: {
            pagination: {
                pageIndex: pagination.page - 1,
                pageSize: pagination.perPage,
            },
            globalFilter,
            sorting,
        },
        pageCount: pagination.total
            ? Math.ceil(pagination.total / pagination.perPage)
            : 0,
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pagination.page - 1,
                          pageSize: pagination.perPage,
                      })
                    : updater;
            setPagination((prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                perPage: next.pageSize,
            }));
        },
        debugTable: true,
    });

    const selectedRows = useMemo(
        () => table.getSelectedRowModel().rows.map((row: any) => row.original),
        [table.getSelectedRowModel()], // dependency
    );

    useEffect(() => {
        if (refreshData) {
            fetchData().finally(() => {
                setRefreshData(false); // reset setelah selesai fetch
                table.resetRowSelection();
            });
        }
    }, [refreshData]);

    useEffect(() => {
        setRowSelection?.(selectedRows);
    }, [selectedRows]);

    const contextValue = {
        data,
        columns: initialColumns,
        table,
        isLoading,
        setIsLoading,
        globalFilter,
        setGlobalFilter,
        sorting,
        setSorting,
        pagination,
        setPagination,
        selectedRows,
        refreshData,
        setRefreshData,
        formatDataExport,
        customButtons,
        fetchData,
    };

    return (
        <DataTableContext.Provider value={contextValue}>
            {children}
        </DataTableContext.Provider>
    );
};
