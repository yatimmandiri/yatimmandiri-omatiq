import { SectionHeader } from "@/components/marketing/marketing-components";
import { getVisibleItems, useResponsiveVisibleCount } from "@/utils/uiResposive";
import { Building2, Handshake } from "lucide-react";
import { PointerEvent, useEffect, useState } from "react";


export const PartnerSection = ({ data }: { data: any }) => {
    return (
        <section className="px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
                <SectionHeader
                    eyebrow="Mitra & Kerjasama"
                    title="Bergerak bersama ekosistem pendidikan"
                    description="OMATIQ terbuka untuk kolaborasi dengan sekolah, TPQ, komunitas guru, orang tua, mentor daerah, dan mitra nasional."
                />
                <PartnerSlider items={data} />
            </div>
        </section>
    )
};

const PartnerSlider = ({ items }: { items: string[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const visibleCount = useResponsiveVisibleCount(4);
    const visibleItems = getVisibleItems(items, activeIndex, visibleCount);

    const moveSlide = (direction: 1 | -1) => {
        setActiveIndex(
            (current) => (current + direction + items.length) % items.length,
        );
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        setTouchStartX(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (touchStartX === null) {
            return;
        }

        const diff = event.clientX - touchStartX;
        setTouchStartX(null);

        if (Math.abs(diff) < 36) {
            return;
        }

        moveSlide(diff < 0 ? 1 : -1);
    };

    useEffect(() => {
        if (items.length <= visibleCount) {
            return;
        }

        const interval = window.setInterval(() => {
            moveSlide(1);
        }, 3600);

        return () => window.clearInterval(interval);
    }, [items.length, visibleCount]);

    return (
        <div
            className="mt-10 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleItems.map((partner, index) => (
                    <div
                        key={`${partner}-${activeIndex}`}
                        className={`group relative min-h-44 overflow-hidden rounded-3xl border border-slate-100 bg-[#F8FAFC] p-5 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#0F60AC]/10 ${index % 2 === 0
                            ? 'animate-in fade-in slide-in-from-bottom-4'
                            : 'animate-in fade-in slide-in-from-top-4'
                            }`}
                    >
                        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#F15F23]/10 transition duration-500 group-hover:scale-125" />
                        <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#56CCF2]/15 transition duration-500 group-hover:scale-125" />
                        <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0F60AC] shadow-sm ring-1 ring-slate-100 transition duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#0F60AC] group-hover:text-white">
                                    {index % 2 === 0 ? (
                                        <Building2 className="h-7 w-7" />
                                    ) : (
                                        <Handshake className="h-7 w-7" />
                                    )}
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-black tracking-wide text-[#F15F23] uppercase shadow-sm">
                                    Partner
                                </span>
                            </div>
                            <div className="relative mt-8">
                                <h3 className="text-xl font-black text-[#1E293B]">
                                    {partner}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                                    Kolaborasi untuk memperluas akses,
                                    pendampingan, dan pengalaman olimpiade anak
                                    Indonesia.
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};