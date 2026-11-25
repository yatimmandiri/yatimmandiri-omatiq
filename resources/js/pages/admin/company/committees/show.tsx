import { ProofModal } from '@/components/ui/proof-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
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
    Sparkles,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

type CheckInTimelineItem = {
    day_number: number;
    name: string;
    title: string;
    subtitle: string;
    is_checked_in: boolean;
    checkpoint?: string | null;
    checkpoint_label?: string | null;
    checked_in_at?: string | null;
    checked_in_at_formatted?: string | null;
    checked_in_by_name?: string | null;
};

type CommitteeShowProps = {
    committee: any;
    photoUrl?: string | null;
    verifyUrl: string;
    checkInTimeline?: CheckInTimelineItem[];
};

const EVENT_DAYS = [
    {
        dayNum: 1,
        title: 'Kedatangan & Penginapan',
        subtitle: 'Check-in Asrama & Penyerahan Pack',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        borderColor: 'border-emerald-200 dark:border-emerald-900/40',
        bgColor: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        iconColor: 'text-emerald-600',
    },
    {
        dayNum: 2,
        title: 'Venue Perlombaan (Penyisihan)',
        subtitle: 'Gate Utama & Sesi Pagi Lomba',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        borderColor: 'border-blue-200 dark:border-blue-900/40',
        bgColor: 'bg-blue-50/40 dark:bg-blue-950/20',
        iconColor: 'text-blue-600',
    },
    {
        dayNum: 3,
        title: 'Venue Perlombaan (Babak Final)',
        subtitle: 'Babak Final & Pengumuman Juara',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        borderColor: 'border-indigo-200 dark:border-indigo-900/40',
        bgColor: 'bg-indigo-50/40 dark:bg-indigo-950/20',
        iconColor: 'text-indigo-600',
    },
    {
        dayNum: 4,
        title: 'Study Tour & Jamuan Ramah Tamah',
        subtitle: 'Wisata Edukasi & Makan Bersama Kontingen',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        borderColor: 'border-amber-200 dark:border-amber-900/40',
        bgColor: 'bg-amber-50/40 dark:bg-amber-950/20',
        iconColor: 'text-amber-600',
    },
];

export default function ShowCommitteePage({
    committee,
    photoUrl,
    verifyUrl,
    checkInTimeline = [],
}: CommitteeShowProps) {
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const isActive = committee.status === 'active';
    const isCheckedIn = !!committee.checked_in_at;

    const getDuty = (dayNum: number): { text: string; isCustom: boolean } => {
        const daily = committee.daily_duties;
        if (daily) {
            if (daily[`day_${dayNum}`]) return { text: daily[`day_${dayNum}`], isCustom: true };
            if (daily[dayNum]) return { text: daily[dayNum], isCustom: true };
            if (daily[String(dayNum)]) return { text: daily[String(dayNum)], isCustom: true };
        }
        const fallback = committee.access_zone || `${committee.division} - ${committee.position || 'Panitia Pelaksana'}`;
        return { text: fallback, isCustom: false };
    };

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
                            {committee.position} &bull; Divisi {committee.division} &bull; {committee.branch ? `Cabang: ${committee.branch}` : 'Pusat'} &bull; OMATIQ {committee.event_year}
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
                                        <div className="text-xs text-slate-500">Kantor Cabang / Penugasan</div>
                                        <div className="font-semibold text-amber-700 dark:text-amber-400">
                                            {committee.branch || 'Pusat'}
                                        </div>
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
                                        <div className="text-xs text-slate-500">Ukuran Kaos / Baju Panitia</div>
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                                            {committee.shirt_size || '-'}
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

                        {/* Jadwal Penugasan Harian 4 Hari Card */}
                        <Card className="border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-xl border-b border-indigo-100 dark:border-indigo-900/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                                            <CalendarDays className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                                                Jadwal Penugasan Harian (Hari 1 s/d 4)
                                            </CardTitle>
                                            <CardDescription className="text-xs text-indigo-900/70 dark:text-indigo-300/70">
                                                Penempatan lokasi tugas panitia yang tersinkronisasi ke terminal verifikator
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild className="text-xs h-7 border-indigo-200 text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-200">
                                        <Link href={`/admin/companies/committees/${committee.id}/edit`}>
                                            <Pencil className="mr-1 h-3 w-3" />
                                            Edit Jadwal
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {EVENT_DAYS.map((day) => {
                                        const dutyInfo = getDuty(day.dayNum);
                                        return (
                                            <div
                                                key={day.dayNum}
                                                className={`rounded-xl border ${day.borderColor} ${day.bgColor} p-3 space-y-1.5 transition hover:shadow-2xs`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${day.badgeColor}`}>
                                                        HARI {day.dayNum}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium">
                                                        {day.title}
                                                    </span>
                                                </div>
                                                <div className="pt-1 flex items-start gap-1.5">
                                                    <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${day.iconColor}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                            {dutyInfo.text}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {dutyInfo.isCustom ? 'Lokasi Penugasan Khusus' : 'Berdasarkan Hak Akses / Divisi'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Presensi Kehadiran 4 Hari Panitia Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-600" />
                                        Presensi Kehadiran 4 Hari Panitia (Gate Check-In)
                                    </CardTitle>
                                    {committee.checked_in_at && (
                                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                            Terakhir Scan: {new Date(committee.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {checkInTimeline && checkInTimeline.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                        {checkInTimeline.map((item) => (
                                            <div
                                                key={item.day_number}
                                                className={`rounded-xl border p-3 flex flex-col justify-between transition ${
                                                    item.is_checked_in
                                                        ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                                                        : 'bg-slate-50/60 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-2">
                                                    <span className="text-[10px] font-black uppercase text-slate-500">
                                                        HARI {item.day_number}
                                                    </span>
                                                    {item.is_checked_in ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            Hadir
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                                            <Clock className="h-3 w-3" />
                                                            Belum
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                                        {item.title}
                                                    </p>
                                                    {item.is_checked_in ? (
                                                        <div className="mt-1.5 text-[10px] text-emerald-800 dark:text-emerald-300">
                                                            <div className="font-semibold">{item.checkpoint_label || item.checkpoint}</div>
                                                            <div className="text-emerald-600 dark:text-emerald-400">{item.checked_in_at_formatted}</div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-1.5 text-[10px] text-slate-400">
                                                            Belum melakukan scan
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                                        <div>
                                            <span className="font-semibold">Belum Ada Catatan Check-in:</span>{' '}
                                            Panitia ini belum memindai kartu lanyard pass di pos gerbang check-in.
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
