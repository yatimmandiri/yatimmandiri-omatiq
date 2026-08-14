import { SectionHeader } from '@/components/marketing/marketing-components';
import {
    BookOpen,
    Bus,
    CheckCircle,
    HeartHandshake,
    Mic2,
    Trophy,
} from 'lucide-react';

const systems = [
    {
        title: 'Kompetisi Matematika',
        description:
            'Mengukur logika, ketelitian, strategi penyelesaian soal, dan keberanian anak menghadapi tantangan.',
        icon: BookOpen,
        color: '#17524A',
    },
    {
        title: "Kompetisi Al-Qur'an",
        description:
            "Menguatkan pemahaman tajwid, ketepatan cara baca, adab, dan kecintaan anak pada Al-Qur'an.",
        icon: HeartHandshake,
        color: '#17524A',
    },
    {
        title: 'Edutour',
        description:
            'Memberikan pengalaman belajar di luar kelas agar anak bertemu wawasan baru dan inspirasi besar.',
        icon: Bus,
        color: '#5DD39E',
    },
    {
        title: 'Grand Final dan Inspirasi',
        description:
            'Final nasional, sesi tokoh masyarakat, dan panggung penghargaan untuk membentuk mental juara.',
        icon: Trophy,
        color: '#8B5CF6',
    },
];

const principles = [
    'Edukatif dan memuliakan peserta',
    'Terukur, transparan, dan ramah anak',
    'Menguatkan prestasi sekaligus karakter',
    'Memberi pengalaman yang membahagiakan',
];

export function SistemLombaSection() {
    return (
        <section className="bg-gradient-to-b from-white via-[#F8FAFC] to-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Sistem dan Pengalaman"
                    title="Lebih dari lomba, OMATIQ adalah pengalaman pembentukan diri"
                    description="OMATIQ menghadirkan kompetisi, edutour, pembinaan karakter, dan inspirasi agar anak belajar menjadi juara dengan cara yang sehat dan bermakna."
                />

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {systems.map((item) => (
                        <div
                            key={item.title}
                            className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-2 hover:shadow-xl"
                        >
                            <span
                                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition group-hover:scale-110"
                                style={{ backgroundColor: item.color }}
                            >
                                <item.icon className="h-7 w-7" />
                            </span>
                            <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 rounded-[28px] bg-[#17524A] p-6 text-white shadow-xl shadow-[#17524A]/20 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#E5BE1E]">
                                <Mic2 className="h-4 w-4" />
                                Prinsip Pelaksanaan
                            </span>
                            <h3 className="mt-4 max-w-2xl text-2xl font-black sm:text-3xl">
                                Setiap fase dirancang untuk menguatkan harapan,
                                bukan hanya mengejar piala.
                            </h3>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {principles.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-black text-white"
                                >
                                    <CheckCircle className="h-5 w-5 shrink-0 text-[#E5BE1E]" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
