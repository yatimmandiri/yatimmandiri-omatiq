import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Award,
    BadgeCheck,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Crown,
    ExternalLink,
    GraduationCap,
    Home,
    MapPin,
    Phone,
    Printer,
    QrCode,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trophy,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type ParticipantEntity = {
    id: number;
    registration_number: string;
    status: 'submitted' | 'verified' | 'rejected' | string;
    registration_type?: string;
    event_year: number;
    branch?: string | null;
    penyaluran_sanggar_name?: string | null;
    guardian_name?: string | null;
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
        guardian_name?: string | null;
        is_binaan?: boolean;
        photo_url?: string | null;
    } | null;
    verified_at?: string;
    national?: {
        status: string;
        shirt_size?: string | null;
        payment_status?: string;
        is_verified?: boolean;
    } | null;
};

type ChaperoneEntity = {
    id: number;
    formatted_id: string;
    name: string;
    nik?: string | null;
    gender: 'male' | 'female';
    phone?: string | null;
    email?: string | null;
    branch?: string | null;
    position?: string | null;
    source_type?: string;
    status: string;
    notes?: string | null;
    verified_at?: string | null;
    verifier_name?: string;
    province_name?: string | null;
    regency_name?: string | null;
    participants_count: number;
    participants: Array<{
        id: number;
        registration_number: string;
        name: string;
        school_name: string;
        school_level: string;
        grade: string;
        olimpiade_name: string;
        category: string;
        is_binaan: boolean;
        photo_url?: string | null;
        national_status: string;
        is_national_verified: boolean;
    }>;
};

type CommitteeEntity = {
    id: number;
    code: string;
    name: string;
    nik?: string | null;
    gender: 'male' | 'female';
    phone?: string | null;
    email?: string | null;
    division: string;
    position: string;
    access_zone: string;
    duty_description?: string | null;
    photo_url?: string | null;
    status: 'active' | 'inactive' | string;
    notes?: string | null;
    event_year: number;
    checked_in_at?: string | null;
    has_user_account?: boolean;
};

type GuestEntity = {
    id: number;
    code: string;
    name: string;
    institution: string;
    position: string;
    category: string;
    phone?: string | null;
    email?: string | null;
    table_number?: string | null;
    seat_count: number;
    photo_url?: string | null;
    status: string;
    notes?: string | null;
    event_year: number;
    checked_in_at?: string | null;
};

type VerifyProps = {
    pageTitle: string;
    queryCode?: string | null;
    persona?: 'participant' | 'chaperone' | 'committee' | 'guest' | 'not_found' | null;
    isValid: boolean;
    isFirstCheckIn?: boolean;
    entity?: any;
    // Backward-compat props
    queryRegistrationNumber?: string | null;
    participant?: ParticipantEntity | null;
    chaperone?: ChaperoneEntity | null;
    committee?: CommitteeEntity | null;
    guest?: GuestEntity | null;
};

export default function UniversalVerifyPage({
    pageTitle,
    queryCode,
    persona,
    isValid,
    isFirstCheckIn,
    entity,
    queryRegistrationNumber,
    participant: propParticipant,
    chaperone: propChaperone,
    committee: propCommittee,
    guest: propGuest,
}: VerifyProps) {
    const activeCode = queryCode ?? queryRegistrationNumber ?? '';
    const [searchQuery, setSearchQuery] = useState(activeCode);
    const [copied, setCopied] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Resolve active persona & data
    const resolvedPersona = persona ?? (
        propCommittee ? 'committee' :
        propGuest ? 'guest' :
        propChaperone ? 'chaperone' :
        propParticipant ? 'participant' :
        activeCode ? 'not_found' : null
    );

    const activeEntity = entity ?? (
        resolvedPersona === 'committee' ? propCommittee :
        resolvedPersona === 'guest' ? propGuest :
        resolvedPersona === 'chaperone' ? propChaperone :
        resolvedPersona === 'participant' ? propParticipant : null
    );

    // Audio chime on scan
    const playChime = (valid: boolean, firstTime: boolean) => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (valid) {
                osc.type = 'sine';
                if (firstTime) {
                    // Double high chime (First check-in / Valid)
                    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.35);
                } else {
                    // Repeated scan
                    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
                    gain.gain.setValueAtTime(0.12, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.25);
                }
            } else {
                // Low sawtooth warning (Not found / Invalid)
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            }
        } catch {
            // Audio context unsupported / blocked
        }
    };

    useEffect(() => {
        if (activeCode) {
            playChime(isValid, Boolean(isFirstCheckIn));
        }
        // Always refocus input for USB barcode cashier gun scanner continuous flow
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
    }, [activeCode, isValid, isFirstCheckIn]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.get(`/verifikasi/${encodeURIComponent(trimmed)}`);
        }
    };

    const handleCopy = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <Head title={pageTitle || 'Universal Gate Terminal OMATIQ'} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#ffffff] px-4 pt-28 pb-24 sm:px-6 lg:px-8">
                {/* Background ambient lighting */}
                <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#17524A]/10 blur-3xl sm:w-[800px]" />
                <div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#FFE600]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-[#22C55E]/10 blur-3xl" />

                <div className="relative mx-auto max-w-3xl">
                    {/* Header Seal / Logo */}
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#17524A]/20 bg-white/80 px-4 py-1.5 text-xs font-black tracking-wider text-[#17524A] uppercase shadow-sm backdrop-blur-md">
                            <ShieldCheck className="h-4 w-4 text-[#17524A]" />
                            Official Venue Gate Terminal &bull; OMATIQ 2026
                        </div>
                        <h1 className="mt-3 text-2xl font-black text-[#0f172a] sm:text-4xl">
                            Pintu Masuk & Verifikasi Akses Venue
                        </h1>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-[#64748b]">
                            Satu terminal terpadu untuk pemindaian lanyard pass seluruh entitas: <strong>Peserta, Pendamping, Panitia, dan Tamu Undangan</strong>.
                        </p>
                    </div>

                    {/* Scanner Input Terminal (Optimized for USB Cashier Barcode Guns) */}
                    <div className="mb-6 rounded-2xl bg-white p-3.5 shadow-xl shadow-slate-200/50 ring-2 ring-[#17524A]/20">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#17524A]">
                                <QrCode className="size-4" />
                                Kotak Scan Barcode / QR / Kode Akses
                            </span>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Continuous USB Scanner Mode
                            </span>
                        </div>
                        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Arahkan barcode scanner kasir / ketik kode (OMQ-..., OFF-..., CREW-..., INV-...)"
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm font-bold text-slate-800 placeholder-slate-400 transition focus:border-[#17524A] focus:bg-white focus:ring-[#17524A]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#17524A]/20 transition hover:bg-[#13443d] active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                Scan / Cek
                            </button>
                        </form>

                        {/* Supported Persona Badges Indicator */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-400">Auto-Detect:</span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                                🟢 Peserta (OMQ)
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 font-bold text-teal-800">
                                🔵 Pendamping (OFF)
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-800">
                                🟣 Panitia (CREW)
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-800">
                                🟡 Tamu VIP (INV)
                            </span>
                        </div>
                    </div>

                    {/* Result Container: Check Persona */}
                    {isValid && activeEntity ? (
                        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200/80">
                            {/* 1. PARTICIPANT PERSONA */}
                            {resolvedPersona === 'participant' && (
                                <>
                                    <div className="bg-gradient-to-r from-[#134e45] via-[#17524A] to-[#258a7c] px-6 py-6 text-center text-white sm:px-8">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                            <CheckCircle2 className="h-10 w-10 text-[#FFE600]" />
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wide text-[#FFE600] uppercase">
                                            <GraduationCap className="size-3.5" />
                                            KARTU PESERTA ASLI &bull; FINALIS OMATIQ
                                        </div>
                                        <h2 className="mt-2 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                            {activeEntity.student?.full_name ?? '-'}
                                        </h2>
                                        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-emerald-100 sm:text-sm">
                                            Peserta terdaftar sah dalam basis data OMATIQ dan diverifikasi untuk akses arena lomba.
                                        </p>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-6 text-center sm:flex-row sm:text-left">
                                            <div className="relative">
                                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#17524A] bg-slate-100 shadow-md">
                                                    {activeEntity.student?.photo_url ? (
                                                        <img src={activeEntity.student.photo_url} alt="Foto" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center text-slate-400">
                                                            <User className="h-10 w-10" />
                                                            <span className="text-[10px] font-bold">FOTO</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-[#17524A]">
                                                    <Trophy className="h-3.5 w-3.5 text-[#E5BE1E]" />
                                                    {activeEntity.olimpiade?.name ?? 'OMATIQ'} ({activeEntity.olimpiade?.category ?? '-'})
                                                </div>
                                                <h3 className="mt-2 text-2xl font-black text-slate-900">
                                                    {activeEntity.student?.full_name}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-extrabold text-slate-700">
                                                        BIB: {activeEntity.registration_number}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(activeEntity.registration_number)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                                        {copied ? 'Tersalin' : 'Salin'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <Building2 className="size-4 text-[#17524A]" />
                                                    Asal Sekolah & Kelas
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {activeEntity.student?.school_name ?? '-'} (Kelas {activeEntity.student?.grade ?? '-'})
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <MapPin className="size-4 text-[#17524A]" />
                                                    Wilayah / Cabang
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {activeEntity.branch ?? activeEntity.student?.regency_name ?? '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-center gap-3">
                                            <a
                                                href={`/pendaftaran/kartu/${activeEntity.registration_number}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#17524A] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#13443d]"
                                            >
                                                <Printer className="size-4 text-[#FFE600]" />
                                                Buka Lanyard Pass Peserta
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 2. CHAPERONE PERSONA */}
                            {resolvedPersona === 'chaperone' && (
                                <>
                                    <div className="bg-gradient-to-r from-[#0f766e] via-[#115e59] to-[#134e4a] px-6 py-6 text-center text-white sm:px-8">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                            <Users className="h-10 w-10 text-[#FFE600]" />
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wide text-[#FFE600] uppercase">
                                            <UserCheck className="size-3.5" />
                                            OFFICIAL PENDAMPING KONTINGEN NASIONAL
                                        </div>
                                        <h2 className="mt-2 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                            {activeEntity.name}
                                        </h2>
                                        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-teal-100 sm:text-sm">
                                            Official pendamping terverifikasi sah mewakili kontingen cabang {activeEntity.branch}.
                                        </p>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">ID Pendamping</span>
                                                <p className="mt-1 font-mono text-base font-extrabold text-teal-900">{activeEntity.formatted_id}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kontingen Cabang</span>
                                                <p className="mt-1 text-sm font-bold text-slate-800">{activeEntity.branch}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Total Santri Dampingan</span>
                                                <p className="mt-1 text-base font-extrabold text-[#17524A]">{activeEntity.participants_count} Finalis</p>
                                            </div>
                                        </div>

                                        {/* Accompanied Participants */}
                                        {activeEntity.participants?.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    Rombongan Peserta yang Didampingi:
                                                </h4>
                                                <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                                                    {activeEntity.participants.map((p: any) => (
                                                        <div key={p.id} className="flex items-center justify-between p-3.5 text-xs">
                                                            <div>
                                                                <p className="font-bold text-slate-900">{p.name}</p>
                                                                <p className="text-slate-500">{p.olimpiade_name} &bull; {p.school_name}</p>
                                                            </div>
                                                            <a
                                                                href={`/verifikasi/${p.registration_number}`}
                                                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                                                            >
                                                                {p.registration_number}
                                                                <ExternalLink className="size-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 3. COMMITTEE PERSONA */}
                            {resolvedPersona === 'committee' && (
                                <>
                                    <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1e3a8a] px-6 py-6 text-center text-white sm:px-8">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                            <BadgeCheck className="h-10 w-10 text-[#FFE600]" />
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wide text-[#FFE600] uppercase">
                                            <ShieldCheck className="size-3.5" />
                                            CREW ACCESS &bull; PANITIA PELAKSANA OMATIQ
                                        </div>
                                        <h2 className="mt-2 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                            {activeEntity.name}
                                        </h2>
                                        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-indigo-100 sm:text-sm">
                                            Divisi <strong>{activeEntity.division}</strong> &bull; Zona Akses: <strong>{activeEntity.access_zone}</strong>
                                        </p>
                                        {activeEntity.checked_in_at && (
                                            <div
                                                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                                                    activeEntity.is_checked_in_today
                                                        ? 'bg-emerald-500/30 text-emerald-200'
                                                        : 'bg-slate-500/30 text-slate-300'
                                                }`}
                                            >
                                                <Clock className="size-3.5" />
                                                {isFirstCheckIn
                                                    ? `Check-in Hari Ini Berhasil (${activeEntity.checked_in_time || activeEntity.checked_in_at})`
                                                    : activeEntity.is_checked_in_today
                                                      ? `Telah Hadir Hari Ini (${activeEntity.checked_in_time || activeEntity.checked_in_at})`
                                                      : `Check-in Terakhir: ${activeEntity.checked_in_at}`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kode Panitia</span>
                                                <p className="mt-1 font-mono text-base font-extrabold text-indigo-900">{activeEntity.code}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Jabatan / Role</span>
                                                <p className="mt-1 text-sm font-bold text-slate-800">{activeEntity.position}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Status Keaktifan</span>
                                                <p className="mt-1 text-sm font-bold text-emerald-700">Aktif & Terdaftar</p>
                                            </div>
                                        </div>
                                        {activeEntity.duty_description && (
                                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                                                <span className="font-bold text-slate-900">Uraian Tugas: </span>
                                                {activeEntity.duty_description}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 4. GUEST PERSONA */}
                            {resolvedPersona === 'guest' && (
                                <>
                                    <div className="bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#3f3f46] px-6 py-6 text-center text-white sm:px-8">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                            <Crown className="h-10 w-10 text-[#FFE600]" />
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wide text-[#FFE600] uppercase">
                                            <Sparkles className="size-3.5" />
                                            VIP GUEST &bull; {activeEntity.category}
                                        </div>
                                        <h2 className="mt-2 text-xl font-black tracking-wide uppercase sm:text-2xl">
                                            {activeEntity.name}
                                        </h2>
                                        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-amber-100 sm:text-sm">
                                            {activeEntity.institution} &bull; {activeEntity.position}
                                        </p>
                                        {activeEntity.checked_in_at && (
                                            <div
                                                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                                                    activeEntity.is_checked_in_today
                                                        ? 'bg-amber-500/30 text-amber-200'
                                                        : 'bg-slate-500/30 text-slate-300'
                                                }`}
                                            >
                                                <Clock className="size-3.5" />
                                                {isFirstCheckIn
                                                    ? `Kedatangan Hari Ini Tercatat (${activeEntity.checked_in_time || activeEntity.checked_in_at})`
                                                    : activeEntity.is_checked_in_today
                                                      ? `Telah Hadir Hari Ini (${activeEntity.checked_in_time || activeEntity.checked_in_at})`
                                                      : `Check-in Terakhir: ${activeEntity.checked_in_at}`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 text-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                                Alokasi Kursi / Meja Kehormatan
                                            </span>
                                            <p className="mt-1 text-2xl font-black text-amber-950 sm:text-3xl">
                                                {activeEntity.table_number}
                                            </p>
                                            <p className="mt-1 text-xs text-amber-800">
                                                Kapasitas Pendamping: <strong>{activeEntity.seat_count} Orang</strong>
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kode Undangan</span>
                                                <p className="mt-1 font-mono text-base font-extrabold text-slate-900">{activeEntity.code}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kategori Tamu</span>
                                                <p className="mt-1 text-sm font-bold text-amber-700">{activeEntity.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Trust Footer */}
                            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-center text-xs text-slate-500">
                                <span className="font-bold text-[#17524A]">🔒 Verifikasi Terpadu Venue OMATIQ</span> &bull; Terhubung secara live ke basis data event.
                            </div>
                        </div>
                    ) : (
                        /* Not Found / Standby State */
                        <div className="overflow-hidden rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-slate-200/80 sm:p-12">
                            {activeCode ? (
                                <>
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 ring-8 ring-rose-50">
                                        <ShieldAlert className="h-10 w-10" />
                                    </div>
                                    <h2 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
                                        Data Barcode Tidak Ditemukan
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                                        Kode <span className="font-mono font-bold text-rose-600">"{activeCode}"</span> tidak terdaftar sebagai Peserta, Pendamping, Panitia, maupun Tamu Undangan di sistem OMATIQ.
                                    </p>
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                searchInputRef.current?.focus();
                                            }}
                                            className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                        >
                                            Bersihkan & Scan Ulang
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800 ring-8 ring-emerald-50">
                                        <QrCode className="h-10 w-10 text-[#17524A]" />
                                    </div>
                                    <h2 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
                                        Terminal Siap Pindai Lanyard Pass
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                                        Arahkan alat scanner USB ke barcode 1D atau QR Code pada lanyard pass pengunjung gate untuk verifikasi instan.
                                    </p>
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200">
                                        <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Input auto-focus siap menerima input terus menerus
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
