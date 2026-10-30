import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { NationalReRegisterModal } from '@/components/partials/national-re-register-modal';
import { SelectComponent } from '@/components/partials/select-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProofModal } from '@/components/ui/proof-modal';
import participants from '@/routes/admin/companies/participants';
import { formatExportString } from '@/utils/formatCsv';
import {
    confirmAction,
    confirmDelete,
    showWarningAlert,
} from '@/utils/sweetalert';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    CreditCard,
    ExternalLink,
    Eye,
    FileCheck2,
    Filter,
    MapPin,
    MoreHorizontal,
    Pencil,
    Printer,
    RefreshCw,
    RotateCcw,
    Trash2,
    Trophy,
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
    const isAdmin = userRoles.includes('Administrators');
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

    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [isReRegisterModalOpen, setIsReRegisterModalOpen] = useState(false);
    const [selectedParticipantForReRegister, setSelectedParticipantForReRegister] =
        useState<any>(null);

    const hasActiveFilter = Object.entries(filterValue).some(([k, v]) => {
        if (isKeuangan && k === 'registration_type' && v === 'public') {
            return false;
        }
        return Boolean(v);
    });

    const canUpdate =
        (auth?.user?.permissions ?? []).includes('update-participant') ||
        isAdmin ||
        isCabang;

    const handleBulkNational = async (action: 'qualify' | 'disqualify') => {
        if (selectedRows.length === 0) return;

        const isQualify = action === 'qualify';
        const registeredCount = selectedRows.filter(
            (r: any) => r.national && r.national.status !== 'unconfirmed',
        ).length;

        let htmlText = isQualify
            ? `Apakah Anda yakin ingin meloloskan <strong>${selectedRows.length} peserta terpilih</strong> ke Babak Final OMATIQ Nasional 2026? Peserta akan langsung dapat melakukan pendaftaran ulang.`
            : `Apakah Anda yakin ingin membatalkan status lolos Babak Nasional untuk <strong>${selectedRows.length} peserta terpilih</strong>?`;

        if (!isQualify && !isAdmin && registeredCount > 0) {
            htmlText += `<br><br><span class="text-xs text-amber-600 dark:text-amber-400"><strong>Catatan:</strong> Terdapat ${registeredCount} peserta yang sudah melakukan daftar ulang nasional. Peserta tersebut hanya dapat dibatalkan oleh Admin Pusat dan akan otomatis dilewati.</span>`;
        }

        const isConfirmed = await confirmAction({
            title: isQualify
                ? `Loloskan ${selectedRows.length} Peserta ke Babak Nasional?`
                : `Batalkan Kelolosan ${selectedRows.length} Peserta?`,
            html: htmlText,
            icon: isQualify ? 'question' : 'warning',
            confirmButtonText: isQualify
                ? `Ya, Loloskan (${selectedRows.length})`
                : `Ya, Batalkan (${selectedRows.length})`,
            cancelButtonText: 'Kembali',
            isDanger: !isQualify,
        });

        if (isConfirmed) {
            router.post(
                participants.bulkNationalQualify().url,
                {
                    participant_ids: selectedRows.map((r: any) => r.id),
                    action,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedRows([]);
                        setRefreshData((v) => !v);
                    },
                },
            );
        }
    };

    const columns = [
        {
            id: 'actions',
            header: () => <span>Aksi</span>,
            cell: (info: any) => {
                const row = info.row.original;
                const name = row.student?.full_name ?? row.full_name ?? 'Peserta';

                const handleToggleNational = async () => {
                    const isCurrentlyQualified = !!row.national;

                    // Proteksi: Cabang tidak boleh membatalkan peserta yang sudah daftar ulang nasional
                    if (
                        isCurrentlyQualified &&
                        !isAdmin &&
                        row.national?.status !== 'unconfirmed'
                    ) {
                        await showWarningAlert(
                            'Akses Dibatasi',
                            'Peserta ini sudah melakukan pendaftaran ulang Babak Nasional. Pembatalan peserta nasional hanya dapat dilakukan oleh Panitia Pusat (Administrator).',
                        );
                        return;
                    }

                    const isConfirmed = await confirmAction({
                        title: isCurrentlyQualified
                            ? 'Batalkan Kelolosan Nasional?'
                            : 'Loloskan ke Babak Nasional?',
                        html: isCurrentlyQualified
                            ? `Apakah Anda yakin ingin membatalkan status lolos nasional untuk <strong>${name}</strong> (${row.registration_number})?`
                            : `Apakah Anda yakin ingin meloloskan <strong>${name}</strong> (${row.registration_number}) ke Babak Final OMATIQ Nasional 2026?`,
                        icon: isCurrentlyQualified ? 'warning' : 'question',
                        confirmButtonText: isCurrentlyQualified
                            ? 'Ya, Batalkan Lolos'
                            : 'Ya, Loloskan ke Nasional',
                        cancelButtonText: 'Kembali',
                        isDanger: isCurrentlyQualified,
                    });

                    if (isConfirmed) {
                        router.post(
                            participants.nationalQualify(row.id).url,
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => setRefreshData((v) => !v),
                            },
                        );
                    }
                };

                const handleDelete = async () => {
                    const isConfirmed = await confirmDelete({
                        title: 'Konfirmasi Hapus Data',
                        text: `Apakah Anda yakin ingin menghapus data peserta ${name}? Tindakan ini tidak dapat dibatalkan.`,
                        confirmButtonText: 'Ya, Hapus',
                    });

                    if (isConfirmed) {
                        router.delete(`/admin/companies/participants/${row.id}`, {
                            preserveScroll: true,
                            onSuccess: () => setRefreshData((v) => !v),
                        });
                    }
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Aksi Peserta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    router.visit(`/admin/companies/participants/${row.id}`)
                                }
                            >
                                <Eye className="mr-2 size-4" /> Detail
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.visit(
                                            participants.edit(row.id).url,
                                        )
                                    }
                                >
                                    <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                            )}
                            {row.status !== 'rejected' && (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`/admin/companies/participants/${row.id}/card`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Printer className="mr-2 size-4 text-[#17524A]" />
                                        <span>
                                            {row.status === 'verified'
                                                ? 'Cetak Kartu'
                                                : 'Cetak Bukti'}
                                        </span>
                                    </a>
                                </DropdownMenuItem>
                            )}
                            {canUpdate && (
                                <>
                                    <DropdownMenuSeparator />
                                    {isAdmin && (
                                        <DropdownMenuItem
                                            onClick={handleToggleNational}
                                        >
                                            <Trophy className="mr-2 size-4 text-amber-500" />
                                            <span>
                                                {row.national
                                                    ? 'Batalkan Lolos Nasional'
                                                    : 'Loloskan ke Nasional'}
                                            </span>
                                        </DropdownMenuItem>
                                    )}
                                    {row.national?.status === 'verified' && (
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={`/pendaftaran/kartu/${row.registration_number}?stage=national`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex cursor-pointer items-center text-amber-700 focus:text-amber-800"
                                            >
                                                <Printer className="mr-2 size-4 text-amber-600" />
                                                <span>Cetak Kartu Nasional</span>
                                            </a>
                                        </DropdownMenuItem>
                                    )}
                                    {row.national &&
                                        (row.student?.is_binaan ||
                                            row.registration_type ===
                                                'teacher') &&
                                        row.national.status ===
                                            'unconfirmed' && (
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedParticipantForReRegister(
                                                        row,
                                                    );
                                                    setIsReRegisterModalOpen(
                                                        true,
                                                    );
                                                }}
                                                className="font-medium text-emerald-700 focus:text-emerald-800 dark:text-emerald-400"
                                            >
                                                <FileCheck2 className="mr-2 size-4 text-emerald-600" />
                                                <span>
                                                    Daftarkan Ulang Binaan
                                                </span>
                                            </DropdownMenuItem>
                                        )}
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 size-4 text-destructive" />
                                        <span>Hapus</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableHiding: false,
            meta: { sticky: 'left' },
        },
        {
            header: (info: any) => renderRowHeader(info, 'Peserta'),
            accessorKey: 'student.full_name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = info.getValue() ?? row.full_name ?? '-';
                const nik = row.student?.nik ?? row.nik;

                return (
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-semibold">{name}</p>
                            {row.national && (
                                <Badge
                                    variant="outline"
                                    className={
                                        row.national.status === 'verified'
                                            ? 'border-amber-500 bg-amber-500 px-1.5 py-0 text-[10px] font-bold text-white shadow-xs'
                                            : 'border-amber-500/80 bg-amber-50 px-1.5 py-0 text-[10px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    }
                                >
                                    🏆 Finalis Nasional
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{row.registration_number}</span>
                            {nik && (
                                <>
                                    <span>•</span>
                                    <span className="font-mono text-[11px] text-foreground/80">
                                        NIK: {nik}
                                    </span>
                                </>
                            )}
                        </div>
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
            header: 'Sanggar',
            accessorKey: 'student.regency',
            cell: (info: any) => {
                const row = info.row.original;

                return (
                    row.penyaluran_sanggar_name ??
                    info.getValue()?.name ??
                    row.student?.school_name ??
                    '-'
                );
            },
        },
        {
            header: 'Kantor',
            accessorKey: 'branch',
            cell: (info: any) => {
                const row = info.row.original;

                return row.branch ?? row.kantor_name ?? '-';
            },
        },
        ...(isAdmin
            ? [
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
              ]
            : []),
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

                const badgeNode = !canUpdate ? (
                    getPaymentBadge(value)
                ) : (
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

                return (
                    <div className="flex flex-col items-start gap-1">
                        {badgeNode}
                        {!isAdmin && row.status === 'rejected' && (
                            <Badge
                                variant="destructive"
                                className="gap-1 px-1.5 py-0.5 text-[10px]"
                            >
                                <XCircle className="size-3" /> Ditolak Admin
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Babak Nasional',
            accessorKey: 'national.status',
            cell: (info: any) => {
                const row = info.row.original;
                const national = row.national;

                if (!national) {
                    return <span className="text-xs text-muted-foreground">-</span>;
                }

                if (national.status === 'verified') {
                    return (
                        <Badge className="gap-1 border-amber-500 bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600">
                            <Trophy className="size-3" />
                            Finalis Resmi
                        </Badge>
                    );
                }

                if (national.status === 'waiting_confirmation') {
                    return (
                        <Badge
                            variant="secondary"
                            className="gap-1 border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                        >
                            <Clock3 className="size-3 text-amber-700" />
                            Menunggu Verifikasi
                        </Badge>
                    );
                }

                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/80 bg-amber-50/60 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                    >
                        <Trophy className="size-3 text-amber-600" />
                        Lolos (Belum Daftar Ulang)
                    </Badge>
                );
            },
            enableSorting: false,
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
            {/* Floating Bulk Action Bar - Khusus Admin Pusat */}
            {selectedRows.length > 0 && isAdmin && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-4 shadow-md dark:border-amber-600 dark:from-amber-950/80 dark:via-yellow-950/60 dark:to-amber-950/80">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500 font-extrabold text-white shadow-xs">
                            {selectedRows.length}
                        </span>
                        <div>
                            <p className="text-sm font-extrabold tracking-wide text-amber-950 uppercase dark:text-amber-100">
                                {selectedRows.length} Peserta Terpilih
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                Pilih aksi masal gelondongan untuk peserta yang dicentang
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleBulkNational('qualify')}
                            className="gap-1.5 bg-[#17524A] font-bold text-white shadow hover:bg-[#13433c]"
                        >
                            <Trophy className="size-4 text-amber-400" />
                            Loloskan ke Babak Nasional ({selectedRows.length})
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkNational('disqualify')}
                            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                            <XCircle className="size-4" />
                            Batalkan Lolos ({selectedRows.length})
                        </Button>
                    </div>
                </div>
            )}

            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <DataTableProvider
                    columns={columns}
                    filterValue={filterValue}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    setRowSelection={setSelectedRows}
                    urlFetchData={participants.data().url}
                    formatDataExport={(items: any[]) =>
                        items.map((item, index) => {
                            const isBinaan =
                                item.registration_type === 'teacher' ||
                                Boolean(item.mentor_id) ||
                                Boolean(item.student?.is_binaan);

                            const rawCompanionPhone =
                                item.companion_phone ||
                                (isBinaan
                                    ? item.mentor?.phone ||
                                      item.student?.mentor_phone
                                    : item.student?.mentor_phone ||
                                      item.mentor?.phone);

                            const rawParentPhone =
                                item.parent_phone ||
                                item.student?.parent_phone;

                            return {
                                No: index + 1,
                                Registrasi: item.registration_number,
                                NIK: formatExportString(
                                    item.student?.nik ?? item.nik,
                                ),
                                Nama:
                                    item.student?.full_name ??
                                    item.full_name ??
                                    '-',
                                'No. HP Pendamping':
                                    formatExportString(rawCompanionPhone),
                                'No. HP Ortu/Wali':
                                    formatExportString(rawParentPhone),
                                Olimpiade: item.olimpiade?.name || '-',
                                Jalur:
                                    registrationTypeLabels[
                                        item.registration_type
                                    ] ??
                                    item.registration_type ??
                                    '-',
                                Sekolah: item.student?.school_name ?? '-',
                                Sanggar:
                                    item.penyaluran_sanggar_name ??
                                    item.student?.regency?.name ??
                                    '-',
                                Status:
                                    statusLabels[item.status] ?? item.status,
                                Pembayaran:
                                    paymentStatusLabels[item.payment_status] ??
                                    item.payment_status ??
                                    '-',
                                Kantor: item.branch ?? '-',
                                Tahun: item.event_year ?? '-',
                            };
                        })
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
                            {isAdmin && (
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
                            )}
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
                                label="Babak Nasional"
                                placeholder="Semua status nasional..."
                                data={[
                                    { value: 'all', label: 'Semua Peserta' },
                                    { value: 'qualified', label: 'Semua Lolos Nasional' },
                                    { value: 'verified', label: 'Finalis Terverifikasi' },
                                    { value: 'waiting_confirmation', label: 'Menunggu Verifikasi' },
                                    { value: 'unconfirmed', label: 'Belum Daftar Ulang' },
                                    { value: 'not_qualified', label: 'Belum Lolos' },
                                ]}
                                dataSelected={filterValue.national_status}
                                handleOnChange={(value: string) =>
                                    setFilterValue((prev) => ({
                                        ...prev,
                                        national_status: value,
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

            <NationalReRegisterModal
                open={isReRegisterModalOpen}
                onOpenChange={setIsReRegisterModalOpen}
                participant={selectedParticipantForReRegister}
                onSuccess={() => setRefreshData((v) => !v)}
            />
        </div>
    );
}
