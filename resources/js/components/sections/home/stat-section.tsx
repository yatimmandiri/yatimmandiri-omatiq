import { motion } from 'motion/react';

export const StatSection = () => {
    const stats = [
        { label: 'Penerima Manfaat', value: '12,500+' },
        { label: 'Donatur Aktif', value: '8,200+' },
        { label: 'Asrama Omatiq', value: '45' },
        { label: 'Alumni Mandiri', value: '3,400+' },
    ];

    return (
        <section className="relative overflow-hidden bg-primary py-20">
            {/* Decorative background pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-white"></div>
                <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full border-8 border-white"></div>
            </div>

            <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-12 text-center lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <p className="mb-2 font-serif text-4xl font-bold text-accent md:text-5xl">
                                {stat.value}
                            </p>
                            <p className="text-xs font-medium tracking-wide text-white/80 uppercase md:text-sm">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
