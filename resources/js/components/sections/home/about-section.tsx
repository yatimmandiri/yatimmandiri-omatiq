import { FeatureIcon, SectionHeader } from "@/components/marketing/marketing-components";
import { Link } from "@inertiajs/react"
import { ArrowRight, BookOpenCheck, Brain, Calculator, Medal, Sparkles, Trophy, UsersRound } from "lucide-react"

export const AboutSection = () => {
    const olympiadBranches = [
        {
            title: "Olimpiade Al-Qur'an",
            text: "Mengasah pemahaman tajwid, ketepatan cara baca, dan kecintaan anak pada Al-Qur'an.",
            icon: BookOpenCheck,
            color: 'orange' as const,
        },
        {
            title: 'Olimpiade Matematika',
            text: 'Membangun nalar, ketelitian, dan keberanian memecahkan soal secara menyenangkan.',
            icon: Calculator,
            color: 'blue' as const,
        },
    ];

    return (
        <>
            <section className="relative overflow-hidden px-5 py-14 sm:py-16 lg:px-8 lg:py-20">
                <div className="absolute top-10 left-0 h-32 w-32 rounded-[40px] bg-[#FFC857]/25 blur-2xl" />
                <div className="absolute right-0 bottom-10 h-40 w-40 rounded-[48px] bg-[#56CCF2]/20 blur-2xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                            <Sparkles className="h-4 w-4" />
                            Tentang OMATIQ
                        </span>
                        <h2 className="mt-5 text-3xl leading-tight font-black tracking-tight text-[#1E293B] sm:text-4xl md:text-5xl">
                            Ajang olimpiade nasional untuk anak Indonesia yang
                            cerdas, berani, dan berakhlak.
                        </h2>
                        <p className="mt-5 text-base leading-8 text-[#64748B] md:text-lg">
                            OMATIQ adalah kompetisi berbasis nasional yang
                            mempertemukan anak-anak dari berbagai daerah untuk
                            bertumbuh melalui tantangan Al-Qur'an dan
                            Matematika. Untuk tahap awal, OMATIQ fokus pada soal
                            tajwid, cara baca Al-Qur'an, dan kemampuan
                            matematika. Ke depannya, olimpiade akan terus
                            dikembangkan.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:-translate-y-1 hover:bg-[#d94f18]"
                            >
                                Kenali OMATIQ
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/olimpiade"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:border-[#0F60AC]/30 hover:bg-[#0F60AC]/5"
                            >
                                Lihat Olimpiade
                                <Trophy className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:relative lg:block lg:min-h-[520px]">
                        <div className="hidden lg:block">
                            <div className="absolute top-4 left-2 z-10 animate-bounce rounded-3xl bg-[#FFC857] px-5 py-4 text-sm font-black text-[#1E293B] shadow-xl">
                                Nasional
                            </div>

                            <div className="absolute top-28 right-4 z-10 rounded-3xl bg-[#5DD39E] px-5 py-4 text-sm font-black text-white shadow-xl">
                                Tajwid & Logika
                            </div>

                            <div className="absolute bottom-8 left-8 z-10 rounded-3xl bg-[#8B5CF6] px-5 py-4 text-sm font-black text-white shadow-xl">
                                Anak Indonesia
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-md rounded-[28px] bg-white p-4 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 transition sm:p-5 lg:absolute lg:inset-x-4 lg:top-0 lg:rotate-[-3deg] lg:rounded-[36px] lg:hover:rotate-0">
                            <div className="rounded-[28px] bg-[#0F60AC] p-5 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                        <Medal className="h-8 w-8 text-[#FFC857]" />
                                    </div>
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                                        OMATIQ 2026
                                    </span>
                                </div>
                                <h3 className="mt-8 text-3xl font-black">
                                    National Olympiad
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-white/75">
                                    Satu panggung untuk menguji kemampuan,
                                    membangun percaya diri, dan merayakan proses
                                    belajar anak.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:absolute lg:right-0 lg:bottom-0 lg:left-0">
                            {olympiadBranches.map((branch, index) => (
                                <div
                                    key={branch.title}
                                    className={`rounded-3xl bg-white p-6 shadow-xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 transition duration-300 hover:-translate-y-2 ${index === 1 ? 'sm:mt-16' : 'sm:mb-16'}`}
                                >
                                    <FeatureIcon
                                        icon={branch.icon}
                                        color={branch.color}
                                    />
                                    <h3 className="mt-5 text-xl font-black text-[#1E293B]">
                                        {branch.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#64748B]">
                                        {branch.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-8 sm:py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-4 rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-4 md:p-8">
                    {[
                        ['34+', 'Provinsi'],
                        ['2', 'Olimpiade Awal'],
                        ['Nasional', 'Skala Lomba'],
                        ['2026', 'Musim OMATIQ'],
                    ].map(([value, label]) => (
                        <div
                            key={label}
                            className="rounded-3xl bg-[#F8FAFC] p-6 text-center"
                        >
                            <p className="text-4xl font-black text-[#F15F23]">
                                {value}
                            </p>
                            <p className="mt-2 text-sm font-bold text-[#64748B]">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader
                        eyebrow="Why OMATIQ"
                        title="Olimpiade yang serius, hangat, dan mudah diikuti"
                        description="OMATIQ dirancang agar anak-anak merasa tertantang sekaligus didukung oleh sistem lomba yang jelas dan menyenangkan."
                    />
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Trophy,
                                color: 'orange' as const,
                                title: 'Ajang Prestasi',
                                text: 'Memberi ruang bagi anak untuk mengukur kemampuan dan merayakan proses belajar.',
                            },
                            {
                                icon: BookOpenCheck,
                                color: 'mint' as const,
                                title: "Al-Qur'an",
                                text: 'Menguatkan pemahaman tajwid dan cara baca dengan pendekatan yang terarah.',
                            },
                            {
                                icon: Brain,
                                color: 'blue' as const,
                                title: 'Matematika',
                                text: 'Melatih logika, ketelitian, dan strategi menyelesaikan soal secara percaya diri.',
                            },
                            {
                                icon: UsersRound,
                                color: 'purple' as const,
                                title: 'Skala Nasional',
                                text: 'Menghubungkan peserta dari berbagai daerah dalam satu pengalaman lomba.',
                            },
                        ].map((item) => (
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
        </>
    )
}