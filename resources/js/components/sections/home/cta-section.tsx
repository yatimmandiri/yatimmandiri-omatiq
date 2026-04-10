import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const CTASection = () => {
    return (
        <section className="relative overflow-hidden py-24">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&q=80&w=2000"
                    alt="Hands together"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] border border-white/20 bg-white/10 p-12 shadow-2xl backdrop-blur-xl md:p-20"
                    >
                        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-lg">
                            <Heart
                                className="h-10 w-10 text-primary"
                                fill="currentColor"
                            />
                        </div>
                        <h2 className="mb-6 font-serif text-4xl leading-tight font-bold text-white md:text-6xl">
                            Mari Menjadi Bagian dari <br />
                            <span className="text-accent">Perubahan Nyata</span>
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-white/90">
                            Setiap rupiah yang Anda donasikan adalah investasi
                            untuk masa depan anak-anak yatim yang lebih cerah
                            dan mandiri.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <button className="rounded-full bg-accent px-10 py-4 text-xl font-bold text-primary shadow-xl transition-all hover:bg-accent/90 hover:shadow-accent/40 active:scale-95">
                                Donasi Sekarang
                            </button>
                            <button className="rounded-full bg-white px-10 py-4 text-xl font-bold text-primary shadow-xl transition-all hover:bg-gray-100 active:scale-95">
                                Hubungi Kami
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
