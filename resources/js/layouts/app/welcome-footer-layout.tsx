import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export const MainFooterLayout = () => {
    const menuPageLink: any = [
        {
            name: 'Tentang Kami',
            href: '#',
        },
        {
            name: 'Hubungi Kami',
            href: '#',
        },
        {
            name: 'Kebijakan Privasi',
            href: '#',
        },
        {
            name: 'Syarat dan Ketentuan',
            href: '#',
        },
        {
            name: 'Blog',
            href: '#',
        },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer id="footer" className="bg-gray-900 pt-20 pb-10 text-gray-300">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <Heart
                                    className="h-6 w-6 text-accent"
                                    fill="currentColor"
                                />
                            </div>
                            <span className="font-serif text-2xl font-bold text-white">
                                Omatiq
                            </span>
                        </div>
                        <p className="leading-relaxed text-gray-400">
                            Program pemberdayaan yatim mandiri yang berfokus
                            pada pendidikan, karakter, dan kemandirian ekonomi
                            untuk masa depan Indonesia yang lebih baik.
                        </p>
                        <div className="flex gap-4">
                            {[
                                FaFacebook,
                                FaInstagram,
                                FaTwitter,
                                FaYoutube,
                            ].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all hover:bg-primary hover:text-white"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-6 text-lg font-bold text-white">
                            Tautan Cepat
                        </h4>
                        <ul className="space-y-4">
                            {[
                                'Beranda',
                                'Tentang Kami',
                                'Program Unggulan',
                                'Testimoni',
                                'Donasi',
                            ].map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="flex items-center gap-2 transition-colors hover:text-accent"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="mb-6 text-lg font-bold text-white">
                            Kontak Kami
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <MapPin
                                    className="shrink-0 text-white"
                                    size={20}
                                />
                                <span>
                                    Jl. Raya Sarirogo No.1, Sidoarjo, Jawa Timur
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <Phone
                                    className="shrink-0 text-white"
                                    size={20}
                                />
                                <span>(031) 8954321</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail
                                    className="shrink-0 text-white"
                                    size={20}
                                />
                                <span>info@yatimmandiri.org</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="mb-6 text-lg font-bold text-white">
                            Newsletter
                        </h4>
                        <p className="mb-6 text-gray-400">
                            Dapatkan update terbaru mengenai program dan laporan
                            donasi kami.
                        </p>
                        <form className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                            />
                            <button className="hover:bg-primary-light w-full rounded-xl bg-primary py-3 font-bold text-white transition-all">
                                Berlangganan
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-10 text-center text-sm text-gray-500">
                    <p>
                        © {currentYear} Omatiq Yatim Mandiri. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
