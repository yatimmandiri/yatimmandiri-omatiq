import { Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export const MainHeaderLayout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beranda', href: '#' },
        { name: 'Tentang', href: '#about' },
        { name: 'Program', href: '#programs' },
        { name: 'Testimoni', href: '#testimonials' },
        { name: 'Kontak', href: '#footer' },
    ];

    return (
        <nav
            className={`fixed z-50 w-full transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 py-3 shadow-sm backdrop-blur-md'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Heart
                                className="h-6 w-6 text-accent"
                                fill="currentColor"
                            />
                        </div>
                        <span
                            className={`font-serif text-xl font-bold ${scrolled ? 'text-primary' : 'text-white'}`}
                        >
                            Omatiq
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden items-center space-x-8 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                                    scrolled ? 'text-gray-700' : 'text-white'
                                }`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button className="hover:bg-primary-light flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95">
                            Donasi Sekarang
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`${scrolled ? 'text-primary' : 'text-white'}`}
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
                    >
                        <div className="space-y-1 px-4 pt-2 pb-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block rounded-lg px-3 py-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="px-3 pt-4">
                                <button className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-md">
                                    Donasi Sekarang
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
