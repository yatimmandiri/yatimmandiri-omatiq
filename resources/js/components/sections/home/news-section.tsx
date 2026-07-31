import { NewsCard, SectionHeader } from "@/components/marketing/marketing-components"
import type { NewsItem } from "@/components/marketing/site-data";

export const NewsSection = ({ data, newsLoading }: { data: NewsItem[]; newsLoading: boolean }) => {

    return (
        <section className="bg-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Latest News"
                    title="Kabar terbaru dari OMATIQ"
                    description="Ikuti update olimpiade, informasi olimpiade, dan cerita perjalanan peserta dari berbagai daerah."
                />
                {newsLoading ? (
                    <div className="mt-10 space-y-6">
                        <div className="h-96 animate-pulse rounded-[28px] bg-slate-100" />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="h-64 animate-pulse rounded-[28px] bg-slate-100" />
                            <div className="h-64 animate-pulse rounded-[28px] bg-slate-100" />
                        </div>
                    </div>
                ) : (
                    <div className="mt-10 space-y-6">
                        {data[0] && (
                            <NewsCard article={data[0]} featured />
                        )}
                        <div className="grid min-w-0 gap-6 md:grid-cols-2">
                            {data.slice(1, 3).map((article) => (
                                <NewsCard
                                    key={article.id}
                                    article={article}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}