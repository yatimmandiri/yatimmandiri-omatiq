import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const AboutSection = () => {
    const points = [
        'Pembinaan karakter islami yang kuat',
        'Pendidikan formal dan non-formal berkualitas',
        'Pelatihan keterampilan kemandirian ekonomi',
        'Pendampingan psikososial berkelanjutan',
    ];

    return (
        <section id="about" className="overflow-hidden bg-white py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000"
                                alt="Education for children"
                                className="aspect-4/5 w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        {/* Decorative boxes */}
                        <div className="absolute -right-6 -bottom-6 z-0 h-48 w-48 rounded-3xl bg-accent"></div>
                        <div className="absolute -top-6 -left-6 z-0 h-32 w-32 rounded-3xl border-4 border-primary/20"></div>

                        <div className="absolute bottom-10 left-10 z-20 max-w-50 rounded-2xl bg-white p-6 shadow-xl">
                            <p className="text-3xl font-bold text-primary">
                                15+
                            </p>
                            <p className="text-sm text-gray-600">
                                Tahun Mengabdi untuk Negeri
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="mb-4 block text-sm font-bold tracking-wider text-primary uppercase">
                            Tentang Omatiq
                        </span>
                        <h2 className="mb-6 font-serif text-4xl leading-tight font-bold text-gray-900 md:text-5xl">
                            Mewujudkan Kemandirian <br />
                            <span className="text-primary">
                                Yatim Indonesia
                            </span>
                        </h2>
                        <p className="mb-8 text-lg leading-relaxed text-gray-600">
                            Omatiq (Omah Yatim Mandiri) adalah program unggulan
                            Yatim Mandiri yang berfokus pada pemberdayaan
                            anak-anak yatim melalui asrama pembinaan. Kami
                            percaya bahwa setiap anak memiliki potensi besar
                            untuk menjadi pemimpin masa depan.
                        </p>

                        <div className="mb-10 space-y-4">
                            {points.map((point, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="rounded-full bg-primary/10 p-1">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-medium text-gray-700">
                                        {point}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="rounded-full border-2 border-primary px-8 py-3 font-bold text-primary transition-all hover:bg-primary hover:text-white">
                            Selengkapnya
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
