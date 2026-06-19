import {
    CTASection,
    FeatureIcon,
    ProgramCard,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import { ProgramItem, programs } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpenCheck,
    Brain,
    Calculator,
    Camera,
    CheckCircle2,
    Compass,
    Film,
    GalleryHorizontalEnd,
    Goal,
    Images,
    PlayCircle,
    Sparkles,
    Trophy,
    UsersRound,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ProgramDetailProps = {
    slug?: string;
    program?: ProgramItem;
    relatedPrograms?: ProgramItem[];
};

type DetailContent = {
    overviewTitle: string;
    overviewDescription: string;
    objectives: Array<{ icon: LucideIcon; title: string; text: string }>;
    gallery: string[];
    videos: Array<{
        title: string;
        description: string;
        embedUrl: string;
        duration: string;
        tag: string;
    }>;
    ctaDescription: string;
};

const defaultGallery = [
    'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
];

const detailContents: Record<string, DetailContent> = {
    'olimpiade-alquran': {
        overviewTitle: "Apa yang akan dialami peserta Al-Qur'an?",
        overviewDescription:
            "Olimpiade Al-Qur'an membantu anak menguatkan pemahaman tajwid, ketepatan pelafalan, adab membaca, dan keberanian tampil di panggung lomba yang positif.",
        objectives: [
            {
                icon: BookOpenCheck,
                title: 'Memahami tajwid',
                text: 'Peserta berlatih mengenali hukum bacaan dan menerapkannya dengan lebih teliti.',
            },
            {
                icon: Compass,
                title: 'Merapikan cara baca',
                text: "Anak didorong membaca Al-Qur'an dengan pelafalan yang lebih jelas, tenang, dan percaya diri.",
            },
            {
                icon: Sparkles,
                title: 'Menumbuhkan adab',
                text: 'Kompetisi tetap dibangun dengan suasana ramah agar anak belajar disiplin, hormat, dan rendah hati.',
            },
        ],
        gallery: [
            'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1603989872628-78892812af9c?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=900&q=80',
        ],
        videos: [
            {
                title: "Suasana tilawah peserta OMATIQ",
                description:
                    "Cuplikan panggung, ruang tunggu, dan momen peserta menampilkan bacaan terbaiknya.",
                embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
                duration: '03:18',
                tag: 'Highlight',
            },
            {
                title: "Cerita pendamping Al-Qur'an",
                description:
                    'Testimoni singkat tentang persiapan, adab lomba, dan dukungan orang tua.',
                embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                duration: '04:05',
                tag: 'Behind the scene',
            },
        ],
        ctaDescription:
            "Kirim pesan ke tim OMATIQ untuk mengetahui informasi pendaftaran, kategori peserta, dan persiapan Olimpiade Al-Qur'an.",
    },
    'olimpiade-matematika': {
        overviewTitle: 'Apa yang akan dialami peserta Matematika?',
        overviewDescription:
            'Olimpiade Matematika dirancang untuk melatih logika, ketelitian, strategi menyelesaikan soal, dan mental berani mencoba tantangan baru.',
        objectives: [
            {
                icon: Calculator,
                title: 'Mengasah logika',
                text: 'Peserta belajar membaca pola, memahami konsep dasar, dan memilih strategi pengerjaan yang tepat.',
            },
            {
                icon: Brain,
                title: 'Melatih problem solving',
                text: 'Soal dibuat menantang agar anak terbiasa berpikir runtut, teliti, dan tidak mudah menyerah.',
            },
            {
                icon: Trophy,
                title: 'Berani berkompetisi',
                text: 'Anak mendapatkan pengalaman tampil dalam ajang nasional yang rapi, sehat, dan membangun percaya diri.',
            },
        ],
        gallery: [
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
        ],
        videos: [
            {
                title: 'Arena soal Matematika OMATIQ',
                description:
                    'Momen peserta mengerjakan soal, berdiskusi setelah lomba, dan merayakan proses belajar.',
                embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
                duration: '02:47',
                tag: 'Competition day',
            },
            {
                title: 'Strategi belajar sebelum lomba',
                description:
                    'Cuplikan persiapan peserta dalam memahami pola soal dan menjaga fokus.',
                embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                duration: '03:52',
                tag: 'Preparation',
            },
        ],
        ctaDescription:
            'Kirim pesan ke tim OMATIQ untuk mengetahui informasi pendaftaran, level soal, dan panduan persiapan Olimpiade Matematika.',
    },
    'try-out-omatiq': {
        overviewTitle: 'Apa manfaat Try Out OMATIQ?',
        overviewDescription:
            'Try Out membantu peserta mengenali format soal, mengukur kesiapan, dan memahami ritme lomba sebelum mengikuti olimpiade utama.',
        objectives: [
            {
                icon: Goal,
                title: 'Simulasi lomba',
                text: 'Peserta mendapat gambaran alur pengerjaan soal dan suasana kompetisi.',
            },
            {
                icon: CheckCircle2,
                title: 'Evaluasi kesiapan',
                text: 'Hasil latihan membantu anak, orang tua, dan pendamping mengetahui bagian yang perlu diperkuat.',
            },
            {
                icon: UsersRound,
                title: 'Pendampingan terarah',
                text: 'Anak lebih siap karena memahami target latihan dan strategi belajar menjelang lomba.',
            },
        ],
        gallery: [
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
            ...defaultGallery,
            'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80',
        ],
        videos: [
            {
                title: 'Simulasi try out peserta',
                description:
                    'Gambaran alur try out dari registrasi, briefing, hingga evaluasi hasil latihan.',
                embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
                duration: '03:10',
                tag: 'Simulation',
            },
            {
                title: 'Tips siap mengikuti OMATIQ',
                description:
                    'Panduan singkat menjaga ritme belajar dan membangun percaya diri sebelum lomba.',
                embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                duration: '04:20',
                tag: 'Tips',
            },
        ],
        ctaDescription:
            'Hubungi tim OMATIQ untuk mendapatkan informasi jadwal try out dan panduan persiapan peserta.',
    },
};

export default function ProgramDetailPage() {
    const props = usePage<ProgramDetailProps>().props;
    const currentSlug =
        props.program?.slug ??
        props.slug ??
        (typeof window === 'undefined'
            ? ''
            : window.location.pathname.split('/').filter(Boolean).at(-1));
    const program =
        props.program ??
        programs.find((item) => item.slug === currentSlug) ??
        programs[0];
    const detail =
        detailContents[program.slug] ?? detailContents[programs[0].slug];
    const relatedPrograms = props.relatedPrograms?.length
        ? props.relatedPrograms
        : programs.filter((item) => item.id !== program.id).slice(0, 3);

    return (
        <>
            <section className="px-5 pt-28 pb-12 sm:pt-32 md:pb-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/programs"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0F60AC] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Programs
                    </Link>
                    <div className="mt-8 grid overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:rounded-[32px] lg:grid-cols-[1fr_0.9fr]">
                        <div className="p-5 sm:p-8 md:p-12">
                            <span className="inline-flex rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                                {program.category}
                            </span>
                            <h1 className="mt-5 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:mt-6 md:text-6xl">
                                {program.title}
                            </h1>
                            <p className="mt-5 text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                                {program.description}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <span className="rounded-xl bg-[#0F60AC]/10 px-4 py-3 text-sm font-black text-[#0F60AC]">
                                    {program.duration}
                                </span>
                                <span className="rounded-xl bg-[#5DD39E]/15 px-4 py-3 text-sm font-black text-[#12885b]">
                                    {program.level}
                                </span>
                            </div>
                        </div>
                        <img
                            src={program.image}
                            alt={program.title}
                            className="h-72 w-full object-cover sm:h-96 lg:h-full lg:min-h-96"
                        />
                    </div>
                </div>
            </section>

            <section className="px-5 py-12 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader
                        eyebrow="Overview"
                        title={detail.overviewTitle}
                        description={detail.overviewDescription}
                        align="left"
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                        {program.benefits.map((benefit) => (
                            <div
                                key={benefit}
                                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
                            >
                                <FeatureIcon
                                    icon={CheckCircle2}
                                    color="orange"
                                />
                                <p className="mt-5 font-black text-[#1E293B]">
                                    {benefit}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Objectives"
                        title="Tujuan pembelajaran"
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {detail.objectives.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-3xl bg-[#F8FAFC] p-6"
                            >
                                <FeatureIcon icon={item.icon} color="blue" />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden px-5 py-16 lg:px-8">
                <div className="absolute top-12 left-0 h-48 w-48 rounded-full bg-[#FFC857]/20 blur-3xl" />
                <div className="absolute right-0 bottom-20 h-56 w-56 rounded-full bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                        <SectionHeader
                            eyebrow="Dokumentasi"
                            title="Galeri suasana dan video kegiatan"
                            description={`Lihat gambaran suasana ${program.title}: momen peserta, pendamping, ruang lomba, sampai cerita kecil di balik persiapan olimpiade.`}
                            align="left"
                        />
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    icon: Camera,
                                    value: `${detail.gallery.length + 1}+`,
                                    label: 'Foto suasana',
                                },
                                {
                                    icon: Video,
                                    value: `${detail.videos.length}`,
                                    label: 'Video cerita',
                                },
                                {
                                    icon: Images,
                                    value: 'HD',
                                    label: 'Dokumentasi',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F15F23]/10 text-[#F15F23]">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <p className="mt-4 text-2xl font-black text-[#1E293B]">
                                        {item.value}
                                    </p>
                                    <p className="text-sm font-bold text-[#64748B]">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="group relative min-h-80 overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100">
                            <img
                                src={program.image}
                                alt={`Dokumentasi utama ${program.title}`}
                                className="h-full min-h-80 w-full object-cover transition duration-700 group-hover:scale-105 sm:min-h-[460px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/80 via-[#1E293B]/10 to-transparent" />
                            <div className="absolute right-5 bottom-5 left-5 text-white">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                                    <GalleryHorizontalEnd className="h-4 w-4" />
                                    Foto utama kegiatan
                                </div>
                                <h3 className="mt-4 text-2xl font-black sm:text-4xl">
                                    Energi peserta di hari olimpiade
                                </h3>
                                <p className="mt-2 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                                    Dokumentasi ini menggambarkan suasana lomba
                                    yang ramah, tertib, dan menyenangkan untuk
                                    anak-anak.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {detail.gallery.slice(0, 4).map((image, index) => (
                                <div
                                    key={image}
                                    className={`group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 ${index === 0 ? 'sm:row-span-2' : ''}`}
                                >
                                    <img
                                        src={image}
                                        alt={`Galeri suasana ${program.title} ${index + 1}`}
                                        className={`w-full object-cover transition duration-700 group-hover:scale-110 ${index === 0 ? 'h-full min-h-64' : 'h-48 sm:h-full'}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/55 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0F60AC] opacity-0 transition group-hover:opacity-100">
                                        Momen {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {detail.gallery.slice(4).map((image, index) => (
                            <div
                                key={image}
                                className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"
                            >
                                <img
                                    src={image}
                                    alt={`Dokumentasi tambahan ${program.title} ${index + 1}`}
                                    className="h-48 w-full object-cover transition duration-700 group-hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 rounded-[32px] bg-white p-4 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:p-6 lg:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#0F60AC]/10 px-4 py-2 text-sm font-black text-[#0F60AC]">
                                    <Film className="h-4 w-4" />
                                    Video kegiatan
                                </span>
                                <h3 className="mt-4 text-2xl font-black tracking-tight text-[#1E293B] sm:text-3xl">
                                    Cerita bergerak dari arena OMATIQ
                                </h3>
                            </div>
                            <p className="max-w-xl text-sm leading-7 text-[#64748B] sm:text-base">
                                Video dummy ini bisa diganti nanti dengan
                                dokumentasi resmi dari panitia, sekolah, atau
                                kanal YouTube Yatim Mandiri.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-5 lg:grid-cols-2">
                            {detail.videos.map((video) => (
                                <article
                                    key={video.title}
                                    className="overflow-hidden rounded-3xl bg-[#F8FAFC] ring-1 ring-slate-100"
                                >
                                    <div className="relative aspect-video overflow-hidden bg-[#1E293B]">
                                        <iframe
                                            src={video.embedUrl}
                                            title={video.title}
                                            className="h-full w-full"
                                            loading="lazy"
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                        <div className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#F15F23] backdrop-blur">
                                            <PlayCircle className="h-4 w-4" />
                                            {video.duration}
                                        </div>
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <span className="inline-flex rounded-full bg-[#FFC857]/30 px-3 py-1 text-xs font-black text-[#7A4D00]">
                                            {video.tag}
                                        </span>
                                        <h4 className="mt-4 text-xl font-black text-[#1E293B]">
                                            {video.title}
                                        </h4>
                                        <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                            {video.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Related Programs"
                        title="Program lain yang mungkin cocok"
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {relatedPrograms.map((item) => (
                            <ProgramCard key={item.id} program={item} />
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                title={`Daftar minat untuk ${program.title}`}
                description={detail.ctaDescription}
            />
        </>
    );
}
