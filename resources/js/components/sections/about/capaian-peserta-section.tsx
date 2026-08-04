import { SectionHeader } from '@/components/marketing/marketing-components';
import {
    Award,
    BookOpenCheck,
    GraduationCap,
    MapPin,
    Sparkles,
    Trophy,
    Users,
} from 'lucide-react';

const stats = [
    {
        icon: Users,
        value: '3.500+',
        label: 'Peserta setiap tahun',
        text: 'Anak yatim dan dhuafa mengikuti OMATIQ dari berbagai daerah di Indonesia.',
        color: '#17524A',
    },
    {
        icon: MapPin,
        value: '50+',
        label: 'Kota dan kabupaten',
        text: 'Jangkauan peserta berasal dari puluhan wilayah binaan dan mitra Yatim Mandiri.',
        color: '#17524A',
    },
    {
        icon: Trophy,
        value: '10',
        label: 'Tahun perjalanan',
        text: 'Satu dekade OMATIQ menyalakan mimpi, prestasi, dan pengalaman belajar.',
        color: '#8B5CF6',
    },
];

const achievements = [
    {
        icon: BookOpenCheck,
        title: "Prestasi Matematika dan Al-Qur'an",
        text: "OMATIQ melahirkan anak-anak berprestasi di bidang Matematika dan Al-Qur'an.",
    },
    {
        icon: Award,
        title: 'Mental percaya diri',
        text: 'Peserta belajar berani tampil, memimpin diri, dan menghadapi panggung nasional.',
    },
    {
        icon: GraduationCap,
        title: 'Evaluasi pendidikan nasional',
        text: 'OMATIQ menjadi ajang evaluasi program pendidikan binaan Yatim Mandiri.',
    },
    {
        icon: Sparkles,
        title: 'Pengalaman inspiratif',
        text: 'Edutour, grand final, dan sesi tokoh masyarakat menghadirkan pengalaman yang membahagiakan.',
    },
];

export function CapaianPesertaSection() {
    return (
        <section className="bg-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Capaian Peserta"
                    title="Ruang tumbuh bagi ribuan anak yatim dan dhuafa"
                    description="Selama 10 tahun penyelenggaraan, OMATIQ tidak hanya mencetak juara. OMATIQ menghadirkan pengalaman hidup yang membangun harapan, mimpi, dan semangat baru."
                />

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-3xl bg-[#F8FAFC] p-6 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                        >
                            <span
                                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                                style={{ backgroundColor: item.color }}
                            >
                                <item.icon className="h-6 w-6" />
                            </span>
                            <p className="mt-6 text-4xl font-black text-[#1E293B]">
                                {item.value}
                            </p>
                            <p className="mt-2 text-sm font-black text-[#17524A]">
                                {item.label}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {achievements.map((item) => (
                        <div
                            key={item.title}
                            className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A]">
                                <item.icon className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="font-black text-[#1E293B]">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                                    {item.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
