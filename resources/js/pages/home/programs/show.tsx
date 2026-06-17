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
    CheckCircle2,
    Compass,
    GalleryHorizontalEnd,
    Goal,
    Sparkles,
    Trophy,
    UsersRound,
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
            "Cabang Al-Qur'an membantu anak menguatkan pemahaman tajwid, ketepatan pelafalan, adab membaca, dan keberanian tampil di panggung lomba yang positif.",
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
        ],
        ctaDescription:
            "Kirim pesan ke tim OMATIQ untuk mengetahui informasi pendaftaran, kategori peserta, dan persiapan Olimpiade Al-Qur'an.",
    },
    'olimpiade-matematika': {
        overviewTitle: 'Apa yang akan dialami peserta Matematika?',
        overviewDescription:
            'Cabang Matematika dirancang untuk melatih logika, ketelitian, strategi menyelesaikan soal, dan mental berani mencoba tantangan baru.',
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

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Gallery" title="Suasana program" />
                    <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                        {[program.image, ...detail.gallery]
                            .slice(0, 3)
                            .map((image, index) => (
                                <div
                                    key={image}
                                    className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"
                                >
                                    <img
                                        src={image}
                                        alt={`Program gallery ${index + 1}`}
                                        className="h-56 w-full object-cover sm:h-80"
                                    />
                                    {index === 0 && (
                                        <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#0F60AC]">
                                            <GalleryHorizontalEnd className="h-4 w-4" />{' '}
                                            Featured
                                        </div>
                                    )}
                                </div>
                            ))}
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
