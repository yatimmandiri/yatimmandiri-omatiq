import {
    CTASection,
    FeatureIcon,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import { CapaianPesertaSection } from '@/components/sections/about/capaian-peserta-section';
import { SistemLombaSection } from '@/components/sections/about/sistem-lomba-section';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    Brain,
    CalendarDays,
    Calculator,
    CheckCircle2,
    Flag,
    Heart,
    Medal,
    Sparkles,
    Star,
    Target,
    Trophy,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const goalItems = [
    'Meningkatkan kualitas pendidikan anak yatim dan dhuafa di Indonesia',
    'Menumbuhkan semangat belajar dan mental juara sejak usia dini',
    'Menjadi sarana evaluasi pembelajaran program binaan Yatim Mandiri',
    "Mengembangkan minat dan bakat anak di bidang Matematika dan Al-Qur'an",
    'Membentuk generasi Qurani yang cerdas, santun, dan tangguh',
    'Memberikan pengalaman belajar yang inspiratif dan membahagiakan',
    'Membuka akses terhadap pengalaman pendidikan nasional yang berkualitas',
    'Mendorong lahirnya generasi mandiri untuk masa depan Indonesia',
];

const missions = [
    'Memberikan akses ruang prestasi bagi anak yatim dan dhuafa di seluruh Indonesia',
    'Menanamkan nilai Qurani, akhlak mulia, dan semangat belajar',
    'Menghadirkan pembelajaran berbasis pengalaman dan inspirasi',
    'Menjadi sarana evaluasi dan penguatan program pendidikan binaan',
    'Membangun ekosistem pendidikan yang inklusif, humanis, dan berdampak',
];

const values: Array<{
    icon: LucideIcon;
    title: string;
    text: string;
    color: 'orange' | 'blue' | 'mint' | 'purple';
}> = [
    {
        icon: Heart,
        title: 'Memuliakan Anak',
        text: 'Setiap peserta dipandang sebagai pribadi berharga yang layak tumbuh, bermimpi, dan dipercaya.',
        color: 'orange',
    },
    {
        icon: BookOpenCheck,
        title: 'Nilai Qurani',
        text: "OMATIQ menanamkan cinta Al-Qur'an, akhlak mulia, adab, dan ketenangan dalam proses belajar.",
        color: 'mint',
    },
    {
        icon: Brain,
        title: 'Cerdas dan Tangguh',
        text: 'Matematika dan kompetisi melatih logika, ketelitian, keberanian, dan mental juara sejak dini.',
        color: 'blue',
    },
    {
        icon: Users,
        title: 'Inklusif Berdampak',
        text: 'OMATIQ menghubungkan anak, pendamping, sekolah, mitra, dan masyarakat dalam ekosistem pendidikan yang humanis.',
        color: 'purple',
    },
];

const focusItems = [
    {
        icon: Calculator,
        title: 'Matematika',
        text: 'Mengasah logika, ketelitian, problem solving, dan keberanian menghadapi tantangan.',
    },
    {
        icon: BookOpenCheck,
        title: "Al-Qur'an",
        text: 'Menguatkan tajwid, ketepatan bacaan, nilai spiritual, adab, dan percaya diri.',
    },
    {
        icon: Medal,
        title: 'Edutour dan Inspirasi',
        text: 'Membuka perjumpaan dengan pengalaman baru, tokoh inspiratif, dan panggung nasional.',
    },
];

export default function AboutPage() {
    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-14 sm:pt-32 sm:pb-16 md:pb-24 lg:px-8">
                <div className="absolute top-10 left-0 h-40 w-40 rounded-[48px] bg-[#E5BE1E]/25 blur-3xl" />
                <div className="absolute right-0 bottom-10 h-48 w-48 rounded-[56px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#17524A]/10 px-4 py-2 text-sm font-black text-[#17524A]">
                            <Sparkles className="h-4 w-4" />
                            Tentang OMATIQ
                        </span>
                        <h1 className="mt-6 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:text-6xl">
                            Setiap anak berhak memiliki mimpi besar.
                        </h1>
                        <div className="mt-5 space-y-4 text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                            <p>
                                OMATIQ hadir sebagai panggung prestasi dan
                                harapan bagi ribuan anak yatim dan dhuafa di
                                seluruh Indonesia. Diselenggarakan oleh Yatim
                                Mandiri, OMATIQ menjadi ruang bagi mereka untuk
                                belajar, bertumbuh, berprestasi, dan percaya
                                bahwa mereka mampu menjadi generasi masa depan
                                bangsa.
                            </p>
                            <p>
                                Selama 10 tahun perjalanan, OMATIQ telah menjadi
                                lebih dari sekadar olimpiade. Ia adalah
                                pengalaman hidup yang membentuk mental juara,
                                mempertemukan anak-anak dengan inspirasi besar,
                                serta menghadirkan pendidikan yang memuliakan
                                manusia.
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/olimpiade"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-1"
                            >
                                Lihat Olimpiade
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/jadwal"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#17524A]/15 bg-white px-6 py-4 text-sm font-black text-[#17524A] shadow-sm transition hover:-translate-y-1 hover:bg-[#17524A]/5"
                            >
                                Jadwal OMATIQ
                                <CalendarDays className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-4">
                            <img
                                src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80"
                                alt="Anak belajar Al-Qur'an untuk persiapan OMATIQ"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:rounded-3xl sm:p-6">
                                <p className="text-3xl font-black text-[#17524A] sm:text-4xl">
                                    10
                                </p>
                                <p className="mt-2 text-sm font-bold text-[#64748B]">
                                    Tahun perjalanan OMATIQ
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4 sm:mt-12">
                            <div className="rounded-2xl bg-[#17524A] p-4 text-white shadow-xl shadow-[#17524A]/20 sm:rounded-3xl sm:p-6">
                                <FeatureIcon icon={Trophy} color="orange" />
                                <p className="mt-4 text-lg font-black sm:mt-5 sm:text-2xl">
                                    3.500+
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white/75">
                                    Peserta setiap tahun dari puluhan kota dan
                                    kabupaten.
                                </p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80"
                                alt="Latihan matematika untuk OMATIQ"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr]">
                    <SectionHeader
                        eyebrow="Sejarah OMATIQ"
                        title="Dari OGN menjadi panggung prestasi nasional"
                        description="OMATIQ pertama kali diselenggarakan pada tahun 2016 dengan nama Olimpiade Genius Nasional (OGN). Program ini lahir dari komitmen Yatim Mandiri dalam menghadirkan akses pendidikan berkualitas bagi anak yatim dan dhuafa di Indonesia."
                        align="left"
                    />
                    <div className="rounded-[28px] bg-[#F8FAFC] p-5 text-base leading-8 text-[#64748B] sm:p-8">
                        <p>
                            Pada tahun 2018, OGN resmi melakukan rebranding
                            menjadi OMATIQ, Olimpiade Matematika dan Al-Qur'an.
                            Perubahan ini menjadi langkah penting dalam
                            memperkuat identitas program sebagai ajang kompetisi
                            akademik dan keagamaan yang mengedepankan prestasi,
                            karakter, dan nilai spiritual.
                        </p>
                        <p className="mt-5">
                            Selama satu dekade, OMATIQ terus berkembang menjadi
                            salah satu ajang olimpiade anak yatim dan dhuafa
                            terbesar di Indonesia, dengan peserta mencapai lebih
                            dari 3.500 anak setiap tahunnya dari puluhan kota
                            dan kabupaten.
                        </p>
                        <p className="mt-5">
                            OMATIQ telah melewati berbagai fase perjalanan,
                            mulai dari pelaksanaan di kementerian dan institusi
                            nasional, adaptasi virtual saat pandemi Covid-19,
                            hingga berkembang menjadi event pendidikan berbasis
                            pengalaman yang menghadirkan kompetisi, edutour,
                            inspirasi tokoh masyarakat, dan pembentukan mental
                            juara.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Tujuan"
                        title="Ruang tumbuh untuk prestasi, karakter, dan percaya diri"
                        description="Tujuan utama OMATIQ adalah menghadirkan ruang pengembangan prestasi, karakter, dan kepercayaan diri bagi anak yatim dan dhuafa melalui kompetisi Matematika dan Al-Qur'an yang edukatif, inspiratif, dan memuliakan."
                    />
                    <div className="mt-10 grid gap-4 md:grid-cols-2">
                        {goalItems.map((item) => (
                            <div
                                key={item}
                                className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                    <CheckCircle2 className="h-5 w-5" />
                                </span>
                                <p className="text-sm leading-7 font-bold text-[#1E293B]">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-[#17524A] p-6 text-white shadow-xl shadow-[#17524A]/20 sm:p-8">
                        <FeatureIcon icon={Target} color="orange" />
                        <h2 className="mt-6 text-3xl font-black">Visi</h2>
                        <p className="mt-4 leading-8 text-white/80">
                            Menjadi platform pendidikan dan pengembangan talenta
                            anak yatim dan dhuafa terbesar di Indonesia yang
                            melahirkan generasi pemimpin masa depan bangsa.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-[#F8FAFC] p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
                        <FeatureIcon icon={Flag} color="blue" />
                        <h2 className="mt-6 text-3xl font-black text-[#1E293B]">
                            Misi
                        </h2>
                        <div className="mt-5 space-y-3">
                            {missions.map((mission) => (
                                <div
                                    key={mission}
                                    className="flex items-start gap-3 rounded-2xl bg-white p-4"
                                >
                                    <Star className="mt-1 h-4 w-4 shrink-0 text-[#17524A]" />
                                    <p className="text-sm leading-7 font-bold text-[#64748B]">
                                        {mission}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Pengalaman OMATIQ"
                        title="Kompetisi yang menyalakan mimpi dan semangat belajar"
                        description="Melalui kompetisi Matematika dan Al-Qur'an, edutour, pembinaan karakter, hingga pengalaman inspiratif bersama tokoh masyarakat, OMATIQ terus menyalakan mimpi anak-anak Indonesia."
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {focusItems.map((item) => (
                            <div
                                key={item.title}
                                className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-2 hover:shadow-xl hover:shadow-[#17524A]/10"
                            >
                                <FeatureIcon icon={item.icon} color="orange" />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Nilai"
                        title="Prinsip yang menjaga OMATIQ tetap bermakna"
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {values.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-3xl bg-[#F8FAFC] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                            >
                                <FeatureIcon
                                    icon={item.icon}
                                    color={item.color}
                                />
                                <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Perjalanan"
                        title="Satu dekade menyalakan mimpi anak Indonesia"
                        description="Sejak 2016, OMATIQ tumbuh menjadi ajang olimpiade anak yatim dan dhuafa terbesar di Indonesia. Lihat tonggak perjalanan kami dari tahun ke tahun."
                    />
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/about/milestone"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-1"
                        >
                            Jelajahi Perjalanan
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/olimpiade"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#17524A]/15 bg-white px-6 py-4 text-sm font-black text-[#17524A] shadow-sm transition hover:-translate-y-1 hover:bg-[#17524A]/5"
                        >
                            Lihat Olimpiade
                            <CalendarDays className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <SistemLombaSection />

            <CapaianPesertaSection />

            <CTASection
                title="Daftarkan anak untuk mengikuti OMATIQ"
                description="Buka kesempatan bagi anak yatim dan dhuafa untuk belajar, berlatih, dan tampil percaya diri dalam olimpiade Al-Qur'an dan Matematika berskala nasional."
            />
        </>
    );
}
