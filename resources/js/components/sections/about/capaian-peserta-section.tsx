import { SectionHeader } from "@/components/marketing/marketing-components";
import { BookOpen, Calculator, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

export function CapaianPesertaSection() {
    type CategoryKey = 'quran' | 'math';
    type SelectedCategory = CategoryKey | 'all';

    type Achievement = {
        title: string;
        value: string;
        subtitle: string;
        trend: string;
        color: string;
        categoryLabel?: string;
    };

    type CategoryData = {
        category: CategoryKey;
        categoryLabel: string;
        icon: typeof BookOpen;
        achievements: Achievement[];
    };

    const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('all');

    const capaianData: CategoryData[] = [
        {
            category: 'quran',
            categoryLabel: 'Al-Qur\'an',
            icon: BookOpen,
            achievements: [
                {
                    title: 'Peserta Aktif',
                    value: '12,500',
                    subtitle: 'Dari 34+ Provinsi',
                    trend: '+45%',
                    color: 'from-blue-500 to-cyan-500'
                },
                {
                    title: 'Tingkat Kelulusan',
                    value: '94%',
                    subtitle: 'Melewati Seleksi Regional',
                    trend: '+8%',
                    color: 'from-green-500 to-emerald-500'
                },
                {
                    title: 'Rata-rata Skor',
                    value: '87.3',
                    subtitle: 'Dari 100',
                    trend: '+2.5',
                    color: 'from-purple-500 to-pink-500'
                },
                {
                    title: 'Penghargaan',
                    value: '500+',
                    subtitle: 'Medali dan Sertifikat',
                    trend: '+120%',
                    color: 'from-orange-500 to-red-500'
                }
            ]
        },
        {
            category: 'math',
            categoryLabel: 'Matematika',
            icon: Calculator,
            achievements: [
                {
                    title: 'Peserta Aktif',
                    value: '15,200',
                    subtitle: 'Dari 34+ Provinsi',
                    trend: '+52%',
                    color: 'from-blue-500 to-cyan-500'
                },
                {
                    title: 'Tingkat Kelulusan',
                    value: '91%',
                    subtitle: 'Melewati Seleksi Regional',
                    trend: '+6%',
                    color: 'from-green-500 to-emerald-500'
                },
                {
                    title: 'Rata-rata Skor',
                    value: '85.8',
                    subtitle: 'Dari 100',
                    trend: '+3.2',
                    color: 'from-purple-500 to-pink-500'
                },
                {
                    title: 'Penghargaan',
                    value: '600+',
                    subtitle: 'Medali dan Sertifikat',
                    trend: '+135%',
                    color: 'from-orange-500 to-red-500'
                }
            ]
        }
    ];

    const allAchievements = capaianData.flatMap(cat =>
        cat.achievements.map((ach, i) => ({
            ...ach,
            categoryLabel: cat.categoryLabel
        }))
    );

    const displayData = selectedCategory === 'all'
        ? capaianData
        : capaianData.filter(cat => cat.category === selectedCategory);

    return (
        <section className="px-5 py-16 lg:px-8 bg-white">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Capaian Peserta"
                    title="Prestasi nyata dari peserta OMATIQ"
                    description="Ratusan peserta telah membuktikan kemampuan mereka dan meraih penghargaan melalui OMATIQ di berbagai tingkat kompetisi."
                />

                {/* Category Tabs */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`rounded-full px-5 py-2.5 text-sm font-black transition-all duration-300 sm:px-6 sm:py-3 sm:text-base ${selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-[#0F60AC] to-[#F15F23] text-white shadow-lg shadow-[#0F60AC]/30 scale-105'
                            : 'bg-[#F8FAFC] text-[#1E293B] ring-1 ring-slate-200 hover:ring-[#0F60AC] hover:text-[#0F60AC]'
                            }`}
                    >
                        Semua Olimpiade
                    </button>
                    {capaianData.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.category}
                                onClick={() => setSelectedCategory(item.category)}
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition-all duration-300 sm:px-6 sm:py-3 sm:text-base ${selectedCategory === item.category
                                    ? 'bg-gradient-to-r from-[#0F60AC] to-[#F15F23] text-white shadow-lg shadow-[#0F60AC]/30 scale-105'
                                    : 'bg-[#F8FAFC] text-[#1E293B] ring-1 ring-slate-200 hover:ring-[#0F60AC] hover:text-[#0F60AC]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.categoryLabel}
                            </button>
                        );
                    })}
                </div>

                {/* Achievements Grid */}
                <div className="mt-12 space-y-8">
                    {displayData.map((categoryData, catIdx) => (
                        <div key={categoryData.category} className="animate-fadeIn">
                            {selectedCategory === 'all' && (
                                <div className="mb-6 flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F60AC]/20 to-[#F15F23]/20`}>
                                        {categoryData.icon && <categoryData.icon className="h-5 w-5 text-[#0F60AC]" />}
                                    </div>
                                    <h3 className="text-xl font-black text-[#1E293B]">{categoryData.categoryLabel}</h3>
                                </div>
                            )}

                            <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {categoryData.achievements.map((achievement, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#F8FAFC] p-6 shadow-md ring-1 ring-slate-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:ring-[#0F60AC]/50 sm:p-7"
                                    >
                                        {/* Background glow */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}></div>

                                        <div className="relative">
                                            {/* Icon */}
                                            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${achievement.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 sm:h-12 sm:w-12`}>
                                                <Star className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </div>

                                            {/* Category Label */}
                                            {selectedCategory === 'all' && (
                                                <span className="ml-3 inline-block text-xs font-bold text-[#64748B]">
                                                    {achievement.categoryLabel}
                                                </span>
                                            )}

                                            {/* Content */}
                                            <h4 className="mt-4 text-sm font-bold text-[#64748B] sm:text-base">
                                                {achievement.title}
                                            </h4>

                                            <p className="mt-2 text-3xl font-black text-[#1E293B] sm:text-4xl">
                                                {achievement.value}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-[#64748B] sm:text-sm">
                                                {achievement.subtitle}
                                            </p>

                                            {/* Trend */}
                                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 transition-colors duration-300 group-hover:bg-green-100">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                <span className="text-xs font-black text-green-600 sm:text-sm">
                                                    {achievement.trend} vs tahun lalu
                                                </span>
                                            </div>
                                        </div>

                                        {/* Border animation */}
                                        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-[#0F60AC]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Stats Summary */}
                <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#0F60AC] to-[#F15F23] p-8 text-white shadow-xl shadow-[#0F60AC]/20 sm:p-10">
                    <div className="grid gap-8 sm:grid-cols-3">
                        <div className="text-center">
                            <p className="text-3xl font-black sm:text-4xl md:text-5xl">27,700+</p>
                            <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
                                Total Peserta Aktif
                            </p>
                        </div>
                        <div className="border-l border-r border-white/20 text-center">
                            <p className="text-3xl font-black sm:text-4xl md:text-5xl">92.5%</p>
                            <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
                                Tingkat Kepuasan Peserta
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black sm:text-4xl md:text-5xl">1,100+</p>
                            <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
                                Penghargaan Diberikan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}