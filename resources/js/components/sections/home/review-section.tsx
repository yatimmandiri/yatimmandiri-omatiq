import { SectionHeader } from '@/components/marketing/marketing-components';
import { Quote, Star } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

type Review = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    avatar_url?: string | null;
    focus: string;
};

export const ReviewSection = ({ data }: { data: Review[] }) => {
    return (
        <section className="relative overflow-hidden px-5 py-16 lg:px-8">
            <div className="absolute top-16 left-0 h-40 w-40 rounded-full bg-[#E5BE1E]/20 blur-3xl" />
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
                <ReviewSlider items={data} />
            </div>
        </section>
    );
};

const ReviewSlider = ({ items }: { items: Review[] }) => {
    return (
        <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            speed={750}
            grabCursor
            watchOverflow
            rewind={items.length > 1}
            autoplay={{
                delay: 4200,
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
            {items.map((item, index) => (
                <SwiperSlide key={item.id} className="h-auto py-2">
                    <article
                        className={`group relative h-full min-h-0 overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#17524A]/10 sm:min-h-96 sm:rounded-[32px] sm:p-6 ${index % 3 === 0 ? 'lg:rotate-[-1deg]' : index % 3 === 2 ? 'lg:rotate-[1deg]' : ''}`}
                    >
                        <div className="absolute top-5 right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] transition group-hover:scale-110">
                            <Quote className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-4 pr-16">
                            <img
                                src={item.avatar_url || item.avatar}
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
                        <div className="mt-6 flex gap-1 text-[#E5BE1E]">
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
                        <div className="mt-6 inline-flex rounded-full bg-[#17524A]/10 px-4 py-2 text-xs font-black tracking-wide text-[#17524A] uppercase">
                            {item.focus}
                        </div>
                    </article>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
