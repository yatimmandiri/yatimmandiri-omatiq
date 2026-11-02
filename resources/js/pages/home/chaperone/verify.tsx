import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    GraduationCap,
    Home,
    MapPin,
    MessageCircle,
    Phone,
    Printer,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trophy,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type EscortedParticipant = {
    id: number;
    registration_number: string;
    name: string;
    school_name: string;
    school_level: string;
    grade: string;
    olimpiade_name: string;
    category?: string | null;
    is_binaan: boolean;
    photo_url?: string | null;
    national_status: string;
    is_national_verified: boolean;
};

type ChaperoneData = {
    id: number;
    formatted_id: string;
    name: string;
    nik?: string | null;
    gender: 'male' | 'female';
    phone: string;
    email?: string | null;
    branch: string;
    position?: string | null;
    source_type: 'guru' | 'karyawan' | 'lainnya';
    status: 'submitted' | 'verified' | 'rejected' | string;
    notes?: string | null;
    verified_at?: string | null;
    verifier_name?: string | null;
    province_name?: string | null;
    regency_name?: string | null;
    participants_count: number;
    participants: EscortedParticipant[];
};

type VerifyChaperoneProps = {
    pageTitle: string;
    queryCode?: string | null;
    isValid: boolean;
    chaperone?: ChaperoneData | null;
};

export default function ChaperoneVerifyPage({
    pageTitle,
    queryCode,
    isValid,
    chaperone,
}: VerifyChaperoneProps) {
    const [searchQuery, setSearchQuery] = useState(queryCode || '');
    const [participantFilter, setParticipantFilter] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.get(`/verifikasi/pendamping/${encodeURIComponent(trimmed)}`);
        }
    };

    const handleCopy = () => {
        if (chaperone?.formatted_id) {
            navigator.clipboard.writeText(chaperone.formatted_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isVerified = chaperone?.status === 'verified';
    const isSubmitted = chaperone?.status === 'submitted';
    const isRejected = chaperone?.status === 'rejected';

    // WhatsApp clean link
    const waLink = useMemo(() => {
        if (!chaperone?.phone) return null;
        let clean = chaperone.phone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) {
            clean = '62' + clean.slice(1);
        } else if (clean.startsWith('8')) {
            clean = '62' + clean;
        }
        const text = encodeURIComponent(
            `Halo Bapak/Ibu ${chaperone.name}, kami dari Panitia Babak Final Nasional OMATIQ 2026 terkait pendampingan peserta dari Cabang ${chaperone.branch}.`,
        );
        return `https://wa.me/${clean}?text=${text}`;
    }, [chaperone?.phone, chaperone?.name, chaperone?.branch]);

    // Filter participants in view
    const filteredParticipants = useMemo(() => {
        if (!chaperone?.participants) return [];
        if (!participantFilter.trim()) return chaperone.participants;
        const q = participantFilter.toLowerCase();
        return chaperone.participants.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.registration_number.toLowerCase().includes(q) ||
                p.school_name.toLowerCase().includes(q) ||
                p.olimpiade_name.toLowerCase().includes(q),
        );
    }, [chaperone?.participants, participantFilter]);

    return (
        <>
            <Head title={pageTitle} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#ffffff] px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                {/* Background ambient lighting */}
                <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#17524A]/10 blur-3xl sm:w-[800px]" />
                <div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#FFE600]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-[#22C55E]/10 blur-3xl" />

                <div className="relative mx-auto max-w-4xl">
                    {/* Header Seal / Logo */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#17524A]/20 bg-white/80 px-4 py-1.5 text-xs font-black tracking-wider text-[#17524A] uppercase shadow-sm backdrop-blur-md">
                            <ShieldCheck className="h-4 w-4 text-[#17524A]" />
                            Official Chaperone Gateway &bull; OMATIQ 2026
                        </div>
                        <h1 className="mt-3 text-2xl font-black text-[#0f172a] sm:text-4xl">
                            Verifikasi Resmi Pendamping Babak Final
                        </h1>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748b]">
                            Sistem otentikasi resmi untuk memvalidasi keabsahan kartu pass pendamping dan tanggung jawab rombongan kontingen peserta cabang OMATIQ 2026.
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
                                    placeholder="Scan barcode atau ketik ID Pendamping (Contoh: OFF-00001)..."
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm font-bold text-slate-800 placeholder-slate-400 transition focus:border-[#17524A] focus:bg-white focus:ring-[#17524A]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#17524A]/20 transition hover:bg-[#13443d] active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                Cek Keaslian Pass
                            </button>
                        </form>
                    </div>

                    {/* Main Verification Card */}
                    {isValid && chaperone ? (
                        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200/80">
                            {/* Security Result Banner */}
                            <div
                                className={`px-6 py-6 text-center text-white sm:px-8 ${
                                    isVerified
                                        ? 'bg-gradient-to-r from-[#134e45] via-[#17524A] to-[#258a7c]'
                                        : isSubmitted
                                          ? 'bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#9a3412]'
                                          : 'bg-gradient-to-r from-[#dc2626] via-[#b91c1c] to-[#991b1b]'
                                }`}
                            >
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                    {isVerified ? (
                                        <CheckCircle2 className="h-10 w-10 text-[#FFE600]" />
                                    ) : isSubmitted ? (
                                        <Clock className="h-10 w-10 text-[#fed7aa]" />
                                    ) : (
                                        <AlertTriangle className="h-10 w-10 text-[#fca5a5]" />
                                    )}
                                </div>
                                <h2 className="mt-4 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                    {isVerified
                                        ? 'PASS PENDAMPING RESMI TERVERIFIKASI'
                                        : isSubmitted
                                          ? 'USULAN PENDAMPING (MENUNGGU VERIFIKASI PUSAT)'
                                          : 'STATUS PENDAMPING DITOLAK / PERLU REVISI'}
                                </h2>
                                <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-emerald-100 sm:text-sm">
                                    {isVerified
                                        ? 'Pendamping ini telah disetujui resmi oleh Panitia Pusat OMATIQ sebagai Penanggung Jawab Resmi Kontingen Babak Final Nasional 2026.'
                                        : isSubmitted
                                          ? 'Data pengusulan pendamping dari cabang telah tercatat dan saat ini sedang dalam proses peninjauan oleh Panitia Pusat OMATIQ.'
                                          : 'Pengajuan pendamping ini belum disetujui atau memerlukan revisi administrasi dari kantor cabang terkait.'}
                                </p>
                                {chaperone.verified_at && isVerified && (
                                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-1 text-[11px] font-bold text-white/90">
                                        <span>Diverifikasi pada:</span>
                                        <span className="text-[#FFE600]">{chaperone.verified_at}</span>
                                        <span>&bull;</span>
                                        <span>{chaperone.verifier_name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Chaperone Profile Section */}
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-6 text-center sm:flex-row sm:text-left">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#17524A] bg-emerald-50 text-[#17524A] shadow-md">
                                            <User className="h-12 w-12" />
                                        </div>
                                        <span className="absolute -right-2 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#17524A] text-white shadow">
                                            <Check className="h-4 w-4 text-[#FFE600]" />
                                        </span>
                                    </div>

                                    {/* Name & Official ID Header */}
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-[#17524A]">
                                            <Building2 className="h-3.5 w-3.5 text-[#E5BE1E]" />
                                            KANTOR CABANG {chaperone.branch.toUpperCase()}
                                        </div>
                                        <h3 className="mt-2 text-2xl font-black text-slate-900">
                                            {chaperone.name}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-extrabold text-slate-700">
                                                ID: {chaperone.formatted_id}
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
                                                    chaperone.source_type === 'guru'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {chaperone.source_type === 'guru' ? 'Guru Pembimbing' : 'Karyawan Cabang'}
                                            </span>
                                            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                                                {chaperone.participants_count} Peserta Dampingan
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Official Delegation Responsibility Statement */}
                                <div className="mt-6 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-xs">
                                            <ShieldCheck className="h-5 w-5 text-[#FFE600]" />
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-black tracking-wider text-[#17524A] uppercase sm:text-sm">
                                                Pernyataan Tanggung Jawab Resmi Kontingen
                                            </h4>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
                                                Pendamping di atas bertindak sebagai penanggung jawab resmi rombongan delegasi dari <strong>Cabang {chaperone.branch}</strong> dan berkewajiban mendampingi, mengawasi, serta menjamin keselamatan seluruh peserta kontingen yang tercantum di bawah ini selama penyelenggaraan <strong>Babak Final Nasional OMATIQ 2026</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Chaperone Info Grid */}
                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Building2 className="h-4 w-4 text-[#17524A]" />
                                            Asal Cabang
                                        </div>
                                        <p className="mt-1 text-sm font-black text-slate-800">
                                            Cabang {chaperone.branch}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            {chaperone.regency_name ?? 'Wilayah Terdaftar'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <UserCheck className="h-4 w-4 text-[#17524A]" />
                                            Jabatan / Posisi
                                        </div>
                                        <p className="mt-1 text-sm font-black text-slate-800">
                                            {chaperone.position ?? (chaperone.source_type === 'guru' ? 'Guru Pembimbing' : 'Staf Kantor Cabang')}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            Penanggung Jawab Kontingen
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Phone className="h-4 w-4 text-[#17524A]" />
                                            Kontak WhatsApp
                                        </div>
                                        <p className="mt-1 font-mono text-sm font-black text-slate-800">
                                            {chaperone.phone}
                                        </p>
                                        {waLink && (
                                            <a
                                                href={waLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                            >
                                                <MessageCircle className="h-3 w-3" />
                                                <span>Hubungi via WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {chaperone.nik && (
                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-2.5 text-xs text-slate-600">
                                        <span className="font-semibold">ID Kependudukan (NIK Terproteksi):</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {chaperone.nik}
                                        </span>
                                    </div>
                                )}

                                {/* Roster of Escorted Participants */}
                                <div className="mt-8">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-[#17524A]" />
                                            <h4 className="text-lg font-black text-slate-900">
                                                Rombongan Peserta yang Didampingi
                                            </h4>
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                                                {chaperone.participants_count} Santri / Siswa
                                            </span>
                                        </div>
                                        {chaperone.participants.length > 5 && (
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={participantFilter}
                                                    onChange={(e) => setParticipantFilter(e.target.value)}
                                                    placeholder="Cari peserta dalam rombongan..."
                                                    className="w-full rounded-lg border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#17524A] focus:bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {filteredParticipants.length > 0 ? (
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {filteredParticipants.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="group relative flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-[#17524A]/40 hover:shadow-md"
                                                >
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                                                        {p.photo_url ? (
                                                            <img
                                                                src={p.photo_url}
                                                                alt={p.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-mono text-xs font-black text-[#17524A]">
                                                                {p.registration_number}
                                                            </span>
                                                            <span
                                                                className={`rounded px-1.5 py-0.2 text-[10px] font-black uppercase ${
                                                                    p.is_binaan
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                            >
                                                                {p.is_binaan ? 'Binaan' : 'Umum'}
                                                            </span>
                                                            {p.is_national_verified && (
                                                                <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-800">
                                                                    Finalis
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h5 className="mt-1 truncate text-sm font-black text-slate-900 group-hover:text-[#17524A]">
                                                            {p.name}
                                                        </h5>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {p.school_name} &bull; Kelas {p.grade}
                                                        </p>
                                                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                                                            <span className="font-semibold text-slate-600">
                                                                {p.olimpiade_name}
                                                                {p.category ? ` (${p.category})` : ''}
                                                            </span>
                                                            <a
                                                                href={`/verifikasi/${p.registration_number}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 font-bold text-[#17524A] hover:underline"
                                                            >
                                                                <span>Cek Kartu</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                                            Tidak ada peserta dalam rombongan yang cocok dengan pencarian "{participantFilter}".
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                    {waLink && (
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Hubungi Pendamping via WhatsApp</span>
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17524A] to-[#207267] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-0.5 hover:from-[#13443d] hover:to-[#1a5f56]"
                                    >
                                        <Printer className="h-4 w-4 text-[#FFE600]" />
                                        <span>Cetak Bukti Verifikasi</span>
                                    </button>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Home className="h-4 w-4" />
                                        <span>Beranda</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Trust & Security Guarantee Footer */}
                            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-center text-xs text-slate-500">
                                <span className="font-bold text-[#17524A]">🔒 Verifikasi Kriptografis Resmi</span> &bull; Data divalidasi langsung secara real-time dari basis data resmi panitia pusat OMATIQ Yatim Mandiri.
                            </div>
                        </div>
                    ) : (
                        /* Not Found / Invalid State */
                        <div className="overflow-hidden rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-slate-200/80 sm:p-12">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 ring-8 ring-rose-50">
                                <ShieldAlert className="h-10 w-10" />
                            </div>
                            <h2 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
                                {queryCode
                                    ? 'Data Pendamping Tidak Ditemukan'
                                    : 'Masukkan ID / Scan Barcode Pendamping'}
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                                {queryCode ? (
                                    <>
                                        Kode pass pendamping <span className="font-mono font-bold text-rose-600">"{queryCode}"</span> tidak terdaftar dalam basis data resmi OMATIQ 2026. Harap berhati-hati terhadap kartu tidak resmi atau periksa kembali kode ID pada kartu Anda.
                                    </>
                                ) : (
                                    'Silakan scan QR code / barcode pada kartu pass pendamping atau masukkan kode ID resmi pada kolom pencarian di atas.'
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
                                    href="/verifikasi"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#17524A]/20 transition hover:bg-[#13443d]"
                                >
                                    Verifikasi Peserta OMATIQ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
