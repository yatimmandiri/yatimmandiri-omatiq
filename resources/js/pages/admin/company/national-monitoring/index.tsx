import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes/admin';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/utils/sweetalert';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock,
    Filter,
    MapPin,
    MoreHorizontal,
    Package,
    RefreshCw,
    RotateCcw,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

type TodayLog = {
    id: number;
    checkpoint: string;
    checkpoint_label: string;
    time: string;
};

type MonitoringRow = {
    id: number;
    participant_id: number;
    registration_number: string;
    name: string;
    school_name: string;
    branch: string;
    olimpiade: string;
    pack_received: boolean;
    pack_received_at?: string | null;
    has_checked_in_today: boolean;
    latest_checkpoint?: string | null;
    latest_checkpoint_label?: string | null;
    latest_checked_in_at?: string | null;
    today_logs: TodayLog[];
};

export default function NationalMonitoringPage() {
    const { stats, checkpoints, todayLabel } = usePage<any>().props;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const handleResetCheckIn = async (row: MonitoringRow, log?: TodayLog) => {
        const confirmed = await confirmAction({
            title: log ? `Reset Pos ${log.checkpoint_label}?` : 'Reset Kehadiran Hari Ini?',
            text: log
                ? `Log kehadiran ${row.name} di pos "${log.checkpoint_label}" (${log.time}) akan dihapus.`
                : `Seluruh log kehadiran hari ini untuk ${row.name} (${row.registration_number}) akan dihapus.`,
            confirmButtonText: 'Ya, Reset',
        });

        if (!confirmed) return;

        router.post(
            `/admin/companies/national-monitoring/${row.id}/reset-checkin`,
            log ? { log_id: log.id } : {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccessAlert('Berhasil Direset', 'Log kehadiran peserta telah diperbarui.');
                    setRefreshData((prev) => !prev);
                },
                onError: () => showErrorAlert('Gagal', 'Terjadi kesalahan saat mereset log kehadiran.'),
            }
        );
    };

    const handleResetPack = async (row: MonitoringRow) => {
        const confirmed = await confirmAction({
            title: 'Reset Status Event Kit?',
            text: `Status penerimaan Event Kit untuk ${row.name} akan dikembalikan menjadi Belum Diterima.`,
            confirmButtonText: 'Ya, Reset Pack',
        });

        if (!confirmed) return;

        router.post(
            `/admin/companies/national-monitoring/${row.id}/reset-pack`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccessAlert('Berhasil Direset', 'Status Event Kit telah dikembalikan.');
                    setRefreshData((prev) => !prev);
                },
                onError: () => showErrorAlert('Gagal', 'Terjadi kesalahan saat mereset Event Kit.'),
            }
        );
    };

    const columns = [
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                if (!item.has_checked_in_today && !item.pack_received) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Aksi Admin (Reset)</DropdownMenuLabel>
                            {item.has_checked_in_today && (
                                <DropdownMenuItem
                                    onClick={() => handleResetCheckIn(item)}
                                    className="text-rose-600 focus:text-rose-600 cursor-pointer"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset Kehadiran Hari Ini
                                </DropdownMenuItem>
                            )}
                            {item.pack_received && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleResetPack(item)}
                                        className="text-amber-700 focus:text-amber-700 cursor-pointer"
                                    >
                                        <Package className="mr-2 h-4 w-4" />
                                        Reset Event Kit
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
        {
            id: 'registration_number',
            accessorKey: 'registration_number',
            header: (info: any) => renderRowHeader(info, 'No. Registrasi'),
            cell: ({ row }: any) => (
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {row.original.registration_number}
                </span>
            ),
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: (info: any) => renderRowHeader(info, 'Peserta'),
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                return (
                    <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.school_name}</div>
                    </div>
                );
            },
        },
        {
            id: 'branch',
            accessorKey: 'branch',
            header: (info: any) => renderRowHeader(info, 'Cabang & Lomba'),
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                return (
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.branch}</div>
                        <div className="text-[11px] text-slate-500">{item.olimpiade}</div>
                    </div>
                );
            },
        },
        {
            id: 'latest_checked_in_at',
            accessorKey: 'latest_checked_in_at',
            header: (info: any) => renderRowHeader(info, 'Pos Terakhir Hari Ini'),
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                if (!item.has_checked_in_today) {
                    return (
                        <Badge variant="outline" className="text-slate-400 border-slate-200">
                            Belum Scan
                        </Badge>
                    );
                }
                return (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{item.latest_checkpoint_label}</span>
                        <span className="text-emerald-500">({item.latest_checked_in_at})</span>
                    </div>
                );
            },
        },
        {
            id: 'today_logs',
            header: 'Rute Perpindahan Hari Ini',
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                if (item.today_logs.length === 0) {
                    return <span className="text-xs text-slate-400">-</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {item.today_logs.map((log) => (
                            <button
                                key={log.id}
                                type="button"
                                onClick={() => handleResetCheckIn(item, log)}
                                title="Klik untuk reset titik pos ini"
                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition"
                            >
                                <span>{log.checkpoint_label}</span>
                                <span className="text-slate-400">({log.time})</span>
                                <XCircle className="h-3 w-3 text-slate-400 hover:text-rose-600" />
                            </button>
                        ))}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'pack_received',
            accessorKey: 'pack_received',
            header: (info: any) => renderRowHeader(info, 'Event Kit'),
            cell: ({ row }: any) => {
                const item: MonitoringRow = row.original;
                return item.pack_received ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold">
                        Sudah ({item.pack_received_at})
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200">
                        Belum
                    </Badge>
                );
            },
        },
    ];

    const checkpointOptions = Object.entries(checkpoints || {}).map(([value, label]) => ({
        value,
        label: String(label),
    }));

    return (
        <>
            <Head title="Monitoring Peserta Nasional" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Activity className="h-7 w-7 text-[#17524A]" />
                            Monitoring Peserta Nasional
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Pantau pergerakan lokasi, riwayat check-in hari ini ({todayLabel}), dan status Event Kit secara real-time. Khusus Administrator.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRefreshData((prev) => !prev)}
                        className="border-[#17524A] text-[#17524A] hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 font-bold shadow-sm"
                    >
                        <RefreshCw className="mr-1.5 h-4 w-4" />
                        Refresh Live
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Finalis</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats?.total ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hadir Hari Ini</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.checked_in_today ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Belum Scan Hari Ini</p>
                                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats?.not_checked_in_today ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Kit Diterima</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats?.pack_received ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                                <Package className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400 shrink-0" />

                        <div className="w-56">
                            <SelectComponent
                                data={checkpointOptions}
                                dataSelected={filterValue.checkpoint || ''}
                                handleOnChange={(val: string) => setFilterValue((prev) => ({ ...prev, checkpoint: val }))}
                                placeholder="Semua Pos / Lokasi Terakhir"
                            />
                        </div>

                        <div className="w-48">
                            <SelectComponent
                                data={[
                                    { value: 'checked_in', label: 'Sudah Scan Hari Ini' },
                                    { value: 'not_checked_in', label: 'Belum Scan Hari Ini' },
                                ]}
                                dataSelected={filterValue.status || ''}
                                handleOnChange={(val: string) => setFilterValue((prev) => ({ ...prev, status: val }))}
                                placeholder="Semua Status Kehadiran"
                            />
                        </div>

                        {hasActiveFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterValue({})}
                                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </div>

                {/* DataTable */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <DataTableProvider
                        urlFetchData="/admin/companies/national-monitoring/data"
                        columns={columns}
                        withActions={false}
                        filterValue={filterValue}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}
                        initialSorting={[{ id: 'id', desc: true }]}
                        formatDataExport={(items: any[]) =>
                            items.map((item: MonitoringRow, i: number) => ({
                                No: i + 1,
                                'No. Registrasi': item.registration_number,
                                Nama: item.name,
                                Sekolah: item.school_name,
                                Cabang: item.branch,
                                Lomba: item.olimpiade,
                                'Pos Terakhir Hari Ini': item.has_checked_in_today
                                    ? `${item.latest_checkpoint_label} (${item.latest_checked_in_at})`
                                    : 'Belum Scan',
                                'Rute Hari Ini':
                                    item.today_logs.length > 0
                                        ? item.today_logs.map((l) => `${l.checkpoint_label} (${l.time})`).join(' -> ')
                                        : '-',
                                'Event Kit': item.pack_received ? `Sudah (${item.pack_received_at})` : 'Belum',
                            }))
                        }
                    >
                        <DataTableComponent />
                    </DataTableProvider>
                </div>
            </div>
        </>
    );
}

NationalMonitoringPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Monitoring Peserta Nasional', href: '#' },
    ],
};
