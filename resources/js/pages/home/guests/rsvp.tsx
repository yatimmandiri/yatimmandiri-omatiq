import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Crown,
    ExternalLink,
    MapPin,
    Printer,
    QrCode,
    Sparkles,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';

type GuestData = {
    id: number;
    code: string;
    name: string;
    institution: string | null;
    position: string | null;
    category: string;
    email: string | null;
    phone: string | null;
    table_number: string;
    seat_count: number;
    status: 'invited' | 'confirmed' | 'attended' | 'declined';
    confirmed_at: string | null;
    checked_in_at: string | null;
};

type EventInfo = {
    name: string;
    date: string;
    time: string;
    venue: string;
    organizer: string;
};

type PageProps = {
    guest: GuestData;
    token: string;
    verifyUrl: string;
    qrCodeSvg: string;
    eventInfo: EventInfo;
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function GuestRsvpPage() {
    const { guest, token, verifyUrl, qrCodeSvg, eventInfo, flash } = usePage<PageProps>().props;

    const { data, setData, post, processing } = useForm({
        attendance: guest.status === 'declined' ? 'declined' : 'confirmed',
        seat_count: guest.seat_count || 1,
        notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/undangan/${token}/konfirmasi`, {
            preserveScroll: true,
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const isConfirmed = guest.status === 'confirmed' || guest.status === 'attended';
    const isDeclined = guest.status === 'declined';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#134e45] to-slate-950 py-10 px-4 text-slate-100 sm:px-6 lg:px-8">
            <Head title={`Konfirmasi Kehadiran VIP — ${guest.name}`} />

            <div className="mx-auto max-w-2xl">
                {/* Header Branding */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-black tracking-widest text-[#FFE600] uppercase backdrop-blur-md">
                        <Crown className="size-3.5 text-[#FFE600]" />
                        Undangan Kehormatan VIP &bull; OMATIQ 2026
                    </div>
                    <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                        {eventInfo.name}
                    </h1>
                    <p className="mt-2 text-sm text-emerald-200/90">
                        {eventInfo.organizer}
                    </p>
                </div>

                {/* Flash Success Message */}
                {flash?.success && (
                    <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-950/80 p-4 text-center text-sm font-bold text-emerald-200 shadow-lg backdrop-blur-md">
                        ✨ {flash.success}
                    </div>
                )}

                {/* Main Card */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-700/40 bg-white/95 text-slate-900 shadow-2xl backdrop-blur-xl">
                    {/* VIP Top Banner */}
                    <div className="bg-gradient-to-r from-[#17524A] via-[#1a6157] to-[#134e45] p-6 text-center text-white sm:p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-white/20 backdrop-blur-md">
                            <Crown className="h-8 w-8 text-[#FFE600]" />
                        </div>
                        <div className="mt-3 text-xs font-extrabold tracking-widest text-[#FFE600] uppercase">
                            VIP GUEST &bull; {guest.category}
                        </div>
                        <h2 className="mt-1 text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
                            {guest.name}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-emerald-100">
                            {guest.position || 'Tamu Kehormatan'}
                            {guest.institution && ` • ${guest.institution}`}
                        </p>

                        {/* Status Badge */}
                        <div className="mt-4">
                            {isConfirmed ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-300 ring-1 ring-emerald-400/50">
                                    <CheckCircle2 className="size-4 text-emerald-400" />
                                    Terkonfirmasi Hadir
                                    {guest.confirmed_at && ` (${guest.confirmed_at})`}
                                </span>
                            ) : isDeclined ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3.5 py-1 text-xs font-black text-rose-300 ring-1 ring-rose-400/50">
                                    <XCircle className="size-4 text-rose-400" />
                                    Berhalangan Hadir
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-black text-amber-300 ring-1 ring-amber-400/50">
                                    <Sparkles className="size-4 text-[#FFE600]" />
                                    Menunggu Konfirmasi Kehadiran
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5">
                                <Calendar className="size-5 shrink-0 text-[#17524A]" />
                                <div>
                                    <span className="font-bold text-slate-500">Tanggal</span>
                                    <p className="font-bold text-slate-900">{eventInfo.date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5">
                                <Clock className="size-5 shrink-0 text-[#17524A]" />
                                <div>
                                    <span className="font-bold text-slate-500">Waktu</span>
                                    <p className="font-bold text-slate-900">{eventInfo.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 sm:col-span-2">
                                <MapPin className="size-5 shrink-0 text-[#17524A]" />
                                <div>
                                    <span className="font-bold text-slate-500">Lokasi Venue</span>
                                    <p className="font-bold text-slate-900">{eventInfo.venue}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table / Seating Info */}
                        <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4 text-center">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                                Alokasi Meja / Kursi Kehormatan
                            </span>
                            <p className="mt-1 text-2xl font-black text-amber-950 sm:text-3xl">
                                {guest.table_number}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-amber-800">
                                Alokasi: {guest.seat_count} Kursi (Termasuk Pendamping)
                            </p>
                        </div>

                        {/* SECTION A: IF ALREADY CONFIRMED -> SHOW QR PASS (NO FORM) */}
                        {isConfirmed && (
                            <div className="mt-8 rounded-3xl border-2 border-emerald-600/30 bg-emerald-50/50 p-6 text-center shadow-inner">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800 uppercase">
                                    <QrCode className="size-3.5" /> VIP Fast-Track Pass
                                </div>
                                <h3 className="mt-2 text-lg font-black text-slate-900">
                                    Barcode / QR Code Akses Masuk Venue
                                </h3>
                                <p className="mt-1 text-xs text-slate-600">
                                    Kehadiran Anda telah terkonfirmasi. Tunjukkan QR Code ini kepada panitia saat tiba di Pintu Masuk / Universal Gate.
                                </p>

                                {/* QR SVG Box */}
                                <div className="mx-auto my-5 inline-block rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
                                    <div
                                        className="w-[180px] h-[180px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    />
                                    <div className="mt-2 font-mono text-sm font-black tracking-widest text-[#17524A]">
                                        {guest.code}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePrint}
                                        variant="outline"
                                        className="h-10 rounded-xl border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100"
                                    >
                                        <Printer className="mr-1.5 size-4" />
                                        Cetak / Simpan PDF
                                    </Button>
                                    <a
                                        href={verifyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#17524A] px-4 text-xs font-bold text-white shadow hover:bg-[#134e45]"
                                    >
                                        <ExternalLink className="mr-1.5 size-4" />
                                        Buka Gate Verifikasi
                                    </a>
                                </div>

                                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 p-3.5 text-xs text-emerald-900">
                                    🔒 <strong>Konfirmasi Kehadiran Terkunci:</strong> Data kehadiran Anda telah tersimpan dan barcode tiket telah dikirimkan ke email Anda. Bila membutuhkan perubahan alokasi kursi atau data pendamping, silakan hubungi kontak panitia di bawah.
                                </div>
                            </div>
                        )}

                        {/* SECTION B: IF DECLINED (NO FORM) */}
                        {isDeclined && (
                            <div className="mt-8 rounded-3xl border-2 border-rose-200 bg-rose-50/60 p-6 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                                    <XCircle className="size-8" />
                                </div>
                                <h3 className="mt-3 text-lg font-black text-slate-900">
                                    Konfirmasi Tercatat: Berhalangan Hadir
                                </h3>
                                <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
                                    Terima kasih atas konfirmasi Anda. Kami memaklumi bila Bapak/Ibu berhalangan hadir pada acara ini.
                                </p>
                                <div className="mt-4 rounded-xl border border-rose-200 bg-white p-3 text-xs text-slate-600 max-w-md mx-auto">
                                    Bila terjadi perubahan agenda dan Bapak/Ibu berkesempatan untuk hadir, mohon hubungi panitia melalui kontak protokoler di bawah agar data dapat dibuka kembali.
                                </div>
                            </div>
                        )}

                        {/* SECTION C: RSVP FORM (ONLY SHOWN IF STATUS === 'invited') */}
                        {!isConfirmed && !isDeclined && (
                            <div className="mt-8 border-t border-slate-200 pt-6">
                                <h3 className="text-base font-black text-slate-900">
                                    Formulir Konfirmasi Kehadiran
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Mohon konfirmasikan rencana kehadiran Bapak/Ibu demi kelancaran penyambutan tamu kehormatan.
                                </p>

                                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('attendance', 'confirmed')}
                                            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                                                data.attendance === 'confirmed'
                                                    ? 'border-[#17524A] bg-emerald-50/70 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                                    data.attendance === 'confirmed'
                                                        ? 'border-[#17524A] bg-[#17524A] text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {data.attendance === 'confirmed' && <CheckCircle2 className="size-4" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900">
                                                    Insya Allah Hadir
                                                </span>
                                                <p className="text-xs text-slate-500">
                                                    Saya akan hadir di Grand Final OMATIQ 2026.
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setData('attendance', 'declined')}
                                            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                                                data.attendance === 'declined'
                                                    ? 'border-rose-600 bg-rose-50/70 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                                    data.attendance === 'declined'
                                                        ? 'border-rose-600 bg-rose-600 text-white'
                                                    : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {data.attendance === 'declined' && <XCircle className="size-4" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900">
                                                    Berhalangan Hadir
                                                </span>
                                                <p className="text-xs text-slate-500">
                                                    Mohon maaf, saya belum dapat hadir.
                                                </p>
                                            </div>
                                        </button>
                                    </div>

                                    {data.attendance === 'confirmed' && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                                            <div>
                                                <Label htmlFor="seat_count" className="text-xs font-bold text-slate-700">
                                                    Jumlah Kursi yang Dibutuhkan (Termasuk Pendamping)
                                                </Label>
                                                <select
                                                    id="seat_count"
                                                    value={data.seat_count}
                                                    onChange={(e) => setData('seat_count', Number(e.target.value))}
                                                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-[#17524A] focus:outline-none"
                                                >
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <option key={num} value={num}>
                                                            {num} Orang {num === 1 ? '(Hanya Saya)' : `(Saya + ${num - 1} Pendamping)`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <Label htmlFor="notes" className="text-xs font-bold text-slate-700">
                                                    Catatan Tambahan / Nama Pendamping (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    rows={2}
                                                    placeholder="Contoh: Didampingi oleh Ibu Sekretaris / butuh kursi roda..."
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    className="mt-1 rounded-xl text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-12 rounded-xl bg-[#17524A] text-sm font-black text-white shadow-lg transition hover:bg-[#134e45]"
                                    >
                                        {processing ? 'Menyimpan...' : 'Kirim Konfirmasi Kehadiran'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500">
                        Pusat Layanan Tamu Undangan: <strong>0811-1234-5678</strong> (Panitia Humas & VIP)
                    </div>
                </div>
            </div>
        </div>
    );
}
