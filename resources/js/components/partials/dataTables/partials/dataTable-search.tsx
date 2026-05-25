import { Input } from '@/components/ui/input';
import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseDataTable } from '../hooks/useDataTables';

export const DataTableGlobalSearch = () => {
    const { setPagination, globalFilter, setGlobalFilter, table }: any =
        UseDataTable();

    const [search, setSearch] = useState('');

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setGlobalFilter(value);
                setPagination((prev: any) => ({ ...prev, page: 1 }));
                table.resetRowSelection();
            }, 500),
        [],
    );

    useEffect(() => {
        debouncedSearch(search);
    }, [search]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <Input
            className="w-fit"
            placeholder="Search"
            type="search"
            onChange={(e: any) => setSearch(e.target.value)}
        />
    );
};
