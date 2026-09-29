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
import { ProofModal } from '@/components/ui/proof-modal';
import participants from '@/routes/admin/companies/participants';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    CreditCard,
    ExternalLink,
    Eye,
    Filter,
    MapPin,
    RefreshCw,
    RotateCcw,
    XCircle,
} from 'lucide-react';
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
    status === 'verified'
        ? 'default'
        : status === 'rejected'
          ? 'destructive'
          : 'secondary';

export default function ListPage() {
    const { filterOptions, sheets, auth, userBranch } = usePage<{
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
        auth?: {
            user?: {
                permissions?: string[];
                roles?: string[];
            };
        };
        userBranch?: string | null;
    }>().props;

    const userRoles = auth?.user?.roles ?? [];
    const isKeuangan = userRoles.includes('Keuangan');
    const isCabang = userRoles.includes('Cabang');
    const defaultFilter: Record<string, string> = isKeuangan
        ? { registration_type: 'public' }
        : {};

    const [filterValue, setFilterValue] =
        useState<Record<string, string>>(defaultFilter);
    const [refreshData, setRefreshData] = useState(false);
    const [proofUrl, setProofUrl] = useState<string | null>(null);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);

    const hasActiveFilter = Object.entries(filterValue).some(([k, v]) => {
        if (isKeuangan && k === 'registration_type' && v === 'public') {
            return false;
        }
        return Boolean(v);
    });

    const canUpdate =
        (auth?.user?.permissions ?? []).includes('update-participant') ||
        userRoles.includes('Administrators');

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
                registrationTypeLabels[info.getValue()] ??
                info.getValue() ??
                '-',
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

                return (
                    info.getValue()?.name ??
                    row.penyaluran_sanggar_name ??
                    row.student?.school_name ??
                    '-'
                );
            },
        },
        {
            header: 'Kantor Cabang',
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;

                return row.branch ?? row.kantor_name ?? '-';
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info: any) => {
                const status = info.getValue();
                const Icon =
                    status === 'verified'
                        ? CheckCircle2
                        : status === 'rejected'
                          ? XCircle
                          : Clock3;
                const row = info.row.original;

                // Keuangan cannot change registration status (read-only)
                if (!canUpdate || isKeuangan) {
                    return (
                        <Badge variant={statusVariant(status) as any}>
                            <Icon />
                            {statusLabels[status] ?? status}
                        </Badge>
                    );
                }

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
                            <Badge
                                variant={statusVariant(status) as any}
                                className="cursor-pointer"
                            >
                                <Icon />
                                {statusLabels[status] ?? status}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() => updateStatus('submitted')}
                            >
                                <Clock3 className="size-3.5" /> Menunggu
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => updateStatus('verified')}
                            >
                                <CheckCircle2 className="size-3.5 text-emerald-600" /> Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => updateStatus('rejected')}
                            >
                                <XCircle className="size-3.5 text-destructive" /> Ditolak
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
                const value = info.getValue() || 'unpaid';
                const row = info.row.original;

                const getPaymentBadge = (val: string) => {
                    switch (val) {
                        case 'paid':
                            return (
                                <Badge
                                    variant="default"
                                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    {paymentStatusLabels.paid}
                                </Badge>
                            );
                        case 'waiting_confirmation':
                            return (
                                <Badge
                                    variant="secondary"
                                    className="cursor-pointer border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                >
                                    <Clock3 className="size-3.5" />
                                    {paymentStatusLabels.waiting_confirmation}
                                </Badge>
                            );
                        default:
                            return (
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10"
                                >
                                    <XCircle className="size-3.5" />
                                    {paymentStatusLabels.unpaid}
                                </Badge>
                            );
                    }
                };

                if (!canUpdate) {
                    return getPaymentBadge(value);
                }

                const updatePaymentStatus = (newStatus: string) => {
                    router.put(
                        participants.status(row.id).url,
                        { payment_status: newStatus },
                        {
                            preserveScroll: true,
                            onSuccess: () => setRefreshData((v) => !v),
                        },
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {getPaymentBadge(value)}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() => updatePaymentStatus('unpaid')}
                            >
                                <XCircle className="size-3.5 text-destructive" /> Belum Bayar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    updatePaymentStatus('waiting_confirmation')
                                }
                            >
                                <Clock3 className="size-3.5 text-amber-600" /> Menunggu Konfirmasi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => updatePaymentStatus('paid')}
                            >
                                <CheckCircle2 className="size-3.5 text-emerald-600" /> Lunas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            header: 'Bukti Transfer',
            accessorKey: 'payment_proof_url',
            cell: (info: any) => {
                const row = info.row.original;
                const url = row.payment_proof_url;

                if (!url) {
                    return <span className="text-xs text-muted-foreground">-</span>;
                }

                return (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                        onClick={() => {
                            setProofUrl(url);
                            setIsProofModalOpen(true);
                        }}
                    >
                        <Eye className="size-3.5" />
                        Lihat Bukti
                    </Button>
                );
            },
            enableSorting: false,
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
                            Nama:
                                item.student?.full_name ??
                                item.full_name ??
                                '-',
                            Olimpiade: item.olimpiade?.name || '-',
                            Jalur:
                                registrationTypeLabels[
                                    item.registration_type
                                ] ??
                                item.registration_type ??
                                '-',
                            Sekolah: item.student?.school_name ?? '-',
                            Wilayah:
                                item.student?.regency?.name ??
                                item.penyaluran_sanggar_name ??
                                '-',
                            Status: statusLabels[item.status] ?? item.status,
                            Pembayaran:
                                paymentStatusLabels[item.payment_status] ??
                                item.payment_status ??
                                '-',
                            Cabang: item.branch ?? '-',
                            Tahun: item.event_year ?? '-',
                        }))
                    }
                >
                    <div className="flex flex-col gap-4 px-4 pt-8 md:px-8">
                        {userBranch && (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <MapPin className="size-3.5" />
                                Menampilkan data peserta wilayah:{' '}
                                <strong>{userBranch}</strong>
                            </div>
                        )}

                        {isKeuangan && (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                                <CreditCard className="size-3.5" />
                                Akses Akun Keuangan: Verifikasi Status Pembayaran (Default Filter: Jalur Umum)
                            </div>
                        )}

                        {sheets && !isCabang && !isKeuangan && (
                            <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <ExternalLink className="size-4 text-primary" />
                                        Google Sheets Realtime
                                        {sheets?.enabled ? (
                                            <Badge
                                                variant="default"
                                                className="ml-2"
                                            >
                                                Live
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="ml-2"
                                            >
                                                Off
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {sheets?.url && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <a
                                                href={sheets.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="size-4" />
                                                Buka GSheet
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            router.post(
                                                participants.syncSheet().url,
                                            )
                                        }
                                        disabled={!sheets?.enabled}
                                    >
                                        <RefreshCw className="size-4" />
                                        Sync Ulang
                                    </Button>
                                </div>
                            </div>
                        </div>
                        )}

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
                                    onClick={() => setFilterValue(defaultFilter)}
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
                            {!isCabang && !userBranch && (
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
                            )}
                        </div>
                    </div>
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>

            <ProofModal
                open={isProofModalOpen}
                onOpenChange={setIsProofModalOpen}
                href={proofUrl ?? ''}
            />
        </div>
    );
}
