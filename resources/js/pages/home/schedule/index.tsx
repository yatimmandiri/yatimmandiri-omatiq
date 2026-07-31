import { CTASection, SectionHeader } from '@/components/marketing/marketing-components';
import type { OlimpiadeSchedule } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Flag,
    MapPin,
    Medal,
    Sparkles,
    Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

type ScheduleItem = OlimpiadeSchedule & {
    olimpiade?: {
        id: number;
        title: string;
        slug: string;
        category: string;
        image?: string | null;
    } | null;
};

type SchedulePageProps = {
    schedules?: ScheduleItem[];
};

const phaseTone: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    registration: { bg: '#FFF1EA', text: '#F15F23', icon: CalendarDays },
    technical_meeting: { bg: '#EAF5FF', text: '#0F60AC', icon: Clock3 },
    preliminary: { bg: '#FFF7D7', text: '#B77900', icon: CheckCircle2 },
    knockout: { bg: '#ECFDF5', text: '#12885B', icon: Flag },
    semifinal: { bg: '#F3E8FF', text: '#8B5CF6', icon: Medal },
    final: { bg: '#EAF5FF', text: '#0F60AC', icon: Trophy },
    announcement: { bg: '#FFF1EA', text: '#F15F23', icon: Sparkles },
};

const defaultSchedules: ScheduleItem[] = [
    {
        id: 1,
        title: 'Registrasi Nasional',
        phase: 'registration',
        phaseLabel: 'Registrasi',
        startDate: '2026-07-01',
        endDate: '2026-08-10',
        dateLabel: '1 Jul 2026 - 10 Agu 2026',
        location: 'Online Nasional',
        description: 'Sekolah, orang tua, dan pendamping mulai mendaftarkan peserta untuk cabang Al-Qur\'an dan Matematika.',
        color: '#F15F23',
        actionLabel: 'Daftar',
        actionUrl: '/kontak',
        olimpiade: null,
    },
    {
        id: 2,
        title: 'Babak Penyisihan',
        phase: 'preliminary',
        phaseLabel: 'Babak Penyisihan',
        startDate: '2026-08-24',
        endDate: '2026-08-25',
        dateLabel: '24 Agu 2026 - 25 Agu 2026',
        location: 'Online Terjadwal',
        description: 'Peserta mengikuti seleksi awal sesuai cabang lomba untuk menentukan peserta yang lanjut ke fase gugur.',
        color: '#FFC857',
        olimpiade: null,
    },
    {
        id: 3,
        title: 'Fase Knockout',
        phase: 'knockout',
        phaseLabel: 'Fase Knockout',
        startDate: '2026-09-07',
        endDate: '2026-09-14',
        dateLabel: '7 Sep 2026 - 14 Sep 2026',
        location: 'Online Nasional',
        description: 'Peserta terbaik bertanding dalam fase gugur hingga tersisa finalis nasional.',
        color: '#5DD39E',
        olimpiade: null,
    },
    {
        id: 4,
        title: 'Final Nasional OMATIQ',
        phase: 'final',
        phaseLabel: 'Final Nasional',
        startDate: '2026-10-04',
        endDate: null,
        dateLabel: '4 Okt 2026',
        location: 'Final Nasional',
        description: 'Finalis tampil di panggung puncak OMATIQ bersama peserta terbaik dari berbagai daerah.',
        color: '#0F60AC',
        olimpiade: null,
    },
];

export default function SchedulePage() {
    const props = usePage<SchedulePageProps>().props;
    const schedules = props.schedules?.length ? props.schedules : defaultSchedules;
    const grouped = useMemo(() => {
        return schedules.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
            const key = item.phaseLabel || item.phase;
            acc[key] = [...(acc[key] ?? []), item];

            return acc;
        }, {});
    }, [schedules]);
    const heroSchedule = schedules[0];

    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-14 sm:pt-32 sm:pb-20 lg:px-8">
                <div className="absolute top-24 left-0 h-56 w-56 rounded-[56px] bg-[#F15F23]/15 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-[64px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                            <CalendarDays className="h-4 w-4" />
                            Kalender Tahunan OMATIQ
                        </span>
                        <h1 className="mt-6 max-w-4xl text-3xl leading-tight font-black text-[#1E293B] sm:text-5xl lg:text-7xl">
                            Dari registrasi sampai final, semua fase tertata jelas.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#64748B] sm:text-lg">
                            Pantau perjalanan Olimpiade Al-Qur'an dan Matematika OMATIQ dalam satu kalender yang mudah dibaca oleh peserta, orang tua, guru, dan pendamping.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#calendar"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:-translate-y-1"
                            >
                                Lihat Kalender
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <Link
                                href="/olimpiade"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1"
                            >
                                Pilih Olimpiade
                                <Trophy className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-[32px] bg-white p-5 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100">
                            <div className="rounded-[26px] bg-gradient-to-br from-[#0F60AC] via-[#1277D0] to-[#56CCF2] p-5 text-white sm:p-7">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black text-white/70 uppercase">
                                            Fase Terdekat
                                        </p>
                                        <h2 className="mt-2 text-2xl font-black sm:text-4xl">
                                            {heroSchedule?.title ?? 'Jadwal segera hadir'}
                                        </h2>
                                    </div>
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                                        <CalendarDays className="h-7 w-7" />
                                    </span>
                                </div>
                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    <InfoPill icon={Clock3} label="Tanggal" value={heroSchedule?.dateLabel ?? '-'} />
                                    <InfoPill icon={MapPin} label="Lokasi" value={heroSchedule?.location ?? '-'} />
                                </div>
                                <div className="mt-6 rounded-3xl bg-white/12 p-5 backdrop-blur">
                                    <p className="text-sm leading-7 text-white/80">
                                        {heroSchedule?.description ?? 'Tim OMATIQ akan mengumumkan kalender resmi melalui halaman ini.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 hidden rounded-3xl bg-[#FFC857] px-5 py-4 text-sm font-black text-[#1E293B] shadow-xl sm:block">
                            Siap dari awal
                        </div>
                    </div>
                </div>
            </section>

            <section id="calendar" className="bg-white px-5 py-14 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Timeline"
                        title="Kalender pelaksanaan OMATIQ"
                        description="Setiap fase dibuat ringkas agar peserta bisa menyiapkan administrasi, latihan, dan mental kompetisi dengan lebih tenang."
                    />

                    <div className="mt-14 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
                        <div className="h-fit rounded-[28px] bg-[#F8FAFC] p-5 ring-1 ring-slate-100 sm:p-6">
                            <p className="text-sm font-black text-[#64748B] uppercase">
                                Ringkasan Fase
                            </p>
                            <div className="mt-5 space-y-3">
                                {Object.entries(grouped).map(([phase, items]) => (
                                    <a
                                        key={phase}
                                        href={`#${phase.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="flex items-center justify-between rounded-2xl bg-white p-4 text-sm font-black text-[#1E293B] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:text-[#0F60AC]"
                                    >
                                        <span>{phase}</span>
                                        <span className="rounded-full bg-[#0F60AC]/10 px-3 py-1 text-xs text-[#0F60AC]">
                                            {items.length}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-0 bottom-0 left-5 hidden w-px bg-slate-200 sm:block" />
                            <div className="space-y-5">
                                {schedules.map((item, index) => {
                                    const tone = phaseTone[item.phase] ?? phaseTone.registration;
                                    const Icon = tone.icon;

                                    return (
                                        <article
                                            id={item.phaseLabel.toLowerCase().replace(/\s+/g, '-')}
                                            key={item.id}
                                            className="group relative grid gap-4 rounded-[28px] bg-[#F8FAFC] p-4 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-[#0F60AC]/10 sm:grid-cols-[auto_1fr] sm:p-5"
                                        >
                                            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: item.color || tone.text }}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: tone.bg, color: tone.text }}>
                                                        {item.phaseLabel}
                                                    </span>
                                                    <span className="text-xs font-black text-[#64748B]">
                                                        Step {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    {item.olimpiade && (
                                                        <Link
                                                            href={`/olimpiade/${item.olimpiade.slug}`}
                                                            className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0F60AC] ring-1 ring-slate-100"
                                                        >
                                                            {item.olimpiade.title}
                                                        </Link>
                                                    )}
                                                </div>
                                                <h3 className="mt-4 text-2xl font-black text-[#1E293B]">
                                                    {item.title}
                                                </h3>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[#64748B]">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Clock3 className="h-4 w-4 text-[#F15F23]" />
                                                        {item.dateLabel}
                                                    </span>
                                                    {item.location && (
                                                        <span className="inline-flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-[#0F60AC]" />
                                                            {item.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="mt-4 text-sm leading-7 text-[#64748B] sm:text-base">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.actionUrl && item.actionLabel && (
                                                    <Link
                                                        href={item.actionUrl}
                                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F15F23] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                                                    >
                                                        {item.actionLabel}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Siapkan anak sejak fase registrasi."
                description="Cek jadwal, pilih cabang olimpiade yang sesuai, lalu daftarkan peserta agar punya waktu cukup untuk latihan dan pendampingan."
                primaryHref="/kontak"
            />
        </>
    );
}

const InfoPill = ({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) => (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-black text-white/65 uppercase">
            <Icon className="h-4 w-4" />
            {label}
        </div>
        <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
);
