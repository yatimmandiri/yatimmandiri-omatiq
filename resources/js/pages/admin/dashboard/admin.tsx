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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import chaperones from '@/routes/admin/companies/chaperones';
import olimpiades from '@/routes/admin/companies/olimpiades';
import participants from '@/routes/admin/companies/participants';
import students from '@/routes/admin/companies/students';
import teachers from '@/routes/admin/companies/teachers';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Award,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    CreditCard,
    ExternalLink,
    GraduationCap,
    MapIcon,
    Plus,
    Receipt,
    Search,
    ShieldAlert,
    Sparkles,
    Trophy,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

export default function Dashboard() {
    const {
        pageTitle = 'Dashboard Admin',
        branchName,
        isCabang = false,
        isKeuangan = false,
        participantCount = 0,
        verifiedParticipantCount = 0,
        submittedParticipantCount = 0,
        paidCount = 0,
        waitingConfirmationCount = 0,
        unpaidCount = 0,
        umumCount = 0,
        binaanCount = 0,
        teacherCount = 0,
        studentCount = 0,
        sanggarCount = 0,
        olimpiadeCount = 0,
        chaperoneCount = 0,
        totalNationalCount = 0,
        nationalWithChaperoneCount = 0,
        nationalWithoutChaperoneCount = 0,
        unaccompaniedNationalList = [],
        chaperonesList = [],
    } = usePage<{
        pageTitle?: string;
        branchName?: string | null;
        isCabang?: boolean;
        isKeuangan?: boolean;
        participantCount?: number;
        verifiedParticipantCount?: number;
        submittedParticipantCount?: number;
        paidCount?: number;
        waitingConfirmationCount?: number;
        unpaidCount?: number;
        umumCount?: number;
        binaanCount?: number;
        teacherCount?: number;
        studentCount?: number;
        sanggarCount?: number;
        olimpiadeCount?: number;
        chaperoneCount?: number;
        totalNationalCount?: number;
        nationalWithChaperoneCount?: number;
        nationalWithoutChaperoneCount?: number;
        unaccompaniedNationalList?: any[];
        chaperonesList?: any[];
    }>().props;

    // Quick Assignment Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetParticipant, setTargetParticipant] = useState<any>(null);
    const [selectedChaperoneId, setSelectedChaperoneId] = useState<string>('');
    const [assignProcessing, setAssignProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const verificationRate = participantCount
        ? Math.round((verifiedParticipantCount / participantCount) * 100)
        : 0;

    const paymentRate = participantCount
        ? Math.round((paidCount / participantCount) * 100)
        : 0;

    const nationalChaperoneRate = totalNationalCount
        ? Math.round((nationalWithChaperoneCount / totalNationalCount) * 100)
        : 0;

    // Filter unaccompanied finalists by search query
    const filteredUnaccompanied = useMemo(() => {
        if (!searchQuery.trim()) return unaccompaniedNationalList;
        const q = searchQuery.toLowerCase();
        return unaccompaniedNationalList.filter((p: any) =>
            p.name?.toLowerCase().includes(q) ||
            p.registration_number?.toLowerCase().includes(q) ||
            p.branch?.toLowerCase().includes(q) ||
            p.school_name?.toLowerCase().includes(q) ||
            p.olimpiade_name?.toLowerCase().includes(q)
        );
    }, [unaccompaniedNationalList, searchQuery]);

    const handleOpenAssignModal = (p: any) => {
        setTargetParticipant(p);
        // Default to chaperone from the same branch if available
        const sameBranchChaperone = chaperonesList.find(
            (c: any) => !p.branch || c.branch?.toLowerCase() === p.branch?.toLowerCase()
        );
        if (sameBranchChaperone) {
            setSelectedChaperoneId(String(sameBranchChaperone.id));
        } else if (chaperonesList.length > 0) {
            setSelectedChaperoneId(String(chaperonesList[0].id));
        } else {
            setSelectedChaperoneId('');
        }
        setAssignModalOpen(true);
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetParticipant || !selectedChaperoneId) return;

        setAssignProcessing(true);
        router.post(
            chaperones.assignParticipant().url,
            {
                chaperone_id: Number(selectedChaperoneId),
                participant_id: targetParticipant.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAssignModalOpen(false);
                    setTargetParticipant(null);
                    setAssignProcessing(false);
                },
                onError: () => {
                    setAssignProcessing(false);
                },
            }
        );
    };

    return (
        <>
            <Head title={pageTitle} />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17524A] via-[#13423c] to-[#0e2e28] p-6 text-white shadow-xl lg:p-8">
                    <div className="absolute -top-20 -right-20 size-72 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
                                <Sparkles className="size-4 text-[#E5BE1E]" />{' '}
                                {isKeuangan
                                    ? branchName
                                        ? `Keuangan ${branchName}`
                                        : 'Divisi Keuangan'
                                    : branchName
                                      ? `Cabang ${branchName}`
                                      : 'Kontrol OMATIQ 2026'}
                            </p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">
                                {pageTitle}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                {isKeuangan
                                    ? branchName
                                        ? `Pantau status pembayaran peserta dan transaksi pendaftaran wilayah ${branchName}.`
                                        : 'Pantau pendaftaran, verifikasi bukti pembayaran peserta, dan status transaksi OMATIQ 2026.'
                                    : branchName
                                      ? `Pantau pendaftaran, santri binaan, guru, dan sanggar wilayah ${branchName}.`
                                      : 'Pantau pendaftaran, verifikasi, guru, dan olimpiade — semua dalam satu command center.'}
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                                    <div
                                        className="h-full rounded-full bg-[#E5BE1E]"
                                        style={{
                                            width: `${isKeuangan ? paymentRate : verificationRate}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-[#E5BE1E]">
                                    {isKeuangan
                                        ? `${paymentRate}% terbayar (lunas)`
                                        : `${verificationRate}% terverifikasi`}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={participants.index().url}
                                prefetch
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#E5BE1E] px-6 py-3 text-sm font-black text-[#17524A] shadow-lg hover:bg-[#d9b01c]"
                            >
                                {isKeuangan
                                    ? 'Kelola Data Peserta & Pembayaran'
                                    : 'Kelola Peserta'}{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                            {!isKeuangan && (
                                <>
                                    <Link
                                        href={teachers.index().url}
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                                    >
                                        Data Guru
                                    </Link>
                                    <Link
                                        href={students.index().url}
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                                    >
                                        Data Santri
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                {isKeuangan ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Metric
                            label="Total Peserta"
                            value={participantCount}
                            sub={
                                branchName
                                    ? `Peserta ${branchName}`
                                    : 'Semua pendaftaran'
                            }
                            icon={<Users />}
                            accent="#17524A"
                        />
                        <Metric
                            label="Pembayaran Lunas"
                            value={paidCount}
                            sub={`${paymentRate}% dari total peserta`}
                            icon={<CheckCircle2 />}
                            accent="#22c55e"
                        />
                        <Metric
                            label="Menunggu Konfirmasi"
                            value={waitingConfirmationCount}
                            sub="Perlu cek bukti transfer"
                            icon={<ClipboardList />}
                            accent="#f59e0b"
                        />
                        <Metric
                            label="Belum Bayar"
                            value={unpaidCount}
                            sub="Belum upload / konfirmasi"
                            icon={<CreditCard />}
                            accent="#ef4444"
                        />
                        <Metric
                            label="Peserta Jalur Umum"
                            value={umumCount}
                            sub="Registrasi mandiri / umum"
                            icon={<Receipt />}
                            accent="#0ea5e9"
                        />
                        <Metric
                            label="Peserta Sanggar Binaan"
                            value={binaanCount}
                            sub="Rekomendasi guru / sanggar"
                            icon={<GraduationCap />}
                            accent="#8b5cf6"
                            dark
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Metric
                            label="Total Peserta"
                            value={participantCount}
                            sub={
                                isCabang
                                    ? `Peserta ${branchName || 'Cabang'}`
                                    : 'Semua pendaftaran'
                            }
                            icon={<Users />}
                            accent="#17524A"
                        />
                        <Metric
                            label="Terverifikasi"
                            value={verifiedParticipantCount}
                            sub={`${verificationRate}% dari total`}
                            icon={<CheckCircle2 />}
                            accent="#22c55e"
                        />
                        <Metric
                            label="Menunggu Verifikasi"
                            value={submittedParticipantCount}
                            sub="Perlu ditinjau"
                            icon={<ClipboardList />}
                            accent="#f59e0b"
                        />
                        <Metric
                            label="Total Guru"
                            value={teacherCount}
                            sub={
                                isCabang
                                    ? `Guru ${branchName || 'Cabang'}`
                                    : 'Akun terhubung'
                            }
                            icon={<UserCheck />}
                            accent="#0ea5e9"
                        />
                        <Metric
                            label="Total Santri"
                            value={studentCount}
                            sub={
                                isCabang
                                    ? `Santri ${branchName || 'Cabang'}`
                                    : 'Santri binaan'
                            }
                            icon={<GraduationCap />}
                            accent="#8b5cf6"
                        />
                        {isCabang ? (
                            <Metric
                                label="Total Sanggar"
                                value={sanggarCount}
                                sub={`Sanggar ${branchName || 'Cabang'}`}
                                icon={<MapIcon />}
                                accent="#E5BE1E"
                                dark
                            />
                        ) : (
                            <Metric
                                label="Olimpiade"
                                value={olimpiadeCount}
                                sub="Kategori aktif"
                                icon={<Trophy />}
                                accent="#E5BE1E"
                                dark
                            />
                        )}
                        <Metric
                            label="Finalis Nasional"
                            value={totalNationalCount}
                            sub={`${nationalWithChaperoneCount} didampingi • ${nationalWithoutChaperoneCount} belum`}
                            icon={<Award />}
                            accent="#17524A"
                        />
                        <Metric
                            label="Total Pendamping"
                            value={chaperoneCount}
                            sub={
                                isCabang
                                    ? `Pendamping ${branchName || 'Cabang'}`
                                    : 'Pendamping terdaftar'
                            }
                            icon={<Users />}
                            accent="#0ea5e9"
                        />
                    </div>
                )}

                {/* Monitoring Pendamping Babak Final Nasional (Admin & Cabang) */}
                {!isKeuangan && (
                    <Card className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
                        <div className="border-b bg-gradient-to-r from-[#17524A]/10 via-[#17524A]/5 to-transparent p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="border-[#17524A]/30 bg-[#17524A]/10 text-[#17524A] font-bold">
                                            <Trophy className="mr-1 h-3 w-3 text-[#E5BE1E]" />
                                            Babak Final OMATIQ 2026
                                        </Badge>
                                        {nationalWithoutChaperoneCount > 0 ? (
                                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-semibold dark:bg-amber-950/40 dark:text-amber-300">
                                                <AlertCircle className="mr-1 h-3 w-3 text-amber-600" />
                                                {nationalWithoutChaperoneCount} Belum Ada Pendamping
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300">
                                                <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                                                Semua Finalis Sudah Memiliki Pendamping
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                        Monitoring Pendampingan Finalis Nasional
                                    </h2>
                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                        {isCabang ? `Daftar peserta finalis babak nasional dari wilayah ${branchName || 'Cabang'}` : 'Daftar peserta finalis babak nasional se-Indonesia'} yang belum memiliki guru/karyawan pendamping resmi.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        href={chaperones.index().url}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-accent"
                                    >
                                        <Users className="h-3.5 w-3.5 text-[#17524A]" />
                                        <span>Data Pendamping ({chaperoneCount})</span>
                                    </Link>
                                    <Link
                                        href={chaperones.create().url}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#17524A] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#13453e]"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Daftarkan Pendamping Baru</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Progress Bar & Status Pill */}
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
                                <div className="rounded-xl bg-background/80 p-3 border">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Finalis Nasional</span>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-xl font-black text-foreground">{totalNationalCount}</span>
                                        <span className="text-xs text-muted-foreground">Peserta lolos</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3 dark:bg-emerald-950/20 dark:border-emerald-800">
                                    <span className="text-[11px] font-semibold text-emerald-800 uppercase dark:text-emerald-400">Sudah Didampingi</span>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{nationalWithChaperoneCount}</span>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">({nationalChaperoneRate}%)</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 dark:bg-amber-950/20 dark:border-amber-800">
                                    <span className="text-[11px] font-semibold text-amber-800 uppercase dark:text-amber-400">Belum Ada Pendamping</span>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-xl font-black text-amber-700 dark:text-amber-300">{nationalWithoutChaperoneCount}</span>
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Perlu tindakan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List & Quick Execution Table */}
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama, BIB, cabang, sekolah..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-xs rounded-xl"
                                    />
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    Menampilkan {filteredUnaccompanied.length} dari {nationalWithoutChaperoneCount} peserta belum didampingi
                                </div>
                            </div>

                            {filteredUnaccompanied.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center">
                                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        {searchQuery ? 'Tidak ada peserta yang cocok dengan kata kunci pencarian.' : 'Semua peserta finalis babak nasional telah memiliki pendamping!'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Data pendampingan telah lengkap dan terpantau dengan baik.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
                                            <tr>
                                                <th className="px-3.5 py-2.5 w-10 text-center">No</th>
                                                <th className="px-3.5 py-2.5">Finalis &amp; No. Registrasi</th>
                                                <th className="px-3.5 py-2.5">Cabang / Wilayah</th>
                                                <th className="px-3.5 py-2.5">Sekolah &amp; Jenjang</th>
                                                <th className="px-3.5 py-2.5">Kategori Lomba</th>
                                                <th className="px-3.5 py-2.5 text-center">Status</th>
                                                <th className="px-3.5 py-2.5 text-right w-44">Aksi Cepat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredUnaccompanied.map((p: any, idx: number) => (
                                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-3.5 py-2.5 text-center text-muted-foreground font-mono">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3.5 py-2.5">
                                                        <div className="font-bold text-foreground">{p.name}</div>
                                                        <div className="font-mono text-[11px] text-muted-foreground">{p.registration_number}</div>
                                                    </td>
                                                    <td className="px-3.5 py-2.5">
                                                        <Badge variant="outline" className="font-medium text-[11px]">
                                                            <Building2 className="mr-1 h-3 w-3 text-[#17524A]" />
                                                            {p.branch}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3.5 py-2.5 text-muted-foreground">
                                                        <div className="font-medium text-foreground">{p.school_name}</div>
                                                        <div className="text-[11px]">Kelas {p.grade}</div>
                                                    </td>
                                                    <td className="px-3.5 py-2.5">
                                                        <div className="font-medium text-foreground">{p.olimpiade_name}</div>
                                                        <Badge variant="secondary" className="text-[10px] font-semibold mt-0.5">
                                                            {p.is_binaan ? 'Santri Binaan' : 'Jalur Umum'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3.5 py-2.5 text-center">
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold dark:bg-amber-950/40 dark:text-amber-300">
                                                            Belum Ada Pendamping
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3.5 py-2.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenAssignModal(p)}
                                                                className="h-8 bg-[#17524A] text-white hover:bg-[#13453e] text-xs font-semibold px-2.5 gap-1 rounded-lg"
                                                                title="Tugaskan ke pendamping yang sudah ada atau daftarkan baru"
                                                            >
                                                                <UserPlus className="h-3.5 w-3.5" />
                                                                <span>Tugaskan</span>
                                                            </Button>
                                                            <Link
                                                                href={`/admin/companies/chaperones/create?participant_id=${p.id}&branch=${encodeURIComponent(p.branch)}`}
                                                                className="inline-flex items-center justify-center h-8 px-2 rounded-lg border border-input text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                                                                title="Daftarkan pendamping baru khusus peserta ini"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Quick Assign Chaperone Modal Dialog */}
                <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <form onSubmit={handleAssignSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                    <UserPlus className="h-5 w-5 text-[#17524A]" />
                                    <span>Tugaskan Pendamping Finalis Nasional</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Pilih pendamping resmi untuk mendampingi peserta selama Babak Final Nasional OMATIQ 2026.
                                </DialogDescription>
                            </DialogHeader>

                            {targetParticipant && (
                                <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Nama Peserta:</span>
                                        <span className="font-bold text-foreground">{targetParticipant.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">No. Registrasi / BIB:</span>
                                        <span className="font-mono font-semibold">{targetParticipant.registration_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Cabang / Wilayah:</span>
                                        <Badge variant="outline" className="text-[11px] font-semibold">{targetParticipant.branch}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Sekolah:</span>
                                        <span className="font-medium">{targetParticipant.school_name} (Kelas {targetParticipant.grade})</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="chaperone-select" className="text-xs font-bold text-foreground">
                                    Pilih Pendamping Terdaftar <span className="text-destructive">*</span>
                                </Label>

                                {chaperonesList.length === 0 ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                                        Belum ada data pendamping yang terdaftar di sistem. Silakan daftarkan pendamping baru terlebih dahulu.
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedChaperoneId}
                                        onValueChange={(val) => setSelectedChaperoneId(val)}
                                    >
                                        <SelectTrigger id="chaperone-select" className="h-10 text-xs">
                                            <SelectValue placeholder="-- Pilih Pendamping --" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {chaperonesList.map((c: any) => {
                                                const isSameBranch = targetParticipant?.branch && c.branch?.toLowerCase() === targetParticipant.branch?.toLowerCase();
                                                return (
                                                    <SelectItem key={c.id} value={String(c.id)} className="text-xs py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-foreground">{c.name}</span>
                                                            <span className="text-muted-foreground">({c.branch})</span>
                                                            <span className="text-[10px] text-muted-foreground">[{c.source_type === 'guru' ? 'Guru' : 'Karyawan'}]</span>
                                                            {isSameBranch && (
                                                                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Cabang Sesuai</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAssignModalOpen(false)}
                                        className="text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={assignProcessing || !selectedChaperoneId}
                                        className="bg-[#17524A] text-white hover:bg-[#13453e] text-xs font-semibold gap-1.5"
                                    >
                                        <UserPlus className="h-3.5 w-3.5" />
                                        <span>{assignProcessing ? 'Menugaskan...' : 'Simpan & Tugaskan'}</span>
                                    </Button>
                                </DialogFooter>

                                {targetParticipant && (
                                    <div className="text-center pt-2 border-t">
                                        <Link
                                            href={`/admin/companies/chaperones/create?participant_id=${targetParticipant.id}&branch=${encodeURIComponent(targetParticipant.branch)}`}
                                            className="text-xs text-[#17524A] hover:underline inline-flex items-center gap-1 font-semibold"
                                        >
                                            <span>Atau daftarkan pendamping baru untuk {targetParticipant.name}</span>
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Quick links */}
                {isKeuangan ? (
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                        <Quick
                            title="Data Peserta & Status Pembayaran"
                            desc="Cek dan verifikasi bukti transfer peserta, sesuaikan status pembayaran (Lunas, Menunggu, Belum Bayar)."
                            href={participants.index().url}
                            icon={<CreditCard className="size-5" />}
                        />
                        <Quick
                            title="Daftar Peserta Jalur Umum"
                            desc="Filter cepat peserta jalur umum untuk rekonsiliasi pembayaran dan bukti transfer."
                            href={`${participants.index().url}?registration_type=umum`}
                            icon={<Users className="size-5" />}
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Quick
                            title="Data Peserta"
                            desc="Validasi status pendaftaran dan pantau peserta."
                            href={participants.index().url}
                            icon={<Users className="size-5" />}
                        />
                        <Quick
                            title="Data Guru"
                            desc="Data guru dan pembina terhubung di cabang."
                            href={teachers.index().url}
                            icon={<UserCheck className="size-5" />}
                        />
                        <Quick
                            title="Data Santri"
                            desc="Data santri binaan dan sekolah asal."
                            href={students.index().url}
                            icon={<GraduationCap className="size-5" />}
                        />
                        <Quick
                            title={isCabang ? 'Data Sanggar' : 'Olimpiade'}
                            desc={
                                isCabang
                                    ? 'Daftar sanggar binaan wilayah cabang.'
                                    : 'Kategori, jadwal, dan konten olimpiade.'
                            }
                            href={
                                isCabang
                                    ? '/admin/companies/sanggars'
                                    : olimpiades.index().url
                            }
                            icon={
                                isCabang ? (
                                    <MapIcon className="size-5" />
                                ) : (
                                    <Trophy className="size-5" />
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}

const Metric = ({
    label,
    value,
    sub,
    icon,
    accent,
    dark,
}: {
    label: string;
    value: number;
    sub: string;
    icon: ReactNode;
    accent: string;
    dark?: boolean;
}) => (
    <Card className="group relative overflow-hidden rounded-[1.5rem] border-0 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900">
        <div
            className="absolute top-0 right-0 size-28 rounded-full opacity-[0.08] blur-2xl"
            style={{ background: accent }}
        />
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                    {value.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {sub}
                </p>
            </div>
            <div
                className="flex size-11 items-center justify-center rounded-2xl text-white shadow"
                style={{ background: accent, color: dark ? '#17524A' : '#fff' }}
            >
                <span className="[&>svg]:size-5">{icon}</span>
            </div>
        </div>
    </Card>
);

const Quick = ({
    title,
    desc,
    href,
    icon,
}: {
    title: string;
    desc: string;
    href: string;
    icon: ReactNode;
}) => (
    <Link href={href} prefetch className="group">
        <Card className="flex h-full flex-col justify-between rounded-[1.5rem] bg-white p-5 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md dark:bg-zinc-900">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A] group-hover:bg-[#17524A] group-hover:text-white">
                    {icon}
                </div>
                <h3 className="font-black">{title}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {desc}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#17524A] group-hover:gap-2">
                Buka <ArrowRight className="size-4" />
            </span>
        </Card>
    </Link>
);

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
    ],
};
