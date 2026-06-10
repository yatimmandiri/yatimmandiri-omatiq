import { usePage } from '@inertiajs/react';
import { Menu, Sparkles } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import {
    NavigationComponent,
    NavigationSidebarComponent,
} from './home-sidebar-layout';

export const HomeHeaderComponent = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { settings } = usePage<any>().props;

    const logoUrl = (() => {
        if (!settings?.logo) {
            return null;
        }

        if (settings.logo.startsWith('http') || settings.logo.startsWith('/')) {
            return settings.logo;
        }

        return `/storage/${settings.logo}`;
    })();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <Fragment>
            <header
                className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
                    isScrolled
                        ? 'border-b border-white/10 bg-[#0F60AC]/95 shadow-2xl backdrop-blur-xl'
                        : 'bg-transparent'
                }`}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <a href="/" className="flex items-center gap-3">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                className="h-12 w-28 rounded-2xl object-contain"
                                alt="OMATIQ Logo"
                            />
                        ) : (
                            <Fragment>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F15F23] font-black text-white shadow-lg shadow-[#F15F23]/25">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div className="text-white">
                                    <h1 className="text-lg font-black">
                                        OMATIQ
                                    </h1>
                                    <p className="text-xs text-white/65">
                                        Learn. Create. Grow.
                                    </p>
                                </div>
                            </Fragment>
                        )}
                    </a>

                    <NavigationComponent />

                    <a
                        href="/contact"
                        className="hidden rounded-xl bg-[#F15F23] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#F15F23]/20 transition hover:-translate-y-0.5 hover:bg-[#d94f18] lg:inline-flex"
                    >
                        Join Community
                    </a>

                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 lg:hidden"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </header>

            <NavigationSidebarComponent
                open={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </Fragment>
    );
};
