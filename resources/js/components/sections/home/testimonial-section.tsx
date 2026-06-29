import {
    SectionHeader,
    TestimonialCard,
} from '@/components/marketing/marketing-components';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

type Testimonial = {
    id: number;
    name: string;
    role: string;
    quote: string;
    rating: number;
    avatar: string;
    avatar_url?: string | null;
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
    );
};

const TestimonialSlider = ({ items }: { items: Testimonial[] }) => {
    return (
        <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            speed={750}
            grabCursor
            watchOverflow
            rewind={items.length > 1}
            autoplay={{
                delay: 4800,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            }}
            className="mt-10"
        >
            {items.map((testimonial) => (
                <SwiperSlide key={testimonial.id} className="h-auto py-2">
                    <div className="h-full">
                        <TestimonialCard
                            testimonial={{
                                ...testimonial,
                                avatar:
                                    testimonial.avatar_url ||
                                    testimonial.avatar,
                            }}
                        />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
