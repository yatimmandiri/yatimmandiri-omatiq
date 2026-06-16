import {
    EmptyState,
    LoadingState,
    NewsCard,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import { NewsItem, news } from '@/components/marketing/site-data';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

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

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            setFailed(false);

            const response = await axios.get<ExternalNewsPost[]>(NEWS_API_URL);
            const externalArticles = Array.isArray(response.data)
                ? response.data.map(mapExternalPost)
                : [];

            setArticles(externalArticles.length ? externalArticles : news);
        } catch (error) {
            console.error('Gagal mengambil artikel OMATIQ:', error);
            setArticles(news);
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const featured = articles[0];
    const latest = articles.slice(1);

    return (
        <>
            <section className="px-5 pt-28 pb-12 sm:pt-32 sm:pb-14 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Artikel & Kabar"
                        title="Cerita terbaru dari panggung OMATIQ"
                        description="Ikuti kabar olimpiade, wawasan pendidikan, dan cerita inspiratif anak Indonesia yang diperbarui langsung dari kanal berita OMATIQ."
                    />
                    {loading ? (
                        <div className="mt-8 sm:mt-12">
                            <LoadingState />
                        </div>
                    ) : featured ? (
                        <div className="mt-8 sm:mt-12">
                            <NewsCard article={featured} featured />
                        </div>
                    ) : (
                        <div className="mt-8 sm:mt-12">
                            <EmptyState
                                title="Artikel belum tersedia"
                                description="Kami belum menerima data artikel dari kanal berita OMATIQ."
                            />
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
                        <SectionHeader
                            eyebrow="Terbaru"
                            title="Artikel lainnya"
                            description="Kumpulan informasi dan cerita terbaru yang hadir dari sumber berita OMATIQ."
                            align="left"
                        />
                        <p className="shrink-0 text-sm font-bold text-[#64748B]">
                            {loading
                                ? 'Memuat artikel...'
                                : `${articles.length} artikel tersedia`}
                        </p>
                    </div>

                    {failed && (
                        <div className="mt-6 rounded-2xl bg-[#FFC857]/20 px-5 py-4 text-sm font-bold text-[#9A3412]">
                            Data API belum bisa diambil saat ini. Sementara
                            ditampilkan artikel cadangan OMATIQ.
                        </div>
                    )}

                    {loading ? (
                        <div className="mt-10">
                            <LoadingState />
                        </div>
                    ) : latest.length > 0 ? (
                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {latest.map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <EmptyState
                                title="Belum ada artikel lainnya"
                                description="Artikel terbaru akan tampil otomatis ketika tersedia dari sumber berita OMATIQ."
                            />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

const stripHtml = (value: string) => {
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
