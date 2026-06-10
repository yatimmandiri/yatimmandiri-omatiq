import { CTASection, FeatureIcon, ProgramCard, SectionHeader } from '@/components/marketing/marketing-components';
import { ProgramItem, programs } from '@/components/marketing/site-data';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Compass, GalleryHorizontalEnd, Goal, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ProgramDetailProps = {
    program?: ProgramItem;
    relatedPrograms?: ProgramItem[];
};

const objectives: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: Goal, title: 'Build real skills', text: 'Peserta memahami konsep dan langsung menerapkannya dalam project.' },
    { icon: Compass, title: 'Grow confidence', text: 'Peserta berani mencoba, mempresentasikan ide, dan menerima umpan balik.' },
    { icon: Sparkles, title: 'Create portfolio', text: 'Setiap peserta membawa hasil karya atau rencana aksi yang bisa dikembangkan.' },
];

export default function ProgramDetailPage() {
    const props = usePage<ProgramDetailProps>().props;
    const program = props.program ?? programs[0];
    const relatedPrograms = props.relatedPrograms?.length ? props.relatedPrograms : programs.filter((item) => item.id !== program.id).slice(0, 3);

    return (
        <>
            <section className="px-5 py-12 md:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Link href="/programs" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0F60AC] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Programs
                    </Link>
                    <div className="mt-8 grid overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-[#0F60AC]/10 ring-1 ring-slate-100 lg:grid-cols-[1fr_0.9fr]">
                        <div className="p-8 md:p-12">
                            <span className="inline-flex rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">{program.category}</span>
                            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#1E293B] md:text-6xl">{program.title}</h1>
                            <p className="mt-6 text-lg leading-8 text-[#64748B]">{program.description}</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <span className="rounded-xl bg-[#0F60AC]/10 px-4 py-3 text-sm font-black text-[#0F60AC]">{program.duration}</span>
                                <span className="rounded-xl bg-[#5DD39E]/15 px-4 py-3 text-sm font-black text-[#12885b]">{program.level}</span>
                            </div>
                        </div>
                        <img src={program.image} alt={program.title} className="h-full min-h-96 w-full object-cover" />
                    </div>
                </div>
            </section>

            <section className="px-5 py-12 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader eyebrow="Overview" title="Apa yang akan kamu alami?" description="Program ini menggabungkan sesi eksplorasi, praktik, mentoring, dan showcase agar peserta pulang membawa progres nyata." align="left" />
                    <div className="grid gap-4 md:grid-cols-3">
                        {program.benefits.map((benefit) => (
                            <div key={benefit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <FeatureIcon icon={CheckCircle2} color="orange" />
                                <p className="mt-5 font-black text-[#1E293B]">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Objectives" title="Tujuan pembelajaran" />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {objectives.map((item) => (
                            <div key={item.title} className="rounded-3xl bg-[#F8FAFC] p-6">
                                <FeatureIcon icon={item.icon} color="blue" />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Gallery" title="Suasana program" />
                    <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                        {[program.image, 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80'].map((image, index) => (
                            <div key={image} className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                                <img src={image} alt={`Program gallery ${index + 1}`} className="h-80 w-full object-cover" />
                                {index === 0 && <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#0F60AC]"><GalleryHorizontalEnd className="h-4 w-4" /> Featured</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Related Programs" title="Program lain yang mungkin cocok" />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {relatedPrograms.map((item) => <ProgramCard key={item.id} program={item} />)}
                    </div>
                </div>
            </section>

            <CTASection title={`Daftar minat untuk ${program.title}`} description="Kirim pesan ke tim OMATIQ dan kami akan bantu arahkan program terbaik untuk kebutuhanmu." />
        </>
    );
}
