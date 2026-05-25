import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UseDataTable } from '../hooks/useDataTables';

export const DataTablePageSize = () => {
    const pageSizeOptions = [10, 25, 50, 100, 250, 500];

    const { pagination, setPagination, table }: any = UseDataTable();

    const handlePageSizeChange = (value: string) => {
        localStorage.setItem('pageSize', value);
        setPagination({
            ...pagination,
            page: 1,
            perPage: parseInt(value),
        });

        table.resetRowSelection();
    };

    return (
        <div className="flex flex-row items-center">
            <Select
                defaultValue={pagination?.perPage?.toString()}
                onValueChange={(value: string) => handlePageSizeChange(value)}
            >
                <SelectTrigger className="w-fit">
                    <SelectValue
                        placeholder={pagination?.perPage?.toString()}
                    />
                </SelectTrigger>
                <SelectContent>
                    {pageSizeOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
