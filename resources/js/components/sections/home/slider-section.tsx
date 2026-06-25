import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, PlayCircle, X } from 'lucide-react';
import { PointerEvent, useEffect, useMemo, useState } from 'react';

type SliderItem = {
    title: string;
    subtitle: string;
    featured_image?: string | null;
    url?: string | null;
    video_url?: string | null;
    badge?: string;
};

type HeroStats = {
    participants?: number;
    activeOlimpiade?: number;
    communities?: number;
    partners?: number;
};

const fallbackSliders: SliderItem[] = [
    {
        title: 'Olimpiade nasional untuk generasi cerdas dan berakhlak.',
        subtitle:
            'OMATIQ menjadi ruang kompetisi nasional untuk anak-anak Indonesia dalam bidang Al-Quran dan Matematika, dengan pengalaman lomba yang seru, terarah, dan inspiratif.',
        featured_image:
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80',
        url: '/olimpiade',
        video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        badge: 'Olimpiade Nasional Anak Indonesia',
    },
    {
        title: 'Mulai dari tajwid, cara baca, sampai logika matematika.',
        subtitle:
            'Cabang awal OMATIQ fokus pada Olimpiade Al-Quran dan Olimpiade Matematika, lalu akan berkembang ke bidang lain di masa depan.',
        featured_image:
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80',
        url: '/olimpiade',
        video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        badge: 'Al-Quran & Matematika',
    },
    {
        title: 'Ajang prestasi untuk anak-anak dari seluruh Indonesia.',
        subtitle:
            'OMATIQ dirancang agar sekolah, orang tua, guru, dan peserta dapat mengikuti perjalanan lomba dengan mudah dan penuh semangat.',
        featured_image:
            'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=80',
        url: '/kontak',
        video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        badge: 'Dari Daerah Menuju Nasional',
    },
];

export const SliderSection = () => {
    const { sliders, heroStats } = usePage<any>().props;
    const sliderItems = useMemo(
        () => (Array.isArray(sliders) ? sliders : fallbackSliders),
        [sliders],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedSlider, setSelectedSlider] = useState<SliderItem | null>(
        null,
    );
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    useEffect(() => {
        if (sliderItems.length === 0) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % sliderItems.length);
        }, 5500);

        return () => window.clearInterval(interval);
    }, [sliderItems.length]);

    const selectedVideoUrl = selectedSlider
        ? getVideoEmbedUrl(selectedSlider.video_url)
        : null;

    const moveSlide = (direction: 1 | -1) => {
        setActiveIndex(
            (current) =>
                (current + direction + sliderItems.length) % sliderItems.length,
        );
    };

    const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
        setTouchStartX(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
        if (touchStartX === null) {
            return;
        }

        const diff = event.clientX - touchStartX;
        setTouchStartX(null);

        if (Math.abs(diff) < 45) {
            return;
        }

        moveSlide(diff < 0 ? 1 : -1);
    };

    if (sliderItems.length === 0) {
        return null;
    }

    return (
        <section
            className="relative touch-pan-y overflow-hidden bg-slate-950"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="relative min-h-[720px] overflow-hidden sm:min-h-180 lg:h-195">
                {sliderItems.map((item: SliderItem, index: number) => (
                    <SliderItemSection
                        key={`${item.title}-${index}`}
                        item={item}
                        index={index}
                        active={index === activeIndex}
                        stats={heroStats ?? {}}
                        onPlayVideo={setSelectedSlider}
                    />
                ))}
            </div>

            {selectedVideoUrl && selectedSlider && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-xl font-black sm:text-2xl">
                                    {selectedSlider.title}
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/70">
                                    {selectedSlider.subtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSlider(null)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                                aria-label="Close video"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            <iframe
                                src={selectedVideoUrl}
                                title={selectedSlider.title}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

const SliderItemSection = ({
    item,
    index,
    active,
    stats,
    onPlayVideo,
}: {
    item: SliderItem;
    index: number;
    active: boolean;
    stats: HeroStats;
    onPlayVideo: (item: SliderItem) => void;
}) => {
    const featuredImage = getStorageImage(
        item.featured_image,
        fallbackSliders[index % fallbackSliders.length].featured_image || '',
    );
    const hasVideo = Boolean(getVideoEmbedUrl(item.video_url));

    return (
        <div
            className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${
                active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
            <img
                src={featuredImage}
                alt={item.title}
                className={`absolute inset-0 h-full w-full object-cover transition duration-[6500ms] ${
                    active ? 'scale-105' : 'scale-100'
                }`}
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/25" />
            <div className="absolute top-0 -left-20 h-72 w-72 rounded-full bg-[#F15F23]/25 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#56CCF2]/15 blur-3xl" />

            <div className="relative z-10 flex min-h-[720px] items-center sm:min-h-180 lg:h-195">
                <div className="mx-auto w-full max-w-7xl px-5 pt-24 pb-8 sm:px-6 sm:pb-0 lg:px-8">
                    <div className="max-w-3xl text-white">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md sm:mb-6 sm:px-5 sm:text-sm">
                            <span className="h-2 w-2 rounded-full bg-[#5DD39E]" />
                            {item.badge || 'OMATIQ National Olympiad'}
                        </div>
                        <h1 className="text-3xl leading-tight font-black sm:text-4xl md:text-5xl lg:text-6xl">
                            {item.title}
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-200 sm:mt-6 sm:text-base lg:text-xl">
                            {item.subtitle}
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                            <Link
                                href={item.url || '/olimpiade'}
                                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F15F23] px-5 py-3 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:scale-[1.02] hover:bg-[#d94f18] sm:w-auto sm:px-6 sm:py-4 sm:text-base"
                            >
                                <span>Lihat Olimpiade</span>
                                <ArrowRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </Link>
                            <button
                                type="button"
                                onClick={() => onPlayVideo(item)}
                                disabled={!hasVideo}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 sm:py-4 sm:text-base"
                            >
                                <PlayCircle size={20} />
                                Video Olimpiade
                            </button>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
                            {getHeroStats(stats).map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md sm:p-4"
                                >
                                    <h3 className="text-2xl font-bold sm:text-3xl">
                                        {formatStatNumber(stat.value)}
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-200 sm:text-sm">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getHeroStats = (stats: HeroStats) => [
    { label: 'Peserta Belajar', value: stats.participants ?? 12000 },
    { label: 'Cabang Olimpiade', value: stats.activeOlimpiade ?? 2 },
    { label: 'Komunitas', value: stats.communities ?? 120 },
    { label: 'Mitra Kolaborasi', value: stats.partners ?? 36 },
];

const formatStatNumber = (value: number) => {
    if (value >= 1000) {
        const formatted = value / 1000;

        return `${Number.isInteger(formatted) ? formatted : formatted.toFixed(1)}K`;
    }

    return value.toLocaleString('id-ID');
};

const getStorageImage = (path: string | null | undefined, fallback: string) => {
    if (!path) {
        return fallback;
    }

    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
};

const getVideoEmbedUrl = (url: string | null | undefined) => {
    if (!url) {
        return null;
    }

    if (url.includes('/embed/')) {
        return url;
    }

    const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/,
    );

    if (youtubeMatch?.[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }

    return url;
};
