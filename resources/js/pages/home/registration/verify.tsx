import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Award,
    BadgeCheck,
    Building2,
    Calendar,
    CalendarDays,
    Camera,
    CameraOff,
    Check,
    CheckCircle2,
    Clock,
    Coffee,
    Copy,
    Crown,
    ExternalLink,
    GraduationCap,
    Home,
    Info,
    Mail,
    MapPin,
    Phone,
    Plus,
    Printer,
    QrCode,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    Trophy,
    User,
    UserCheck,
    Users,
    Utensils,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { confirmAction } from '@/utils/sweetalert';
import { Button } from '@/components/ui/button';
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

type ConsumptionLog = {
    id: number;
    session_number?: number | null;
    redeemed_at: string;
    redeemed_time?: string;
    verifier_name: string;
    notes?: string | null;
};

type CheckInLogItem = {
    id: number;
    checkpoint: string;
    checkpoint_label: string;
    checked_in_at: string;
    checked_in_date: string;
    verifier_name: string;
    notes?: string | null;
};

type CheckInTimelineItem = {
    day_number: number;
    name: string;
    title: string;
    subtitle: string;
    is_checked_in: boolean;
    primary_time?: string | null;
    primary_date?: string | null;
    primary_checkpoint?: string | null;
    primary_verifier?: string | null;
    all_logs: CheckInLogItem[];
};

type DayOption = {
    name: string;
    title: string;
    subtitle: string;
    default_checkpoint: string;
    default_checkpoint_label: string;
};

type ConsumptionData = {
    remaining: number;
    count: number;
    max: number;
    can_redeem: boolean;
    reason: 'ready' | 'cooldown' | 'exhausted';
    next_session?: number | null;
    message?: string | null;
    last_redeemed_time?: string | null;
    next_available_time?: string | null;
    minutes_left?: number | null;
    logs: ConsumptionLog[];
};

type ParticipantEntity = {
    id: number;
    registration_number: string;
    status: 'submitted' | 'verified' | 'rejected' | string;
    social_status?: string | null;
    registration_type?: string;
    event_year: number;
    branch?: string | null;
    penyaluran_sanggar_name?: string | null;
    guardian_name?: string | null;
    shirt_size?: string | null;
    is_national_qualified?: boolean;
    pack_is_received?: boolean;
    pack_received_at?: string | null;
    check_in_timeline?: CheckInTimelineItem[];
    check_in_today?: any;
    consumption?: ConsumptionData;
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
    shirt_size?: string | null;
    is_national_qualified?: boolean;
    pack_is_received?: boolean;
    pack_received_at?: string | null;
    check_in_timeline?: CheckInTimelineItem[];
    check_in_today?: any;
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
    consumption?: ConsumptionData;
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
        shirt_size?: string | null;
        pack_is_received?: boolean;
        national_status: string;
        is_national_verified: boolean;
        consumption?: ConsumptionData;
    }>;
};

type CommitteeEntity = {
    id: number;
    code: string;
    name: string;
    nik?: string | null;
    gender: 'male' | 'female';
    shirt_size?: string | null;
    phone?: string | null;
    email?: string | null;
    division: string;
    position: string;
    access_zone: string;
    duty_today?: string | null;
    daily_duties?: Record<string, string>;
    duty_description?: string | null;
    photo_url?: string | null;
    status: 'active' | 'inactive' | string;
    notes?: string | null;
    event_year: number;
    checked_in_at?: string | null;
    checked_in_time?: string | null;
    is_checked_in_today?: boolean;
    has_user_account?: boolean;
    check_in_timeline?: CheckInTimelineItem[];
    check_in_today?: any;
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
    checked_in_time?: string | null;
    is_checked_in_today?: boolean;
    check_in_timeline?: CheckInTimelineItem[];
    check_in_today?: any;
};

type VerifyProps = {
    pageTitle: string;
    queryCode?: string | null;
    persona?: 'participant' | 'chaperone' | 'committee' | 'guest' | 'not_found' | null;
    isValid: boolean;
    isFirstCheckIn?: boolean;
    checkInMessage?: string | null;
    entity?: any;
    isAdministrator?: boolean;
    currentMode?: 'access' | 'consumption';
    activeDay?: number;
    activeCheckpoint?: string;
    activeCheckpointLabel?: string;
    dayOptions?: Record<number, DayOption>;
    checkpointOptions?: Record<string, string>;
    // Backward-compat props
    queryRegistrationNumber?: string | null;
    participant?: ParticipantEntity | null;
    chaperone?: ChaperoneEntity | null;
    committee?: CommitteeEntity | null;
    guest?: GuestEntity | null;
};

function ConsumptionCard({
    consumption,
    entityName,
    isAdministrator,
    isProcessing,
    onRedeem,
    onReset,
    theme = 'emerald',
}: {
    consumption: ConsumptionData;
    entityName: string;
    isAdministrator: boolean;
    isProcessing: boolean;
    onRedeem: (force?: boolean) => void;
    onReset: () => void;
    theme?: 'emerald' | 'teal';
}) {
    const isEmerald = theme === 'emerald';
    const lightBg = isEmerald ? 'bg-emerald-50/50' : 'bg-teal-50/50';

    const sessionNames = ['Makan Pagi', 'Makan Siang', 'Makan Malam'];

    return (
        <div className={`mt-6 rounded-3xl border-2 ${isEmerald ? 'border-emerald-500/30' : 'border-teal-500/30'} ${lightBg} p-5 sm:p-6 shadow-sm`}>
            {/* Header info */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                        <Utensils className="h-5 w-5 text-[#17524A]" />
                    </div>
                    <div>
                        <h4 className="text-base font-black text-slate-900 sm:text-lg">
                            Jatah Konsumsi Harian
                        </h4>
                        <p className="text-xs text-slate-500">
                            3x Makan / Hari (Pagi, Siang, Malam) &bull; Reset otomatis 00:00 WIB
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black shadow-sm ${
                            consumption.remaining > 0
                                ? 'bg-[#17524A] text-white'
                                : 'bg-slate-300 text-slate-700'
                        }`}
                    >
                        {consumption.remaining > 0 ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-[#FFE600] animate-pulse" />
                                Sisa: {consumption.remaining} dari {consumption.max} Porsi
                            </>
                        ) : (
                            'Selesai (3/3 Porsi)'
                        )}
                    </span>
                </div>
            </div>

            {/* 3x Portion Visual Status Cards */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {[1, 2, 3].map((num) => {
                    const log = consumption.logs?.find((l: ConsumptionLog) => l.session_number === num) || consumption.logs?.[num - 1];
                    const isTaken = num <= consumption.count;
                    const isNext = num === (consumption.count + 1);

                    return (
                        <div
                            key={num}
                            className={`relative flex flex-col justify-between rounded-2xl border p-3 sm:p-4 text-center transition ${
                                isTaken
                                    ? 'border-emerald-300 bg-emerald-100/70 text-emerald-950 shadow-sm'
                                    : isNext
                                    ? 'border-amber-300 bg-white ring-2 ring-amber-400/50 shadow-sm'
                                    : 'border-slate-200/80 bg-white/70 text-slate-400'
                            }`}
                        >
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {sessionNames[num - 1] || `Sesi ${num}`}
                                </span>
                                <h5 className="mt-0.5 text-xs sm:text-sm font-black">
                                    Porsi {num}
                                </h5>
                            </div>

                            <div className="my-2 flex justify-center">
                                {isTaken ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                                        <Check className="h-4 w-4 stroke-[3]" />
                                    </div>
                                ) : isNext ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-300">
                                        <Utensils className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="text-[11px] font-bold">
                                {isTaken ? (
                                    <span className="text-emerald-800">
                                        {log?.redeemed_at ? `${log.redeemed_at} WIB` : 'Sudah Diambil'}
                                    </span>
                                ) : isNext ? (
                                    <span className="text-amber-700 font-extrabold">Giliran Berikutnya</span>
                                ) : (
                                    <span className="text-slate-400">Belum Diambil</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* COOLDOWN / EXHAUSTED STATES */}
            <div className="mt-5 space-y-3">
                {/* 1. Kondisi Jeda 2 Jam (Anti Fraud / Duplikasi) */}
                {consumption.reason === 'cooldown' && (
                    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 text-amber-950 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-black text-amber-900 uppercase tracking-wide">
                                    ⏳ Jeda Waktu Makan Aktif (Anti-Duplikasi Barcode)
                                </h5>
                                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                    Porsi ke-{consumption.count} baru saja diambil pukul{' '}
                                    <span className="font-extrabold underline">{consumption.last_redeemed_time} WIB</span>.
                                    Untuk mencegah pemakaian ganda oleh pihak lain, sesi berikutnya (Porsi ke-{consumption.next_session})
                                    baru dapat diambil mulai pukul{' '}
                                    <span className="font-extrabold underline text-amber-900">{consumption.next_available_time} WIB</span>{' '}
                                    (jeda 2 jam &bull; &plusmn;{consumption.minutes_left} menit lagi).
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-200/80 px-3 py-1.5 text-xs font-bold text-amber-900">
                                        <Clock className="h-3.5 w-3.5" />
                                        Tersedia Kembali Pukul {consumption.next_available_time} WIB
                                    </div>

                                    {isAdministrator && (
                                        <button
                                            type="button"
                                            onClick={() => onRedeem(true)}
                                            disabled={isProcessing}
                                            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-700 transition"
                                            title="Bypass jeda khusus jika disetujui panitia/admin"
                                        >
                                            <ShieldAlert className="h-3.5 w-3.5" />
                                            Bypass Jeda Sesi (Khusus Admin)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Kondisi Jatah Habis (exhausted) */}
                {consumption.reason === 'exhausted' && (
                    <div className="flex items-center gap-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-100/60 p-4 sm:p-5 text-emerald-950">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h5 className="text-sm font-black text-emerald-900 uppercase">
                                ✅ Seluruh Jatah Konsumsi Hari Ini Lengkap (3/3 Porsi)
                            </h5>
                            <p className="mt-0.5 text-xs text-emerald-800">
                                {entityName} telah mengambil semua 3 porsi makan hari ini. Jatah baru akan otomatis tersedia besok pagi pukul 00:00 WIB.
                            </p>
                        </div>
                    </div>
                )}

                {/* Admin Reset Button */}
                {isAdministrator && (
                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline transition"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Kuota Hari Ini (Admin Saja)
                        </button>
                    </div>
                )}
            </div>

            {/* Riwayat Log Pengambilan Hari Ini */}
            {consumption.logs && consumption.logs.length > 0 && (
                <div className="mt-5 border-t border-slate-200/80 pt-4">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Riwayat Pengambilan Hari Ini:
                    </h5>
                    <ul className="mt-2 space-y-2">
                        {consumption.logs.map((log: ConsumptionLog) => (
                            <li
                                key={log.id}
                                className="flex flex-wrap items-center justify-between rounded-xl bg-white px-3.5 py-2 text-xs border border-slate-100 shadow-xs"
                            >
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-800 border border-emerald-200">
                                        Porsi {log.session_number}
                                    </span>
                                    <span>Pukul {log.redeemed_at} WIB</span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                    Petugas: <span className="font-semibold text-slate-700">{log.verifier_name}</span>
                                    {log.notes && <span className="ml-1 text-slate-400">({log.notes})</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function CheckInTimelineCard({
    timeline,
    activeDay,
    isAdministrator = false,
    onResetCheckIn,
    isProcessing = false,
}: {
    timeline?: CheckInTimelineItem[];
    activeDay: number;
    isAdministrator?: boolean;
    onResetCheckIn?: (logId?: number, dayNum?: number, label?: string) => void;
    isProcessing?: boolean;
}) {
    if (!timeline || timeline.length === 0) return null;

    const checkedInCount = timeline.filter((d) => d.is_checked_in).length;
    const allLoggedCheckins = timeline.flatMap((d) =>
        (d.all_logs || []).map((l) => ({ ...l, day_number: d.day_number, day_name: d.name }))
    );

    return (
        <div className="mt-6 rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 pb-3 gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-2xs">
                        <Calendar className="size-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Presensi Kehadiran 4 Hari Acara
                        </h4>
                        <p className="text-[11px] text-slate-500">
                            Multi-checkpoint per hari &bull; Mendukung kunjungan dinamis (Menteri, Meet & Greet, Venue)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                        Kehadiran: {checkedInCount} dari 4 Hari
                    </span>
                    {isAdministrator && checkedInCount > 0 && onResetCheckIn && (
                        <button
                            type="button"
                            onClick={() => onResetCheckIn(undefined, activeDay, `Hari ${activeDay}`)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs disabled:opacity-50"
                            title="Reset seluruh kehadiran hari ini"
                        >
                            <RotateCcw className="size-3" />
                            <span>Reset Hari {activeDay}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {timeline.map((dayItem) => {
                    const isToday = dayItem.day_number === activeDay;
                    const isAttended = dayItem.is_checked_in;
                    const logCount = dayItem.all_logs?.length || 0;

                    return (
                        <div
                            key={dayItem.day_number}
                            className={`relative flex flex-col justify-between rounded-2xl border p-3 text-center transition ${
                                isAttended
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-2xs'
                                    : isToday
                                    ? 'border-amber-300 bg-amber-50/70 text-amber-950 ring-2 ring-amber-400/40 shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-400'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        {dayItem.name}
                                    </span>
                                    {isToday && (
                                        <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[9px] font-black text-amber-900">
                                            Sesi Ini
                                        </span>
                                    )}
                                </div>
                                <h5 className="mt-1 text-xs font-bold line-clamp-1 text-slate-800" title={dayItem.title}>
                                    {dayItem.title}
                                </h5>
                            </div>

                            <div className="my-2.5 flex justify-center">
                                {isAttended ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                                        <Check className="size-4 stroke-[3]" />
                                    </div>
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                        <Clock className="size-4" />
                                    </div>
                                )}
                            </div>

                            <div className="text-[11px]">
                                {isAttended ? (
                                    <div className="font-extrabold text-emerald-800">
                                        {logCount > 1 ? (
                                            <>
                                                <span>{dayItem.all_logs[0]?.checked_in_at} &bull; {dayItem.all_logs[logCount - 1]?.checked_in_at}</span>
                                                <div className="mt-1">
                                                    <span className="inline-block rounded-md bg-emerald-200/90 px-1.5 py-0.5 text-[9px] font-black text-emerald-900">
                                                        {logCount} Titik Lokasi
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span>{dayItem.primary_time}</span>
                                                <p className="text-[10px] text-emerald-700 font-semibold truncate" title={dayItem.primary_checkpoint || ''}>
                                                    {dayItem.primary_checkpoint}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 font-medium">Belum Hadir</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Riwayat Detail Multi-Checkpoint per Hari */}
            {allLoggedCheckins.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-200/70">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-[#17524A]" />
                            Rute & Titik Kehadiran Tercatat ({allLoggedCheckins.length} Titik)
                        </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {allLoggedCheckins.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs hover:border-[#17524A]/30 transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
                                        H{log.day_number}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate text-[11px]">
                                            {log.checkpoint_label}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {log.checked_in_at} &bull; Dicatat oleh {log.verifier_name}
                                        </p>
                                    </div>
                                </div>

                                {isAdministrator && onResetCheckIn && (
                                    <button
                                        type="button"
                                        onClick={() => onResetCheckIn(log.id, log.day_number, log.checkpoint_label)}
                                        disabled={isProcessing}
                                        title={`Reset check-in di ${log.checkpoint_label}`}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition shrink-0 disabled:opacity-50"
                                    >
                                        <Trash2 className="size-3" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function PackHandoverCard({
    persona,
    entityId,
    entityName,
    shirtSize,
    isReceived,
    receivedAt,
    isProcessing,
    isAdministrator,
    onHandover,
    onReset,
}: {
    persona: 'participant' | 'chaperone';
    entityId: number;
    entityName: string;
    shirtSize?: string;
    isReceived: boolean;
    receivedAt?: string | null;
    isProcessing: boolean;
    isAdministrator: boolean;
    onHandover: () => void;
    onReset: () => void;
}) {
    return (
        <div className="mt-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50/50 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                        <Award className="size-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 sm:text-sm">
                                Serah Terima Event Pack & Kaos (Hari 1)
                            </h4>
                            <span className="rounded-md bg-indigo-200 px-2 py-0.5 text-xs font-black text-indigo-900 border border-indigo-300">
                                Ukuran Kaos: {shirtSize || '-'}
                            </span>
                        </div>
                        <p className="text-xs text-indigo-800/80">
                            Pengambilan seragam kaos lomba resmi, kunci kamar asrama, & paket ID Pass.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isReceived ? (
                        <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs">
                                <CheckCircle2 className="size-4" />
                                Pack Sudah Diterima
                            </span>
                            {receivedAt && (
                                <span className="mt-0.5 text-[10px] text-slate-500 font-medium">
                                    {receivedAt}
                                </span>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={onHandover}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition"
                        >
                            <Check className="size-4 stroke-[3]" />
                            Tandai Pack Diserahkan
                        </button>
                    )}

                    {isReceived && isAdministrator && (
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isProcessing}
                            className="inline-flex items-center rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                            title="Reset Serah Terima (Admin Saja)"
                        >
                            <RotateCcw className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ChaperoneStudentsMealCard({
    chaperoneId,
    chaperoneName,
    participants,
    chaperoneConsumption,
    isProcessing,
    onRedeemBatch,
}: {
    chaperoneId: number;
    chaperoneName: string;
    participants: any[];
    chaperoneConsumption?: ConsumptionData;
    isProcessing: boolean;
    onRedeemBatch: (selectedIds: number[], includeChaperone: boolean) => void;
}) {
    if (!participants || participants.length === 0) return null;

    const availableParticipants = participants.filter(
        (p) => p.consumption && p.consumption.can_redeem
    );

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [includeChaperone, setIncludeChaperone] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === availableParticipants.length && availableParticipants.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(availableParticipants.map((p) => p.id));
        }
    };

    const canChaperoneRedeem = chaperoneConsumption?.can_redeem ?? false;
    const totalPortions = selectedIds.length + (includeChaperone && canChaperoneRedeem ? 1 : 0);

    return (
        <div className="mt-6 rounded-3xl border-2 border-teal-500/40 bg-teal-50/40 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17524A] text-white shadow-sm">
                        <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-base font-black text-slate-900 sm:text-lg">
                            Ambilkan Konsumsi Santri Dampingan (Kolektif)
                        </h4>
                        <p className="text-xs text-slate-500">
                            Pendamping dapat mewakili pengambilan makan santri binaan agar santri dapat beristirahat di kamar.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        disabled={availableParticipants.length === 0}
                        className="rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50 transition shadow-2xs"
                    >
                        {selectedIds.length === availableParticipants.length && availableParticipants.length > 0
                            ? 'Batal Pilih Semua'
                            : `Pilih Semua Santri Siap (${availableParticipants.length})`}
                    </button>
                </div>
            </div>

            {/* List Santri Dampingan dengan Checklist & Status Konsumsi */}
            <div className="mt-4 divide-y divide-teal-100 rounded-2xl border border-teal-200/80 bg-white shadow-xs overflow-hidden">
                {participants.map((p: any) => {
                    const c = p.consumption;
                    const canRedeem = c?.can_redeem ?? false;
                    const isSelected = selectedIds.includes(p.id);

                    return (
                        <div
                            key={p.id}
                            onClick={() => canRedeem && toggleSelect(p.id)}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 transition select-none ${
                                canRedeem ? 'cursor-pointer hover:bg-teal-50/60' : 'bg-slate-50/60 opacity-80'
                            } ${isSelected ? 'bg-teal-50/90 font-medium' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!canRedeem}
                                    onChange={() => toggleSelect(p.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#17524A] focus:ring-[#17524A]"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{p.name}</p>
                                        <span className="font-mono text-[10px] text-slate-500">({p.registration_number})</span>
                                        {p.shirt_size && (
                                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                                                Kaos: {p.shirt_size}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500">{p.olimpiade_name} &bull; {p.school_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                {c ? (
                                    c.reason === 'ready' ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                            Siap Porsi {c.next_session} (Sisa {c.remaining}x)
                                        </span>
                                    ) : c.reason === 'cooldown' ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800" title={c.message || ''}>
                                            <Clock className="size-3" />
                                            Jeda ({c.next_available_time} WIB)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                            <Check className="size-3" />
                                            Lengkap (3/3 Porsi)
                                        </span>
                                    )
                                ) : (
                                    <span className="text-[11px] text-slate-400">Data konsumsi tidak tersedia</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Opsi Jatah Pendamping & CTA Submit */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-3.5 border border-teal-200 shadow-2xs">
                {canChaperoneRedeem ? (
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-teal-900 select-none">
                        <input
                            type="checkbox"
                            checked={includeChaperone}
                            onChange={(e) => setIncludeChaperone(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#17524A] focus:ring-[#17524A]"
                        />
                        <span>Sertakan juga jatah makan pendamping sendiri (+1 Porsi)</span>
                    </label>
                ) : (
                    <span className="text-xs text-slate-500 font-medium">
                        (Jatah makan pendamping: {chaperoneConsumption?.reason === 'exhausted' ? 'Lengkap 3/3' : 'Sedang cooldown'})
                    </span>
                )}

                <button
                    type="button"
                    onClick={() => onRedeemBatch(selectedIds, includeChaperone)}
                    disabled={totalPortions === 0 || isProcessing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-[#17524A]/20 hover:bg-[#13443d] active:scale-95 transition disabled:opacity-50"
                >
                    <Utensils className="size-4" />
                    Ambilkan Konsumsi ({totalPortions} Porsi) ➔
                </button>
            </div>
        </div>
    );
}

const DEFAULT_CHECKPOINTS: Record<string, string> = {
    penginapan: '🏨 Penginapan / Asrama & Kumpul Bus',
    kunjungan_mentan: '🏛️ Kunjungan Kediaman Menteri Pertanian',
    meet_greet_tokoh: '🌟 Meet & Greet Tokoh Nasional',
    venue_lomba: '🎯 Venue Perlombaan (Gate Utama)',
    presscon: '🎙️ Portal Presscon & Media',
    study_tour: '🚌 Study Tour & Wisata Edukasi',
    ramah_tamah: '🍽️ Jamuan Ramah Tamah / Gala Dinner',
    gate_umum: '🚪 Gate Akses Terpadu',
};

interface CustomCheckpoint {
    key: string;
    label: string;
}

export default function UniversalVerifyPage({
    pageTitle,
    queryCode,
    persona,
    isValid,
    isFirstCheckIn,
    checkInMessage,
    entity,
    isAdministrator = false,
    activeDay: activeDayProp = 1,
    activeCheckpoint: activeCheckpointProp = 'penginapan',
    activeCheckpointLabel: activeCheckpointLabelProp = 'Penginapan / Asrama',
    dayOptions,
    checkpointOptions,
    queryRegistrationNumber,
    participant: propParticipant,
    chaperone: propChaperone,
    committee: propCommittee,
    guest: propGuest,
}: VerifyProps) {
    const { flash } = usePage().props as unknown as { flash?: { success?: string | null; error?: string | null; info?: string | null } };
    const activeCode = queryCode ?? queryRegistrationNumber ?? '';
    const [searchQuery, setSearchQuery] = useState(activeCode);
    const [copied, setCopied] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [scanCooldownCountdown, setScanCooldownCountdown] = useState<number>(0);

    const [customCheckpoints, setCustomCheckpoints] = useState<CustomCheckpoint[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('omatiq_custom_checkpoints');
                if (saved) return JSON.parse(saved);
            } catch {
                // ignore
            }
        }
        return [];
    });

    const [isCustomPosModalOpen, setIsCustomPosModalOpen] = useState(false);
    const [newCustomPosName, setNewCustomPosName] = useState('');

    const [activeDay, setActiveDay] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('omatiq_verify_day');
            if (saved) return Number(saved);
        }
        return activeDayProp || 1;
    });

    const [activeCheckpoint, setActiveCheckpoint] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('omatiq_verify_checkpoint');
            if (saved) return saved;
        }
        return activeCheckpointProp || 'penginapan';
    });

    const [activeCheckpointLabel, setActiveCheckpointLabel] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('omatiq_verify_checkpoint_label');
            if (saved) return saved;
        }
        return activeCheckpointLabelProp || 'Penginapan / Asrama';
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isScanLockedRef = useRef(false);
    const scannerContainerId = 'venue-qr-reader';

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

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
                    html5QrCodeRef.current?.clear();
                });
            }
        };
    }, []);

    // Extract code from full URLs (e.g., https://omatiq.com/verifikasi/OMQ-20261104-0005) or raw text
    const extractCode = (rawText: string): string => {
        const text = rawText.trim();

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                const url = new URL(text);
                const pathParts = url.pathname.split('/').filter(Boolean);

                if (pathParts.length > 0) {
                    return decodeURIComponent(pathParts[pathParts.length - 1]);
                }
            }
        } catch {
            // Fallback to text
        }

        return text;
    };

    const navigateToCode = (
        code: string,
        dayNum: number = activeDay,
        cp: string = activeCheckpoint,
        cpLabel: string = activeCheckpointLabel
    ) => {
        const cleanCode = extractCode(code);
        if (!cleanCode) return;

        const url = `/verifikasi/${encodeURIComponent(cleanCode)}`;
        router.get(
            url,
            { day: dayNum, checkpoint: cp, checkpoint_label: cpLabel },
            { preserveScroll: true }
        );
    };

    const handleDayChange = (newDay: number) => {
        setActiveDay(newDay);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omatiq_verify_day', String(newDay));
        }
        if (activeCode) {
            navigateToCode(activeCode, newDay, activeCheckpoint, activeCheckpointLabel);
        }
    };

    const handleCheckpointChange = (newCheckpoint: string, newLabel: string) => {
        setActiveCheckpoint(newCheckpoint);
        setActiveCheckpointLabel(newLabel);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omatiq_verify_checkpoint', newCheckpoint);
            localStorage.setItem('omatiq_verify_checkpoint_label', newLabel);
        }
        if (activeCode) {
            navigateToCode(activeCode, activeDay, newCheckpoint, newLabel);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            navigateToCode(trimmed);
        }
    };

    const handleCopy = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Toggle Camera Scanner
    const toggleCameraScanner = async () => {
        if (isCameraActive) {
            // Stop scanning
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                try {
                    await html5QrCodeRef.current.stop();
                    html5QrCodeRef.current.clear();
                } catch (err) {
                    console.error('Error stopping QR scanner:', err);
                }
            }
            setIsCameraActive(false);
            setCameraError(null);
            return;
        }

        // Start scanning
        setCameraError(null);
        setIsCameraActive(true);

        // Give React a tick to mount container
        setTimeout(async () => {
            try {
                const qrScanner = new Html5Qrcode(scannerContainerId);
                html5QrCodeRef.current = qrScanner;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                };

                await qrScanner.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        // Success callback
                        const detected = extractCode(decodedText);
                        if (!detected) return;

                        // Cegah multi-frame burst saat kartu masih berada di depan kamera
                        if (isScanLockedRef.current) return;

                        isScanLockedRef.current = true;
                        setScanCooldownCountdown(3);
                        setSearchQuery(detected);
                        navigateToCode(detected);

                        let secondsLeft = 3;
                        const interval = setInterval(() => {
                            secondsLeft -= 1;
                            setScanCooldownCountdown(secondsLeft);
                            if (secondsLeft <= 0) {
                                clearInterval(interval);
                                isScanLockedRef.current = false;
                                setScanCooldownCountdown(0);
                            }
                        }, 1000);
                    },
                    () => {
                        // Frame scan error / no QR detected, ignore frame failures
                    }
                );
            } catch (err: any) {
                console.error('Failed to start camera:', err);
                setCameraError(err?.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di peramban.');
                setIsCameraActive(false);
            }
        }, 100);
    };

    // Redeem consumption (manual button)
    const handleRedeemConsumption = (force: boolean = false) => {
        if (!activeEntity?.id || !resolvedPersona) return;
        setIsProcessingAction(true);
        router.post(
            '/verifikasi/consumption/redeem',
            {
                type: resolvedPersona,
                id: activeEntity.id,
                force: force,
                notes: 'Pengambilan konsumsi verifikator gate',
            },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Reset daily consumption (Admin only)
    const handleResetConsumption = async () => {
        if (!activeEntity?.id || !resolvedPersona) return;

        const confirmed = await confirmAction({
            title: 'Reset Kuota Konsumsi?',
            text: `Kuota konsumsi hari ini untuk ${activeEntity.student?.full_name || activeEntity.name} akan dikembalikan menjadi 3 porsi.`,
            confirmButtonText: 'Ya, Reset Kuota',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (!confirmed) return;

        setIsProcessingAction(true);
        router.post(
            '/verifikasi/consumption/reset',
            {
                type: resolvedPersona,
                id: activeEntity.id,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Reset VIP Guest Check-in (Admin only)
    const handleResetGuestCheckIn = async () => {
        if (!activeEntity?.id) return;

        const confirmed = await confirmAction({
            title: 'Reset Kehadiran Tamu?',
            text: `Status check-in tamu VIP ${activeEntity.name} akan dikembalikan menjadi belum check-in hari ini.`,
            confirmButtonText: 'Ya, Reset Check-in',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (!confirmed) return;

        setIsProcessingAction(true);
        router.post(
            `/verifikasi/guest/${activeEntity.id}/reset-checkin`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Serah terima pack & kaos (Hari 1)
    const handleHandoverPack = (type: 'participant' | 'chaperone', id: number) => {
        setIsProcessingAction(true);
        router.post(
            '/verifikasi/pack/handover',
            { type, id },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Reset serah terima pack & kaos (Admin only)
    const handleResetPack = async (type: 'participant' | 'chaperone', id: number) => {
        const confirmed = await confirmAction({
            title: 'Reset Serah Terima Pack?',
            text: 'Status serah terima event pack & kaos akan dikembalikan menjadi belum diterima.',
            confirmButtonText: 'Ya, Reset',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });
        if (!confirmed) return;

        setIsProcessingAction(true);
        router.post(
            '/verifikasi/pack/reset',
            { type, id },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Pengambilan konsumsi kolektif santri binaan oleh pendamping
    const handleRedeemChaperoneStudents = async (selectedIds: number[], includeChaperone: boolean) => {
        if (selectedIds.length === 0 && !includeChaperone) return;

        const totalCount = selectedIds.length + (includeChaperone ? 1 : 0);
        const confirmed = await confirmAction({
            title: `Ambilkan Konsumsi (${totalCount} Porsi)?`,
            text: `Apakah Anda yakin ingin mengambilkan jatah konsumsi untuk ${selectedIds.length} santri binaan terpilih${includeChaperone ? ' dan 1 porsi pendamping' : ''}? Jatah makan masing-masing santri akan otomatis terpotong 1 porsi hari ini.`,
            confirmButtonText: 'Ya, Ambilkan Konsumsi',
            cancelButtonText: 'Batal',
            icon: 'question',
        });
        if (!confirmed) return;

        setIsProcessingAction(true);
        router.post(
            '/verifikasi/consumption/redeem-chaperone-students',
            {
                chaperone_id: activeEntity.id,
                participant_ids: selectedIds,
                include_chaperone: includeChaperone,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    // Tambah Pos Kustom oleh Administrator
    const handleAddCustomPos = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = newCustomPosName.trim();
        if (!trimmed) return;

        const slug = 'custom_' + trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const label = `📍 ${trimmed}`;

        const updated = [...customCheckpoints.filter((c) => c.key !== slug), { key: slug, label }];
        setCustomCheckpoints(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omatiq_custom_checkpoints', JSON.stringify(updated));
        }

        handleCheckpointChange(slug, label);
        setNewCustomPosName('');
        setIsCustomPosModalOpen(false);
    };

    // Hapus Pos Kustom dari memori browser
    const handleDeleteCustomPos = (keyToDelete: string) => {
        const updated = customCheckpoints.filter((c) => c.key !== keyToDelete);
        setCustomCheckpoints(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omatiq_custom_checkpoints', JSON.stringify(updated));
        }
        if (activeCheckpoint === keyToDelete) {
            handleCheckpointChange('penginapan', DEFAULT_CHECKPOINTS.penginapan);
        }
    };

    // Reset Check-in Log (Khusus Administrator)
    const handleResetCheckIn = async (logId?: number, dayNum?: number, label?: string) => {
        if (!activeEntity?.id || !resolvedPersona) return;

        const targetName = activeEntity.student?.full_name || activeEntity.name || activeEntity.registration_number || 'entitas';
        const title = logId
            ? `Reset Kehadiran di ${label || 'Pos Ini'}?`
            : dayNum
            ? `Reset Semua Kehadiran Hari ${dayNum}?`
            : 'Reset Kehadiran Hari Ini?';

        const text = logId
            ? `Catatan absensi di ${label || 'pos ini'} untuk ${targetName} akan dihapus dari sistem.`
            : `Seluruh riwayat presensi hari ke-${dayNum || activeDay} untuk ${targetName} akan di-reset.`;

        const confirmed = await confirmAction({
            title,
            text,
            confirmButtonText: 'Ya, Reset Kehadiran',
            cancelButtonText: 'Batal',
            icon: 'warning',
        });

        if (!confirmed) return;

        setIsProcessingAction(true);
        router.post(
            '/verifikasi/checkin/reset',
            {
                persona: resolvedPersona,
                target_id: activeEntity.id,
                log_id: logId,
                day_number: dayNum,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(false),
            }
        );
    };

    return (
        <>
            <Head title={pageTitle || 'Universal Gate Terminal OMATIQ'} />

            <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#ffffff] px-4 pt-24 ${activeEntity?.consumption ? 'pb-36 sm:pb-32' : 'pb-24'} sm:px-6 lg:px-8`}>
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

                    {/* Flash Message Banner */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 shadow-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900 shadow-sm">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-5 shrink-0 text-rose-600" />
                                <span>{flash.error}</span>
                            </div>
                        </div>
                    )}
                    {flash?.info && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Info className="size-5 shrink-0 text-sky-600" />
                                <span>{flash.info}</span>
                            </div>
                        </div>
                    )}



                    {/* Tanggal Otomatis & Pos Verifikator Aktif */}
                    <div className="mb-4 rounded-2xl border border-[#17524A]/20 bg-white/95 p-3.5 shadow-sm backdrop-blur-md">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#17524A]">
                                    TANGGAL PRESENSI (OTOMATIS):
                                </span>
                                <div className="mt-1 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-[#17524A] border border-emerald-200">
                                    <span>📅</span>
                                    <span>
                                        {new Date().toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#17524A]">
                                        POS / GATE TUGAS ANDA:
                                    </span>
                                    {isAdministrator && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomPosModalOpen(true)}
                                            className="inline-flex items-center gap-1 text-[10px] font-black text-[#17524A] hover:text-[#09767a] transition"
                                            title="Kelola / Tambah Pos Kustom (Khusus Admin)"
                                        >
                                            <Plus className="size-3" />
                                            <span>Pos Kustom</span>
                                        </button>
                                    )}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <select
                                        value={activeCheckpoint}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__add_custom__') {
                                                setIsCustomPosModalOpen(true);
                                                return;
                                            }
                                            const foundCustom = customCheckpoints.find((c) => c.key === val);
                                            const label =
                                                foundCustom?.label ||
                                                checkpointOptions?.[val] ||
                                                DEFAULT_CHECKPOINTS[val] ||
                                                e.target.options[e.target.selectedIndex].text;
                                            handleCheckpointChange(val, label);
                                        }}
                                        className="rounded-xl border-slate-300 bg-slate-50 py-1.5 pr-8 pl-3 text-xs font-black text-slate-800 shadow-2xs focus:border-[#17524A] focus:bg-white focus:ring-[#17524A]"
                                    >
                                        <optgroup label="Pos Resmi Agenda Acara">
                                            {Object.entries({ ...DEFAULT_CHECKPOINTS, ...(checkpointOptions || {}) }).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </optgroup>

                                        {customCheckpoints.length > 0 && (
                                            <optgroup label="Pos Kustom Tersimpan">
                                                {customCheckpoints.map((cp) => (
                                                    <option key={cp.key} value={cp.key}>
                                                        {cp.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}

                                        {isAdministrator && (
                                            <option value="__add_custom__">
                                                ➕ Tambah Pos Kustom Lainnya...
                                            </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banner Auto Check-In Notification */}
                    {isFirstCheckIn && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-100 px-4 py-3.5 text-sm font-black text-emerald-950 shadow-md">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                                    <Check className="size-4 stroke-[3]" />
                                </span>
                                <div>
                                    <p className="text-sm font-black text-emerald-950">
                                        {checkInMessage || `Auto Check-In Berhasil! Hadir di ${activeCheckpointLabel} (Hari ${activeDay}).`}
                                    </p>
                                    <p className="text-xs font-semibold text-emerald-800">
                                        Kehadiran entitas telah otomatis terekam dalam sistem log presensi harian acara.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scanner Input Terminal (Optimized for USB Cashier Barcode Guns & Camera) */}
                    <div className="mb-6 rounded-2xl bg-white p-3.5 shadow-xl shadow-slate-200/50 ring-2 ring-[#17524A]/20">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#17524A]">
                                <QrCode className="size-4" />
                                Kotak Scan Barcode / QR / Kode Akses
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleCameraScanner}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                                        isCameraActive
                                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    }`}
                                >
                                    {isCameraActive ? (
                                        <>
                                            <CameraOff className="size-3.5" />
                                            Tutup Kamera
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="size-3.5" />
                                            Scan via Kamera
                                        </>
                                    )}
                                </button>
                                <span className="hidden sm:inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    USB Scanner Ready
                                </span>
                            </div>
                        </div>

                        {/* Live Camera Scanner Box */}
                        {isCameraActive && (
                            <div className="mb-3 overflow-hidden rounded-2xl border-2 border-emerald-500 bg-slate-950 p-2 text-center text-white">
                                <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold text-emerald-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                                        Arahkan Kamera ke Barcode / QR Code
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleCameraScanner}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                                <div id={scannerContainerId} className="w-full overflow-hidden rounded-xl bg-black" />
                                {scanCooldownCountdown > 0 ? (
                                    <div className="mt-2 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300">
                                        ⚡ Barcode terdeteksi! Menunggu jeda ({scanCooldownCountdown}s) sebelum scan berikutnya...
                                    </div>
                                ) : (
                                    <p className="mt-2 text-[11px] text-slate-400">
                                        Sistem otomatis mendeteksi QR Code dan langsung mengarahkan ke kartu identitas.
                                    </p>
                                )}
                            </div>
                        )}

                        {cameraError && (
                            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                                {cameraError}
                            </div>
                        )}

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
                            {/* =========================================================================
                                1. PARTICIPANT PERSONA
                               ========================================================================= */}
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
                                        {/* Profile Card Header */}
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
                                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-[#17524A]">
                                                        <Trophy className="h-3.5 w-3.5 text-[#E5BE1E]" />
                                                        {activeEntity.olimpiade?.name ?? 'OMATIQ'} ({activeEntity.olimpiade?.category ?? '-'})
                                                    </span>
                                                    {activeEntity.student?.is_binaan && (
                                                        <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-xs font-black text-teal-800">
                                                            Santri Binaan
                                                        </span>
                                                    )}
                                                    {activeEntity.national?.is_verified && (
                                                        <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">
                                                            Finalis Nasional
                                                        </span>
                                                    )}
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

                                        {/* Detailed Information Grid */}
                                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <Building2 className="size-4 text-[#17524A]" />
                                                    Asal Sekolah & Kelas
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {activeEntity.student?.school_name ?? '-'} (Kelas {activeEntity.student?.grade ?? '-'})
                                                </p>
                                                <p className="text-xs text-slate-500">{activeEntity.student?.school_level ?? '-'}</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <MapPin className="size-4 text-[#17524A]" />
                                                    Wilayah / Cabang
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {activeEntity.branch ?? activeEntity.student?.regency_name ?? '-'}
                                                </p>
                                                {activeEntity.penyaluran_sanggar_name && (
                                                    <p className="text-xs text-slate-500">Sanggar: {activeEntity.penyaluran_sanggar_name}</p>
                                                )}
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <User className="size-4 text-[#17524A]" />
                                                    Guru Pembimbing / Pendamping
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {activeEntity.student?.mentor_name ?? '-'}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                    <Award className="size-4 text-[#17524A]" />
                                                    Atribut Peserta Nasional
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    Ukuran Kaos: {activeEntity.shirt_size || activeEntity.national?.shirt_size || '-'}
                                                </p>
                                                <p className="text-xs text-emerald-700">Status: {activeEntity.status === 'verified' ? 'Terverifikasi Resmi' : activeEntity.status}</p>
                                            </div>
                                        </div>

                                        {/* Presensi Kehadiran 4 Hari Acara */}
                                        <CheckInTimelineCard
                                            timeline={activeEntity.check_in_timeline}
                                            activeDay={activeDay}
                                            isAdministrator={isAdministrator}
                                            onResetCheckIn={handleResetCheckIn}
                                            isProcessing={isProcessingAction}
                                        />

                                        {/* Logistik Serah Terima Pack & Kaos (Khusus Finalis Nasional) */}
                                        {activeEntity.is_national_qualified ? (
                                            <PackHandoverCard
                                                persona="participant"
                                                entityId={activeEntity.id}
                                                entityName={activeEntity.student?.full_name || activeEntity.registration_number}
                                                shirtSize={activeEntity.shirt_size || activeEntity.national?.shirt_size}
                                                isReceived={Boolean(activeEntity.pack_is_received)}
                                                receivedAt={activeEntity.pack_received_at}
                                                isProcessing={isProcessingAction}
                                                isAdministrator={isAdministrator}
                                                onHandover={() => handleHandoverPack('participant', activeEntity.id)}
                                                onReset={() => handleResetPack('participant', activeEntity.id)}
                                            />
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500 flex items-center gap-3">
                                                <Info className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>Peserta babak penyisihan regional (bukan finalis nasional, alokasi event pack tidak tersedia).</span>
                                            </div>
                                        )}

                                        {/* =========================================================================
                                            CONSUMPTION TRACKING WIDGET (PARTICIPANT)
                                           ========================================================================= */}
                                        {activeEntity.consumption && (
                                            <ConsumptionCard
                                                consumption={activeEntity.consumption}
                                                entityName={activeEntity.student?.full_name || activeEntity.name}
                                                isAdministrator={isAdministrator}
                                                isProcessing={isProcessingAction}
                                                onRedeem={handleRedeemConsumption}
                                                onReset={handleResetConsumption}
                                                theme="emerald"
                                            />
                                        )}

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

                            {/* =========================================================================
                                2. CHAPERONE PERSONA
                               ========================================================================= */}
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
                                            Official pendamping terverifikasi sah mewakili kontingen cabang <strong>{activeEntity.branch}</strong>.
                                        </p>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">ID Pendamping</span>
                                                <p className="mt-1 font-mono text-base font-extrabold text-teal-900">{activeEntity.formatted_id}</p>
                                                {activeEntity.nik && <p className="text-[11px] text-slate-500">NIK: {activeEntity.nik}</p>}
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kontingen Cabang</span>
                                                <p className="mt-1 text-sm font-bold text-slate-800">{activeEntity.branch}</p>
                                                {activeEntity.position && <p className="text-[11px] text-slate-500">Jabatan: {activeEntity.position}</p>}
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Total Santri Dampingan</span>
                                                <p className="mt-1 text-base font-extrabold text-[#17524A]">{activeEntity.participants_count} Finalis</p>
                                                <p className="text-[11px] text-emerald-700">Status: {activeEntity.status === 'verified' ? 'Terverifikasi' : activeEntity.status}</p>
                                            </div>
                                        </div>

                                        {/* Contact & Verification Info */}
                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Kontak Pendamping</span>
                                                <div className="mt-1 text-xs text-slate-700 space-y-1">
                                                    {activeEntity.phone && (
                                                        <p className="flex items-center gap-1.5 font-bold">
                                                            <Phone className="size-3.5 text-[#17524A]" />
                                                            {activeEntity.phone}
                                                        </p>
                                                    )}
                                                    {activeEntity.email && (
                                                        <p className="flex items-center gap-1.5">
                                                            <Mail className="size-3.5 text-[#17524A]" />
                                                            {activeEntity.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Verifikator Resmi</span>
                                                <p className="mt-1 text-sm font-bold text-slate-800">{activeEntity.verifier_name || 'Admin Pusat OMATIQ'}</p>
                                                {activeEntity.verified_at && <p className="text-[11px] text-slate-500">Diverifikasi: {activeEntity.verified_at}</p>}
                                            </div>
                                        </div>

                                        {/* Presensi Kehadiran 4 Hari Acara (Pendamping) */}
                                        <CheckInTimelineCard
                                            timeline={activeEntity.check_in_timeline}
                                            activeDay={activeDay}
                                            isAdministrator={isAdministrator}
                                            onResetCheckIn={handleResetCheckIn}
                                            isProcessing={isProcessingAction}
                                        />

                                        {/* Logistik Serah Terima Pack & Kaos Pendamping */}
                                        <PackHandoverCard
                                            persona="chaperone"
                                            entityId={activeEntity.id}
                                            entityName={activeEntity.name}
                                            shirtSize={activeEntity.shirt_size}
                                            isReceived={Boolean(activeEntity.pack_is_received)}
                                            receivedAt={activeEntity.pack_received_at}
                                            isProcessing={isProcessingAction}
                                            isAdministrator={isAdministrator}
                                            onHandover={() => handleHandoverPack('chaperone', activeEntity.id)}
                                            onReset={() => handleResetPack('chaperone', activeEntity.id)}
                                        />

                                        {/* =========================================================================
                                            CONSUMPTION TRACKING WIDGET (CHAPERONE)
                                           ========================================================================= */}
                                        {activeEntity.consumption && (
                                            <ConsumptionCard
                                                consumption={activeEntity.consumption}
                                                entityName={activeEntity.name}
                                                isAdministrator={isAdministrator}
                                                isProcessing={isProcessingAction}
                                                onRedeem={handleRedeemConsumption}
                                                onReset={handleResetConsumption}
                                                theme="teal"
                                            />
                                        )}

                                        {/* FITUR KOLEKTIF: Ambilkan Konsumsi Santri Binaan oleh Pendamping */}
                                        {activeEntity.participants && activeEntity.participants.length > 0 && (
                                            <ChaperoneStudentsMealCard
                                                chaperoneId={activeEntity.id}
                                                chaperoneName={activeEntity.name}
                                                participants={activeEntity.participants}
                                                chaperoneConsumption={activeEntity.consumption}
                                                isProcessing={isProcessingAction}
                                                onRedeemBatch={handleRedeemChaperoneStudents}
                                            />
                                        )}

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
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSearchQuery(p.registration_number);
                                                                    navigateToCode(p.registration_number);
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                                                            >
                                                                {p.registration_number}
                                                                <ExternalLink className="size-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-center gap-3">
                                            <a
                                                href={`/pendamping/kartu/${activeEntity.formatted_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7a6400] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#685500]"
                                            >
                                                <Printer className="size-4 text-[#FFE600]" />
                                                Buka Kartu Tanda Pengenal Pendamping
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =========================================================================
                                3. COMMITTEE PERSONA
                               ========================================================================= */}
                            {resolvedPersona === 'committee' && (
                                <>
                                    <div className="bg-gradient-to-r from-[#09767a] via-[#0f766e] to-[#134e4a] px-6 py-6 text-center text-white sm:px-8">
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
                                        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-teal-100 sm:text-sm">
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
                                                <p className="mt-1 font-mono text-base font-extrabold text-[#09767a]">{activeEntity.code}</p>
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

                                        {/* Badge Lokasi Penugasan Resmi Hari Ini */}
                                        <div className="mt-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 p-4 text-indigo-950">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                                                    <MapPin className="size-5" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                                                        LOKASI PENUGASAN RESMI HARI INI (HARI {activeDay}):
                                                    </span>
                                                    <p className="text-sm sm:text-base font-black text-indigo-950">
                                                        {activeEntity.duty_today || activeEntity.access_zone || 'All Access'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Jadwal Penugasan 4 Hari Acara Panitia */}
                                        <div className="mt-4 rounded-2xl border border-indigo-200 bg-white p-4 shadow-xs text-left">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-indigo-600" />
                                                    <span className="text-xs font-bold text-slate-800">
                                                        Jadwal Penugasan 4 Hari Panitia
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                                    Sesi Aktif: Hari {activeDay}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {[
                                                    { num: 1, title: 'Kedatangan & Penginapan', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                                                    { num: 2, title: 'Venue Perlombaan (Penyisihan)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
                                                    { num: 3, title: 'Venue Perlombaan (Babak Final)', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                                                    { num: 4, title: 'Study Tour & Jamuan Ramah Tamah', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
                                                ].map((d) => {
                                                    const daily = activeEntity.daily_duties;
                                                    let duty = '';
                                                    if (daily) {
                                                        duty = daily[`day_${d.num}`] || daily[d.num] || daily[String(d.num)] || '';
                                                    }
                                                    if (!duty) {
                                                        duty = activeEntity.access_zone || `${activeEntity.division} - ${activeEntity.position || 'Panitia Pelaksana'}`;
                                                    }
                                                    const isToday = d.num === activeDay;

                                                    return (
                                                        <div
                                                            key={d.num}
                                                            className={`rounded-xl border p-2.5 transition ${
                                                                isToday
                                                                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-300/60 shadow-2xs'
                                                                    : 'bg-slate-50/70 border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${d.badgeColor}`}>
                                                                    HARI {d.num}
                                                                </span>
                                                                {isToday && (
                                                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                                                        Hari Ini
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                                                {duty}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 truncate">
                                                                {d.title}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Presensi Kehadiran 4 Hari Panitia */}
                                        <CheckInTimelineCard
                                            timeline={activeEntity.check_in_timeline}
                                            activeDay={activeDay}
                                            isAdministrator={isAdministrator}
                                            onResetCheckIn={handleResetCheckIn}
                                            isProcessing={isProcessingAction}
                                        />

                                        {activeEntity.duty_description && (
                                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                                                <span className="font-bold text-slate-900">Uraian Tugas Umum: </span>
                                                {activeEntity.duty_description}
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-center gap-3">
                                            <a
                                                href={`/panitia/kartu/${activeEntity.code}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#09767a] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#075e61]"
                                            >
                                                <Printer className="size-4 text-[#FFE600]" />
                                                Buka Kartu Tanda Pengenal Panitia
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =========================================================================
                                4. GUEST PERSONA (VIP vs NON-VIP)
                               ========================================================================= */}
                            {resolvedPersona === 'guest' && (() => {
                                const isGuestVip = ['VIP', 'VVIP'].includes(String(activeEntity.category).toUpperCase());

                                return (
                                    <>
                                        <div
                                            className={
                                                isGuestVip
                                                    ? 'bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#3f3f46] px-6 py-6 text-center text-white sm:px-8'
                                                    : 'bg-gradient-to-r from-[#134e45] via-[#17524A] to-[#1e6b60] px-6 py-6 text-center text-white sm:px-8'
                                            }
                                        >
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-2 ring-white/30">
                                                {isGuestVip ? (
                                                    <Crown className="h-10 w-10 text-[#FFE600]" />
                                                ) : (
                                                    <Users className="h-10 w-10 text-emerald-200" />
                                                )}
                                            </div>
                                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wide text-white uppercase">
                                                {isGuestVip ? (
                                                    <>
                                                        <Sparkles className="size-3.5 text-[#FFE600]" />
                                                        <span className="text-[#FFE600]">TAMU KEHORMATAN VIP</span>
                                                    </>
                                                ) : (
                                                    <span>TAMU UNDANGAN &bull; NON-VIP</span>
                                                )}
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
                                                            ? isGuestVip
                                                                ? 'bg-amber-500/30 text-amber-200'
                                                                : 'bg-emerald-500/30 text-emerald-200'
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
                                            {/* Seating / Table Allocation */}
                                            <div
                                                className={`mb-6 rounded-2xl border-2 p-4 text-center ${
                                                    isGuestVip
                                                        ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                                                        : 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                                                }`}
                                            >
                                                <span
                                                    className={`text-xs font-bold uppercase tracking-wider ${
                                                        isGuestVip ? 'text-amber-900' : 'text-emerald-800'
                                                    }`}
                                                >
                                                    Kapasitas Undangan
                                                </span>
                                                <p className="mt-1 text-2xl font-black sm:text-3xl">
                                                    {activeEntity.seat_count} Orang
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Kode Undangan</span>
                                                    <p className="mt-1 font-mono text-base font-extrabold text-slate-900">{activeEntity.code}</p>
                                                </div>
                                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Kategori Tamu</span>
                                                    <p
                                                        className={`mt-1 text-sm font-bold ${
                                                            isGuestVip ? 'text-amber-700' : 'text-emerald-700'
                                                        }`}
                                                    >
                                                        {isGuestVip ? 'VIP (Tamu Kehormatan)' : 'Non-VIP (Tamu Biasa)'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Reset Check-in Button for Admin */}
                                            {isAdministrator && activeEntity.checked_in_at && (
                                                <div className="mt-6 flex justify-center border-t border-slate-100 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleResetGuestCheckIn}
                                                        disabled={isProcessingAction}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                                                    >
                                                        <RotateCcw className="size-4" />
                                                        Reset Kehadiran Tamu VIP Hari Ini (Admin)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}

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
                                        Arahkan alat scanner USB atau gunakan kamera bawaan ke barcode 1D atau QR Code pada lanyard pass untuk verifikasi instan.
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

            {/* Sticky Bottom Action Bar for Mobile & Fast Verification */}
            {activeEntity?.consumption && (
                <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-4 py-3 sm:py-3.5">
                    <div className="mx-auto flex max-w-3xl flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
                        {/* Summary Identitas & Sisa Kuota */}
                        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#17524A] ring-1 ring-emerald-200">
                                    <Utensils className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs sm:text-sm font-black text-slate-900">
                                        {activeEntity.student?.full_name || activeEntity.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {resolvedPersona === 'participant' ? 'Peserta' : 'Pendamping'} &bull; Sisa:{' '}
                                        <strong className="text-emerald-700 font-extrabold">{activeEntity.consumption.remaining}</strong>{' '}
                                        dari {activeEntity.consumption.max} Porsi
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700 sm:hidden border border-slate-200">
                                {activeEntity.consumption.count}/3 Selesai
                            </span>
                        </div>

                        {/* Sticky Action Button */}
                        <div className="shrink-0 flex items-center gap-2">
                            {activeEntity.consumption.can_redeem ? (
                                <button
                                    type="button"
                                    onClick={() => handleRedeemConsumption(false)}
                                    disabled={isProcessingAction}
                                    className="flex w-full sm:w-auto h-12 sm:h-13 items-center justify-center gap-2.5 rounded-2xl bg-[#17524A] px-5 sm:px-8 text-center font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:bg-[#12423b] active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                                >
                                    <Utensils className="h-4 w-4 text-[#FFE600]" />
                                    <span className="text-xs sm:text-sm uppercase tracking-wide">
                                        Ambil Porsi Ke-{activeEntity.consumption.next_session || (activeEntity.consumption.count + 1)} (-1 Porsi)
                                    </span>
                                </button>
                            ) : activeEntity.consumption.reason === 'cooldown' ? (
                                <div className="flex w-full sm:w-auto h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 sm:px-6 font-bold text-amber-900 border border-amber-300 text-xs sm:text-sm shadow-xs">
                                    <Clock className="h-4 w-4 shrink-0 text-amber-700" />
                                    <span>⏳ Jeda Sesi (Tersedia {activeEntity.consumption.next_available_time} WIB)</span>
                                </div>
                            ) : (
                                <div className="flex w-full sm:w-auto h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 sm:px-6 font-bold text-emerald-900 border border-emerald-300 text-xs sm:text-sm shadow-xs">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                                    <span>✅ Kuota 3/3 Porsi Lengkap</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Pos Kustom (Khusus Administrator) */}
            {isAdministrator && (
                <Dialog open={isCustomPosModalOpen} onOpenChange={setIsCustomPosModalOpen}>
                    <DialogContent className="max-w-md">
                        <form onSubmit={handleAddCustomPos}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                    <MapPin className="size-5 text-[#17524A]" />
                                    Tambah Pos / Titik Kunjungan Kustom
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Tambahkan pos khusus (seperti kunjungan insidental, lokasi studi, atau venue tambahan). Tersimpan khusus di perangkat verifikator Anda.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-3">
                                <div>
                                    <Label htmlFor="custom-pos-name" className="text-xs font-bold text-slate-700">
                                        Nama Titik / Pos Acara <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="custom-pos-name"
                                        value={newCustomPosName}
                                        onChange={(e) => setNewCustomPosName(e.target.value)}
                                        placeholder="Contoh: Kunjungan Museum Kepresidenan"
                                        className="mt-1 h-9 text-xs"
                                        autoFocus
                                    />
                                </div>

                                {customCheckpoints.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400">
                                            Pos Kustom yang Tersimpan:
                                        </span>
                                        <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto pr-1">
                                            {customCheckpoints.map((cp) => (
                                                <div
                                                    key={cp.key}
                                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs"
                                                >
                                                    <span className="font-semibold text-slate-700 truncate text-[11px]">
                                                        {cp.label}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCustomPos(cp.key)}
                                                        className="text-slate-400 hover:text-rose-500 transition p-1"
                                                        title="Hapus pos ini"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCustomPosModalOpen(false)}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!newCustomPosName.trim()}
                                    className="bg-[#17524A] hover:bg-[#13433c] text-white text-xs font-bold"
                                >
                                    Simpan & Pilih Pos
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
