import { ProofModal } from '@/components/ui/proof-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Crown,
    ExternalLink,
    MapPin,
    Pencil,
    Phone,
    Printer,
    Sparkles,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type GuestShowProps = {
    guest: any;
    photoUrl?: string | null;
    verifyUrl: string;
};

export default function ShowGuestPage({
    guest,
    photoUrl,
    verifyUrl,
}: GuestShowProps) {
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const isAttended = !!guest.checked_in_at;

    return (
        <>
            <Head title={`Detail Tamu: ${guest.name}`} />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                                {guest.code}
                            </span>
                            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold uppercase text-[10px]">
                                {guest.category}
                            </Badge>
                            {isAttended ? (
                                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Hadir di Venue
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-slate-300 text-slate-500">
                                    {guest.status === 'confirmed' ? 'Terkonfirmasi' : guest.status}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                            {guest.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {guest.position} &bull; {guest.institution || 'Tamu Kehormatan OMATIQ 2026'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/companies/guests">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/companies/guests/${guest.id}/edit`}>
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
                                href={`/admin/companies/guests/${guest.id}/card`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-1.5 h-4 w-4" />
                                Cetak Kartu Undangan
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Photo & Card Preview */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Foto & Pass Undangan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center space-y-4">
                            <div className="relative h-44 w-36 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt={guest.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-amber-500">
                                        <Crown className="h-12 w-12 mx-auto stroke-[1.5]" />
                                        <span className="text-[10px] mt-1 block font-bold uppercase">{guest.category}</span>
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
                                        <Crown className="mr-1.5 h-3.5 w-3.5" />
                                        Lihat Pembesar Foto
                                    </Button>
                                    <ProofModal
                                        href={photoUrl}
                                        open={isProofModalOpen}
                                        onOpenChange={setIsProofModalOpen}
                                        title={`Foto Tamu: ${guest.name}`}
                                    />
                                </>
                            )}

                            <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 text-xs border border-slate-200 dark:border-slate-800 text-left space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Alokasi Meja:</span>
                                    <span className="font-bold text-amber-700 dark:text-amber-400">
                                        {guest.table_number || 'VIP Area'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Kapasitas (Pax):</span>
                                    <span className="font-semibold">{guest.seat_count} Orang</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Kategori:</span>
                                    <span className="font-bold uppercase text-amber-600">{guest.category}</span>
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

                    {/* Right Column: Bio & Seating Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-amber-600" />
                                    Informasi Tamu & Protokoler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-xs text-slate-500">Nama Lengkap & Gelar</div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{guest.name}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Instansi / Lembaga</div>
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                            {guest.institution || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Jabatan Resmi</div>
                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                            {guest.position || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Nomor / Meja Kehormatan</div>
                                        <div className="font-bold text-amber-700 dark:text-amber-400">
                                            {guest.table_number || 'Area Kursi VIP'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Jumlah Undangan (Pax)</div>
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                            {guest.seat_count} Orang
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Kontak Penghubung</div>
                                        <div className="font-mono text-slate-800 dark:text-slate-200">
                                            {guest.phone || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Email</div>
                                        <div className="text-slate-800 dark:text-slate-200">
                                            {guest.email || '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500">Diinput Oleh</div>
                                        <div className="text-slate-800 dark:text-slate-200">
                                            {guest.creator?.name || 'Administrator Pusat'}
                                        </div>
                                    </div>
                                </div>

                                {guest.notes && (
                                    <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200 dark:border-slate-800">
                                        <div className="text-xs font-semibold text-slate-500 mb-1">Catatan Khusus Tamu</div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                            {guest.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    Status Kedatangan (Gate Check-In)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {guest.checked_in_at ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                        <div>
                                            <span className="font-bold">Telah Hadir di Venue:</span>{' '}
                                            Waktu scan tercatat pada <strong>{new Date(guest.checked_in_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</strong>.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                                        <div>
                                            <span className="font-semibold">Belum Melakukan Scan di Pintu Masuk:</span>{' '}
                                            Tamu kehormatan ini belum tiba di lokasi acara atau belum melakukan pemindaian pass di gerbang masuk VIP.
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

ShowGuestPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tamu Undangan', href: '/admin/companies/guests' },
        { title: 'Detail Tamu', href: '#' },
    ],
};
