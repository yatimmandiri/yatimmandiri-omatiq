import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
    Calendar,
    Check,
    Clock,
    Copy,
    GraduationCap,
    Home,
    MapPin,
    Phone,
    Printer,
    Search,
    ShieldAlert,
    ShieldCheck,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type CommitteeData = {
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
    photo_url?: string | null;
    status: 'active' | 'inactive' | string;
    notes?: string | null;
    event_year: number;
    checked_in_at?: string | null;
    has_user_account?: boolean;
};

type VerifyCommitteeProps = {
    pageTitle: string;
    queryCode?: string | null;
    isValid: boolean;
    committee?: CommitteeData | null;
};

export default function CommitteeVerifyPage({
    pageTitle,
    queryCode,
    isValid,
    committee,
}: VerifyCommitteeProps) {
    const [searchQuery, setSearchQuery] = useState(queryCode || '');
    const [copied, setCopied] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Audio Chime on scan
    const playChime = (success: boolean) => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (success) {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else {
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
        if (queryCode) {
            playChime(isValid);
        }
        searchInputRef.current?.focus();
    }, [queryCode, isValid]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.get(`/verifikasi/panitia/${encodeURIComponent(trimmed)}`);
        }
    };

    const handleCopy = () => {
        if (committee?.code) {
            navigator.clipboard.writeText(committee.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isActive = committee?.status === 'active';

    return (
        <>
            <Head title={pageTitle} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 pt-32 pb-24 text-slate-100 sm:px-6 lg:px-8">
                {/* Background ambient lighting */}
                <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl sm:w-[800px]" />
                <div className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-3xl">
                    {/* Header Breadcrumb / Nav */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-amber-400"
                        >
                            <Home className="h-4 w-4" />
                            <span>Beranda OMATIQ</span>
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-1 font-medium text-blue-300 border border-blue-500/30">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Gate Access System
                            </span>
                        </div>
                    </div>

                    {/* Persona Selector Tabs */}
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 backdrop-blur-md">
                        <Link
                            href="/verifikasi"
                            className="flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200"
                        >
                            <GraduationCap className="inline-block h-3.5 w-3.5 mr-1" />
                            Peserta
                        </Link>
                        <Link
                            href="/verifikasi/pendamping"
                            className="flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200"
                        >
                            <Users className="inline-block h-3.5 w-3.5 mr-1" />
                            Pendamping
                        </Link>
                        <Link
                            href="/verifikasi/panitia"
                            className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-center text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20"
                        >
                            <BadgeCheck className="inline-block h-3.5 w-3.5 mr-1" />
                            Panitia
                        </Link>
                        <Link
                            href="/verifikasi/tamu"
                            className="flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200"
                        >
                            <UserCheck className="inline-block h-3.5 w-3.5 mr-1" />
                            Tamu Undangan
                        </Link>
                    </div>

                    {/* Search & USB Scanner Form */}
                    <div className="mb-8 rounded-3xl border border-slate-700/60 bg-slate-800/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                Pemindai Barcode / QR / Kode Panitia
                            </span>
                            <span className="rounded bg-slate-700/70 px-2 py-0.5 text-[10px] text-slate-300">
                                Support Scanner USB Kasir
                            </span>
                        </div>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Arahkan laser scanner USB atau ketik CREW-00001..."
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-3 pr-4 pl-10 text-sm font-medium text-slate-100 placeholder-slate-500 shadow-inner transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:inline">Periksa</span>
                            </button>
                        </form>
                    </div>

                    {/* Verification Result */}
                    {queryCode && (
                        <div className="space-y-6">
                            {isValid && committee ? (
                                <div className="overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                                    {/* Top Status Banner */}
                                    <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                            <ShieldCheck className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold sm:text-lg">
                                                PANITIA PELAKSANA RESMI TERVERIFIKASI
                                            </h2>
                                            <p className="text-xs text-emerald-100">
                                                ID Pass resmi dan hak akses venue babak final nasional OMATIQ 2026 telah tervalidasi.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Committee Main Profile Body */}
                                    <div className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                            {/* Photo / Avatar */}
                                            <div className="relative shrink-0">
                                                <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-slate-800 shadow-lg">
                                                    {committee.photo_url ? (
                                                        <img
                                                            src={committee.photo_url}
                                                            alt={committee.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400">
                                                            <User className="h-12 w-12 stroke-[1.5]" />
                                                            <span className="mt-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                                                Panitia
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-2 -right-2 inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow">
                                                    {committee.access_zone}
                                                </span>
                                            </div>

                                            {/* Bio Info */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                                        {committee.code}
                                                    </span>
                                                    <button
                                                        onClick={handleCopy}
                                                        className="text-slate-400 hover:text-slate-200 transition-colors"
                                                        title="Salin Kode"
                                                    >
                                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                                                        {isActive ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </div>

                                                <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                                                    {committee.name}
                                                </h1>

                                                <p className="mt-1 text-sm font-semibold text-amber-300">
                                                    {committee.position} &bull; Divisi {committee.division}
                                                </p>

                                                {/* Meta Info Grid */}
                                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
                                                        <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                                                        <div>
                                                            <div className="text-slate-400">Jam Masuk Venue</div>
                                                            <div className="font-semibold text-slate-200">
                                                                {committee.checked_in_at || 'Baru Pertama Kali Masuk (Checked-In)'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
                                                        <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                                        <div>
                                                            <div className="text-slate-400">Hak Akses Venue</div>
                                                            <div className="font-semibold text-slate-200">
                                                                {committee.access_zone}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {committee.phone && (
                                                        <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
                                                            <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                                                            <div>
                                                                <div className="text-slate-400">Kontak Panitia</div>
                                                                <div className="font-semibold text-slate-200">
                                                                    {committee.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {committee.nik && (
                                                        <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
                                                            <User className="h-4 w-4 text-purple-400 shrink-0" />
                                                            <div>
                                                                <div className="text-slate-400">NIK (PDP Masked)</div>
                                                                <div className="font-semibold text-slate-200 font-mono">
                                                                    {committee.nik}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Notice */}
                                        <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
                                            <BadgeCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-amber-300">Instruksi Petugas Gerbang:</span>{' '}
                                                Tunjukkan kartu lanyard fisik bertanda <strong>CREW</strong>. Pemegang kartu ini memiliki wewenang operasional penuh di area OMATIQ 2026. Silakan persilakan masuk.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        <ShieldAlert className="h-7 w-7" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-white">
                                        Data Panitia Tidak Ditemukan
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                                        Kode <span className="font-mono font-bold text-rose-300">{queryCode}</span> tidak terdaftar dalam database resmi panitia OMATIQ. Silakan periksa kembali nomor atau hubungi Helpdesk.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
