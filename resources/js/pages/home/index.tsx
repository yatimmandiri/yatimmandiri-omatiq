import {
    CTASection,
    FeatureIcon,
    NewsCard,
    ProgramCard,
    SectionHeader,
    TestimonialCard,
} from '@/components/marketing/marketing-components';
import { SliderSection } from '@/components/sections/home/slider-section';
import { news, partners, programs, testimonials } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, HeartHandshake, Lightbulb, ShieldCheck } from 'lucide-react';

type HomeProps = {
    programs?: typeof programs;
    news?: typeof news;
    testimonials?: typeof testimonials;
    partners?: string[];
};

export default function HomePage() {
    const props = usePage<HomeProps>().props;
    const featuredPrograms = props.programs?.length ? props.programs : programs;
    const latestNews = props.news?.length ? props.news : news;
    const testimonialItems = props.testimonials?.length ? props.testimonials : testimonials;
    const partnerItems = props.partners?.length ? props.partners : partners;

    return (
        <>
            <SliderSection />

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <SectionHeader eyebrow="Featured Programs" title="Program belajar yang dibuat untuk tumbuh bersama" description="Setiap program dirancang ramah, praktis, dan dekat dengan kebutuhan komunitas modern." align="left" />
                        <Link href="/programs" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0F60AC] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0F60AC]/20 transition hover:-translate-y-1">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {featuredPrograms.slice(0, 3).map((program) => <ProgramCard key={program.id} program={program} />)}
                    </div>
                </div>
            </section>

            <section className="px-5 py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-4 rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-4 md:p-8">
                    {[
                        ['12K+', 'Participants'],
                        ['48+', 'Programs'],
                        ['120+', 'Communities'],
                        ['36+', 'Partners'],
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
                    <SectionHeader eyebrow="Why OMATIQ" title="Friendly by design, serious about impact" description="Kami menggabungkan pengalaman belajar yang playful dengan sistem yang tetap profesional dan terpercaya." />
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Lightbulb, color: 'orange' as const, title: 'Creative Learning', text: 'Modul interaktif yang mendorong ide, eksperimen, dan karya nyata.' },
                            { icon: HeartHandshake, color: 'mint' as const, title: 'Community First', text: 'Ruang belajar yang suportif, inklusif, dan dekat dengan kebutuhan peserta.' },
                            { icon: BookOpenCheck, color: 'blue' as const, title: 'Practical Outcomes', text: 'Setiap sesi diarahkan ke keterampilan, portofolio, dan aksi terukur.' },
                            { icon: ShieldCheck, color: 'purple' as const, title: 'Trusted System', text: 'Dikelola rapi oleh mentor, fasilitator, dan proses pembelajaran yang jelas.' },
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
                    <SectionHeader eyebrow="Latest News" title="Cerita terbaru dari ruang belajar OMATIQ" description="Ikuti update program, insight pendidikan, dan kisah komunitas yang sedang bergerak." />
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {latestNews.slice(0, 3).map((article, index) => <NewsCard key={article.id} article={article} featured={index === 0} />)}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Testimonials" title="Dipercaya oleh learner, mentor, dan komunitas" description="Pengalaman belajar yang hangat membuat peserta merasa berani mencoba dan terus berkembang." />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {testimonialItems.slice(0, 3).map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
                    </div>
                </div>
            </section>

            <section className="px-5 py-12 lg:px-8">
                <div className="mx-auto max-w-7xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100">
                    <p className="text-center text-sm font-black uppercase tracking-wide text-[#64748B]">Growing with partners and communities</p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        {partnerItems.map((partner) => (
                            <div key={partner} className="flex h-20 items-center justify-center rounded-3xl bg-[#F8FAFC] px-4 text-center text-sm font-black text-[#0F60AC]">
                                {partner}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection />
        </>
    );
}

