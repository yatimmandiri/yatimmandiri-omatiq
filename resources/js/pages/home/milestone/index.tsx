import {
    CTASection,
    FeatureIcon,
    SectionHeader,
} from '@/components/marketing/marketing-components';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    CalendarDays,
    Flag,
    GraduationCap,
    Route,
    Sparkles,
    Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type HistoryItem = {
    year: string;
    label: string;
    title: string;
    text: string;
    image: string;
    icon: LucideIcon;
    color: string;
};

const historyItems: HistoryItem[] = [
    {
        year: '2016',
        label: 'Awal Gerakan',
        title: 'Olimpiade Genius Nasional lahir',
        text: 'OMATIQ pertama kali diselenggarakan dengan nama Olimpiade Genius Nasional (OGN), lahir dari komitmen Yatim Mandiri menghadirkan akses pendidikan berkualitas bagi anak yatim dan dhuafa.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85',
        icon: Sparkles,
        color: '#17524A',
    },
    {
        year: '2018',
        label: 'Rebranding',
        title: 'OGN menjadi OMATIQ',
        text: "OGN resmi bertransformasi menjadi OMATIQ, Olimpiade Matematika dan Al-Qur'an, dengan identitas yang lebih kuat sebagai ajang prestasi, karakter, dan nilai spiritual.",
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85',
        icon: BookOpenCheck,
        color: '#17524A',
    },
    {
        year: '2020',
        label: 'Adaptasi',
        title: 'Tetap berjalan saat pandemi',
        text: 'OMATIQ melewati fase adaptasi virtual saat pandemi Covid-19, menjaga semangat belajar anak-anak tetap menyala meski ruang perjumpaan berubah.',
        image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=85',
        icon: CalendarDays,
        color: '#5DD39E',
    },
    {
        year: '2024',
        label: 'Pengalaman',
        title: 'Kompetisi, edutour, dan inspirasi',
        text: 'OMATIQ berkembang menjadi event pendidikan berbasis pengalaman yang menghadirkan kompetisi, edutour, inspirasi tokoh masyarakat, dan pembentukan mental juara.',
        image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=85',
        icon: GraduationCap,
        color: '#8B5CF6',
    },
    {
        year: '2026',
        label: '1 Dekade',
        title: 'Satu dekade menyalakan mimpi',
        text: 'OMATIQ memasuki momentum satu dekade penyelenggaraan, perjalanan panjang melahirkan generasi Qurani, cerdas, santun, dan mandiri.',
        image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=85',
        icon: Trophy,
        color: '#E5BE1E',
    },
];

const highlightItems = [
    {
        label: 'Cabang Lomba',
        value: "Matematika & Al-Qur'an",
    },
    {
        label: 'Jangkauan',
        value: 'Puluhan kota & kabupaten',
    },
    {
        label: 'Peserta Tahunan',
        value: '3.500+ anak',
    },
];

export default function MilestonePage() {
    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-14 sm:pt-32 sm:pb-16 md:pb-24 lg:px-8">
                <div className="absolute top-10 left-0 h-40 w-40 rounded-[48px] bg-[#E5BE1E]/25 blur-3xl" />
                <div className="absolute right-0 bottom-10 h-48 w-48 rounded-[56px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#17524A]/10 px-4 py-2 text-sm font-black text-[#17524A]">
                            <Route className="h-4 w-4" />
                            Perjalanan OMATIQ
                        </span>
                        <h1 className="mt-6 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:text-6xl">
                            Satu dekade langkah kecil menjadi perjalanan besar.
                        </h1>
                        <div className="mt-5 space-y-4 text-base leading-8 text-[#64748B] sm:mt-6 sm:text-lg">
                            <p>
                                Sejak 2016, OMATIQ tumbuh dari sebuah gerakan
                                kecil menjadi ajang olimpiade anak yatim dan
                                dhuafa terbesar di Indonesia. Setiap tahun
                                menyimpan cerita tentang akses pendidikan,
                                adaptasi, inspirasi, dan keberanian anak-anak
                                untuk tampil di panggung nasional.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {highlightItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                                >
                                    <p className="text-sm font-black text-[#17524A]">
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-xs font-bold text-[#64748B]">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17524A] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-1"
                            >
                                Tentang OMATIQ
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/olimpiade"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#17524A]/15 bg-white px-6 py-4 text-sm font-black text-[#17524A] shadow-sm transition hover:-translate-y-1 hover:bg-[#17524A]/5"
                            >
                                Lihat Olimpiade
                                <Flag className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-4">
                            <img
                                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80"
                                alt="Perayaan peserta OMATIQ"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:rounded-3xl sm:p-6">
                                <FeatureIcon icon={Trophy} color="orange" />
                                <p className="mt-4 text-3xl font-black text-[#17524A] sm:text-4xl">
                                    2016
                                </p>
                                <p className="mt-2 text-sm font-bold text-[#64748B]">
                                    Tahun perjalanan dimulai
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4 sm:mt-12">
                            <div className="rounded-2xl bg-[#17524A] p-4 text-white shadow-xl shadow-[#17524A]/20 sm:rounded-3xl sm:p-6">
                                <FeatureIcon
                                    icon={GraduationCap}
                                    color="mint"
                                />
                                <p className="mt-4 text-lg font-black sm:mt-5 sm:text-2xl">
                                    3.500+
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white/75">
                                    Peserta setiap tahun dari puluhan kota dan
                                    kabupaten.
                                </p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80"
                                alt="Anak-anak merayakan prestasi"
                                className="h-48 w-full rounded-2xl object-cover shadow-xl sm:h-72 sm:rounded-3xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Perjalanan"
                        title="Sejarah OMATIQ dari tahun ke tahun"
                        description="Setiap fase membawa cerita tentang akses pendidikan, adaptasi, inspirasi, dan keberanian anak yatim dan dhuafa untuk tampil di panggung nasional."
                    />
                    <div className="mt-12 space-y-6">
                        {historyItems.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.year}
                                    className={`grid overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#17524A]/10 lg:grid-cols-2 ${
                                        index % 2
                                            ? 'lg:[&>*:first-child]:order-2'
                                            : ''
                                    }`}
                                >
                                    <div className="relative min-h-64 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/70 via-transparent to-transparent" />
                                        <div className="absolute right-5 bottom-5 left-5 flex items-center justify-between text-white">
                                            <div>
                                                <p className="text-sm font-black text-white/70 uppercase">
                                                    {item.label}
                                                </p>
                                                <p className="text-4xl font-black">
                                                    {item.year}
                                                </p>
                                            </div>
                                            <span
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            >
                                                <Icon className="h-7 w-7" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                        <span
                                            className="inline-flex w-fit rounded-full px-4 py-2 text-sm font-black"
                                            style={{
                                                backgroundColor: `${item.color}18`,
                                                color: item.color,
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        <h3 className="mt-5 text-2xl font-black text-[#1E293B] sm:text-3xl">
                                            {item.title}
                                        </h3>
                                        <p className="mt-4 text-base leading-8 text-[#64748B]">
                                            {item.text}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <CTASection
                title="Daftarkan anak untuk mengikuti OMATIQ"
                description="Buka kesempatan bagi anak yatim dan dhuafa untuk belajar, berlatih, dan tampil percaya diri dalam olimpiade Al-Qur'an dan Matematika berskala nasional."
            />
        </>
    );
}
