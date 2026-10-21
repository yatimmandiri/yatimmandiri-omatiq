import {
    ArrowUp,
    ExternalLink,
    Mail,
    MapPin,
    MessageCircleMore,
    Phone,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    buildWhatsappUrl,
    parseWhatsappContacts,
} from '@/utils/whatsapp';
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
    FaWhatsapp,
} from 'react-icons/fa6';

export const HomeFooterComponent = () => {
    const { settings } = usePage<any>().props;

    const address = settings?.address || 'Jakarta, Indonesia';
    const phone = settings?.phone || '+62 812 0000 2026';
    const email = settings?.email || 'hello@omatiq.id';

    const contacts = useMemo(
        () => parseWhatsappContacts(settings?.social?.whatsapp || settings?.whatsapp),
        [settings?.social?.whatsapp, settings?.whatsapp],
    );

    const primaryContact = contacts[0];
    const displayPhone = primaryContact?.number || phone;
    const phoneLink = primaryContact
        ? buildWhatsappUrl(primaryContact.number)
        : `tel:${phone.replace(/\D/g, '')}`;

    return (
        <footer className="relative overflow-hidden bg-[#17524A] text-white">
            <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-[#17524A]/20 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#56CCF2]/15 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16">
                <div className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1: Brand & Socials */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">
                                OMATIQ<span className="text-[#E5BE1E]">.</span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/80">
                                Ekosistem belajar modern untuk pelajar, mentor,
                                sekolah, dan komunitas yang ingin tumbuh lewat
                                kreativitas dan kolaborasi.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {[
                                {
                                    Icon: FaFacebook,
                                    href: settings?.social?.facebook
                                        ? `https://facebook.com/${settings.social.facebook}`
                                        : '#',
                                },
                                {
                                    Icon: FaInstagram,
                                    href: settings?.social?.instagram
                                        ? `https://instagram.com/${settings.social.instagram}`
                                        : '#',
                                },
                                {
                                    Icon: FaTwitter,
                                    href: settings?.social?.twitter
                                        ? `https://x.com/${settings.social.twitter}`
                                        : '#',
                                },
                                {
                                    Icon: FaLinkedin,
                                    href: '#',
                                },
                            ].map(({ Icon, href }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    target={href !== '#' ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Navigasi */}
                    <div>
                        <h3 className="mb-6 text-lg font-bold tracking-tight text-white">
                            Navigasi
                        </h3>
                        <ul className="space-y-3.5 text-sm text-white/80">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Olimpiade', href: '/olimpiade' },
                                { label: 'News', href: '/berita' },
                                { label: 'Contact', href: '/kontak' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="transition hover:text-white"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Olimpiade */}
                    <div>
                        <h3 className="mb-6 text-lg font-bold tracking-tight text-white">
                            Olimpiade
                        </h3>
                        <ul className="space-y-3.5 text-sm text-white/80">
                            {[
                                { label: 'Olimpiade Al-Quran', href: '/olimpiade' },
                                { label: 'Olimpiade Matematika', href: '/olimpiade' },
                                { label: 'Try Out Nasional', href: '/jadwal' },
                                { label: 'Kelas Persiapan', href: '/jadwal' },
                                { label: 'Final Nasional', href: '/jadwal' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="transition hover:text-white"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Hubungi Kami & Newsletter */}
                    <div>
                        <h3 className="mb-6 text-lg font-bold tracking-tight text-white">
                            Hubungi Kami
                        </h3>
                        <div className="space-y-4 text-sm text-white/85">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#E5BE1E]"
                                />
                                <p>{address}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone
                                    size={19}
                                    className="shrink-0 text-[#E5BE1E]"
                                />
                                <a
                                    href={phoneLink}
                                    target={primaryContact ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="transition hover:text-white"
                                >
                                    {displayPhone}
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail
                                    size={19}
                                    className="shrink-0 text-[#E5BE1E]"
                                />
                                <a
                                    href={`mailto:${email}`}
                                    className="transition hover:text-white"
                                >
                                    {email}
                                </a>
                            </div>
                        </div>

                        <div className="mt-7">
                            <p className="mb-3 text-sm font-bold text-white">
                                Dapatkan Update Olimpiade
                            </p>
                            <div className="flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/10">
                                <input
                                    type="email"
                                    placeholder="Email Anda"
                                    className="w-full bg-[#F1F5F9] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white"
                                />
                                <button
                                    type="button"
                                    className="shrink-0 bg-[#17524A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#134e45]"
                                >
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-10 border-t border-white/10" />

                <div className="flex flex-col items-start justify-between gap-4 text-sm text-white/60 sm:items-center md:flex-row">
                    <p>
                        Copyright {new Date().getFullYear()} OMATIQ. All rights
                        reserved.
                    </p>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <a href="#" className="transition hover:text-white">
                            Privacy Policy
                        </a>
                        <a href="#" className="transition hover:text-white">
                            Terms & Conditions
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export const FloatingButtonSection = () => {
    const { settings } = usePage<any>().props;
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const contacts = useMemo(
        () => parseWhatsappContacts(settings?.social?.whatsapp || settings?.whatsapp),
        [settings?.social?.whatsapp, settings?.whatsapp],
    );

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Close contact popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                setShowContactModal(false);
            }
        };

        if (showContactModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showContactModal]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWhatsappClick = (e: React.MouseEvent) => {
        // If there's more than 1 contact, toggle popover modal
        if (contacts.length > 1) {
            e.preventDefault();
            setShowContactModal((prev) => !prev);
        }
    };

    // If only 1 contact, direct link
    const singleContact = contacts[0];
    const directWhatsappUrl = singleContact
        ? buildWhatsappUrl(singleContact.number)
        : 'https://wa.me/628111343577';

    return (
        <div
            ref={popoverRef}
            className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
        >
            {/* Multi-Admin Popover Card */}
            {showContactModal && contacts.length > 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <FaWhatsapp size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                                    Hubungi Admin OMATIQ
                                </h4>
                                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    ● Siap Melayani
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowContactModal(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mt-3 space-y-2">
                        {contacts.map((contact, idx) => (
                            <a
                                key={idx}
                                href={buildWhatsappUrl(contact.number)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowContactModal(false)}
                                className="hover:shadow-xs group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 dark:text-slate-200 dark:group-hover:text-emerald-400">
                                        {contact.name}
                                    </p>
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        {contact.number}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105 group-hover:bg-emerald-500">
                                    <ExternalLink size={14} />
                                </div>
                            </a>
                        ))}
                    </div>

                    <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">
                        Pilih admin sesuai kebutuhan bantuan pendaftaran Anda.
                    </p>
                </div>
            )}

            <div className="group relative">
                {!showContactModal && (
                    <div className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 rounded-xl bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                        {contacts.length > 1
                            ? 'Pilih Kontak WhatsApp'
                            : 'Chat WhatsApp'}
                    </div>
                )}
                <a
                    href={directWhatsappUrl}
                    target={contacts.length > 1 ? undefined : '_blank'}
                    rel={contacts.length > 1 ? undefined : 'noopener noreferrer'}
                    onClick={handleWhatsappClick}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-emerald-600 sm:h-14 sm:w-14"
                    aria-label="Kontak WhatsApp"
                >
                    <MessageCircleMore size={26} />
                </a>
            </div>

            {showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-black sm:h-14 sm:w-14"
                >
                    <ArrowUp
                        size={22}
                        className="transition-transform group-hover:-translate-y-1"
                    />
                </button>
            )}
        </div>
    );
};
