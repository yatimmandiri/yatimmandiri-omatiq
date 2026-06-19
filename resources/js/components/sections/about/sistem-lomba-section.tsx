import { SectionHeader } from "@/components/marketing/marketing-components";
import { ArrowRight, BookOpen, CheckCircle, Target, Trophy, Zap } from "lucide-react";
import { useState } from "react";

export function SistemLombaSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sistemLomba = [
    {
      id: 1,
      title: 'Ujian Tulis',
      description: 'Tes komprehensif untuk mengukur pemahaman dan kemampuan analisis peserta',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Multiple choice dengan tingkat kesulitan bertingkat',
        'Durasi ujian disesuaikan dengan kategori usia',
        'Soal dikembangkan oleh expert di bidangnya',
        'Sistem penilaian yang objektif dan transparan'
      ],
      stats: {
        label: 'Peserta',
        value: '5000+'
      }
    },
    {
      id: 2,
      title: 'Ujian Praktik',
      description: 'Demonstrasi langsung kemampuan dan keahlian dalam bidang lomba',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      features: [
        'Pengawasan langsung dari juri berpengalaman',
        'Metrik penilaian yang jelas dan terukur',
        'Feedback konstruktif untuk setiap peserta',
        'Suasana yang mendukung dan positif'
      ],
      stats: {
        label: 'Juri Profesional',
        value: '100+'
      }
    },
    {
      id: 3,
      title: 'Kurikulum Bertingkat',
      description: 'Materi pembelajaran yang disesuaikan dengan tingkat kemampuan dan usia',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Kategori: SD, SMP, SMA',
        'Konten disesuaikan kurikulum nasional',
        'Modul pembelajaran terintegrasi',
        'Sumber daya online untuk semua peserta'
      ],
      stats: {
        label: 'Kategori',
        value: '3'
      }
    },
    {
      id: 4,
      title: 'Grand Final',
      description: 'Penampilan di panggung nasional dengan hadiah menarik dan pengakuan',
      icon: Trophy,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Final nasional di kota besar',
        'Live streaming untuk seluruh Indonesia',
        'Hadiah total puluhan juta rupiah',
        'Sertifikat nasional untuk semua peserta'
      ],
      stats: {
        label: 'Total Hadiah',
        value: '100M+'
      }
    }
  ];

  return (
    <section className="px-5 py-16 lg:px-8 bg-gradient-to-b from-white via-[#F8FAFC] to-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Sistem Lomba"
          title="Struktur kompetisi yang terukur dan menguntungkan"
          description="OMATIQ dirancang dengan sistem yang fair, terukur, dan memberikan kesempatan yang sama bagi semua peserta dari berbagai daerah."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sistemLomba.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={item.id}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="group cursor-pointer"
              >
                <div className={`relative h-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-500 ${isExpanded ? 'ring-2 ring-[#0F60AC] shadow-2xl shadow-[#0F60AC]/20' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
                  {/* Background gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}></div>

                  <div className="relative p-6 sm:p-7">
                    {/* Icon Container */}
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110 sm:h-14 sm:w-14`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-lg font-black text-[#1E293B] sm:text-xl">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F8FAFC] p-3 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-[#0F60AC]/10 group-hover:to-[#F15F23]/10">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#0F60AC] to-[#F15F23]"></div>
                      <span className="text-xs font-bold text-[#64748B]">{item.stats.label}</span>
                      <span className="ml-auto text-sm font-black text-[#0F60AC]">{item.stats.value}</span>
                    </div>

                    {/* Expandable Features */}
                    <div className={`mt-4 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-2 border-t border-slate-100 pt-4">
                        {item.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F60AC]" />
                            <span className="text-xs leading-5 text-[#64748B]">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#0F60AC] transition-all duration-300 group-hover:gap-3">
                      {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                      <ArrowRight className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
