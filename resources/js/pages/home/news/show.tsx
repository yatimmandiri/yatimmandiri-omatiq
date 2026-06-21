import {
    CTASection,
    NewsCard,
} from '@/components/marketing/marketing-components';
import { NewsItem, news } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Globe2, Link2, Mail, Share2 } from 'lucide-react';

type NewsDetailProps = {
    article?: NewsItem;
    news?: NewsItem;
    relatedArticles?: NewsItem[];
};

export default function NewsDetailPage() {
    const props = usePage<NewsDetailProps>().props;
    const article = props.article ?? props.news ?? news[0];
    const relatedArticles = props.relatedArticles?.length
        ? props.relatedArticles
        : news.filter((item) => item.id !== article.id).slice(0, 3);

    return (
        <>
            <article>
                <section className="px-5 pt-28 pb-12 sm:pt-32 md:pb-20 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <Link
                            href="/berita"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0F60AC] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to News
                        </Link>
                        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-black tracking-wide uppercase">
                            <span className="rounded-full bg-[#F15F23]/10 px-3 py-1 text-[#F15F23]">
                                {article.category}
                            </span>
                            <span className="text-[#64748B]">
                                {article.date}
                            </span>
                            <span className="text-[#64748B]">
                                {article.readTime}
                            </span>
                        </div>
                        <h1 className="mt-5 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:text-6xl">
                            {article.title}
                        </h1>
                        <p className="mt-5 text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                            {article.excerpt}
                        </p>
                        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-bold text-[#64748B]">
                                    Written by
                                </p>
                                <p className="font-black text-[#1E293B]">
                                    {article.author}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {[Share2, Globe2, Mail, Link2].map(
                                    (Icon, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#0F60AC] transition hover:bg-[#0F60AC] hover:text-white"
                                            aria-label="Share article"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-5 pb-16 lg:px-8">
                    <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:rounded-[32px]">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="h-64 w-full object-cover sm:h-96 lg:h-[520px]"
                        />
                    </div>
                </section>

                <section className="bg-white px-5 py-16 lg:px-8">
                    <div className="prose prose-slate prose-headings:font-black prose-p:text-[#64748B] prose-p:leading-8 mx-auto max-w-3xl">
                        <p>
                            OMATIQ percaya bahwa pendidikan yang baik tidak
                            berhenti pada materi. Pengalaman belajar perlu
                            terasa manusiawi, interaktif, dan dekat dengan
                            kebutuhan peserta. Karena itu setiap olimpiade
                            dirancang dengan perpaduan konten, komunitas, dan
                            pendampingan.
                        </p>
                        <h2>Membangun pengalaman belajar yang lebih hidup</h2>
                        <p>
                            Dalam setiap sesi, peserta diajak memahami konsep,
                            mencoba secara langsung, berdiskusi dengan mentor,
                            lalu menutup proses dengan refleksi atau karya. Pola
                            ini membantu pembelajaran terasa lebih relevan dan
                            mudah dibawa ke kehidupan sehari-hari.
                        </p>
                        <h2>Komunitas sebagai ruang tumbuh</h2>
                        <p>
                            Komunitas memberi dukungan yang sering kali tidak
                            ditemukan dalam kelas biasa. Peserta bisa saling
                            melihat proses, bertukar ide, dan merayakan progres
                            kecil yang membuat mereka terus bergerak.
                        </p>
                        <blockquote>
                            Belajar menjadi lebih kuat ketika peserta merasa
                            ditemani, dipercaya, dan diberi ruang untuk mencoba.
                        </blockquote>
                        <p>
                            Ke depan, OMATIQ akan terus membuka ruang kolaborasi
                            dengan sekolah, komunitas, mentor, dan mitra yang
                            memiliki visi serupa: membuat pendidikan lebih
                            kreatif, ramah, dan berdampak.
                        </p>
                    </div>
                </section>
            </article>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-2xl font-black text-[#1E293B] sm:text-3xl md:text-5xl">
                        Related Articles
                    </h2>
                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {relatedArticles.map((item) => (
                            <NewsCard key={item.id} article={item} />
                        ))}
                    </div>
                </div>
            </section>

            <CTASection title="Punya cerita komunitas yang ingin dikembangkan?" />
        </>
    );
}
