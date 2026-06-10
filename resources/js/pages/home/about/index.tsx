import { CTASection, FeatureIcon, SectionHeader } from '@/components/marketing/marketing-components';
import { Link } from '@inertiajs/react';
import { ArrowRight, Compass, Flag, Heart, Layers3, Rocket, Sparkles, Target, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const timeline = [
    { year: '2023', text: 'OMATIQ dimulai sebagai ruang kecil untuk belajar kreatif lintas komunitas.' },
    { year: '2024', text: 'Program mentor dan kelas digital pertama berjalan bersama sekolah dan komunitas lokal.' },
    { year: '2025', text: 'Ekosistem program berkembang dengan kurikulum, fasilitator, dan kolaborasi lintas kota.' },
    { year: '2026', text: 'OMATIQ memperluas dampak melalui learning lab, community academy, dan kemitraan strategis.' },
];

const values: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: Heart, title: 'Empathy', text: 'Mendengar kebutuhan peserta dan komunitas dengan sungguh-sungguh.' },
    { icon: Sparkles, title: 'Creativity', text: 'Membuat belajar terasa segar, visual, dan mudah diikuti.' },
    { icon: Users, title: 'Collaboration', text: 'Membangun dampak lewat kemitraan dan aksi bersama.' },
    { icon: Compass, title: 'Growth', text: 'Mengukur progres dan terus memperbaiki pengalaman belajar.' },
];

const team = [
    { name: 'Alya Rahmani', role: 'Learning Experience Lead', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80' },
    { name: 'Dimas Pratama', role: 'Community Partnership', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80' },
    { name: 'Maya Lestari', role: 'Creative Program Designer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80' },
];

export default function AboutPage() {
    return (
        <>
            <section className="px-5 py-16 md:py-24 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                    <div>
                        <span className="inline-flex rounded-full bg-[#0F60AC]/10 px-4 py-2 text-sm font-black text-[#0F60AC]">About OMATIQ</span>
                        <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#1E293B] md:text-6xl">Kami percaya belajar harus terasa dekat, berani, dan menyenangkan.</h1>
                        <p className="mt-6 text-lg leading-8 text-[#64748B]">OMATIQ adalah organisasi pendidikan dan komunitas yang merancang pengalaman belajar modern untuk membantu peserta menemukan potensi, membangun karya, dan bergerak bersama komunitasnya.</p>
                        <Link href="/programs" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-1">
                            Explore Programs
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" alt="Students learning together" className="h-72 w-full rounded-3xl object-cover shadow-xl" />
                        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" alt="Mentors planning a community class" className="mt-12 h-72 w-full rounded-3xl object-cover shadow-xl" />
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader eyebrow="Our Story" title="Dibangun dari energi komunitas" description="Kami melihat banyak pelajar dan komunitas punya semangat besar, tetapi membutuhkan struktur, mentor, dan ruang aman untuk mencoba. Dari sana OMATIQ hadir." align="left" />
                    <div className="rounded-[32px] bg-[#F8FAFC] p-8 text-base leading-8 text-[#64748B]">
                        <p>OMATIQ menggabungkan pendekatan kreatif, pembelajaran berbasis proyek, dan dukungan komunitas. Kami tidak hanya membuat kelas, kami merancang perjalanan belajar yang membuat peserta merasa mampu, terhubung, dan siap menciptakan dampak.</p>
                        <p className="mt-5">Setiap program dibangun bersama mentor, pengajar, dan mitra komunitas agar kontennya relevan dengan kebutuhan nyata di lapangan.</p>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-[#0F60AC] p-8 text-white shadow-xl shadow-[#0F60AC]/20">
                        <FeatureIcon icon={Target} color="orange" />
                        <h2 className="mt-6 text-3xl font-black">Vision</h2>
                        <p className="mt-4 leading-8 text-white/80">Menjadi ekosistem belajar dan komunitas yang menginspirasi generasi kreatif, mandiri, dan berdampak.</p>
                    </div>
                    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                        <FeatureIcon icon={Flag} color="blue" />
                        <h2 className="mt-6 text-3xl font-black text-[#1E293B]">Mission</h2>
                        <p className="mt-4 leading-8 text-[#64748B]">Menyediakan program belajar yang inklusif, praktis, menyenangkan, dan terhubung dengan kebutuhan komunitas serta dunia masa depan.</p>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Core Values" title="Nilai yang menjaga cara kami bergerak" />
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {values.map((item) => (
                            <div key={item.title} className="rounded-3xl bg-[#F8FAFC] p-6">
                                <FeatureIcon icon={item.icon} color="orange" />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Journey" title="Perjalanan OMATIQ" />
                    <div className="mt-10 grid gap-4 md:grid-cols-4">
                        {timeline.map((item) => (
                            <div key={item.year} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <p className="text-4xl font-black text-[#F15F23]">{item.year}</p>
                                <p className="mt-4 text-sm leading-7 text-[#64748B]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Team" title="Orang-orang di balik pengalaman belajar" />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {team.map((member) => (
                            <div key={member.name} className="overflow-hidden rounded-3xl bg-[#F8FAFC] shadow-sm ring-1 ring-slate-100">
                                <img src={member.image} alt={member.name} className="h-80 w-full object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-[#1E293B]">{member.name}</h3>
                                    <p className="mt-1 text-sm font-bold text-[#64748B]">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <SectionHeader eyebrow="Structure" title="Struktur yang ringan, kolaboratif, dan fokus dampak" description="OMATIQ bergerak melalui tim program, mentor, komunitas, dan kemitraan yang saling terhubung." align="left" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {['Executive Lead', 'Learning Experience', 'Community Partnership', 'Creative Production'].map((item) => (
                            <div key={item} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <FeatureIcon icon={Layers3} color="blue" />
                                <p className="mt-5 text-lg font-black text-[#1E293B]">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Gallery" title="Momen belajar yang terasa hidup" />
                    <div className="mt-10 grid gap-4 md:grid-cols-4">
                        {[
                            'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=700&q=80',
                            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80',
                            'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80',
                            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80',
                        ].map((image, index) => (
                            <img key={image} src={image} alt={`OMATIQ gallery ${index + 1}`} className="h-64 w-full rounded-3xl object-cover shadow-sm" />
                        ))}
                    </div>
                </div>
            </section>

            <CTASection title="Mari bangun ruang belajar yang lebih berani." />
        </>
    );
}
