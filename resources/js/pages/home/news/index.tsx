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
const BLOG_API_URL = 'https://yatimmandiri.org/blog/wp-json/ymapi/v2/posts';

type ExternalNewsPost = {
    id: number;
    date?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    author?:
    | {
        name?: string;
    }
    | string;
    categories?: Array<{
        name?: string;
    }>;
    featured_image?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
        full?: string;
    };
    link?: string;
};

const mapExternalPost = (
    post: ExternalNewsPost,
    fallbackCategory = 'OMATIQ',
): NewsItem => {
    const excerpt = stripHtml(post.excerpt || '');
    const author =
        typeof post.author === 'string'
            ? post.author
            : post.author?.name || 'Yatim Mandiri';

    return {
        id: post.id,
        title: stripHtml(post.title || 'Artikel OMATIQ'),
        slug: post.slug || String(post.id),
        category: post.categories?.[0]?.name || fallbackCategory,
        date: post.date || '',
        excerpt,
        image:
            post.featured_image?.large ||
            post.featured_image?.medium ||
            post.featured_image?.full ||
            post.featured_image?.thumbnail ||
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        author,
        readTime: `${Math.max(3, Math.ceil(excerpt.split(/\s+/).length / 180))} min read`,
        link: post.link,
    };
};

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsItem[]>([]);
    const [blogs, setBlogs] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [blogLoading, setBlogLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [blogFailed, setBlogFailed] = useState(false);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            setFailed(false);

            const response = await axios.get<ExternalNewsPost[]>(NEWS_API_URL);
            const externalArticles = Array.isArray(response.data)
                ? response.data.map((post) => mapExternalPost(post))
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

    const fetchBlogs = useCallback(async () => {
        try {
            setBlogLoading(true);
            setBlogFailed(false);

            const response = await axios.get<ExternalNewsPost[]>(BLOG_API_URL);
            const externalBlogs = Array.isArray(response.data)
                ? response.data.map((post) => mapExternalPost(post, 'Blog'))
                : [];

            setBlogs(externalBlogs);
        } catch (error) {
            console.error('Gagal mengambil blog Yatim Mandiri:', error);
            setBlogs([]);
            setBlogFailed(true);
        } finally {
            setBlogLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
        fetchBlogs();
    }, [fetchArticles, fetchBlogs]);

    const featured = articles[0];
    const latest = articles.slice(1);
    const featuredBlog = blogs[0];
    const latestBlogs = blogs.slice(1, 7);

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
                            {latest.slice(0, 3).map((article) => (
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

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
                        <SectionHeader
                            eyebrow="Blog"
                            title="Inspirasi dan wawasan pilihan"
                            description="Baca artikel edukatif, inspirasi kebaikan, dan wawasan keluarga dari kanal Blog Yatim Mandiri."
                            align="left"
                        />
                    </div>

                    {blogFailed && (
                        <div className="mt-6 rounded-2xl bg-[#FFC857]/20 px-5 py-4 text-sm font-bold text-[#9A3412]">
                            Data blog belum bisa diambil saat ini. Silakan coba
                            refresh halaman beberapa saat lagi.
                        </div>
                    )}

                    {blogLoading ? (
                        <div className="mt-10">
                            <LoadingState />
                        </div>
                    ) : featuredBlog ? (
                        <div className="mt-10 space-y-6">
                            <NewsCard article={featuredBlog} featured />
                            {latestBlogs.length > 0 && (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {latestBlogs.slice(0, 3).map((blog) => (
                                        <NewsCard
                                            key={blog.id}
                                            article={blog}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <EmptyState
                                title="Blog belum tersedia"
                                description="Kami belum menerima data dari kanal Blog Yatim Mandiri."
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
