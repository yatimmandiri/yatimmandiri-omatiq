import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
import { DatePickerComponent } from '@/components/partials/datePicker-component';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import activities from '@/routes/admin/logs/activities';
import { formatDate } from '@/utils/formatDate';
import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Eye,
    Filter,
    Layers,
    RotateCcw,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface ListPageProps {
    events?: Array<{ id: string; name: string }>;
    subjectTypes?: Array<{ id: string; name: string }>;
}

export default function ListPage({
    events = [],
    subjectTypes = [],
}: ListPageProps) {
    const [refreshData, setRefreshData] = useState(false);
    const [detailLog, setDetailLog] = useState<any | null>(null);
    const [filterValue, setFilterValue] = useState<any>({
        event: 'all',
        subject_type: 'all',
        date_from: '',
        date_to: '',
    });

    const resetFilter = () => {
        setFilterValue({
            event: 'all',
            subject_type: 'all',
            date_from: '',
            date_to: '',
        });
        setRefreshData((prev) => !prev);
    };

    const fmtVal = (val: any) => {
        if (val === null || val === undefined || val === '') return '-';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    const renderEventBadge = (event: string) => {
        const ev = String(event || '').toLowerCase();
        if (ev === 'created') {
            return (
                <Badge className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
                    Tambah
                </Badge>
            );
        }
        if (ev === 'updated') {
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                >
                    Ubah
                </Badge>
            );
        }
        if (ev === 'deleted') {
            return (
                <Badge variant="destructive" className="font-semibold">
                    Hapus
                </Badge>
            );
        }
        return <Badge variant="secondary">{event || '-'}</Badge>;
    };

    const columns = useMemo(
        () => [
            {
                id: 'aksi',
                header: () => (
                    <div className="text-center font-semibold">Aksi</div>
                ),
                cell: (info: any) => {
                    const row = info.row.original;
                    return (
                        <div className="flex justify-center">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 px-2.5 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                                onClick={() => setDetailLog(row)}
                            >
                                <Eye className="size-3.5" />
                                Detail
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                header: (info: any) => renderRowHeader(info, 'Waktu'),
                accessorKey: 'created_at',
                cell: (info: any) => {
                    const val = info.getValue();
                    return (
                        <div className="space-y-0.5 whitespace-nowrap">
                            <p className="font-medium">
                                {formatDate(val, 'datetime')}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                                ID: #{info.row.original.id}
                            </p>
                        </div>
                    );
                },
            },
            {
                id: 'user_pelaku',
                header: (info: any) => renderRowHeader(info, 'Pengguna / Pelaku'),
                cell: (info: any) => {
                    const row = info.row.original;
                    return (
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">
                                    {row.causer_name}
                                </span>
                                {row.causer_branch && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] uppercase"
                                    >
                                        {row.causer_branch}
                                    </Badge>
                                )}
                            </div>
                            {row.causer_email && (
                                <p className="text-xs text-muted-foreground">
                                    {row.causer_email}
                                </p>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                header: (info: any) => renderRowHeader(info, 'Aktivitas'),
                accessorKey: 'event',
                cell: (info: any) => renderEventBadge(info.getValue()),
            },
            {
                id: 'modul_target',
                header: (info: any) => renderRowHeader(info, 'Modul & Target'),
                cell: (info: any) => {
                    const row = info.row.original;
                    return (
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                                    {row.subject_name}
                                </span>
                                {row.subject_id && (
                                    <span className="font-mono text-xs text-muted-foreground">
                                        #{row.subject_id}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {row.description || '-'}
                            </p>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: 'perubahan_nilai',
                header: () => (
                    <div className="font-semibold">Nilai Berubah (Diff)</div>
                ),
                cell: (info: any) => {
                    const row = info.row.original;
                    const diffs = Array.isArray(row.diff_fields)
                        ? row.diff_fields
                        : [];
                    if (diffs.length === 0) {
                        return (
                            <span className="text-xs text-muted-foreground">
                                -
                            </span>
                        );
                    }
                    const first = diffs[0];
                    const extra = diffs.length - 1;

                    return (
                        <div className="max-w-[320px] text-xs">
                            <div className="font-mono text-[11px] leading-relaxed">
                                <span className="font-semibold text-foreground">
                                    {first.field}:
                                </span>{' '}
                                <span className="text-destructive line-through">
                                    {fmtVal(first.old)}
                                </span>{' '}
                                <span className="text-muted-foreground">→</span>{' '}
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {fmtVal(first.new)}
                                </span>
                            </div>
                            {extra > 0 && (
                                <p className="mt-0.5 font-medium text-[10px] text-muted-foreground">
                                    +{extra} kolom lainnya
                                </p>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [],
    );

    const formatDataExport = (data: any[]) => {
        return data.map((item: any, i: number) => {
            const diffs = Array.isArray(item.diff_fields) ? item.diff_fields : [];
            const diffText = diffs
                .map((d: any) => `${d.field}: ${fmtVal(d.old)} -> ${fmtVal(d.new)}`)
                .join(' | ');

            return {
                No: i + 1,
                Waktu: formatDate(item.created_at, 'datetime'),
                Pelaku: item.causer_name,
                Email: item.causer_email || '-',
                Cabang: item.causer_branch || '-',
                Aktivitas: item.event,
                Modul: item.subject_name,
                'ID Target': item.subject_id || '-',
                Deskripsi: item.description || '-',
                'Nilai Berubah': diffText || '-',
            };
        });
    };

    return (
        <>
            <Head title="Log Aktivitas Sistem" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Activity className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                            Log Aktivitas Sistem
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Rekam jejak seluruh penambahan, pengubahan, dan penghapusan data oleh pengguna di dalam sistem.
                    </p>
                </div>

                <div className="relative min-h-[500px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <DataTableProvider
                        columns={columns}
                        filterValue={filterValue}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}
                        urlFetchData={activities.data().url}
                        formatDataExport={formatDataExport}
                        withActions={false}
                    >
                        <div className="flex flex-col space-y-4 border-b bg-muted/20 px-4 py-5 md:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <Filter className="size-3.5" />
                                    Filter Aktivitas
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={resetFilter}
                                >
                                    <RotateCcw className="size-3" />
                                    Reset Filter
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <SelectComponent
                                    label="Jenis Aktivitas"
                                    placeholder="Semua event..."
                                    data={events}
                                    dataSelected={filterValue.event}
                                    handleOnChange={(val: any) =>
                                        setFilterValue((prev: any) => ({
                                            ...prev,
                                            event: val,
                                        }))
                                    }
                                />

                                <SelectComponent
                                    label="Modul / Entitas"
                                    placeholder="Semua modul..."
                                    data={subjectTypes}
                                    dataSelected={filterValue.subject_type}
                                    handleOnChange={(val: any) =>
                                        setFilterValue((prev: any) => ({
                                            ...prev,
                                            subject_type: val,
                                        }))
                                    }
                                />

                                <DatePickerComponent
                                    label="Dari Tanggal"
                                    value={filterValue.date_from}
                                    handleOnChange={(val: any) =>
                                        setFilterValue((prev: any) => ({
                                            ...prev,
                                            date_from: val ? formatDate(val, 'custom') : '',
                                        }))
                                    }
                                />

                                <DatePickerComponent
                                    label="Sampai Tanggal"
                                    value={filterValue.date_to}
                                    handleOnChange={(val: any) =>
                                        setFilterValue((prev: any) => ({
                                            ...prev,
                                            date_to: val ? formatDate(val, 'custom') : '',
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <DataTableComponent />
                    </DataTableProvider>
                </div>
            </div>

            {/* Modal Detail Perubahan Data (Diff) */}
            <Dialog open={Boolean(detailLog)} onOpenChange={(open) => !open && setDetailLog(null)}>
                <DialogContent className="max-w-2xl sm:max-w-3xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
                            <DialogTitle className="text-lg font-bold">
                                Detail Riwayat Perubahan Data
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Rincian perbedaan nilai lama (*old*) dan nilai baru (*new*) pada entitas yang disentuh.
                        </DialogDescription>
                    </DialogHeader>

                    {detailLog && (
                        <div className="space-y-4 py-2">
                            {/* Metadata Header */}
                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3.5 text-xs sm:grid-cols-4">
                                <div>
                                    <p className="font-semibold text-muted-foreground">Waktu Kejadian</p>
                                    <p className="mt-0.5 font-medium text-foreground">
                                        {formatDate(detailLog.created_at, 'datetime')}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Pelaku (User)</p>
                                    <p className="mt-0.5 font-medium text-foreground">
                                        {detailLog.causer_name}
                                    </p>
                                    {detailLog.causer_email && (
                                        <p className="text-[11px] text-muted-foreground">
                                            {detailLog.causer_email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Aktivitas</p>
                                    <div className="mt-0.5">
                                        {renderEventBadge(detailLog.event)}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Target Entitas</p>
                                    <p className="mt-0.5 font-mono font-medium text-foreground">
                                        {detailLog.subject_name} #{detailLog.subject_id || '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Diff Table */}
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Perbedaan Nilai Kolom ({detailLog.diff_count} kolom)
                                </h4>
                                <div className="max-h-[340px] overflow-auto rounded-lg border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[180px] text-xs font-bold">
                                                    Nama Field
                                                </TableHead>
                                                <TableHead className="text-xs font-bold text-destructive">
                                                    Nilai Lama (Sebelum)
                                                </TableHead>
                                                <TableHead className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    Nilai Baru (Sesudah)
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.isArray(detailLog.diff_fields) &&
                                            detailLog.diff_fields.length > 0 ? (
                                                detailLog.diff_fields.map((f: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                                                            {f.field}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-destructive/90 break-all">
                                                            {fmtVal(f.old)}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-xs text-emerald-600 dark:text-emerald-400 break-all">
                                                            {fmtVal(f.new)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="py-6 text-center text-xs text-muted-foreground"
                                                    >
                                                        Tidak ada rincian perubahan atribut (event create/delete atau tanpa dirty attributes).
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto"
                            onClick={() => setDetailLog(null)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
