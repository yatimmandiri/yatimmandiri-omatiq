import { Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export const TestimonialSection = () => {
    const testimonials = [
        {
            name: 'Bpk. Ahmad Subarjo',
            role: 'Donatur Tetap',
            text: 'Saya merasa tenang menitipkan donasi di Omatiq. Laporannya transparan dan saya bisa melihat langsung perkembangan anak-anak di asrama.',
            image: 'https://i.pravatar.cc/150?u=ahmad',
        },
        {
            name: 'Siti Aminah',
            role: 'Alumni Omatiq',
            text: 'Berkat Omatiq, saya bisa kuliah dan sekarang bekerja sebagai perawat. Omatiq bukan sekadar asrama, tapi keluarga bagi saya.',
            image: 'https://i.pravatar.cc/150?u=siti',
        },
        {
            name: 'Ibu Ratna',
            role: 'Donatur',
            text: 'Programnya sangat terukur. Fokus pada kemandirian adalah kunci agar anak-anak yatim tidak hanya bergantung pada belas kasihan.',
            image: 'https://i.pravatar.cc/150?u=ratna',
        },
    ];

    return (
        <section id="testimonials" className="bg-surface overflow-hidden py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900">
                        Apa Kata Mereka?
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Kisah inspiratif dari para donatur dan penerima manfaat
                        yang telah menjadi bagian dari keluarga besar Omatiq.
                    </p>
                </div>

                <div className="mx-auto max-w-5xl">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000 }}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                            },
                        }}
                        className="pb-16"
                    >
                        {testimonials.map((item, index) => (
                            <SwiperSlide key={index}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="relative flex h-full flex-col rounded-4xl border border-gray-100 bg-white p-10 shadow-sm"
                                >
                                    <Quote className="absolute top-6 right-6 h-16 w-16 text-primary/10" />
                                    <p className="relative z-10 mb-8 grow text-lg text-gray-600 italic">
                                        "{item.text}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-14 w-14 rounded-full border-2 border-primary/20 object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm font-medium text-primary">
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};
