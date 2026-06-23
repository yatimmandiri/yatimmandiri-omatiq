import { SectionHeader, TestimonialCard } from "@/components/marketing/marketing-components";
import { getVisibleItems, useResponsiveVisibleCount } from "@/utils/uiResposive";
import { PointerEvent, useEffect, useState } from "react";

type Testimonial = {
    id: number;
    name: string;
    role: string;
    quote: string;
    rating: number;
    avatar: string;
};

export const TestimonialSection = ({ data }: { data: Testimonial[] }) => {
    return (
        <section className="bg-white px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Testimonials"
                    title="Dipercaya oleh orang tua, guru, dan komunitas"
                    description="OMATIQ membantu anak-anak berani mencoba, disiplin berlatih, dan bangga pada proses belajarnya."
                />
                <TestimonialSlider items={data} />
            </div>
        </section>
    )
};

const TestimonialSlider = ({ items }: { items: Testimonial[] }) => {
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
        }, 4800);

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
                {visibleItems.map((testimonial) => (
                    <TestimonialCard
                        key={`${testimonial.id}-${activeIndex}`}
                        testimonial={testimonial}
                    />
                ))}
            </div>
        </div>
    );
};