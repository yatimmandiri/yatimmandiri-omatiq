import { EmptyState, NewsCard, SectionHeader } from '@/components/marketing/marketing-components';
import { news } from '@/components/marketing/site-data';
import { usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type NewsProps = {
    news?: typeof news | { data?: typeof news };
};

const normalizeNews = (value: NewsProps['news']) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value?.data && Array.isArray(value.data)) {
        return value.data;
    }

    return news;
};

export default function NewsPage() {
    const props = usePage<NewsProps>().props;
    const sourceNews = normalizeNews(props.news);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const categories = ['All', ...Array.from(new Set(sourceNews.map((item) => item.category)))];

    const articles = useMemo(() => {
        return sourceNews.filter((article) => {
            const matchesSearch = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'All' || article.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [category, search, sourceNews]);

    const featured = articles[0] ?? sourceNews[0];
    const latest = articles.slice(featured ? 1 : 0);

    return (
        <>
            <section className="px-5 py-16 md:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="News & Stories" title="Magazine belajar, komunitas, dan dampak" description="Baca cerita terbaru dari program OMATIQ, insight pendidikan, dan praktik baik dari komunitas." />
                    {featured && <div className="mt-12"><NewsCard article={featured} featured /></div>}
                </div>
            </section>

            <section className="bg-white px-5 py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_auto]">
                    <label className="relative block">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles..." className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-4 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-[#F15F23] focus:bg-white" />
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                        {categories.map((item) => (
                            <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black transition ${category === item ? 'bg-[#F15F23] text-white shadow-lg shadow-[#F15F23]/20' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#0F60AC]/10 hover:text-[#0F60AC]'}`}>
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Latest Articles" title="Tulisan terbaru" align="left" />
                    {latest.length > 0 ? (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {latest.map((article) => <NewsCard key={article.id} article={article} />)}
                        </div>
                    ) : (
                        <div className="mt-8"><EmptyState title="Artikel tidak ditemukan" description="Coba gunakan kata kunci lain atau pilih kategori berbeda." /></div>
                    )}
                </div>
            </section>
        </>
    );
}
