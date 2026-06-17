import {
    CTASection,
    FeatureIcon,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpenCheck,
    Brain,
    Calculator,
    ChevronRight,
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
import { useState } from 'react';

const [activeYear, setActiveYear] = useState(0);

const timeline = [
    {
        year: 2020,
        theme: "Perkenalan",
        title: "Memulai Petualangan OMATIQ",
        text: "OMATIQ pertama kali diluncurkan dengan antusiasme tinggi, membawa konsep olimpiade matematika yang interaktif dan menyenangkan bagi siswa.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        color: "from-blue-500 to-cyan-500",
        icon: Award,
    },
    {
        year: 2021,
        theme: "Ekspansi",
        title: "Pertumbuhan dan Perkembangan",
        text: "Dengan dukungan luar biasa dari komunitas, OMATIQ berkembang ke berbagai wilayah dengan lebih banyak peserta dan kategori baru.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
        color: "from-purple-500 to-pink-500",
        icon: Sparkles,
    },
    {
        year: 2022,
        theme: "Inovasi",
        title: "Era Digital dan Transformasi",
        text: "OMATIQ mengadopsi teknologi terkini dengan platform online yang memudahkan partisipasi dari seluruh Indonesia.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop",
        color: "from-green-500 to-emerald-500",
        icon: ChevronRight,
    },
    {
        year: 2023,
        theme: "Kesuksesan",
        title: "Pencapaian Luar Biasa",
        text: "OMATIQ mencapai puncak popularitasnya dengan ribuan peserta aktif dan pengakuan internasional atas kontribusinya.",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
        color: "from-orange-500 to-red-500",
        icon: Sparkles,
    },
    {
        year: 2024,
        theme: "Visi Masa Depan",
        title: "Melanjutkan Warisan",
        text: "OMATIQ terus berinovasi dengan fitur-fitur baru yang lebih interaktif, gamified, dan mendukung pembelajaran berkelanjutan.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
        color: "from-pink-500 to-rose-500",
        icon: Award,
    },
];

const values: Array<{
    icon: LucideIcon;
    title: string;
    text: string;
    color: 'orange' | 'blue' | 'mint' | 'purple';
}> = [
        {
            icon: Heart,
            title: 'Ramah untuk Anak',
            text: 'Kompetisi dibuat menantang tanpa kehilangan rasa aman, hangat, dan menyenangkan.',
            color: 'orange',
        },
        {
            icon: BookOpenCheck,
            title: "Cinta Al-Qur'an",
            text: "Mendorong anak memahami tajwid, memperbaiki cara baca, dan bangga belajar Al-Qur'an.",
            color: 'mint',
        },
        {
            icon: Brain,
            title: 'Berani Bernalar',
            text: 'Matematika menjadi ruang untuk melatih logika, strategi, ketelitian, dan percaya diri.',
            color: 'blue',
        },
        {
            icon: Users,
            title: 'Kolaborasi Nasional',
            text: 'Menghubungkan sekolah, TPQ, orang tua, guru, dan mitra daerah untuk mendukung peserta.',
            color: 'purple',
        },
    ];

const focusItems = [
    {
        icon: BookOpenCheck,
        title: "Olimpiade Al-Qur'an",
        text: 'Soal tajwid, ketepatan cara baca, adab belajar, dan keberanian tampil.',
    },
    {
        icon: Calculator,
        title: 'Olimpiade Matematika',
        text: 'Logika dasar, problem solving, strategi soal, dan latihan ketelitian.',
    },
    {
        icon: Trophy,
        title: 'Panggung Nasional',
        text: 'Pengalaman lomba berskala nasional untuk anak-anak dari berbagai daerah.',
    },
];

export default function AboutPage() {
    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-14 sm:pt-32 sm:pb-16 md:pb-24 lg:px-8">
                <div className="absolute top-10 left-0 h-40 w-40 rounded-[48px] bg-[#FFC857]/25 blur-3xl" />
                <div className="absolute right-0 bottom-10 h-48 w-48 rounded-[56px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#0F60AC]/10 px-4 py-2 text-sm font-black text-[#0F60AC]">
                            <Sparkles className="h-4 w-4" />
                            Tentang OMATIQ
                        </span>
                        <h1 className="mt-6 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:text-6xl">
                            Olimpiade nasional untuk anak Indonesia yang cerdas,
                            berani, dan berakhlak.
                        </h1>
                        <p className="mt-5 text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                            OMATIQ adalah ajang olimpiade berbasis nasional
                            untuk anak-anak Indonesia. Pada tahap awal, OMATIQ
                            berfokus pada dua cabang utama: Al-Qur'an melalui
                            tajwid dan cara baca, serta Matematika untuk melatih
                            logika, ketelitian, dan keberanian bernalar.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/programs"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-1"
                            >
                                Lihat Olimpiade
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {/* <Link
                                href="/kontak"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:bg-[#0F60AC]/5"
                            >
                                Daftarkan Anak
                                <Medal className="h-4 w-4" />
                            </Link> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-4">
                            <img
                                src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80"
                                alt="Anak belajar Al-Qur'an untuk persiapan olimpiade"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:rounded-3xl sm:p-6">
                                <p className="text-3xl font-black text-[#F15F23] sm:text-4xl">
                                    34+
                                </p>
                                <p className="mt-2 text-sm font-bold text-[#64748B]">
                                    Provinsi sasaran peserta
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4 sm:mt-12">
                            <div className="rounded-2xl bg-[#0F60AC] p-4 text-white shadow-xl shadow-[#0F60AC]/20 sm:rounded-3xl sm:p-6">
                                <FeatureIcon icon={Trophy} color="orange" />
                                <p className="mt-4 text-lg font-black sm:mt-5 sm:text-2xl">
                                    OMATIQ 2026
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white/75">
                                    Panggung nasional untuk anak yang siap
                                    berprestasi.
                                </p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80"
                                alt="Latihan matematika untuk olimpiade"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeader
                        eyebrow="Our Story"
                        title="Dari semangat belajar menuju panggung nasional"
                        description="OMATIQ hadir karena banyak anak punya potensi besar, tetapi membutuhkan ruang lomba yang tertata, positif, dan mudah diakses dari berbagai daerah."
                        align="left"
                    />
                    <div className="rounded-[28px] bg-[#F8FAFC] p-5 text-base leading-8 text-[#64748B] sm:p-8">
                        <p>
                            Kami percaya olimpiade bukan hanya soal menang.
                            Untuk anak-anak, olimpiade adalah pengalaman berani
                            mencoba, disiplin berlatih, belajar dari tantangan,
                            dan merasakan kebanggaan ketika tampil membawa usaha
                            terbaiknya.
                        </p>
                        <p className="mt-5">
                            Karena itu OMATIQ dibangun dengan pendekatan yang
                            ramah untuk anak, jelas untuk orang tua, mudah
                            didampingi guru, dan terbuka untuk kerja sama
                            sekolah, TPQ, komunitas pendidikan, serta mitra
                            daerah.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-[#0F60AC] p-6 text-white shadow-xl shadow-[#0F60AC]/20 sm:p-8">
                        <FeatureIcon icon={Target} color="orange" />
                        <h2 className="mt-6 text-3xl font-black">Vision</h2>
                        <p className="mt-4 leading-8 text-white/80">
                            Menjadi olimpiade nasional yang menginspirasi anak
                            Indonesia untuk mencintai Al-Qur'an, berani
                            bernalar, dan tumbuh sebagai generasi berprestasi
                            serta berakhlak.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
                        <FeatureIcon icon={Flag} color="blue" />
                        <h2 className="mt-6 text-3xl font-black text-[#1E293B]">
                            Mission
                        </h2>
                        <p className="mt-4 leading-8 text-[#64748B]">
                            Menyelenggarakan olimpiade Al-Qur'an dan Matematika
                            yang terarah, menyenangkan, transparan, serta mampu
                            melibatkan sekolah, TPQ, orang tua, guru, dan mitra
                            pendidikan dari berbagai wilayah.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Fokus Olimpiade"
                        title="Dua cabang awal, satu tujuan besar"
                        description="OMATIQ dimulai dari bidang yang dekat dengan pembentukan akhlak dan daya pikir anak."
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {focusItems.map((item) => (
                            <div
                                key={item.title}
                                className="group rounded-3xl bg-[#F8FAFC] p-6 transition hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#0F60AC]/10"
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

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Core Values"
                        title="Nilai yang menjaga pengalaman OMATIQ"
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {values.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
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

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Journey"
                        title="Tema perjalanan OMATIQ dari tahun ke tahun"
                        description="Setiap musim OMATIQ dapat membawa tema, visual, dan cerita berbeda agar pengalaman olimpiade selalu segar dan relevan untuk anak-anak."
                    />
                    <div className="relative mt-16">
                        {/* Desktop Timeline Line with Animation */}
                        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
                            {/* Static background line */}
                            <div className="absolute inset-0 w-full bg-gradient-to-b from-[#0F60AC] via-[#F15F23] to-[#0F60AC] opacity-20"></div>

                            {/* Animated flowing line 1 */}
                            <div className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-[#0F60AC] to-transparent opacity-60 animated-line"></div>

                            {/* Animated flowing line 2 */}
                            <div
                                className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-[#F15F23] to-transparent opacity-40"
                                style={{ animation: 'flowDown 5s linear infinite 1s' }}
                            ></div>

                            {/* Shimmer effect */}
                            <div
                                className="absolute inset-0 w-full bg-gradient-to-b from-[#0F60AC]/0 via-white to-[#F15F23]/0 opacity-50"
                                style={{
                                    animation: 'flowDown 3s linear infinite',
                                    backgroundSize: '100% 200%'
                                }}
                            ></div>

                            {/* Glow effect */}
                            <div className="absolute inset-0 w-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#0F60AC]/30 to-[#F15F23]/30 blur-lg opacity-70"></div>
                        </div>

                        {/* Timeline Items */}
                        <div className="space-y-12 lg:space-y-8">
                            {timeline.map((item, index) => {
                                const Icon = item.icon;
                                const isEven = index % 2 === 0;

                                return (
                                    <div
                                        key={item.year}
                                        className="group cursor-pointer"
                                        onClick={() => setActiveYear(index)}
                                        onMouseEnter={() => setActiveYear(index)}
                                    >
                                        {/* Desktop Layout */}
                                        <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
                                            {/* Left side - content for even, image for odd */}
                                            <div className={isEven ? 'order-1' : 'order-2'}>
                                                <div className={`relative group/card rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1`} style={{
                                                    boxShadow: activeYear === index ? `0 25px 50px -12px rgba(15, 96, 172, 0.3)` : 'initial'
                                                }}>
                                                    {/* Gradient overlay */}
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/card:opacity-10 transition-opacity duration-500`}></div>

                                                    <div className="relative p-8 lg:p-10">
                                                        {/* Animated Icon */}
                                                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg mb-6 group-hover/card:scale-110 transition-all duration-300`} style={{
                                                            transform: activeYear === index ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)',
                                                            filter: activeYear === index ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'none'
                                                        }}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>

                                                        {/* Year & Theme */}
                                                        <div className="mb-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.color} px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all duration-300`} style={{
                                                                    opacity: activeYear === index ? 1 : 0.8,
                                                                    transform: activeYear === index ? 'scale(1.1)' : 'scale(1)'
                                                                }}>
                                                                    <span className="inline-block w-2 h-2 rounded-full bg-white pulse-glow"></span>
                                                                    {item.theme}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-2xl lg:text-3xl font-black text-[#1E293B] leading-tight mb-3 transition-all duration-300" style={{
                                                                color: activeYear === index ? '#0F60AC' : '#1E293B'
                                                            }}>
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-sm lg:text-base leading-relaxed text-[#64748B] mb-4">
                                                                {item.text}
                                                            </p>
                                                        </div>

                                                        {/* Year Display */}
                                                        <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${item.color} text-white font-black text-lg shadow-md transition-all duration-300`} style={{
                                                            transform: activeYear === index ? 'scale(1.1)' : 'scale(1)',
                                                            filter: activeYear === index ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none'
                                                        }}>
                                                            {item.year}
                                                        </div>
                                                    </div>

                                                    {/* Border animation */}
                                                    <div className="absolute inset-0 border-2 border-transparent group-hover/card:border-slate-300 rounded-2xl pointer-events-none transition-colors duration-300" style={{
                                                        borderColor: activeYear === index ? `rgba(${item.color.includes('blue') ? '15, 96, 172' : item.color.includes('purple') ? '147, 51, 234' : item.color.includes('green') ? '34, 197, 94' : item.color.includes('orange') ? '249, 115, 22' : '236, 72, 153'}, 0.5)` : 'transparent'
                                                    }}></div>
                                                </div>
                                            </div>

                                            {/* Right side - image */}
                                            <div className={isEven ? 'order-2' : 'order-1'}>
                                                <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-xl group/img">
                                                    <img
                                                        src={item.image}
                                                        alt={`${item.theme} ${item.year}`}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                    />
                                                    {/* Overlay on hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>

                                                    {/* Animated center circle dot */}
                                                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl timeline-dot" style={{
                                                        transform: activeYear === index ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%) scale(1)',
                                                        boxShadow: activeYear === index ? `0 0 20px rgba(15, 96, 172, 0.6)` : '0 10px 25px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} transition-all duration-300`} style={{
                                                            boxShadow: activeYear === index ? `0 0 15px rgba(15, 96, 172, 0.8)` : 'none'
                                                        }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Layout */}
                                        <div className="lg:hidden">
                                            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={`${item.theme} ${item.year}`}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className={`absolute top-4 right-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${item.color} text-white font-black shadow-lg`}>
                                                        {item.year % 10}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6">
                                                    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.color} px-3 py-1 text-xs font-black text-white uppercase mb-3 shadow-md`}>
                                                        <span className="inline-block w-2 h-2 rounded-full bg-white pulse-glow"></span>
                                                        {item.theme}
                                                    </div>
                                                    <h3 className="text-xl font-black text-[#1E293B] mb-2">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-[#64748B] mb-4">
                                                        {item.text}
                                                    </p>
                                                    <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${item.color} text-white font-black text-sm shadow-md`}>
                                                        {item.year}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Daftarkan anak untuk mengikuti OMATIQ"
                description="Buka kesempatan bagi anak untuk belajar, berlatih, dan tampil percaya diri dalam olimpiade Al-Qur'an dan Matematika berskala nasional."
            />
        </>
    );
}
