import {
    CTASection,
    FeatureIcon,
    NewsCard,
    SectionHeader,
    TestimonialCard,
} from '@/components/marketing/marketing-components';
import { SliderSection } from '@/components/sections/home/slider-section';
import { news, partners, testimonials } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import { PointerEvent, useEffect, useState } from 'react';
import {
    ArrowRight,
    BookOpenCheck,
    Building2,
    Brain,
    Calculator,
    Handshake,
    Medal,
    Quote,
    Star,
    Sparkles,
    Trophy,
    UsersRound,
} from 'lucide-react';

type PublicFigureReview = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    focus: string;
};

const publicFigureReviews: PublicFigureReview[] = [
    {
        id: 1,
        name: 'Dr. Aisyah Rahmani',
        role: 'Tokoh Pendidikan Anak',
        quote: 'OMATIQ memberi ruang kompetisi yang sehat. Anak-anak tidak hanya mengejar nilai, tetapi belajar disiplin, percaya diri, dan mencintai proses.',
        avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=500&q=80',
        focus: 'Pendidikan Karakter',
    },
    {
        id: 2,
        name: 'Ust. Farhan Al-Hafidz',
        role: 'Pembina Tahsin Nasional',
        quote: 'Cabang Al-Quran di OMATIQ penting karena mempertemukan ketelitian tajwid dengan semangat anak-anak untuk membaca lebih baik.',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80',
        focus: 'Tajwid & Tahsin',
    },
    {
        id: 3,
        name: 'Prof. Bima Santoso',
        role: 'Pemerhati Matematika Dasar',
        quote: 'Matematika perlu dibuat menantang sekaligus menyenangkan. OMATIQ punya peluang besar untuk menumbuhkan keberanian bernalar sejak dini.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80',
        focus: 'Logika Matematika',
    },
    {
        id: 4,
        name: 'Nadia Paramitha',
        role: 'Duta Literasi Keluarga',
        quote: 'Saya suka cara OMATIQ melibatkan sekolah, guru, dan orang tua. Anak merasa punya panggung, sementara pendamping punya arah yang jelas.',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80',
        focus: 'Kolaborasi Keluarga',
    },
    {
        id: 5,
        name: 'Raka Adinata',
        role: 'Pegiat Kompetisi Pelajar',
        quote: 'Ajang seperti OMATIQ bisa menjadi pengalaman pertama yang membekas bagi anak-anak untuk berani tampil di skala nasional.',
        avatar: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=500&q=80',
        focus: 'Prestasi Nasional',
    },
];
const olympiadBranches = [
    {
        title: "Olimpiade Al-Qur'an",
        text: 'Mengasah pemahaman tajwid, ketepatan cara baca, dan kecintaan anak pada Al-Qur\'an.',
        icon: BookOpenCheck,
        color: 'orange' as const,
    },
    {
        title: 'Olimpiade Matematika',
        text: 'Membangun nalar, ketelitian, dan keberanian memecahkan soal secara menyenangkan.',
        icon: Calculator,
        color: 'blue' as const,
    },
];

type HomeProps = {
    news?: typeof news;
    testimonials?: typeof testimonials;
    partners?: string[];
};

export default function HomePage() {
    const props = usePage<HomeProps>().props;
    const latestNews = props.news?.length ? props.news : news;
    const testimonialItems = props.testimonials?.length ? props.testimonials : testimonials;
    const partnerItems = props.partners?.length ? props.partners : partners;

    return (
        <>
            <SliderSection />

            <section className="relative overflow-hidden px-5 py-20 lg:px-8">
                <div className="absolute left-0 top-10 h-32 w-32 rounded-[40px] bg-[#FFC857]/25 blur-2xl" />
                <div className="absolute bottom-10 right-0 h-40 w-40 rounded-[48px] bg-[#56CCF2]/20 blur-2xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                            <Sparkles className="h-4 w-4" />
                            Tentang OMATIQ
                        </span>
                        <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#1E293B] md:text-5xl">
                            Ajang olimpiade nasional untuk anak Indonesia yang cerdas, berani, dan berakhlak.
                        </h2>
                        <p className="mt-5 text-base leading-8 text-[#64748B] md:text-lg">
                            OMATIQ adalah kompetisi berbasis nasional yang mempertemukan anak-anak dari berbagai daerah untuk bertumbuh melalui tantangan Al-Qur'an dan Matematika. Untuk tahap awal, OMATIQ fokus pada soal tajwid, cara baca Al-Qur'an, dan kemampuan matematika. Ke depannya, cabang olimpiade akan terus dikembangkan.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:-translate-y-1 hover:bg-[#d94f18]"
                            >
                                Kenali OMATIQ
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/programs"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:border-[#0F60AC]/30 hover:bg-[#0F60AC]/5"
                            >
                                Lihat Olimpiade
                                <Trophy className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative min-h-[520px]">
                        <div className="absolute left-2 top-4 z-10 hidden animate-bounce rounded-3xl bg-[#FFC857] px-5 py-4 text-sm font-black text-[#1E293B] shadow-xl md:block">
                            Nasional
                        </div>
                        <div className="absolute right-4 top-28 z-10 hidden rounded-3xl bg-[#5DD39E] px-5 py-4 text-sm font-black text-white shadow-xl md:block">
                            Tajwid & Logika
                        </div>
                        <div className="absolute bottom-8 left-8 z-10 hidden rounded-3xl bg-[#8B5CF6] px-5 py-4 text-sm font-black text-white shadow-xl md:block">
                            Anak Indonesia
                        </div>

                        <div className="absolute inset-x-4 top-0 mx-auto max-w-md rotate-[-3deg] rounded-[36px] bg-white p-5 shadow-2xl shadow-[#0F60AC]/10 ring-1 ring-slate-100 transition hover:rotate-0">
                            <div className="rounded-[28px] bg-[#0F60AC] p-5 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                        <Medal className="h-8 w-8 text-[#FFC857]" />
                                    </div>
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                                        OMATIQ 2026
                                    </span>
                                </div>
                                <h3 className="mt-8 text-3xl font-black">
                                    National Olympiad
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-white/75">
                                    Satu panggung untuk menguji kemampuan, membangun percaya diri, dan merayakan proses belajar anak.
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 grid gap-4 sm:grid-cols-2">
                            {olympiadBranches.map((branch, index) => (
                                <div
                                    key={branch.title}
                                    className={`rounded-3xl bg-white p-6 shadow-xl shadow-[#0F60AC]/10 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-2 ${index === 1 ? 'sm:mt-16' : 'sm:mb-16'}`}
                                >
                                    <FeatureIcon icon={branch.icon} color={branch.color} />
                                    <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                        {branch.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                        {branch.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-4 rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-4 md:p-8">
                    {[
                        ['34+', 'Provinsi'],
                        ['2', 'Cabang Awal'],
                        ['Nasional', 'Skala Lomba'],
                        ['2026', 'Musim OMATIQ'],
                    ].map(([value, label]) => (
                        <div key={label} className="rounded-3xl bg-[#F8FAFC] p-6 text-center">
                            <p className="text-4xl font-black text-[#F15F23]">{value}</p>
                            <p className="mt-2 text-sm font-bold text-[#64748B]">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Why OMATIQ" title="Olimpiade yang serius, hangat, dan mudah diikuti" description="OMATIQ dirancang agar anak-anak merasa tertantang sekaligus didukung oleh sistem lomba yang jelas dan menyenangkan." />
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Trophy, color: 'orange' as const, title: 'Ajang Prestasi', text: 'Memberi ruang bagi anak untuk mengukur kemampuan dan merayakan proses belajar.' },
                            { icon: BookOpenCheck, color: 'mint' as const, title: "Al-Qur'an", text: 'Menguatkan pemahaman tajwid dan cara baca dengan pendekatan yang terarah.' },
                            { icon: Brain, color: 'blue' as const, title: 'Matematika', text: 'Melatih logika, ketelitian, dan strategi menyelesaikan soal secara percaya diri.' },
                            { icon: UsersRound, color: 'purple' as const, title: 'Skala Nasional', text: 'Menghubungkan peserta dari berbagai daerah dalam satu pengalaman lomba.' },
                        ].map((item) => (
                            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
                                <FeatureIcon icon={item.icon} color={item.color} />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Latest News" title="Kabar terbaru dari OMATIQ" description="Ikuti update olimpiade, informasi cabang lomba, dan cerita perjalanan peserta dari berbagai daerah." />
                    <div className="mt-10 space-y-6">
                        {latestNews[0] && (
                            <NewsCard article={latestNews[0]} featured />
                        )}
                        <div className="grid min-w-0 gap-6 md:grid-cols-2">
                            {latestNews.slice(1, 3).map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden px-5 py-16 lg:px-8">
                <div className="absolute left-0 top-16 h-40 w-40 rounded-full bg-[#FFC857]/20 blur-3xl" />
                <div className="absolute right-0 bottom-16 h-48 w-48 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <SectionHeader eyebrow="Review Tokoh" title="Dukungan dari para pemerhati pendidikan" description="Beberapa tokoh dan praktisi melihat OMATIQ sebagai ruang lomba yang bisa membangun prestasi, karakter, dan keberanian anak Indonesia." align="left" />
                    </div>
                    <PublicFigureReviewSlider items={publicFigureReviews} />
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Testimonials" title="Dipercaya oleh orang tua, guru, dan komunitas" description="OMATIQ membantu anak-anak berani mencoba, disiplin berlatih, dan bangga pada proses belajarnya." />
                    <TestimonialSlider items={testimonialItems} />
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
                    <SectionHeader eyebrow="Mitra & Kerjasama" title="Bergerak bersama ekosistem pendidikan" description="OMATIQ terbuka untuk kolaborasi dengan sekolah, TPQ, komunitas guru, orang tua, mentor daerah, dan mitra nasional." />
                    <PartnerSlider items={partnerItems} />
                </div>
            </section>

            <CTASection title="Daftarkan anak untuk tampil di panggung OMATIQ" description="Ajak anak mengikuti olimpiade nasional yang mengasah kemampuan Al-Qur'an, Matematika, keberanian, dan semangat berprestasi sejak dini." />
        </>
    );
}





const PublicFigureReviewSlider = ({ items }: { items: PublicFigureReview[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const visibleItems = getVisibleItems(items, activeIndex, 3);

    const moveSlide = (direction: 1 | -1) => {
        setActiveIndex((current) => (current + direction + items.length) % items.length);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        setTouchStartX(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (touchStartX === null) {
            return;
        }

        const diff = event.clientX - touchStartX;
        setTouchStartX(null);

        if (Math.abs(diff) < 40) {
            return;
        }

        moveSlide(diff < 0 ? 1 : -1);
    };

    useEffect(() => {
        if (items.length <= 3) {
            return;
        }

        const interval = window.setInterval(() => {
            moveSlide(1);
        }, 4200);

        return () => window.clearInterval(interval);
    }, [items.length]);

    return (
        <div
            className="mt-10 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item, index) => (
                    <article
                        key={`${item.id}-${activeIndex}`}
                        className={`group relative min-h-96 overflow-hidden rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0F60AC]/10 ${
                            index === 0 ? 'lg:rotate-[-1deg]' : index === 2 ? 'lg:rotate-[1deg]' : ''
                        }`}
                    >
                        <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F15F23]/10 text-[#F15F23] transition group-hover:scale-110">
                            <Quote className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-4 pr-16">
                            <img
                                src={item.avatar}
                                alt={item.name}
                                className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                            />
                            <div className="min-w-0">
                                <h3 className="break-words text-lg font-black text-[#1E293B]">
                                    {item.name}
                                </h3>
                                <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B]">
                                    {item.role}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-1 text-[#FFC857]">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star key={starIndex} className="h-4 w-4 fill-current" />
                            ))}
                        </div>
                        <p className="mt-5 text-base leading-8 text-[#1E293B]">
                            "{item.quote}"
                        </p>
                        <div className="mt-6 inline-flex rounded-full bg-[#0F60AC]/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#0F60AC]">
                            {item.focus}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

const TestimonialSlider = ({ items }: { items: typeof testimonials }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const visibleItems = getVisibleItems(items, activeIndex, 3);

    const moveSlide = (direction: 1 | -1) => {
        setActiveIndex((current) => (current + direction + items.length) % items.length);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        setTouchStartX(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (touchStartX === null) {
            return;
        }

        const diff = event.clientX - touchStartX;
        setTouchStartX(null);

        if (Math.abs(diff) < 40) {
            return;
        }

        moveSlide(diff < 0 ? 1 : -1);
    };

    useEffect(() => {
        if (items.length <= 3) {
            return;
        }

        const interval = window.setInterval(() => {
            moveSlide(1);
        }, 4800);

        return () => window.clearInterval(interval);
    }, [items.length]);

    return (
        <div
            className="mt-10 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((testimonial) => (
                    <TestimonialCard key={`${testimonial.id}-${activeIndex}`} testimonial={testimonial} />
                ))}
            </div>
        </div>
    );
};

const PartnerSlider = ({ items }: { items: string[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const visibleItems = getVisibleItems(items, activeIndex, 4);

    const moveSlide = (direction: 1 | -1) => {
        setActiveIndex((current) => (current + direction + items.length) % items.length);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        setTouchStartX(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (touchStartX === null) {
            return;
        }

        const diff = event.clientX - touchStartX;
        setTouchStartX(null);

        if (Math.abs(diff) < 36) {
            return;
        }

        moveSlide(diff < 0 ? 1 : -1);
    };

    useEffect(() => {
        if (items.length <= 4) {
            return;
        }

        const interval = window.setInterval(() => {
            moveSlide(1);
        }, 3600);

        return () => window.clearInterval(interval);
    }, [items.length]);

    return (
        <div
            className="mt-10 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleItems.map((partner, index) => (
                    <div
                        key={`${partner}-${activeIndex}`}
                        className={`group relative min-h-44 overflow-hidden rounded-3xl border border-slate-100 bg-[#F8FAFC] p-5 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#0F60AC]/10 ${
                            index % 2 === 0 ? 'animate-in fade-in slide-in-from-bottom-4' : 'animate-in fade-in slide-in-from-top-4'
                        }`}
                    >
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F15F23]/10 transition duration-500 group-hover:scale-125" />
                        <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#56CCF2]/15 transition duration-500 group-hover:scale-125" />
                        <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0F60AC] shadow-sm ring-1 ring-slate-100 transition duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-[#0F60AC] group-hover:text-white">
                                    {index % 2 === 0 ? <Building2 className="h-7 w-7" /> : <Handshake className="h-7 w-7" />}
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#F15F23] shadow-sm">
                                    Partner
                                </span>
                            </div>
                            <div className="relative mt-8">
                                <h3 className="text-xl font-black text-[#1E293B]">
                                    {partner}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                                    Kolaborasi untuk memperluas akses, pendampingan, dan pengalaman olimpiade anak Indonesia.
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const getVisibleItems = <T,>(items: T[], startIndex: number, visibleCount: number) => {
    if (items.length <= visibleCount) {
        return items;
    }

    return Array.from({ length: visibleCount }).map((_, offset) => items[(startIndex + offset) % items.length]);
};



