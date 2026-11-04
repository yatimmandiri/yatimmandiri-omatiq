import { ProofModal } from '@/components/ui/proof-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    CheckCircle2,
    Clock,
    ExternalLink,
    Image as ImageIcon,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Printer,
    Shield,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

type CommitteeShowProps = {
    committee: any;
    photoUrl?: string | null;
    verifyUrl: string;
};

export default function ShowCommitteePage({
    committee,
    photoUrl,
    verifyUrl,
}: CommitteeShowProps) {
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const isActive = committee.status === 'active';
    const isCheckedIn = !!committee.checked_in_at;

    return (
        <>
            <Head title={`Detail Panitia: ${committee.name}`} />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                                {committee.code}
                            </span>
                            <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-emerald-600' : ''}>
                                {isActive ? 'Aktif' : 'Non-Aktif'}
                            </Badge>
                            {isCheckedIn ? (
                                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Hadir di Venue
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-slate-300 text-slate-500">
                                    Belum Hadir
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                            {committee.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {committee.position} &bull; Divisi {committee.division} &bull; OMATIQ {committee.event_year}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/companies/committees">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/companies/committees/${committee.id}/edit`}>
                                <Pencil className="mr-1.5 h-4 w-4" />
                                Edit Data
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        >
                            <a
                                href={`/admin/companies/committees/${committee.id}/card`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-1.5 h-4 w-4" />
                                Cetak Lanyard Pass
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Photo & Card Preview */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Foto & Pass Lanyard</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center space-y-4">
                            <div className="relative h-44 w-36 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt={committee.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-slate-400">
                                        <User className="h-12 w-12 mx-auto stroke-[1.5]" />
                                        <span className="text-[10px] mt-1 block font-semibold">Tanpa Foto</span>
                                    </div>
                                )}
                            </div>

                            {photoUrl && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsProofModalOpen(true)}
                                        className="text-xs"
                                    >
                                        <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                                        Lihat Pembesar Foto
                                    </Button>
                                    <ProofModal
                                        href={photoUrl}
                                        open={isProofModalOpen}
                                        onOpenChange={setIsProofModalOpen}
                                        title={`Foto Panitia: ${committee.name}`}
                                    />
                                </>
                            )}

                            <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 text-xs border border-slate-200 dark:border-slate-800 text-left space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Hak Akses:</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400">{committee.access_zone}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Tahun:</span>
                                    <span className="font-semibold">{committee.event_year}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Akun Login:</span>
                                    <span className="font-semibold">
                                        {committee.user ? `${committee.user.name}` : 'Tidak Ada'}
                                    </span>
                                </div>
                            </div>

                            <Button variant="ghost" size="sm" asChild className="w-full text-xs">
                                <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                    Buka Halaman Scanner Publik
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Right Column: Bio & Presence */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-emerald-600" />
                                    Rincian Kepanitiaan & Identitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-xs text-slate-500">Nama Lengkap</div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{committee.name}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Divisi</div>
                                        <div className="font-semibold text-amber-700 dark:text-amber-400">
                                            {committee.division}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Jabatan / Peran</div>
                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                            {committee.position || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Jenis Kelamin</div>
                                        <div className="font-medium">
                                            {committee.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Nomor Telepon / WA</div>
                                        <div className="font-mono text-slate-800 dark:text-slate-200">
                                            {committee.phone || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Email</div>
                                        <div className="text-slate-800 dark:text-slate-200">
                                            {committee.email || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">NIK (Nomor Induk Kependudukan)</div>
                                        <div className="font-mono text-slate-800 dark:text-slate-200">
                                            {committee.nik || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Ditambahkan Oleh</div>
                                        <div className="text-slate-800 dark:text-slate-200">
                                            {committee.creator?.name || 'Administrator Pusat'}
                                        </div>
                                    </div>
                                </div>

                                {committee.notes && (
                                    <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200 dark:border-slate-800">
                                        <div className="text-xs font-semibold text-slate-500 mb-1">Catatan Tambahan</div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                            {committee.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    Riwayat Masuk Venue (Gate Check-In)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {committee.checked_in_at ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                        <div>
                                            <span className="font-bold">Telah Memasuki Venue:</span>{' '}
                                            Waktu scan tercatat pada <strong>{new Date(committee.checked_in_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</strong>.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                                        <div>
                                            <span className="font-semibold">Belum Melakukan Scan di Pintu Masuk:</span>{' '}
                                            Panitia ini belum memindai kartu lanyard pass di gerbang masuk venue OMATIQ 2026.
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ShowCommitteePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Panitia', href: '/admin/companies/committees' },
        { title: 'Detail Panitia', href: '#' },
    ],
};
