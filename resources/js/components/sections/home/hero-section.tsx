import { ArrowRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroSection = () => {
    return (
        <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000"
                    alt="Children smiling"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/70 to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-accent-light mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                            <Heart size={16} fill="currentColor" />
                            Program Pemberdayaan Yatim
                        </span>
                        <h1 className="mb-6 font-serif text-5xl leading-tight font-bold text-white md:text-7xl">
                            Omatiq <br />
                            <span className="text-accent">Yatim Mandiri</span>
                        </h1>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-100 md:text-xl">
                            Membangun masa depan yatim yang mandiri, berakhlak
                            mulia, dan berdaya saing melalui pendidikan dan
                            pembinaan berkelanjutan.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <button className="group flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                Donasi Sekarang
                                <ArrowRight className="transition-transform group-hover:translate-x-1" />
                            </button>
                            <button className="flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20">
                                Pelajari Program
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-16 flex items-center gap-8"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/100?u=${i}`}
                                    alt="Donatur"
                                    className="h-12 w-12 rounded-full border-2 border-primary object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ))}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-accent text-xs font-bold text-primary">
                                +1k
                            </div>
                        </div>
                        <div className="text-white">
                            <p className="text-xl font-bold">1,240+</p>
                            <p className="text-sm text-gray-300">
                                Donatur Aktif
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute right-0 bottom-0 -mr-20 -mb-20 h-1/2 w-1/3 rounded-full bg-accent/10 blur-[120px]"></div>
        </section>
    );
};
