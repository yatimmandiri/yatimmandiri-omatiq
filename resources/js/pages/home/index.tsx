import { CTASection, SectionHeader } from '@/components/marketing/marketing-components';
import { SliderSection } from '@/components/sections/home/slider-section';
import type { NewsItem } from '@/components/marketing/site-data';
import { partners } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ReviewSection } from '@/components/sections/home/review-section';
import { TestimonialSection } from '@/components/sections/home/testimonial-section';
import { PartnerSection } from '@/components/sections/home/partner-section';
import { NewsSection } from '@/components/sections/home/news-section';
import { AboutSection } from '@/components/sections/home/about-section';

const NEWS_API_URL =
    'https://yatimmandiri.org/news/wp-json/ymapi/v2/posts?categories=557';

type ExternalNewsPost = {
    id: number;
    date?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    author?: {
        name?: string;
    };
    featured_image?: {
        medium?: string;
    };
    link?: string;
};

export default function HomePage() {
    const { reviews, testimonials, olimpiade } = usePage<any>().props;

    const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchLatestNews = async () => {
            try {
                setNewsLoading(true);
                const response =
                    await axios.get<ExternalNewsPost[]>(NEWS_API_URL);
                const mappedNews = Array.isArray(response.data)
                    ? response.data.map(mapExternalPost)
                    : [];

                if (isMounted && mappedNews.length) {
                    setLatestNews(mappedNews);
                }
            } catch (error) {
                console.error('Gagal mengambil artikel OMATIQ:', error);
            } finally {
                if (isMounted) {
                    setNewsLoading(false);
                }
            }
        };

        fetchLatestNews();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            <SliderSection />

            <AboutSection />

            <CTASection
                title="Daftarkan anak untuk tampil di panggung OMATIQ"
                description="Ajak anak mengikuti olimpiade nasional yang mengasah kemampuan Al-Qur'an, Matematika, keberanian, dan semangat berprestasi sejak dini."
            />

            {/* Olimpiade view */}
            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Olimpiade"
                        title="Olimpiade OMATIQ"
                        description="Olimpiade OMATIQ membantu anak membangun akhlak, ketelitian, logika, dan percaya diri dalam proses belajar."
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {olimpiade.slice(0, 2).map((item: any) => (
                            <Link
                                key={item.title}
                                href={`/olimpiade/${item.slug}`}
                                className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="h-56 overflow-hidden sm:h-64">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 sm:p-6">
                                    <h3 className="text-xl font-black text-[#1E293B]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                        {item.description}
                                    </p>
                                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#F15F23]">
                                        Detail Olimpiade
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <NewsSection data={latestNews} newsLoading={newsLoading} />

            {reviews.length > 0 && (
                <ReviewSection data={reviews} />
            )}

            {testimonials.length > 0 && (
                <TestimonialSection data={testimonials} />
            )}

            <PartnerSection data={partners} />
        </>
    );
}

const mapExternalPost = (post: ExternalNewsPost): NewsItem => {
    const excerpt = stripHtml(post.excerpt || '');

    return {
        id: post.id,
        title: stripHtml(post.title || 'Artikel OMATIQ'),
        slug: post.slug || String(post.id),
        category: 'OMATIQ',
        date: post.date || '',
        excerpt,
        image:
            post.featured_image?.medium ||
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        author: post.author?.name || 'Yatim Mandiri',
        readTime: `${Math.max(3, Math.ceil(excerpt.split(/\s+/).length / 180))} min read`,
        link: post.link,
    };
};

const stripHtml = (value: string) => {
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
