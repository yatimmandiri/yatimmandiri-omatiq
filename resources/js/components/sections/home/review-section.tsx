import { SectionHeader } from "@/components/marketing/marketing-components";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getVisibleItems, useResponsiveVisibleCount } from "@/utils/uiResposive";
import { Quote, Star } from "lucide-react";
import { PointerEvent, useEffect, useState } from "react";

type Review = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    focus: string;
};

export const ReviewSection = ({ data }: { data: Review[] }) => {
    return (
        <section className="relative overflow-hidden px-5 py-16 lg:px-8">
            <div className="absolute top-16 left-0 h-40 w-40 rounded-full bg-[#FFC857]/20 blur-3xl" />
            <div className="absolute right-0 bottom-16 h-48 w-48 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
            <div className="relative mx-auto max-w-7xl">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <SectionHeader
                        eyebrow="Review Tokoh"
                        title="Dukungan dari para pemerhati pendidikan"
                        description="Beberapa tokoh dan praktisi melihat OMATIQ sebagai ruang lomba yang bisa membangun prestasi, karakter, dan keberanian anak Indonesia."
                        align="left"
                    />
                </div>
                <ReviewSlider
                    items={data}
                />
            </div>
        </section>
    );
};


const ReviewSlider = ({
    items,
}: {
    items: Review[];
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const visibleCount = useResponsiveVisibleCount(3);
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

        if (Math.abs(diff) < 40) {
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
        }, 4200);

        return () => window.clearInterval(interval);
    }, [items.length, visibleCount]);

    return (
        <div
            className="mt-10 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setTouchStartX(null)}
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item, index) => (
                    <article
                        key={`${item.id}-${activeIndex}`}
                        className={`group relative min-h-0 overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0F60AC]/10 sm:min-h-96 sm:rounded-[32px] sm:p-6 ${index === 0
                            ? 'lg:rotate-[-1deg]'
                            : index === 2
                                ? 'lg:rotate-[1deg]'
                                : ''
                            }`}
                    >
                        <div className="absolute top-5 right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F15F23]/10 text-[#F15F23] transition group-hover:scale-110">
                            <Quote className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-4 pr-16">
                            <img
                                src={item.avatar}
                                alt={item.name}
                                className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                            />
                            <div className="min-w-0">
                                <h3 className="text-lg font-black break-words text-[#1E293B]">
                                    {item.name}
                                </h3>
                                <p className="mt-1 text-sm leading-6 font-semibold text-[#64748B]">
                                    {item.role}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-1 text-[#FFC857]">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star
                                    key={starIndex}
                                    className="h-4 w-4 fill-current"
                                />
                            ))}
                        </div>
                        <p className="mt-5 text-base leading-8 text-[#1E293B]">
                            "{item.quote}"
                        </p>
                        <div className="mt-6 inline-flex rounded-full bg-[#0F60AC]/10 px-4 py-2 text-xs font-black tracking-wide text-[#0F60AC] uppercase">
                            {item.focus}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};