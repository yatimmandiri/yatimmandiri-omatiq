import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const ProgramSection = () => {
    const programs = [
        {
            title: 'Asrama Omatiq',
            desc: 'Pusat pembinaan intensif bagi anak yatim dengan fasilitas asrama yang memadai.',
            image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
            category: 'Pendidikan',
        },
        {
            title: 'Beasiswa Prestasi',
            desc: 'Dukungan dana pendidikan bagi yatim berprestasi di tingkat sekolah dan universitas.',
            image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
            category: 'Sosial',
        },
        {
            title: 'Kemandirian Ekonomi',
            desc: 'Pelatihan skill menjahit, memasak, dan IT untuk bekal kemandirian setelah lulus.',
            image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
            category: 'Skill',
        },
    ];

    return (
        <section id="programs" className="bg-white py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
                    <div className="max-w-2xl">
                        <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900">
                            Program Unggulan
                        </h2>
                        <p className="text-lg text-gray-600">
                            Berbagai inisiatif yang dirancang khusus untuk
                            memastikan setiap anak yatim mendapatkan kesempatan
                            yang sama untuk sukses.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-3">
                        Lihat Semua Program <ArrowRight size={20} />
                    </button>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <div className="relative mb-6 aspect-4/3 overflow-hidden rounded-3xl">
                                <img
                                    src={program.image}
                                    alt={program.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-1 text-xs font-bold tracking-wider text-primary uppercase backdrop-blur-sm">
                                    {program.category}
                                </div>
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-primary">
                                {program.title}
                            </h3>
                            <p className="mb-6 line-clamp-2 text-gray-600">
                                {program.desc}
                            </p>
                            <button className="flex items-center gap-2 text-sm font-bold text-primary transition-transform group-hover:translate-x-2">
                                Detail Program <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
