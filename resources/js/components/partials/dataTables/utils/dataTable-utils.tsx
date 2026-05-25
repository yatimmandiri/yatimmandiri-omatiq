import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { router } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronsUpDownIcon,
    ChevronUpIcon,
    FileTextIcon,
    MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

export const renderRowHeader = (info: any, title: string) => {
    const isSorted = info.column.getIsSorted();
    const columnId = info.column.id;

    const renderSortIcon = () => {
        if (isSorted === 'asc') return <ChevronUpIcon className="h-5 w-5" />;
        if (isSorted === 'desc') return <ChevronDownIcon className="h-5 w-5" />;

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
    if (!value) return '-';

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

export const renderRowActions = (info: any, setRefreshData: any) => {
    const { currentUrl } = useCurrentUrl();

    const [openModal, setOpenModal] = useState(false);

    const data = info.row.original;

    const handleDelete = (id: number) => {
        router.delete(`${currentUrl}/${id}`, {
            onSuccess: () => {
                setOpenModal(false);
                setRefreshData(true);
            },
        });
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
                    <DropdownMenuItem
                        onClick={() =>
                            router.visit(`${currentUrl}/${data.id}/edit`)
                        }
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpenModal(true)}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {openModal && (
                <Dialog
                    open={openModal}
                    onOpenChange={(open) => setOpenModal(open)}
                >
                    <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
                    <DialogContent className="">
                        <DialogTitle className="text-xl font-semibold">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2">
                            Are you sure you want to delete this item? This
                            action cannot be undone.
                        </DialogDescription>
                        <div className="mt-4 flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setOpenModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(data.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Fragment>
    );
};
