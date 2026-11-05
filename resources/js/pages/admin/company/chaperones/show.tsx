import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import chaperones from '@/routes/admin/companies/chaperones';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock3,
    GraduationCap,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Printer,
    ShieldAlert,
    ShieldCheck,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const statusBadges: Record<string, { label: string; className: string; icon: any }> = {
    submitted: {
        label: 'Menunggu Verifikasi Pusat',
        className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
        icon: Clock3,
    },
    verified: {
        label: 'Disetujui Resmi (Verified)',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Ditolak / Perlu Revisi',
        className: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
        icon: XCircle,
    },
};

export default function ShowChaperonePage() {
    const { chaperone, canVerify } = usePage<any>().props;

    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<'verified' | 'rejected'>('verified');

    const verifyForm = useForm({
        status: 'verified',
        notes: '',
    });

    const openVerifyModal = (status: 'verified' | 'rejected') => {
        setTargetStatus(status);
        verifyForm.setData({
            status,
            notes: chaperone.notes ?? '',
        });
        setVerifyModalOpen(true);
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyForm.put(chaperones.verify(chaperone.id).url, {
            onSuccess: () => setVerifyModalOpen(false),
        });
    };

    const currentBadge = statusBadges[chaperone.status] ?? statusBadges.submitted;
    const StatusIcon = currentBadge.icon;

    return (
        <>
            <Head title={`Detail Pendamping - ${chaperone.name}`} />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={chaperones.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                                    {chaperone.name}
                                </h1>
                                <Badge variant="outline" className={`flex items-center gap-1 ${currentBadge.className}`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {currentBadge.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                <Building2 className="h-3.5 w-3.5 text-[#17524A]" />
                                Cabang: <span className="font-semibold text-foreground">{chaperone.branch}</span>
                                <span>•</span>
                                <span>{chaperone.position || 'Official Cabang'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {chaperone.status === 'verified' && (
                            <>
                                <Button asChild className="bg-[#17524A] text-white hover:bg-[#13443d]">
                                    <a
                                        href={chaperones.card(chaperone.id).url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Cetak Kartu Pass Lanyard
                                    </a>
                                </Button>
                                <Button variant="outline" asChild className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                                    <a
                                        href={`/verifikasi/pendamping/OFF-${String(chaperone.id).padStart(5, '0')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                        Halaman Verifikasi Publik
                                    </a>
                                </Button>
                            </>
                        )}

                        {canVerify && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => openVerifyModal('verified')}
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                                    Setujui Pendamping
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-rose-600 text-rose-700 hover:bg-rose-50"
                                    onClick={() => openVerifyModal('rejected')}
                                >
                                    <XCircle className="mr-1.5 h-4 w-4 text-rose-600" />
                                    Tolak / Revisi
                                </Button>
                            </>
                        )}

                        {chaperone.status !== 'verified' && (
                            <Button variant="outline" asChild>
                                <Link href={chaperones.edit(chaperone.id).url}>
                                    <Pencil className="mr-1.5 h-4 w-4" />
                                    Edit Data
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Audit & Notes Alert if rejected or has notes */}
                {chaperone.notes && (
                    <div
                        className={`rounded-lg border p-4 ${
                            chaperone.status === 'rejected'
                                ? 'border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                                : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
                        }`}
                    >
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">
                                    Catatan Verifikasi Panitia Pusat:
                                </h4>
                                <p className="text-sm mt-0.5 whitespace-pre-wrap">{chaperone.notes}</p>
                                {chaperone.verified_by && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Diverifikasi oleh: {chaperone.verifier?.name ?? 'Admin Pusat'} pada{' '}
                                        {chaperone.verified_at ? new Date(chaperone.verified_at).toLocaleString('id-ID') : '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN: Biodata Details */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader className="bg-muted/30 pb-3">
                                <CardTitle className="text-base text-foreground font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#17524A]" />
                                    Informasi Pendamping
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Nama Lengkap</span>
                                    <span className="font-semibold text-foreground">{chaperone.name}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">NIK</span>
                                    <span className="font-mono text-foreground font-medium">{chaperone.nik}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Asal Penugasan</span>
                                    <span className="capitalize font-medium text-foreground">
                                        {chaperone.source_type === 'guru' ? 'Guru Pembimbing Cabang' : 'Karyawan / Official Cabang'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Jabatan / Instansi</span>
                                    <span className="text-foreground">{chaperone.position || '-'}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Jenis Kelamin</span>
                                    <span className="text-foreground">
                                        {chaperone.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Ukuran Kaos / Baju</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                        {chaperone.shirt_size || '-'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Nomor WhatsApp / HP</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono font-medium text-foreground">{chaperone.phone}</span>
                                        {chaperone.phone && (
                                            <a
                                                href={`https://wa.me/${chaperone.phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs text-emerald-600 hover:underline"
                                            >
                                                <Phone className="h-3 w-3 mr-1" />
                                                Chat WA
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Alamat Email</span>
                                    <span className="text-foreground">{chaperone.email || '-'}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted-foreground block">Tempat & Tanggal Lahir</span>
                                    <span className="text-foreground">
                                        {chaperone.birth_place ? `${chaperone.birth_place}, ` : ''}
                                        {chaperone.birth_date
                                            ? new Date(chaperone.birth_date).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : '-'}
                                    </span>
                                </div>

                                <div className="border-t pt-3">
                                    <span className="text-xs text-muted-foreground block">Alamat Domisili</span>
                                    <p className="text-xs text-foreground mt-0.5">
                                        {chaperone.address || '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {[
                                            chaperone.village?.name,
                                            chaperone.district?.name,
                                            chaperone.regency?.name,
                                            chaperone.province?.name,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>

                                <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
                                    <div>
                                        Didaftarkan oleh: <span className="font-medium text-foreground">{chaperone.creator?.name ?? '-'}</span>
                                    </div>
                                    <div>
                                        Tanggal Daftar: {new Date(chaperone.created_at).toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Assigned Participants List */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base text-foreground font-semibold flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-[#17524A]" />
                                        Daftar Peserta Babak Final Nasional yang Didampingi
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {chaperone.participants?.length ?? 0} Peserta
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Rombongan peserta dari cabang {chaperone.branch} di bawah tanggung jawab resmi pendamping ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {(!chaperone.participants || chaperone.participants.length === 0) ? (
                                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                        <Users className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                                        <p className="text-sm font-medium">Belum Ada Peserta yang Diasosiasikan</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Klik tombol &quot;Edit Data&quot; di atas untuk memilih peserta dari cabang {chaperone.branch}.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                                                    <th className="py-2.5 px-3 font-semibold">No</th>
                                                    <th className="py-2.5 px-3 font-semibold">No. Registrasi</th>
                                                    <th className="py-2.5 px-3 font-semibold">Nama Peserta</th>
                                                    <th className="py-2.5 px-3 font-semibold">Asal Sekolah</th>
                                                    <th className="py-2.5 px-3 font-semibold">Olimpiade</th>
                                                    <th className="py-2.5 px-3 font-semibold">Tipe</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {chaperone.participants.map((p: any, idx: number) => (
                                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="py-2.5 px-3 text-xs text-muted-foreground">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-xs font-semibold text-foreground">
                                                            {p.registration_number}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="font-medium text-foreground">
                                                                {p.student?.full_name ?? '-'}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Kelas: {p.student?.grade ?? '-'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs text-muted-foreground">
                                                            {p.student?.school_name ?? '-'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs">
                                                            <span className="font-medium text-foreground">
                                                                {p.olimpiade?.name ?? '-'}
                                                            </span>
                                                            <span className="text-muted-foreground block text-[11px]">
                                                                ({p.olimpiade?.category ?? '-'})
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs">
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                                    p.student?.is_binaan
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {p.student?.is_binaan ? 'Santri Binaan' : 'Peserta Umum'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Verification Modal for Central Admin */}
            <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {targetStatus === 'verified' ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        Setujui Pendamping Babak Nasional
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 text-rose-600" />
                                        Tolak / Minta Revisi Pendamping
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {targetStatus === 'verified'
                                    ? `Konfirmasi persetujuan resmi untuk ${chaperone.name} sebagai official pendamping dari Cabang ${chaperone.branch}. Setelah disetujui, kartu pass lanyard dapat dicetak.`
                                    : `Tuliskan catatan atau alasan penolakan/revisi untuk ${chaperone.name} agar dapat diperbaiki oleh Kantor Cabang ${chaperone.branch}.`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="verify-notes" className="text-xs font-semibold">
                                {targetStatus === 'verified' ? 'Catatan Panitia (Opsional)' : 'Alasan Penolakan / Catatan Revisi'}
                            </Label>
                            <Textarea
                                id="verify-notes"
                                rows={3}
                                value={verifyForm.data.notes}
                                onChange={(e) => verifyForm.setData('notes', e.target.value)}
                                placeholder={
                                    targetStatus === 'verified'
                                        ? 'Contoh: Disetujui kuota pendamping resmi cabang.'
                                        : 'Contoh: Nomor kontak tidak aktif / kuota cabang telah mencukupi.'
                                }
                                required={targetStatus === 'rejected'}
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
                                disabled={verifyForm.processing}
                                className={
                                    targetStatus === 'verified'
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-rose-600 text-white hover:bg-rose-700'
                                }
                            >
                                {verifyForm.processing
                                    ? 'Memproses...'
                                    : targetStatus === 'verified'
                                      ? 'Ya, Setujui Pendamping'
                                      : 'Simpan Penolakan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowChaperonePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Pendamping', href: chaperones.index().url },
        { title: 'Detail Pendamping', href: '#' },
    ],
};
