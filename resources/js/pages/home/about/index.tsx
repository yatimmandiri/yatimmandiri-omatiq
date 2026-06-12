import { CTASection, FeatureIcon, SectionHeader } from '@/components/marketing/marketing-components';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    Brain,
    Calculator,
    Compass,
    Flag,
    Heart,
    MapPin,
    Medal,
    Sparkles,
    Target,
    Trophy,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const timeline = [
    {
        year: '2024',
        theme: 'Membangun Gagasan',
        title: 'OMATIQ mulai dirancang sebagai ajang olimpiade anak',
        text: "Fokus awal diarahkan pada kebutuhan anak-anak Indonesia untuk punya ruang kompetisi yang ramah, terarah, dan dekat dengan nilai pendidikan.",
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    },
    {
        year: '2025',
        theme: 'Tajwid, Logika, dan Percaya Diri',
        title: "Cabang Al-Qur'an dan Matematika dipersiapkan",
        text: "OMATIQ mematangkan konsep lomba Al-Qur'an melalui tajwid dan cara baca, serta Matematika untuk melatih nalar, ketelitian, dan keberanian anak.",
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
    },
    {
        year: '2026',
        theme: 'Berani Tampil Nasional',
        title: 'Musim olimpiade nasional OMATIQ',
        text: 'OMATIQ bergerak untuk mempertemukan peserta dari berbagai daerah, sekolah, TPQ, guru pendamping, orang tua, dan mitra pendidikan dalam satu panggung nasional.',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
    },
    {
        year: '2027',
        theme: 'Cabang Baru, Dampak Lebih Luas',
        title: 'Pengembangan bidang olimpiade berikutnya',
        text: 'Setelah fondasi Al-Qur\'an dan Matematika kuat, OMATIQ disiapkan untuk menambah cabang lomba baru agar semakin banyak potensi anak yang bisa tumbuh.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    },
];

const values: Array<{ icon: LucideIcon; title: string; text: string; color: 'orange' | 'blue' | 'mint' | 'purple' }> = [
    { icon: Heart, title: 'Ramah untuk Anak', text: 'Kompetisi dibuat menantang tanpa kehilangan rasa aman, hangat, dan menyenangkan.', color: 'orange' },
    { icon: BookOpenCheck, title: "Cinta Al-Qur'an", text: "Mendorong anak memahami tajwid, memperbaiki cara baca, dan bangga belajar Al-Qur'an.", color: 'mint' },
    { icon: Brain, title: 'Berani Bernalar', text: 'Matematika menjadi ruang untuk melatih logika, strategi, ketelitian, dan percaya diri.', color: 'blue' },
    { icon: Users, title: 'Kolaborasi Nasional', text: 'Menghubungkan sekolah, TPQ, orang tua, guru, dan mitra daerah untuk mendukung peserta.', color: 'purple' },
];

const focusItems = [
    { icon: BookOpenCheck, title: "Olimpiade Al-Qur'an", text: 'Soal tajwid, ketepatan cara baca, adab belajar, dan keberanian tampil.' },
    { icon: Calculator, title: 'Olimpiade Matematika', text: 'Logika dasar, problem solving, strategi soal, dan latihan ketelitian.' },
    { icon: Trophy, title: 'Panggung Nasional', text: 'Pengalaman lomba berskala nasional untuk anak-anak dari berbagai daerah.' },
];

export default function AboutPage() {
    return (
        <>
            <section className="relative overflow-hidden px-5 py-16 md:py-24 lg:px-8">
                <div className="absolute left-0 top-10 h-40 w-40 rounded-[48px] bg-[#FFC857]/25 blur-3xl" />
                <div className="absolute bottom-10 right-0 h-48 w-48 rounded-[56px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#0F60AC]/10 px-4 py-2 text-sm font-black text-[#0F60AC]">
                            <Sparkles className="h-4 w-4" />
                            Tentang OMATIQ
                        </span>
                        <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#1E293B] md:text-6xl">
                            Olimpiade nasional untuk anak Indonesia yang cerdas, berani, dan berakhlak.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-[#64748B]">
                            OMATIQ adalah ajang olimpiade berbasis nasional untuk anak-anak Indonesia. Pada tahap awal, OMATIQ berfokus pada dua cabang utama: Al-Qur'an melalui tajwid dan cara baca, serta Matematika untuk melatih logika, ketelitian, dan keberanian bernalar.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/programs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-1">
                                Lihat Cabang Olimpiade
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/kontak" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:bg-[#0F60AC]/5">
                                Daftarkan Anak
                                <Medal className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80" alt="Anak belajar Al-Qur'an untuk persiapan olimpiade" className="h-72 w-full rounded-3xl object-cover shadow-xl" />
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <p className="text-4xl font-black text-[#F15F23]">34+</p>
                                <p className="mt-2 text-sm font-bold text-[#64748B]">Provinsi sasaran peserta</p>
                            </div>
                        </div>
                        <div className="mt-12 space-y-4">
                            <div className="rounded-3xl bg-[#0F60AC] p-6 text-white shadow-xl shadow-[#0F60AC]/20">
                                <FeatureIcon icon={Trophy} color="orange" />
                                <p className="mt-5 text-2xl font-black">OMATIQ 2026</p>
                                <p className="mt-2 text-sm leading-7 text-white/75">Panggung nasional untuk anak yang siap berprestasi.</p>
                            </div>
                            <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80" alt="Latihan matematika untuk olimpiade" className="h-72 w-full rounded-3xl object-cover shadow-xl" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader eyebrow="Our Story" title="Dari semangat belajar menuju panggung nasional" description="OMATIQ hadir karena banyak anak punya potensi besar, tetapi membutuhkan ruang lomba yang tertata, positif, dan mudah diakses dari berbagai daerah." align="left" />
                    <div className="rounded-[32px] bg-[#F8FAFC] p-8 text-base leading-8 text-[#64748B]">
                        <p>
                            Kami percaya olimpiade bukan hanya soal menang. Untuk anak-anak, olimpiade adalah pengalaman berani mencoba, disiplin berlatih, belajar dari tantangan, dan merasakan kebanggaan ketika tampil membawa usaha terbaiknya.
                        </p>
                        <p className="mt-5">
                            Karena itu OMATIQ dibangun dengan pendekatan yang ramah untuk anak, jelas untuk orang tua, mudah didampingi guru, dan terbuka untuk kerja sama sekolah, TPQ, komunitas pendidikan, serta mitra daerah.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-[#0F60AC] p-8 text-white shadow-xl shadow-[#0F60AC]/20">
                        <FeatureIcon icon={Target} color="orange" />
                        <h2 className="mt-6 text-3xl font-black">Vision</h2>
                        <p className="mt-4 leading-8 text-white/80">
                            Menjadi olimpiade nasional yang menginspirasi anak Indonesia untuk mencintai Al-Qur'an, berani bernalar, dan tumbuh sebagai generasi berprestasi serta berakhlak.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                        <FeatureIcon icon={Flag} color="blue" />
                        <h2 className="mt-6 text-3xl font-black text-[#1E293B]">Mission</h2>
                        <p className="mt-4 leading-8 text-[#64748B]">
                            Menyelenggarakan olimpiade Al-Qur'an dan Matematika yang terarah, menyenangkan, transparan, serta mampu melibatkan sekolah, TPQ, orang tua, guru, dan mitra pendidikan dari berbagai wilayah.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader eyebrow="Fokus Olimpiade" title="Dua cabang awal, satu tujuan besar" description="OMATIQ dimulai dari bidang yang dekat dengan pembentukan akhlak dan daya pikir anak." />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {focusItems.map((item) => (
                            <div key={item.title} className="group rounded-3xl bg-[#F8FAFC] p-6 transition hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#0F60AC]/10">
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
                    <SectionHeader eyebrow="Core Values" title="Nilai yang menjaga pengalaman OMATIQ" />
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {values.map((item) => (
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
                    <SectionHeader eyebrow="Journey" title="Tema perjalanan OMATIQ dari tahun ke tahun" description="Setiap musim OMATIQ dapat membawa tema, visual, dan cerita berbeda agar pengalaman olimpiade selalu segar dan relevan untuk anak-anak." />
                    <div className="mt-10 grid gap-6 lg:grid-cols-4">
                        {timeline.map((item, index) => (
                            <article key={item.year} className={`group overflow-hidden rounded-[32px] bg-[#F8FAFC] shadow-sm ring-1 ring-slate-100 transition duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-[#0F60AC]/10 ${index % 2 === 1 ? 'lg:mt-10' : ''}`}>
                                <div className="relative h-56 overflow-hidden">
                                    <img src={item.image} alt={`${item.theme} ${item.year}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#F15F23] backdrop-blur">
                                        {item.year}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#0F60AC]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0F60AC]">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {item.theme}
                                    </span>
                                    <h3 className="mt-4 text-xl font-black leading-tight text-[#1E293B]">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#64748B]">{item.text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 rounded-[32px] bg-[#0F60AC] p-8 text-white shadow-2xl shadow-[#0F60AC]/20 md:grid-cols-3 md:p-10">
                    {[
                        ['Nasional', 'Skala olimpiade'],
                        ["Al-Qur'an", 'Cabang akhlak dan bacaan'],
                        ['Matematika', 'Cabang logika dan ketelitian'],
                    ].map(([value, label]) => (
                        <div key={value} className="rounded-3xl bg-white/10 p-6 text-center backdrop-blur">
                            <p className="text-3xl font-black text-[#FFC857]">{value}</p>
                            <p className="mt-2 text-sm font-bold text-white/75">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <CTASection title="Daftarkan anak untuk mengikuti OMATIQ" description="Buka kesempatan bagi anak untuk belajar, berlatih, dan tampil percaya diri dalam olimpiade Al-Qur'an dan Matematika berskala nasional." />
        </>
    );
}
