import { BookOpen, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const BenefitSection = () => {
    const benefits = [
        {
            icon: <BookOpen className="h-8 w-8" />,
            title: 'Pendidikan Berkualitas',
            desc: 'Akses pendidikan formal dan beasiswa hingga jenjang perguruan tinggi.',
        },
        {
            icon: <ShieldCheck className="h-8 w-8" />,
            title: 'Lingkungan Aman',
            desc: 'Asrama yang nyaman dengan pengawasan dan bimbingan ustadz/ustadzah.',
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'Pembinaan Karakter',
            desc: 'Kurikulum tahfidz Quran dan pembentukan akhlakul karimah.',
        },
        {
            icon: <TrendingUp className="h-8 w-8" />,
            title: 'Life Skills',
            desc: 'Pelatihan kewirausahaan dan keterampilan praktis untuk masa depan.',
        },
    ];

    return (
        <section className="bg-surface py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900">
                            Manfaat Program
                        </h2>
                        <p className="text-lg text-gray-600">
                            Kami berkomitmen memberikan yang terbaik untuk
                            tumbuh kembang anak-anak yatim agar mereka siap
                            menghadapi tantangan zaman.
                        </p>
                    </motion.div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
                        >
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                {benefit.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900">
                                {benefit.title}
                            </h3>
                            <p className="leading-relaxed text-gray-600">
                                {benefit.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
