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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import chaperones from '@/routes/admin/companies/chaperones';
import { confirmDelete } from '@/utils/sweetalert';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Phone,
    Plus,
    Printer,
    RotateCcw,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const statusLabels: Record<string, { label: string; className: string; icon: any }> = {
    submitted: {
        label: 'Menunggu',
        className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
        icon: Clock3,
    },
    verified: {
        label: 'Disetujui',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Ditolak',
        className: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
        icon: XCircle,
    },
};

export default function ListChaperonesPage() {
    const { stats, isCabang, userBranch, branches = [], auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Administrators');

    const [filterValue, setFilterValue] = useState<Record<string, string>>({});
    const [refreshData, setRefreshData] = useState(false);

    // Modal state for Admin rejection or status notes
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [selectedChaperone, setSelectedChaperone] = useState<any>(null);
    const [targetStatus, setTargetStatus] = useState<'submitted' | 'verified' | 'rejected'>('verified');
    const [verifyNotes, setVerifyNotes] = useState('');
    const [verifyProcessing, setVerifyProcessing] = useState(false);

    const hasActiveFilter = Object.values(filterValue).some(Boolean);

    const handleDelete = async (chaperone: any) => {
        const confirmed = await confirmDelete({
            title: 'Hapus Data Pendamping?',
            text: `Data pendamping ${chaperone.name} dari cabang ${chaperone.branch} akan dihapus.`,
            confirmButtonText: 'Ya, Hapus Data',
        });

        if (confirmed) {
            router.delete(chaperones.destroy(chaperone.id).url, {
                onSuccess: () => setRefreshData((prev) => !prev),
            });
        }
    };

    const handleUpdateStatus = (row: any, newStatus: 'submitted' | 'verified' | 'rejected') => {
        if (newStatus === 'rejected') {
            setSelectedChaperone(row);
            setTargetStatus('rejected');
            setVerifyNotes(row.notes || '');
            setVerifyModalOpen(true);
            return;
        }

        router.put(
            chaperones.verify(row.id).url,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => setRefreshData((v) => !v),
            }
        );
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChaperone) return;

        setVerifyProcessing(true);
        router.put(
            chaperones.verify(selectedChaperone.id).url,
            {
                status: targetStatus,
                notes: verifyNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setVerifyModalOpen(false);
                    setSelectedChaperone(null);
                    setVerifyProcessing(false);
                    setRefreshData((v) => !v);
                },
                onError: () => {
                    setVerifyProcessing(false);
                },
            }
        );
    };

    const columns = [
        {
            id: 'actions',
            header: () => <span className="font-semibold text-xs">Aksi</span>,
            cell: (info: any) => {
                const row = info.row.original;
                const canEdit = isAdmin || row.status !== 'verified';
                const canDelete = isAdmin || row.status !== 'verified';

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Aksi Pendamping</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.visit(chaperones.show(row.id).url)}>
                                <Eye className="mr-2 h-4 w-4" /> Detail
                            </DropdownMenuItem>
                            {canEdit && (
                                <DropdownMenuItem onClick={() => router.visit(chaperones.edit(row.id).url)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                            )}
                            {row.status === 'verified' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={chaperones.card(row.id).url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center"
                                        >
                                            <Printer className="mr-2 h-4 w-4 text-[#17524A]" />
                                            <span>Cetak Pass Lanyard</span>
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`/verifikasi/pendamping/OFF-${String(row.id).padStart(5, '0')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center text-emerald-700"
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                            <span>Verifikasi Publik</span>
                                        </a>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(row)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 60,
        },
        {
            header: (info: any) => renderRowHeader(info, 'Nama Pendamping & NIK'),
            accessorKey: 'name',
            cell: (info: any) => {
                const row = info.row.original;
                return (
                    <div className="space-y-0.5">
                        <button
                            type="button"
                            onClick={() => router.visit(chaperones.show(row.id).url)}
                            className="font-semibold text-sm text-foreground hover:underline text-left block"
                        >
                            {row.name}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono">{row.nik}</span>
                            <span>•</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    row.source_type === 'guru'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                }`}
                            >
                                {row.source_type === 'guru' ? 'Guru Pembimbing' : 'Karyawan Cabang'}
                            </span>
                            {row.shirt_size && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                    Kaos: {row.shirt_size}
                                </span>
                            )}
                        </div>
                        {row.position && (
                            <p className="text-[11px] text-muted-foreground">{row.position}</p>
                        )}
                    </div>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Cabang'),
            accessorKey: 'branch',
            cell: (info: any) => {
                const branch = info.getValue() ?? '-';
                return (
                    <Badge variant="outline" className="font-medium text-xs flex items-center gap-1 w-fit">
                        <Building2 className="h-3 w-3 text-[#17524A]" />
                        {branch}
                    </Badge>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'No. WhatsApp / HP'),
            accessorKey: 'phone',
            cell: (info: any) => {
                const phone = info.getValue() ?? '-';
                return (
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{phone}</span>
                        {phone && phone !== '-' && (
                            <a
                                href={`https://wa.me/${String(phone).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Kirim WhatsApp"
                            >
                                <Phone className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Peserta Didampingi'),
            accessorKey: 'participants_count',
            cell: (info: any) => {
                const count = info.getValue() ?? 0;
                return (
                    <Badge
                        variant="secondary"
                        className={`text-xs font-semibold ${
                            count > 0 ? 'bg-[#17524A]/10 text-[#17524A]' : 'text-muted-foreground'
                        }`}
                    >
                        <Users className="mr-1 h-3 w-3" />
                        {count} Peserta
                    </Badge>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Status Verifikasi'),
            accessorKey: 'status',
            cell: (info: any) => {
                const row = info.row.original;
                const status = (info.getValue() as string) || 'submitted';
                const meta = statusLabels[status] ?? statusLabels.submitted;
                const StatusIcon = meta.icon;

                // Cabang role: Read-only badge
                if (!isAdmin) {
                    return (
                        <Badge variant="outline" className={`text-xs font-medium flex items-center gap-1 w-fit ${meta.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {meta.label}
                        </Badge>
                    );
                }

                // Administrator role: Interactive inline dropdown
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shadow-xs transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${meta.className}`}
                                title="Klik untuk mengubah status verifikasi pendamping"
                            >
                                <StatusIcon className="h-3 w-3 shrink-0" />
                                <span>{meta.label}</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                                Tinjau & Ubah Status:
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleUpdateStatus(row, 'submitted')}
                                className="flex items-center gap-2 cursor-pointer text-xs"
                            >
                                <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                                <span>Kembalikan Menunggu</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleUpdateStatus(row, 'verified')}
                                className="flex items-center gap-2 cursor-pointer text-xs font-medium text-emerald-700 focus:text-emerald-800"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Setujui Layak (Verified)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleUpdateStatus(row, 'rejected')}
                                className="flex items-center gap-2 cursor-pointer text-xs font-medium text-rose-700 focus:text-rose-800"
                            >
                                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                <span>Tolak / Minta Revisi...</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Tgl Daftar'),
            accessorKey: 'created_at',
            cell: (info: any) => renderRowDate(info.getValue()),
        },
    ];

    return (
        <>
            <Head title="Data Pendamping Babak Final Nasional" />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl flex items-center gap-2">
                            <Users className="h-6 w-6 text-[#17524A]" />
                            Data Pendamping Babak Final Nasional
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isCabang
                                ? `Daftar official penanggung jawab kontingen peserta dari Cabang ${userBranch ?? ''}`
                                : 'Kelola dan verifikasi official pendamping kontingen dari seluruh kantor cabang'}
                        </p>
                    </div>

                    <Button asChild className="bg-[#17524A] text-white hover:bg-[#13443d]">
                        <Link href={chaperones.create().url}>
                            <Plus className="mr-2 h-4 w-4" />
                            Daftarkan Pendamping
                        </Link>
                    </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-[#17524A]/10 p-2.5 text-[#17524A]">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total Pendamping</p>
                                <p className="text-xl font-bold text-foreground">{stats?.total ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Menunggu Verifikasi</p>
                                <p className="text-xl font-bold text-amber-600">{stats?.submitted ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Disetujui Resmi</p>
                                <p className="text-xl font-bold text-emerald-600">{stats?.verified ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-rose-500/10 p-2.5 text-rose-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Ditolak / Revisi</p>
                                <p className="text-xl font-bold text-rose-600">{stats?.rejected ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Filter className="h-3.5 w-3.5 text-[#17524A]" />
                        <span>Filter:</span>
                    </div>

                    {!isCabang && branches.length > 0 && (
                        <div className="w-48">
                            <SelectComponent
                                placeholder="Semua Cabang"
                                data={[
                                    { value: '', label: 'Semua Cabang' },
                                    ...branches.map((b: string) => ({ value: b, label: b })),
                                ]}
                                dataSelected={filterValue.branch ?? ''}
                                handleOnChange={(val: string) =>
                                    setFilterValue((prev) => ({ ...prev, branch: val }))
                                }
                            />
                        </div>
                    )}

                    <div className="w-44">
                        <SelectComponent
                            placeholder="Semua Status"
                            data={[
                                { value: '', label: 'Semua Status' },
                                { value: 'submitted', label: 'Menunggu' },
                                { value: 'verified', label: 'Disetujui' },
                                { value: 'rejected', label: 'Ditolak' },
                            ]}
                            dataSelected={filterValue.status ?? ''}
                            handleOnChange={(val: string) =>
                                setFilterValue((prev) => ({ ...prev, status: val }))
                            }
                        />
                    </div>

                    <div className="w-44">
                        <SelectComponent
                            placeholder="Semua Asal"
                            data={[
                                { value: '', label: 'Semua Asal' },
                                { value: 'guru', label: 'Guru Pembimbing' },
                                { value: 'karyawan', label: 'Karyawan Cabang' },
                            ]}
                            dataSelected={filterValue.source_type ?? ''}
                            handleOnChange={(val: string) =>
                                setFilterValue((prev) => ({ ...prev, source_type: val }))
                            }
                        />
                    </div>

                    {hasActiveFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setFilterValue({})}
                        >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Reset Filter
                        </Button>
                    )}
                </div>

                {/* DataTable - withActions={false} prevents duplicated action column */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <DataTableProvider
                        columns={columns}
                        withActions={false}
                        filterValue={filterValue}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}
                        urlFetchData={chaperones.data().url}
                        initialSorting={[{ id: 'created_at', desc: true }]}
                        formatDataExport={(items: any[]) =>
                            items.map((item: any, i: number) => ({
                                No: i + 1,
                                Nama: item.name,
                                NIK: `'${item.nik}`,
                                Cabang: item.branch,
                                'No. HP': item.phone || '-',
                                Asal: item.source_type === 'guru' ? 'Guru Pembimbing' : 'Karyawan Cabang',
                                Jabatan: item.position || '-',
                                'Jml Peserta': item.participants_count || 0,
                                Status: item.status,
                                'Tgl Daftar': item.created_at,
                            }))
                        }
                    >
                        <DataTableComponent />
                    </DataTableProvider>
                </div>
            </div>

            {/* Admin Rejection / Status Notes Modal */}
            <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <span>Tolak / Minta Revisi Pendamping</span>
                            </DialogTitle>
                            <DialogDescription>
                                Berikan catatan atau alasan penolakan/revisi untuk{' '}
                                <strong>{selectedChaperone?.name}</strong> dari Cabang{' '}
                                <strong>{selectedChaperone?.branch}</strong> agar dapat ditindaklanjuti oleh kantor cabang.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="chaperone-rejection-notes" className="text-xs font-semibold">
                                Alasan Penolakan / Catatan Revisi <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="chaperone-rejection-notes"
                                rows={3}
                                value={verifyNotes}
                                onChange={(e) => setVerifyNotes(e.target.value)}
                                placeholder="Contoh: Kuota pendamping cabang ini telah terpenuhi / nomor WhatsApp tidak dapat dihubungi..."
                                required
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setVerifyModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={verifyProcessing}
                                className="bg-rose-600 text-white hover:bg-rose-700"
                            >
                                {verifyProcessing ? 'Menyimpan...' : 'Simpan Penolakan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ListChaperonesPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Pendamping', href: chaperones.index().url },
    ],
};
