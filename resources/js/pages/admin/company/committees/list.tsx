import { CommitteeImportModal } from '@/components/forms/admin/company/committee-import-modal';
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
import { confirmDelete, showSuccessAlert, showErrorAlert } from '@/utils/sweetalert';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    BadgeCheck,
    Building2,
    CheckCircle2,
    ChevronDown,
    Clock,
    Eye,
    FileSpreadsheet,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Printer,
    RotateCcw,
    Shield,
    Trash2,
    UploadCloud,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function ListCommitteesPage() {
    const { stats, divisions = [], branches = [] } = usePage<any>().props;

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [openImportModal, setOpenImportModal] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const handleDelete = async (committee: any) => {
        const confirmed = await confirmDelete({
            title: 'Hapus Panitia?',
            text: `Data panitia ${committee.name} (${committee.code}) akan dihapus.`,
            confirmButtonText: 'Ya, Hapus Data',
        });

        if (confirmed) {
            router.delete(`/admin/companies/committees/${committee.id}`, {
                onSuccess: () => setRefreshData((prev) => !prev),
            });
        }
    };

    const handleBulkCheckIn = async () => {
        if (selectedRows.length === 0) return;

        const ids = selectedRows.map((r) => r.id);
        setIsCheckingIn(true);

        try {
            const res = await axios.post('/admin/companies/committees/bulk-check-in', { ids });
            showSuccessAlert('Check-In Berhasil!', res.data.message || `${ids.length} panitia berhasil ditandai hadir di venue.`);
            setSelectedRows([]);
            setRefreshData((prev) => !prev);
        } catch (err: any) {
            showErrorAlert('Gagal Check-In', err.response?.data?.message || 'Terjadi kesalahan saat mencatat kehadiran.');
        } finally {
            setIsCheckingIn(false);
        }
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
                const committee = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Aksi Panitia</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/companies/committees/${committee.id}`}>
                                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/companies/committees/${committee.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                                    Edit Data
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a
                                    href={`/admin/companies/committees/${committee.id}/card`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="mr-2 h-4 w-4 text-emerald-600" />
                                    Cetak Lanyard Pass
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(committee)}
                                className="text-rose-600 focus:text-rose-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Panitia
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
            header: (info: any) => renderRowHeader(info, 'Kode ID'),
            cell: ({ row }: any) => (
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {row.original.code}
                </span>
            ),
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: (info: any) => renderRowHeader(info, 'Nama Panitia'),
            cell: ({ row }: any) => {
                const c = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {c.photo_path ? (
                                <img src={`/storage/${c.photo_path}`} alt={c.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-4 w-4 text-slate-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <Link
                                href={`/admin/companies/committees/${c.id}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 transition-colors block truncate"
                            >
                                {c.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate">
                                {c.user ? `Akun: ${c.user.email}` : (c.phone || 'Panitia Lapangan')}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'branch',
            accessorKey: 'branch',
            header: (info: any) => renderRowHeader(info, 'Kantor Cabang'),
            cell: ({ row }: any) => {
                const b = row.original.branch;
                return (
                    <Badge
                        variant="outline"
                        className="text-xs font-semibold bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    >
                        <Building2 className="mr-1 h-3 w-3 text-amber-600" />
                        {b || 'Pusat'}
                    </Badge>
                );
            },
        },
        {
            id: 'division',
            accessorKey: 'division',
            header: (info: any) => renderRowHeader(info, 'Divisi & Jabatan'),
            cell: ({ row }: any) => {
                const c = row.original;
                return (
                    <div>
                        <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">
                            {c.division}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            {c.position || '-'} {c.shirt_size ? `• Kaos: ${c.shirt_size}` : ''}
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'access_zone',
            accessorKey: 'access_zone',
            header: (info: any) => renderRowHeader(info, 'Hak Akses'),
            cell: ({ row }: any) => (
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 font-bold">
                    {row.original.access_zone || 'All Access'}
                </Badge>
            ),
        },
        {
            id: 'checked_in_at',
            accessorKey: 'checked_in_at',
            header: (info: any) => renderRowHeader(info, 'Status Kehadiran'),
            cell: ({ row }: any) => {
                const checked = row.original.checked_in_at;
                if (!checked) {
                    return (
                        <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px]">
                            Belum Hadir
                        </Badge>
                    );
                }
                const checkedDate = new Date(checked);
                const isToday = checkedDate.toDateString() === new Date().toDateString();
                return isToday ? (
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-[10px]">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                        Hadir Hari Ini ({checkedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                    </Badge>
                ) : (
                    <Badge variant="outline" className="border-slate-200 text-slate-500 bg-slate-50 dark:bg-slate-900/40 text-[10px]">
                        Hari Lalu ({checkedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })})
                    </Badge>
                );
            },
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: (info: any) => renderRowHeader(info, 'Keaktifan'),
            cell: ({ row }: any) => {
                const isActive = row.original.status === 'active';
                return (
                    <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-emerald-600 text-[10px]' : 'text-[10px]'}>
                        {isActive ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                );
            },
        },
    ];

    const divisionOptions = divisions.map((div: string) => ({
        value: div,
        label: div,
    }));

    const branchOptions = branches.map((b: string) => ({
        value: b,
        label: b,
    }));

    return (
        <>
            <Head title="Manajemen Panitia Pelaksana OMATIQ" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <BadgeCheck className="h-7 w-7 text-amber-500" />
                            Data Panitia Pelaksana (Crew Pass)
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Kelola kepanitiaan nasional OMATIQ 2026, zona wewenang, lanyard badge pass, dan presensi masuk gerbang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenImportModal(true)}
                            className="border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-semibold shadow-sm text-xs sm:text-sm"
                        >
                            <UploadCloud className="mr-1.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                            Import Excel / CSV
                        </Button>
                        <Button
                            asChild
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20 text-xs sm:text-sm"
                        >
                            <Link href="/admin/companies/committees/create">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Tambah Panitia
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Panitia</p>
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
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.checked_in ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Panitia Aktif</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats?.active ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                                <BadgeCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Non-Aktif</p>
                                <p className="text-2xl font-black text-slate-400 mt-1">{stats?.inactive ?? 0}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Plan C Bulk Action Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                        
                        {/* Division Filter */}
                        <div className="w-44">
                            <SelectComponent
                                options={divisionOptions}
                                value={filterValue.division || ''}
                                onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, division: val }))}
                                placeholder="Semua Divisi"
                            />
                        </div>

                        {/* Branch Filter */}
                        {branchOptions.length > 0 && (
                            <div className="w-40">
                                <SelectComponent
                                    options={branchOptions}
                                    value={filterValue.branch || ''}
                                    onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, branch: val }))}
                                    placeholder="Semua Cabang"
                                />
                            </div>
                        )}

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
                        <div className="w-32">
                            <SelectComponent
                                options={[
                                    { value: 'active', label: 'Aktif' },
                                    { value: 'inactive', label: 'Non-Aktif' },
                                ]}
                                value={filterValue.status || ''}
                                onValueChange={(val: string) => setFilterValue((prev) => ({ ...prev, status: val }))}
                                placeholder="Keaktifan"
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

                    {/* Plan C Bulk Check-In Button */}
                    <div className="flex items-center gap-2">
                        {selectedRows.length > 0 && (
                            <Button
                                onClick={handleBulkCheckIn}
                                disabled={isCheckingIn}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Tandai Hadir ({selectedRows.length} Terpilih)
                            </Button>
                        )}
                    </div>
                </div>

                {/* DataTable */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <DataTableProvider
                        urlFetchData="/admin/companies/committees/data"
                        columns={columns}
                        withActions={false}
                        filterValue={filterValue}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}
                        initialSorting={[{ id: 'id', desc: true }]}
                        formatDataExport={(items: any[]) =>
                            items.map((item: any, i: number) => ({
                                No: i + 1,
                                'Kode ID': item.code,
                                Nama: item.name,
                                'Kantor Cabang': item.branch || 'Pusat',
                                NIK: item.nik ? `'${item.nik}` : '-',
                                'Ukuran Kaos': item.shirt_size || '-',
                                Divisi: item.division,
                                Jabatan: item.position || '-',
                                'Hak Akses': item.access_zone,
                                'No. HP': item.phone || '-',
                                'Jam Masuk': item.checked_in_at ? new Date(item.checked_in_at).toLocaleString('id-ID') : 'Belum Hadir',
                                Status: item.status === 'active' ? 'Aktif' : 'Non-Aktif',
                            }))
                        }
                    >
                        <DataTableComponent />
                    </DataTableProvider>
                </div>
            </div>

            {/* Modal Import Excel / CSV */}
            <CommitteeImportModal
                open={openImportModal}
                onOpenChange={setOpenImportModal}
                divisions={divisions}
                onSuccess={() => setRefreshData((prev) => !prev)}
            />
        </>
    );
}

ListCommitteesPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Panitia', href: '#' },
    ],
};
