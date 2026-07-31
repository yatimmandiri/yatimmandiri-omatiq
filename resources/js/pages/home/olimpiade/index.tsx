import {
    CTASection,
    OlimpiadeCard,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import type { OlimpiadeItem} from '@/components/marketing/site-data';
import { olimpiade } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    Brain,
    CalendarDays,
    Calculator,
    CheckCircle2,
    GraduationCap,
    Medal,
    Sparkles,
    Star,
    Target,
    Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type OlimpiadeProps = {
    olimpiade?: typeof olimpiade | { data?: typeof olimpiade };
};

type OlympiadTheme = {
    icon: LucideIcon;
    eyebrow: string;
    accent: string;
    soft: string;
    dark: string;
    number: string;
    highlights: string[];
    image: string;
};

const normalizeOlimpiade = (value: OlimpiadeProps['olimpiade']) => {
    return Array.isArray(value)
        ? value
        : value?.data && Array.isArray(value.data)
            ? value.data
            : olimpiade;
};

const isMainOlimpiade = (item: OlimpiadeItem) => {
    const content = `${item.title} ${item.category}`.toLowerCase();

    return (
        content.includes('qur') ||
        content.includes('matematika') ||
        content.includes('math')
    );
};

const getTheme = (olimpiade: OlimpiadeItem, index: number): OlympiadTheme => {
    const content = `${olimpiade.title} ${olimpiade.category}`.toLowerCase();
    const isQuran = content.includes('qur');
    const isMath = content.includes('matematika') || content.includes('math');

    if (isQuran) {
        return {
            icon: BookOpenCheck,
            eyebrow: "Ketepatan bacaan & kecintaan Al-Qur'an",
            accent: '#F15F23',
            soft: '#FFF1EA',
            dark: '#9A3412',
            number: '01',
            highlights: ['Tajwid', 'Cara baca', 'Adab & percaya diri'],
            image: olimpiade.image,
        };
    }

    if (!isMath) {
        return {
            icon: GraduationCap,
            eyebrow: 'Ruang tumbuh prestasi & karakter',
            accent: '#8B5CF6',
            soft: '#F3E8FF',
            dark: '#6D28D9',
            number: String(index + 1).padStart(2, '0'),
            highlights: [
                olimpiade.category,
                olimpiade.level,
                'Pengalaman nasional',
            ],
            image: olimpiade.image,
        };
    }

    return {
        icon: Calculator,
        eyebrow: 'Logika, strategi & keberanian bernalar',
        accent: '#0F60AC',
        soft: '#EAF5FF',
        dark: '#083B6B',
        number: '02',
        highlights: ['Logika dasar', 'Problem solving', 'Strategi soal'],
        image: olimpiade.image,
    };
};

export default function OlimpiadePage() {
    const props = usePage<OlimpiadeProps>().props;
    const olympiads = normalizeOlimpiade(props.olimpiade);
    const mainOlimpiads = olympiads.filter(isMainOlimpiade).slice(0, 2);
    const featuredOlimpiads = mainOlimpiads.length
        ? mainOlimpiads
        : olympiads.slice(0, 2);
    const otherOlimpiads = olympiads.filter(
        (item) => !featuredOlimpiads.some((featured) => featured.id === item.id),
    );

    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-14 sm:pt-32 sm:pb-20 lg:px-8">
                <div className="absolute top-28 left-0 h-48 w-48 rounded-[48px] bg-[#FFC857]/20 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-56 w-56 rounded-[56px] bg-[#56CCF2]/15 blur-3xl" />

                <div className="relative mx-auto max-w-7xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                        <Medal className="h-4 w-4" />
                        Olimpiade OMATIQ
                    </span>
                    <h1 className="mx-auto mt-6 max-w-5xl text-3xl leading-tight font-black text-[#1E293B] sm:text-4xl md:text-6xl lg:text-7xl">
                        Dua bidang utama, banyak ruang prestasi untuk anak Indonesia.
                    </h1>
                    <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                        OMATIQ memusatkan pengalaman lomba pada Al-Qur'an dan
                        Matematika sebagai cabang utama, sekaligus membuka ruang
                        bagi cabang olimpiade lain yang mendukung proses tumbuh
                        anak secara utuh.
                    </p>

                    <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
                        {[
                            {
                                icon: Trophy,
                                value: 'Nasional',
                                label: 'Skala kompetisi',
                            },
                            {
                                icon: Target,
                                value: `${olympiads.length} Olimpiade`,
                                label: 'Cabang tersedia',
                            },
                            {
                                icon: Star,
                                value: 'Anak Indonesia',
                                label: 'Panggung prestasi',
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F60AC]/10 text-[#0F60AC]">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <span>
                                    <strong className="block text-sm font-black text-[#1E293B]">
                                        {item.value}
                                    </strong>
                                    <span className="text-xs font-semibold text-[#64748B]">
                                        {item.label}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-14 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Pilih Olimpiademu"
                        title="Kenali dua panggung utama OMATIQ"
                        description="Al-Qur'an dan Matematika menjadi cabang utama OMATIQ. Keduanya membawa pengalaman, tantangan, dan kemampuan yang berbeda untuk dikembangkan."
                    />

                    <div className="mt-14 space-y-10">
                        {featuredOlimpiads.map((olimpiade, index) => {
                            const theme = getTheme(olimpiade, index);
                            const Icon = theme.icon;

                            return (
                                <article
                                    key={olimpiade.id}
                                    className="group overflow-hidden rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#0F60AC]/10 sm:rounded-[32px]"
                                >
                                    <div
                                        className={`grid lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
                                    >
                                        <div className="relative min-h-72 overflow-hidden sm:min-h-80 lg:min-h-[560px]">
                                            <img
                                                src={theme.image}
                                                alt={olimpiade.title}
                                                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                                            <span className="absolute top-5 left-5 text-5xl font-black text-white/25 sm:top-6 sm:left-6 sm:text-7xl">
                                                {theme.number}
                                            </span>
                                            <div className="absolute right-6 bottom-6 left-6 flex items-center justify-between gap-4 text-white">
                                                <div>
                                                    <p className="text-xs font-black tracking-widest text-white/70 uppercase">
                                                        OMATIQ National Olympiad
                                                    </p>
                                                    <p className="mt-2 text-xl font-black">
                                                        {olimpiade.level}
                                                    </p>
                                                </div>
                                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                                                    <Icon className="h-7 w-7" />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center p-5 sm:p-7 md:p-12 lg:p-14">
                                            <span
                                                className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black"
                                                style={{
                                                    backgroundColor: theme.soft,
                                                    color: theme.dark,
                                                }}
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                {theme.eyebrow}
                                            </span>
                                            <h2 className="mt-5 text-3xl leading-tight font-black text-[#1E293B] sm:mt-6 sm:text-4xl md:text-5xl">
                                                {olimpiade.title}
                                            </h2>
                                            <p className="mt-5 text-base leading-8 text-[#64748B] md:text-lg">
                                                {olimpiade.description}
                                            </p>
                                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                                {theme.highlights.map(
                                                    (highlight) => (
                                                        <div
                                                            key={highlight}
                                                            className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-black text-[#1E293B] shadow-sm ring-1 ring-slate-100"
                                                        >
                                                            <CheckCircle2
                                                                className="h-4 w-4 shrink-0"
                                                                style={{
                                                                    color: theme.accent,
                                                                }}
                                                            />
                                                            {highlight}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <div className="mt-8 flex items-center gap-3 rounded-2xl p-4 md:p-5" style={{ backgroundColor: theme.soft }}>
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: theme.accent }}>
                                                    <Target className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black tracking-wide uppercase" style={{ color: theme.dark }}>
                                                        Jadwal Pelaksanaan
                                                    </p>
                                                    <p className="mt-1 text-sm font-black text-[#1E293B] md:text-base">
                                                        {olimpiade.nextSchedule?.dateLabel ??
                                                            'Jadwal segera diumumkan'}
                                                    </p>
                                                    {olimpiade.nextSchedule?.title && (
                                                        <p className="mt-1 text-xs font-bold text-[#64748B]">
                                                            {olimpiade.nextSchedule.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                                <Link
                                                    href={`/olimpiade/${olimpiade.slug}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-1"
                                                    style={{
                                                        backgroundColor:
                                                            theme.accent,
                                                    }}
                                                >
                                                    Lihat Detail
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href="/jadwal"
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:border-[#0F60AC]/25"
                                                >
                                                    Kalender
                                                    <CalendarDays className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {otherOlimpiads.length > 0 && (
                <section className="px-5 py-14 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                            <SectionHeader
                                eyebrow="Olimpiade Lainnya"
                                title="Cabang tambahan untuk pengalaman belajar yang lebih luas"
                                description="Jika OMATIQ menambah cabang baru, bagian ini otomatis menampilkan katalog olimpiade dari data terbaru."
                                align="left"
                            />
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    {
                                        icon: Sparkles,
                                        value: `${otherOlimpiads.length}`,
                                        label: 'Cabang tambahan',
                                    },
                                    {
                                        icon: CalendarDays,
                                        value: 'Terjadwal',
                                        label: 'Mengikuti kalender',
                                    },
                                    {
                                        icon: Trophy,
                                        value: 'Nasional',
                                        label: 'Panggung prestasi',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
                                    >
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F15F23]/10 text-[#F15F23]">
                                            <item.icon className="h-5 w-5" />
                                        </span>
                                        <p className="mt-4 text-xl font-black text-[#1E293B]">
                                            {item.value}
                                        </p>
                                        <p className="text-sm font-bold text-[#64748B]">
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {otherOlimpiads.map((item) => (
                                <OlimpiadeCard key={item.id} olimpiade={item} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-white px-5 py-14 sm:py-20 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader
                        eyebrow="Satu Semangat"
                        title="Setiap cabang bertemu dalam karakter yang sama"
                        description="Al-Qur'an menguatkan adab dan ketepatan. Matematika melatih logika dan ketekunan. Cabang lain dapat memperluas minat, tetapi semuanya tetap bermuara pada keberanian anak untuk bertumbuh."
                        align="left"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl bg-[#F15F23] p-7 text-white shadow-xl shadow-[#F15F23]/20">
                            <BookOpenCheck className="h-9 w-9 text-[#FFC857]" />
                            <p className="mt-8 text-2xl font-black">
                                Berakhlak dalam proses
                            </p>
                            <p className="mt-3 text-sm leading-7 text-white/80">
                                Belajar disiplin, menghargai aturan, dan tampil
                                dengan adab terbaik.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-[#0F60AC] p-7 text-white shadow-xl shadow-[#0F60AC]/20 sm:mt-10">
                            <Brain className="h-9 w-9 text-[#56CCF2]" />
                            <p className="mt-8 text-2xl font-black">
                                Berani menghadapi tantangan
                            </p>
                            <p className="mt-3 text-sm leading-7 text-white/80">
                                Membangun ketahanan, ketelitian, dan percaya
                                diri saat memecahkan masalah.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Sudah tahu olimpiade yang paling cocok?"
                description="Daftarkan anak untuk mengikuti cabang OMATIQ yang sesuai dan berikan pengalaman berkompetisi yang positif di tingkat nasional."
            />
        </>
    );
}
