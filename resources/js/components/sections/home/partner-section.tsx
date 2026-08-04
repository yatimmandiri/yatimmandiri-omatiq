import { SectionHeader } from '@/components/marketing/marketing-components';
import { Building2, Handshake } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

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
    );
};

const PartnerSlider = ({ items }: { items: string[] }) => {
    return (
        <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            speed={700}
            grabCursor
            watchOverflow
            rewind={items.length > 1}
            autoplay={{
                delay: 3600,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
            }}
            className="mt-10"
        >
            {items.map((partner, index) => (
                <SwiperSlide
                    key={`${partner}-${index}`}
                    className="h-auto py-2"
                >
                    <div className="group relative h-full min-h-44 overflow-hidden rounded-3xl border border-slate-100 bg-[#F8FAFC] p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-[#17524A]/10">
                        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#17524A]/10 transition duration-500 group-hover:scale-125" />
                        <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#56CCF2]/15 transition duration-500 group-hover:scale-125" />
                        <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#17524A] shadow-sm ring-1 ring-slate-100 transition duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#17524A] group-hover:text-white">
                                    {index % 2 === 0 ? (
                                        <Building2 className="h-7 w-7" />
                                    ) : (
                                        <Handshake className="h-7 w-7" />
                                    )}
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-black tracking-wide text-[#17524A] uppercase shadow-sm">
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
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
