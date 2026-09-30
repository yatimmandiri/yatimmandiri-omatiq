import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    GraduationCap,
    Home,
    MapPin,
    Printer,
    QrCode,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trophy,
    User,
    UserCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type VerifyProps = {
    pageTitle: string;
    queryRegistrationNumber?: string | null;
    isValid: boolean;
    participant?: {
        id: number;
        registration_number: string;
        status: 'submitted' | 'verified' | 'rejected' | string;
        registration_type?: string;
        event_year: number;
        branch?: string | null;
        penyaluran_sanggar_name?: string | null;
        olimpiade?: {
            id?: number;
            name?: string;
            category?: string | null;
        } | null;
        student?: {
            full_name?: string | null;
            nik?: string | null;
            nis?: string | null;
            school_name?: string | null;
            school_level?: string | null;
            grade?: string | null;
            regency_name?: string | null;
            mentor_name?: string | null;
            is_binaan?: boolean;
            photo_url?: string | null;
        } | null;
        verified_at?: string;
    } | null;
};

export default function RegistrationVerifyPage({
    pageTitle,
    queryRegistrationNumber,
    isValid,
    participant,
}: VerifyProps) {
    const [searchQuery, setSearchQuery] = useState(queryRegistrationNumber || '');
    const [copied, setCopied] = useState(false);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.get(`/verifikasi/${encodeURIComponent(trimmed)}`);
        }
    };

    const handleCopy = () => {
        if (participant?.registration_number) {
            navigator.clipboard.writeText(participant.registration_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isVerified = participant?.status === 'verified';
    const isSubmitted = participant?.status === 'submitted';

    return (
        <>
            <Head title={pageTitle} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#ffffff] px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                {/* Background ambient lighting */}
                <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#17524A]/10 blur-3xl sm:w-[800px]" />
                <div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#FFE600]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-[#22C55E]/10 blur-3xl" />

                <div className="relative mx-auto max-w-3xl">
                    {/* Header Seal / Logo */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#17524A]/20 bg-white/80 px-4 py-1.5 text-xs font-black tracking-wider text-[#17524A] uppercase shadow-sm backdrop-blur-md">
                            <ShieldCheck className="h-4 w-4 text-[#17524A]" />
                            Official Verification Gateway &bull; OMATIQ {participant?.event_year ?? 2026}
                        </div>
                        <h1 className="mt-3 text-2xl font-black text-[#0f172a] sm:text-4xl">
                            Verifikasi Keaslian Peserta
                        </h1>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-[#64748b]">
                            Sistem otentikasi resmi untuk memvalidasi keabsahan kartu pendaftaran dan status kepesertaan OMATIQ.
                        </p>
                    </div>

                    {/* Quick Search Bar */}
                    <div className="mb-8 rounded-2xl bg-white p-3 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/80">
                        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Masukkan Nomor Registrasi (Contoh: OMQ-...)"
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm font-bold text-slate-800 placeholder-slate-400 transition focus:border-[#17524A] focus:bg-white focus:ring-[#17524A]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#17524A]/20 transition hover:bg-[#13443d] active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                Cek Keaslian
                            </button>
                        </form>
                    </div>

                    {/* Main Verification Card */}
                    {isValid && participant ? (
                        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200/80">
                            {/* Security Result Banner */}
                            <div
                                className={`px-6 py-6 text-center text-white sm:px-8 ${
                                    isVerified
                                        ? 'bg-gradient-to-r from-[#134e45] via-[#17524A] to-[#258a7c]'
                                        : 'bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#9a3412]'
                                }`}
                            >
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                    {isVerified ? (
                                        <CheckCircle2 className="h-10 w-10 text-[#FFE600]" />
                                    ) : (
                                        <Clock className="h-10 w-10 text-[#fed7aa]" />
                                    )}
                                </div>
                                <h2 className="mt-4 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                    {isVerified
                                        ? 'KARTU PESERTA ASLI & TERVERIFIKASI'
                                        : 'PENDAFTARAN TERCATAT (MENUNGGU VERIFIKASI)'}
                                </h2>
                                <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-emerald-100 sm:text-sm">
                                    {isVerified
                                        ? 'Peserta ini telah terdaftar sah dalam basis data resmi OMATIQ Yatim Mandiri dan berhak mengikuti perlombaan.'
                                        : 'Data pendaftaran peserta telah terdaftar di sistem dan saat ini sedang menunggu verifikasi akhir oleh panitia.'}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-1 text-[11px] font-bold text-white/90">
                                    <span>Diperiksa pada:</span>
                                    <span className="text-[#FFE600]">{participant.verified_at}</span>
                                </div>
                            </div>

                            {/* Participant Profile Section */}
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-6 text-center sm:flex-row sm:text-left">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#17524A] bg-slate-100 shadow-md">
                                            {participant.student?.photo_url ? (
                                                <img
                                                    src={participant.student.photo_url}
                                                    alt="Foto Peserta"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <User className="h-10 w-10" />
                                                    <span className="text-[10px] font-bold">FOTO</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="absolute -right-2 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#17524A] text-white shadow">
                                            <Check className="h-4 w-4 text-[#FFE600]" />
                                        </span>
                                    </div>

                                    {/* Name & BIB Header */}
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-[#17524A]">
                                            <Trophy className="h-3.5 w-3.5 text-[#E5BE1E]" />
                                            {participant.olimpiade?.name ?? 'OMATIQ'}
                                            {participant.olimpiade?.category ? ` (${participant.olimpiade.category})` : ''}
                                        </div>
                                        <h3 className="mt-2 text-2xl font-black text-slate-900">
                                            {participant.student?.full_name ?? '-'}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-extrabold text-slate-700">
                                                BIB: {participant.registration_number}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                        <span className="text-emerald-600">Tersalin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Salin</span>
                                                    </>
                                                )}
                                            </button>
                                            <span
                                                className={`rounded-md px-2.5 py-1 text-xs font-black uppercase ${
                                                    participant.student?.is_binaan
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {participant.student?.is_binaan ? 'Peserta Binaan' : 'Peserta Umum'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Verification Info Grid */}
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <GraduationCap className="h-4 w-4 text-[#17524A]" />
                                            Asal Sekolah &amp; Kelas
                                        </div>
                                        <p className="mt-1 text-sm font-black text-slate-800">
                                            {participant.student?.school_name ?? '-'}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            {participant.student?.school_level ?? 'SD/MI'} &bull; Kelas{' '}
                                            {participant.student?.grade ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <MapPin className="h-4 w-4 text-[#17524A]" />
                                            Cabang / Wilayah
                                        </div>
                                        <p className="mt-1 text-sm font-black text-slate-800">
                                            {participant.branch ?? participant.student?.regency_name ?? '-'}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            {participant.student?.regency_name ?? 'Wilayah Terdaftar'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <UserCheck className="h-4 w-4 text-[#17524A]" />
                                            Guru Pendamping / Wali
                                        </div>
                                        <p className="mt-1 text-sm font-black text-slate-800">
                                            {participant.student?.mentor_name ?? '-'}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            {participant.student?.is_binaan
                                                ? 'Guru Binaan Sanggar'
                                                : 'Pendamping Resmi'}
                                        </p>
                                    </div>

                                    {participant.penyaluran_sanggar_name ? (
                                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Building2 className="h-4 w-4 text-[#17524A]" />
                                                Sanggar Binaan
                                            </div>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                {participant.penyaluran_sanggar_name}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-500">
                                                Sanggar Genius Yatim Mandiri
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Calendar className="h-4 w-4 text-[#17524A]" />
                                                Tahun Event
                                            </div>
                                            <p className="mt-1 text-sm font-black text-slate-800">
                                                OMATIQ {participant.event_year ?? 2026}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-500">
                                                Olimpiade Matematika &amp; Al-Qur'an
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {participant.student?.nik && (
                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-2.5 text-xs text-slate-600">
                                        <span className="font-semibold">ID Kependudukan (NIK):</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {participant.student.nik}
                                        </span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                    <a
                                        href={`/pendaftaran/kartu/${participant.registration_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17524A] to-[#207267] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-0.5 hover:from-[#13443d] hover:to-[#1a5f56]"
                                    >
                                        <Printer className="h-4 w-4 text-[#FFE600]" />
                                        {isVerified ? 'Buka Kartu Peserta' : 'Buka Bukti Registrasi'}
                                    </a>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Home className="h-4 w-4" />
                                        Beranda
                                    </Link>
                                </div>
                            </div>

                            {/* Trust & Security Guarantee Footer */}
                            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-center text-xs text-slate-500">
                                <span className="font-bold text-[#17524A]">🔒 Verifikasi Kriptografis Resmi</span> &bull; Data diverifikasi langsung secara real-time dari database pusat OMATIQ Yatim Mandiri.
                            </div>
                        </div>
                    ) : (
                        /* Not Found / Invalid State */
                        <div className="overflow-hidden rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-slate-200/80 sm:p-12">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 ring-8 ring-rose-50">
                                <ShieldAlert className="h-10 w-10" />
                            </div>
                            <h2 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
                                {queryRegistrationNumber
                                    ? 'Data Peserta Tidak Ditemukan'
                                    : 'Masukkan Nomor Registrasi'}
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                                {queryRegistrationNumber ? (
                                    <>
                                        Nomor registrasi <span className="font-mono font-bold text-rose-600">"{queryRegistrationNumber}"</span> tidak terdaftar dalam sistem database OMATIQ. Harap berhati-hati terhadap pemalsuan kartu atau periksa kembali nomor registrasi Anda.
                                    </>
                                ) : (
                                    'Silakan scan QR code pada kartu peserta atau masukkan nomor registrasi resmi pada kolom pencarian di atas.'
                                )}
                            </p>

                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    <Home className="h-4 w-4" />
                                    Kembali ke Beranda
                                </Link>
                                <Link
                                    href="/pendaftaran"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#17524A]/20 transition hover:bg-[#13443d]"
                                >
                                    Daftar OMATIQ Sekarang
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
