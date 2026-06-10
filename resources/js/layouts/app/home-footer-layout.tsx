import { ArrowUp, Mail, MapPin, MessageCircleMore, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
} from 'react-icons/fa6';

export const HomeFooterComponent = () => {
    return (
        <footer className="relative overflow-hidden bg-[#0F60AC] text-white">
            <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-[#F15F23]/20 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#56CCF2]/15 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 lg:grid-cols-4">
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-3xl font-black">
                                OMATIQ<span className="text-[#FFC857]">.</span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/75">
                                Ekosistem belajar modern untuk pelajar, mentor,
                                sekolah, dan komunitas yang ingin tumbuh lewat
                                kreativitas dan kolaborasi.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {[FaFacebook, FaInstagram, FaTwitter, FaLinkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-5 text-lg font-bold">Navigasi</h3>
                        <ul className="space-y-3 text-sm text-white/75">
                            {[
                                ['Home', '/'],
                                ['About Us', '/about'],
                                ['Programs', '/programs'],
                                ['News', '/news'],
                                ['Contact', '/contact'],
                            ].map(([label, href]) => (
                                <li key={href}>
                                    <a href={href} className="transition hover:text-white">
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 text-lg font-bold">Program Unggulan</h3>
                        <ul className="space-y-3 text-sm text-white/75">
                            {[
                                'Creative Learning Lab',
                                'Community Builder Academy',
                                'Future Ready Classroom',
                                'Digital Skills Sprint',
                                'Mentor Circle',
                            ].map((item) => (
                                <li key={item}>
                                    <a href="/programs" className="transition hover:text-white">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 text-lg font-bold">Hubungi Kami</h3>
                        <div className="space-y-4 text-sm text-white/75">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 text-[#FFC857]" />
                                <p>Jakarta, Indonesia</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-[#FFC857]" />
                                <p>+62 812 0000 2026</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-[#FFC857]" />
                                <p>hello@omatiq.id</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="mb-3 text-sm font-medium">
                                Dapatkan Update Program
                            </p>
                            <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                <input
                                    type="email"
                                    placeholder="Email Anda"
                                    className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/50"
                                />
                                <button className="bg-[#F15F23] px-5 text-sm font-semibold text-white transition hover:opacity-90">
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-10 border-t border-white/10" />

                <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/60 md:flex-row">
                    <p>Copyright {new Date().getFullYear()} OMATIQ. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="transition hover:text-white">Privacy Policy</a>
                        <a href="#" className="transition hover:text-white">Terms & Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export const FloatingButtonSection = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
            <div className="group relative">
                <div className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 rounded-xl bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                    Chat WhatsApp
                </div>
                <a
                    href="https://wa.me/6281200002026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-green-600"
                >
                    <MessageCircleMore size={26} />
                </a>
            </div>

            {showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="group flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-black"
                >
                    <ArrowUp size={22} className="transition-transform group-hover:-translate-y-1" />
                </button>
            )}
        </div>
    );
};
