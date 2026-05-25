import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { arrayToCSV, downloadCSV } from '@/utils/formatCsv';
import { router } from '@inertiajs/react';
import { CopyIcon, DownloadIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import { createElement } from 'react';
import { toast } from 'sonner';
import { UseDataTable } from '../hooks/useDataTables';

interface DataTableButtonsProps {
    buttonsActive?: any;
}

export const DataTableButtons = ({
    buttonsActive = {},
}: DataTableButtonsProps) => {
    const currentUrl = useCurrentUrl();
    const {
        table,
        setPagination,
        pagination,
        setRefreshData,
        selectedRows,
        formatDataExport,
        customButtons,
    }: any = UseDataTable();

    const buttons = [
        {
            key: 'copy',
            label: 'Copy',
            icon: CopyIcon,
            onClick: () => {
                if (selectedRows.length === 0) {
                    toast.error('Tidak ada data yang dipilih');
                    return;
                }

                const formatedData = formatDataExport(selectedRows);

                const headers = Object.keys(formatedData[0] ?? {});
                const textToCopy = [
                    headers.join('\t'),
                    ...formatedData.map((row: any) =>
                        headers.map((key) => row[key]).join('\t'),
                    ),
                ].join('\n');

                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => toast.success('Data berhasil disalin'))
                    .catch(() => toast.error('Gagal menyalin data'));
            },
            enabled: true,
        },
        {
            key: 'create',
            label: 'Create',
            icon: PlusIcon,
            onClick: () => {
                router.visit(currentUrl.currentUrl + '/create');
            },
            enabled: true,
        },
        {
            key: 'export',
            label: 'Export',
            icon: DownloadIcon,
            children: [
                {
                    key: 'csv',
                    label: 'CSV',
                    onClick: () => {
                        if (selectedRows.length === 0) {
                            toast.error('Tidak ada data yang dipilih');
                            return;
                        }

                        const formatedData = formatDataExport(selectedRows);

                        const csv = arrayToCSV(formatedData);

                        downloadCSV(csv, 'export.csv');
                    },
                },
                {
                    key: 'pdf',
                    label: 'PDF',
                    onClick: () => {
                        if (selectedRows.length === 0) {
                            toast.error('Tidak ada data yang dipilih');
                            return;
                        }

                        const formatedData = formatDataExport(selectedRows);

                        console.log(formatedData);
                    },
                },
            ],
            enabled: true,
        },
        ...(customButtons ?? []),
        {
            key: 'reload',
            label: 'Reload',
            icon: RefreshCwIcon,
            onClick: () => {
                setRefreshData(true);
                table.resetRowSelection();
                setPagination({
                    ...pagination,
                    page: 1,
                });
            },
            enabled: true,
        },
    ];

    // const buttonItems = useMemo(() => first, [second])

    const applyButtonActive = (buttons: any[], buttonsActive: any) => {
        return buttons.map((btn) => {
            const activeConfig = buttonsActive?.[btn.key]; // ✅ perbaikan di sini

            if (btn.children && typeof activeConfig === 'object') {
                return {
                    ...btn,
                    enabled: true,
                    children: btn.children
                        .filter(
                            (child: any) => activeConfig?.[child.key] !== false,
                        )
                        .map((child: any) => ({
                            ...child,
                            enabled: activeConfig?.[child.key] !== false,
                        })),
                };
            }

            return {
                ...btn,
                enabled: activeConfig !== false,
            };
        });
    };

    const filteredButtons = applyButtonActive(buttons, buttonsActive);
    const activeButtons = filteredButtons.filter((btn) => btn.enabled);

    return (
        <div
            className="flex flex-row items-center overflow-x-auto"
            role="group"
        >
            {activeButtons.map((btn, i) =>
                btn.children && btn.children.length > 0 ? (
                    <DropdownMenu key={btn.key}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                className={cn(
                                    i === 0 ? 'rounded-l-md' : 'rounded-l-none',
                                    i === activeButtons.length - 1
                                        ? 'rounded-r-md'
                                        : 'rounded-r-none',
                                )}
                            >
                                {btn.icon &&
                                    createElement(btn.icon, {
                                        className: 'mr-2 h-4 w-4',
                                    })}
                                <span className="hidden md:inline">
                                    {btn.label}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {btn.children.map((child: any) => (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    key={child.key}
                                    onClick={child.onClick}
                                >
                                    <span>{child.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        type="button"
                        key={btn.key}
                        onClick={btn.onClick}
                        className={cn(
                            i === 0 ? 'rounded-l-md' : 'rounded-l-none',
                            i === activeButtons.length - 1
                                ? 'rounded-r-md'
                                : 'rounded-r-none',
                        )}
                    >
                        {btn.icon &&
                            createElement(btn.icon, {
                                className: 'mr-2 h-4 w-4',
                            })}
                        <span className="hidden md:inline">{btn.label}</span>
                    </Button>
                ),
            )}
        </div>
    );
};
