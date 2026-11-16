import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import {
    renderRowDate,
    renderRowHeader,
} from '@/components/partials/dataTables/utils/dataTable-utils';
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
import { confirmAction, confirmDelete, showErrorAlert, showSuccessAlert } from '@/utils/sweetalert';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Archive,
    CheckCircle2,
    Clock,
    Copy,
    Crown,
    Download,
    Eye,
    Filter,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Plus,
    Printer,
    QrCode,
    RotateCcw,
    Send,
    Sparkles,
    Trash2,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const categoryLabels: Record<string, { label: string; className: string }> = {
    vip: {
        label: 'VIP',
        className: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-black',
    },
    vvip: {
        label: 'VIP',
        className: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-black',
    },
    non_vip: {
        label: 'Non-VIP',
        className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-semibold',
    },
    'non-vip': {
        label: 'Non-VIP',
        className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-semibold',
    },
    umum: {
        label: 'Non-VIP',
        className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-semibold',
    },
};

export default function ListGuestsPage() {
    const { stats } = usePage<any>().props;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const handleDelete = async (guest: any) => {
        const confirmed = await confirmDelete({
            title: 'Hapus Tamu Undangan?',
            text: `Data tamu ${guest.name} (${guest.code}) akan dihapus.`,
            confirmButtonText: 'Ya, Hapus Data',
        });

        if (confirmed) {
            router.delete(`/admin/companies/guests/${guest.id}`, {
                onSuccess: () => setRefreshData((prev) => !prev),
            });
        }
    };

    const handleResetRsvp = async (guest: any) => {
        const confirmed = await confirmAction({
            title: 'Reset Konfirmasi RSVP?',
            text: `Status kehadiran tamu VIP ${guest.name} (${guest.code}) akan di-reset kembali menjadi 'Diundang' (invited) sehingga formulir konfirmasi online dapat diisi kembali.`,
            confirmButtonText: 'Ya, Reset RSVP',
        });

        if (confirmed) {
            router.post(
                `/admin/companies/guests/${guest.id}/reset-rsvp`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        showSuccessAlert('Status RSVP Berhasil Direset', 'Formulir RSVP online tamu VIP ini telah dibuka kembali.');
                        setRefreshData((prev) => !prev);
                    },
                    onError: () => {
                        showErrorAlert('Gagal Mereset RSVP', 'Terjadi kesalahan saat memproses reset RSVP.');
                    },
                }
            );
        }
    };

    const handleBulkCheckIn = async () => {
        if (selectedRows.length === 0) return;

        const ids = selectedRows.map((r) => r.id);
        setIsCheckingIn(true);

        try {
            const res = await axios.post('/admin/companies/guests/bulk-check-in', { ids });
            showSuccessAlert('Check-In Berhasil!', res.data.message || `${ids.length} tamu berhasil ditandai hadir di venue.`);
            setSelectedRows([]);
            setRefreshData((prev) => !prev);
        } catch (err: any) {
            showErrorAlert('Gagal Check-In', err.response?.data?.message || 'Terjadi kesalahan saat mencatat kedatangan.');
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleBulkDownloadQr = async () => {
        if (selectedRows.length === 0) return;

        const ids = selectedRows.map((r) => r.id);
        setIsDownloading(true);

        try {
            const res = await axios.post(
                '/admin/companies/guests/bulk-download-rsvp-qr',
                { ids },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `QR-RSVP-Tamu-VIP-${ids.length}-Data.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSuccessAlert('Unduh Berhasil!', `Berhasil mengunduh ${ids.length} QR Code konfirmasi dalam file ZIP.`);
        } catch (err: any) {
            showErrorAlert('Gagal Mengunduh', 'Terjadi kesalahan saat membuat file ZIP.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCopyRsvp = (guest: any) => {
        if (!guest.rsvp_url) return;
        navigator.clipboard.writeText(guest.rsvp_url);
        showSuccessAlert('Tautan Disalin!', `Link konfirmasi RSVP untuk ${guest.name} telah disalin ke clipboard.`);
    };

    const columns = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) => {
                        table.toggleAllPageRowsSelected(!!e.target.checked);
                    }}
                />
            ),
            cell: ({ row }: any) => (
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    checked={row.getIsSelected()}
                    onChange={(e) => {
                        row.toggleSelected(!!e.target.checked);
                    }}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => {
                const guest = row.original;
                const isVip = ['vip', 'vvip'].includes(guest.category?.toLowerCase());

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Aksi Tamu</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/companies/guests/${guest.id}`}>
                                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/companies/guests/${guest.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                                    Edit Data
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a
                                    href={`/admin/companies/guests/${guest.id}/card`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="mr-2 h-4 w-4 text-emerald-600" />
                                    Cetak Kartu Pass
                                </a>
                            </DropdownMenuItem>
                            {isVip && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`/admin/companies/guests/${guest.id}/download-rsvp-qr`}
                                            className="text-[#17524A] dark:text-emerald-400 font-semibold cursor-pointer"
                                        >
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Unduh QR RSVP (PNG)
                                        </a>
                                    </DropdownMenuItem>
                                    {guest.rsvp_url && (
                                        <DropdownMenuItem
                                            onClick={() => handleCopyRsvp(guest)}
                                            className="text-amber-700 dark:text-amber-400 font-medium cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Salin Tautan RSVP
                                        </DropdownMenuItem>
                                    )}
                                    {guest.status !== 'invited' && (
                                        <DropdownMenuItem
                                            onClick={() => handleResetRsvp(guest)}
                                            className="text-orange-600 dark:text-orange-400 font-medium cursor-pointer"
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset RSVP (Buka Kunci Form)
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(guest)}
                                className="text-rose-600 focus:text-rose-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Tamu
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
        },
        {
            id: 'code',
            accessorKey: 'code',
            header: (info: any) => renderRowHeader(info, 'No. Undangan'),
            cell: ({ row }: any) => (
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {row.original.code}
                </span>
            ),
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: (info: any) => renderRowHeader(info, 'Nama Tamu'),
            cell: ({ row }: any) => {
                const g = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                            {g.photo_path ? (
                                <img src={`/storage/${g.photo_path}`} alt={g.name} className="h-full w-full object-cover" />
                            ) : (
                                <Crown className="h-4 w-4 text-amber-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <Link
                                href={`/admin/companies/guests/${g.id}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 transition-colors block truncate"
                            >
                                {g.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate">
                                {g.institution || g.phone || 'Tamu Kehormatan'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'category',
            accessorKey: 'category',
            header: (info: any) => renderRowHeader(info, 'Kategori'),
            cell: ({ row }: any) => {
                const cat = row.original.category?.toLowerCase() || 'umum';
                const meta = categoryLabels[cat] || categoryLabels.umum;
                return (
                    <Badge variant="outline" className={`text-[10px] ${meta.className}`}>
                        {meta.label}
                    </Badge>
                );
            },
        },
        {
            id: 'table_number',
            accessorKey: 'table_number',
            header: (info: any) => renderRowHeader(info, 'Meja & Pax'),
            cell: ({ row }: any) => {
                const g = row.original;
                return (
                    <div>
                        <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">
                            {g.table_number || 'VIP Area'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            {g.seat_count || 1} Orang
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'checked_in_at',
            accessorKey: 'checked_in_at',
            header: (info: any) => renderRowHeader(info, 'Kedatangan'),
            cell: ({ row }: any) => {
                const g = row.original;
                const checked = g.checked_in_at;

                if (checked) {
                    const checkedDate = new Date(checked);
                    const isToday = checkedDate.toDateString() === new Date().toDateString();
                    return isToday ? (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-[10px] font-semibold">
                            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                            Hadir Hari Ini ({checkedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                            Hari Lalu ({checkedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })})
                        </Badge>
                    );
                }

                if (g.status === 'declined') {
                    return (
                        <Badge variant="outline" className="border-rose-300 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 text-[10px] font-semibold">
                            <XCircle className="mr-1 h-3 w-3 text-rose-600" />
                            Berhalangan Hadir
                        </Badge>
                    );
                }

                if (g.status === 'confirmed') {
                    return (
                        <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 text-[10px] font-medium">
                            <Clock className="mr-1 h-3 w-3 text-amber-600" />
                            Terkonfirmasi
                        </Badge>
                    );
                }

                return (
                    <Badge variant="outline" className="border-slate-200 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/40 text-[10px]">
                        Belum Hadir
                    </Badge>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Manajemen Tamu Undangan OMATIQ" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Crown className="h-7 w-7 text-amber-500" />
                            Data Tamu Undangan (VIP / VVIP)
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Kelola daftar undangan kehormatan babak final OMATIQ 2026, nomor meja VIP, dan presensi gerbang masuk.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        >
                            <Link href="/admin/companies/guests/create">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Tambah Tamu Undangan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tamu</p>
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
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hadir di Venue</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.attended ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tamu VIP</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats?.vip ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                                <Crown className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tamu Non-VIP</p>
                                <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{stats?.non_vip ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terkonfirmasi</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{stats?.confirmed ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Plan C Bulk Action Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                        
                        {/* Category Filter */}
                        <div className="w-40">
                            <SelectComponent
                                options={[
                                    { value: 'vip', label: 'Tamu VIP' },
                                    { value: 'non_vip', label: 'Tamu Non-VIP' },
                                ]}
                                value={filterValue.category || ''}
                                onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, category: val }))}
                                placeholder="Semua Kategori"
                            />
                        </div>

                        {/* Presence Filter */}
                        <div className="w-36">
                            <SelectComponent
                                options={[
                                    { value: 'yes', label: 'Sudah Hadir' },
                                    { value: 'no', label: 'Belum Hadir' },
                                ]}
                                value={filterValue.checked_in || ''}
                                onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, checked_in: val }))}
                                placeholder="Kehadiran"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="w-40">
                            <SelectComponent
                                options={[
                                    { value: 'confirmed', label: 'Terkonfirmasi' },
                                    { value: 'attended', label: 'Sudah Masuk' },
                                    { value: 'invited', label: 'Terkirim' },
                                    { value: 'declined', label: 'Berhalangan' },
                                ]}
                                value={filterValue.status || ''}
                                onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, status: val }))}
                                placeholder="Status RSVP"
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

                    {/* Bulk Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedRows.length > 0 && (
                            <>
                                <Button
                                    type="button"
                                    onClick={handleBulkDownloadQr}
                                    disabled={isDownloading}
                                    variant="outline"
                                    className="border-[#17524A] text-[#17524A] hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 font-bold text-xs"
                                >
                                    <Archive className="mr-1.5 h-3.5 w-3.5" />
                                    {isDownloading ? 'Mengompres...' : `Unduh QR Terpilih (ZIP) (${selectedRows.length})`}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleBulkCheckIn}
                                    disabled={isCheckingIn}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Tandai Hadir ({selectedRows.length})
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* DataTable */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <DataTableProvider
                        urlFetchData="/admin/companies/guests/data"
                        columns={columns}
                        withActions={false}
                        filterValue={filterValue}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}
                        initialSorting={[{ id: 'id', desc: true }]}
                        formatDataExport={(items: any[]) =>
                            items.map((item: any, i: number) => ({
                                No: i + 1,
                                'No. Undangan': item.code,
                                Nama: item.name,
                                Lembaga: item.institution || '-',
                                Jabatan: item.position || '-',
                                Kategori: item.category?.toUpperCase() || 'UMUM',
                                'Alokasi Meja': item.table_number || 'VIP Area',
                                'Kapasitas Pax': item.seat_count || 1,
                                'No. HP': item.phone || '-',
                                'Jam Masuk': item.checked_in_at
                                    ? new Date(item.checked_in_at).toLocaleString('id-ID')
                                    : item.status === 'declined'
                                    ? 'Berhalangan Hadir'
                                    : item.status === 'confirmed'
                                    ? 'Terkonfirmasi (Belum Masuk)'
                                    : 'Belum Hadir',
                                Status: item.status,
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

ListGuestsPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tamu Undangan', href: '#' },
    ],
};
