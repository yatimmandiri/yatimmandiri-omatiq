import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import participants from '@/routes/admin/companies/participants';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock3, ExternalLink, Filter, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';

const statusLabels: Record<string, string> = {
    submitted: 'Menunggu',
    verified: 'Verified',
    rejected: 'Ditolak',
};

const registrationTypeLabels: Record<string, string> = {
    public: 'Umum',
    teacher: 'Guru',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Belum Bayar',
    waiting_confirmation: 'Menunggu Konfirmasi',
    paid: 'Lunas',
};

const statusVariant = (status: string) =>
    status === 'verified' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';

export default function ListPage() {
    const { filterOptions, sheets } = usePage<{
        filterOptions?: {
            olimpiades?: Array<{ value: string; label: string }>;
            eventYears?: Array<{ value: string; label: string }>;
            branches?: Array<{ value: string; label: string }>;
        };
        sheets?: {
            enabled?: boolean;
            spreadsheet_id?: string | null;
            sheet_name?: string | null;
            url?: string | null;
        };
    }>().props;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Peserta'),
            accessorKey: 'student.full_name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = info.getValue() ?? row.full_name ?? '-';
                return (
                    <div className="space-y-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.registration_number}
                        </p>
                    </div>
                );
            },
        },
        {
            header: 'Olimpiade',
            accessorKey: 'olimpiade',
            cell: (info: any) => info.getValue()?.name ?? '-',
        },
        {
            header: 'Jalur',
            accessorKey: 'registration_type',
            cell: (info: any) =>
                registrationTypeLabels[info.getValue()] ?? info.getValue() ?? '-',
        },
        {
            header: 'Sekolah',
            accessorKey: 'student.school_name',
            cell: (info: any) => {
                const row = info.row.original;
                return row.student?.school_name ?? info.getValue() ?? '-';
            },
        },
        {
            header: 'Wilayah',
            accessorKey: 'student.regency',
            cell: (info: any) => {
                const row = info.row.original;
                return info.getValue()?.name ?? row.penyaluran_sanggar_name ?? row.student?.school_name ?? '-';
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();
                const Icon = status === 'verified' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3;
                const row = info.row.original;

                const updateStatus = (newStatus: string) => {
                    router.put(
                        participants.status(row.id).url,
                        { status: newStatus },
                        {
                            preserveScroll: true,
                            onSuccess: () => setRefreshData((v) => !v),
                        },
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge variant={statusVariant(status) as any} className="cursor-pointer">
                                <Icon />
                                {statusLabels[status] ?? status}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => updateStatus('submitted')}>
                                <Clock3 /> Submitted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus('verified')}>
                                <CheckCircle2 /> Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus('rejected')}>
                                <XCircle /> Rejected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            header: 'Pembayaran',
            accessorKey: 'payment_status',
            cell: (info: any) => {
                const value = info.getValue();

                return (
                    <Badge variant={value === 'paid' ? 'default' : 'outline'}>
                        {paymentStatusLabels[value] ?? value ?? '-'}
                    </Badge>
                );
            },
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={participants.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => ({
                            No: index + 1,
                            Registrasi: item.registration_number,
                            Nama: item.student?.full_name ?? item.full_name ?? '-',
                            Olimpiade: item.olimpiade?.name || '-',
                            Jalur: registrationTypeLabels[item.registration_type] ?? item.registration_type ?? '-',
                            Sekolah: item.student?.school_name ?? '-',
                            Wilayah: item.student?.regency?.name ?? item.penyaluran_sanggar_name ?? '-',
                            Status: statusLabels[item.status] ?? item.status,
                            Pembayaran: paymentStatusLabels[item.payment_status] ?? item.payment_status ?? '-',
                            Cabang: item.branch ?? '-',
                            Tahun: item.event_year ?? '-',
                        }))
                    }
                >
                    <div className="flex flex-col gap-4 px-4 pt-8 md:px-8">
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <ExternalLink className="size-4 text-primary" />
                                        Google Sheets Realtime
                                        {sheets?.enabled ? (
                                            <Badge variant="default" className="ml-2">
                                                Live
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="ml-2">
                                                Off
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {sheets?.enabled && sheets?.url
                                            ? `1 sheet • ${sheets.sheet_name ?? 'Data Peserta'} • Auto sync via queue + manual Sync Ulang. NIK full, public Viewer.`
                                            : 'Aktifkan di Site Settings (spreadsheet ID) untuk sync otomatis saat ada peserta baru/update.'}
                                    </p>
                                    {sheets?.spreadsheet_id && (
                                        <p className="text-xs text-muted-foreground">ID: {sheets.spreadsheet_id}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {sheets?.url && (
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={sheets.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-4" />
                                                Buka GSheet
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => router.post(participants.syncSheet().url)}
                                        disabled={!sheets?.enabled}
                                    >
                                        <RefreshCw className="size-4" />
                                        Sync Ulang
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Filter className="size-4 text-primary" />
                                    Filter Peserta
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Gunakan filter server-side untuk mempercepat
                                    pengecekan data peserta dalam jumlah besar.
                                </p>
                            </div>
                            {hasActiveFilter && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilterValue({})}
                                >
                                    <RotateCcw />
                                    Reset Filter
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SelectComponent
                                label="Olimpiade"
                                placeholder="Semua olimpiade..."
                                data={filterOptions?.olimpiades ?? []}
                                dataSelected={filterValue.olimpiade_id}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        olimpiade_id: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Status Peserta"
                                placeholder="Semua status..."
                                data={[
                                    { value: 'submitted', label: 'Menunggu' },
                                    { value: 'verified', label: 'Verified' },
                                    { value: 'rejected', label: 'Ditolak' },
                                ]}
                                dataSelected={filterValue.status}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        status: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Jalur Pendaftaran"
                                placeholder="Semua jalur..."
                                data={[
                                    { value: 'public', label: 'Umum' },
                                    { value: 'teacher', label: 'Guru' },
                                ]}
                                dataSelected={filterValue.registration_type}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        registration_type: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Tahun Event"
                                placeholder="Semua tahun..."
                                data={filterOptions?.eventYears ?? []}
                                dataSelected={filterValue.event_year}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        event_year: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Status Pembayaran"
                                placeholder="Semua pembayaran..."
                                data={[
                                    { value: 'unpaid', label: 'Belum Bayar' },
                                    {
                                        value: 'waiting_confirmation',
                                        label: 'Menunggu Konfirmasi',
                                    },
                                    { value: 'paid', label: 'Lunas' },
                                ]}
                                dataSelected={filterValue.payment_status}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        payment_status: value,
                                    }))
                                }
                            />
                            <SelectComponent
                                label="Cabang / Kantor"
                                placeholder="Semua cabang..."
                                data={filterOptions?.branches ?? []}
                                dataSelected={filterValue.branch}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        branch: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}
