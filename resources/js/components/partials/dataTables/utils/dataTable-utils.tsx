import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { formatDate } from '@/utils/formatDate';
import { confirmDelete } from '@/utils/sweetalert';
import { router } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronsUpDownIcon,
    ChevronUpIcon,
    FileTextIcon,
    MoreHorizontal,
} from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

export const renderRowHeader = (info: any, title: string) => {
    const isSorted = info.column.getIsSorted();
    const columnId = info.column.id;

    const renderSortIcon = () => {
        if (isSorted === 'asc') {
            return <ChevronUpIcon className="h-5 w-5" />;
        }

        if (isSorted === 'desc') {
            return <ChevronDownIcon className="h-5 w-5" />;
        }

        if (!isSorted && columnId === 'id') {
            return (
                <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
            );
        }

        return <ChevronsUpDownIcon className="h-5 w-5 text-muted-foreground" />;
    };

    return (
        <div
            className="flex cursor-pointer flex-row items-center justify-between space-x-4 px-3"
            onClick={info.column.getToggleSortingHandler()}
        >
            <span>{title}</span>
            {renderSortIcon()}
        </div>
    );
};

export const renderRowDate = (value: any) => {
    if (!value) {
        return '-';
    }

    return formatDate(value);
};

export const renderRowNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
};

export const renderRowParagraph = (value: string) => {
    return (
        <div className="line-clamp-2 wrap-break-word whitespace-normal">
            {value}
        </div>
    );
};

export const renderRowPDF = (value: any) => {
    if (value) {
        return (
            <a href={`/storage/${value}`} target="_blank">
                <FileTextIcon className="h-8 w-8 text-red-500" />
            </a>
        );
    }

    return <div>No PDF</div>;
};

export const renderRowImage = (
    value: any,
    className: string,
    isExternal?: boolean,
) => {
    if (!value) {
        return <div className="text-gray-400 italic">No Image</div>;
    }

    // Pastikan path file
    const url = isExternal ? value : `/storage/${value}`;

    return (
        <img
            src={url}
            alt="Image"
            className={`rounded-md object-cover ${className}`}
            width={40}
            height={40}
            loading="lazy"
        />
    );
};

export const RowActions = ({
    info,
    setRefreshData,
    actions,
}: {
    info: any;
    setRefreshData: any;
    actions?: { edit?: boolean; delete?: boolean };
}) => {
    const { currentUrl } = useCurrentUrl();

    const data = info.row.original;

    const showEdit = actions?.edit !== false;
    const showDelete = actions?.delete !== false;

    const handleDelete = async (id: number) => {
        const isConfirmed = await confirmDelete({
            title: 'Konfirmasi Hapus Data',
            text: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
            confirmButtonText: 'Ya, Hapus',
        });

        if (isConfirmed) {
            router.delete(`${currentUrl}/${id}`, {
                onSuccess: () => {
                    setRefreshData(true);
                },
            });
        }
    };

    return (
        <Fragment>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => router.visit(`${currentUrl}/${data.id}`)}
                    >
                        Detail
                    </DropdownMenuItem>
                    {showEdit && (
                        <DropdownMenuItem
                            onClick={() =>
                                router.visit(`${currentUrl}/${data.id}/edit`)
                            }
                        >
                            Edit
                        </DropdownMenuItem>
                    )}
                    {showDelete && (
                        <DropdownMenuItem
                            onClick={() => handleDelete(data.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </Fragment>
    );
};
