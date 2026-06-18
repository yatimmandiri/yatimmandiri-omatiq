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
    const page = usePage<any>();
    const { settings } = page.props;
    const currentPath = (page.url || '/').split('?')[0];
    const isHomePage = currentPath === '/';
    const useSolidHeader = isScrolled || !isHomePage;
    console.log(settings);

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
                className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${useSolidHeader
                    ? 'border-b border-slate-200/70 bg-white/95 shadow-xl shadow-[#0F60AC]/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/95'
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
                                <img
                                    src={'assets/images/LOGO OMATIQ.png'}
                                    className="h-12 w-28 rounded-2xl object-contain"
                                    alt="OMATIQ Logo"
                                />
                            </Fragment>
                        )}
                    </a>

                    <NavigationComponent solid={useSolidHeader} />

                    <button
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsMobileMenuOpen((open) => !open);
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl backdrop-blur-md transition lg:hidden ${isMobileMenuOpen
                            ? 'border border-[#F15F23] bg-[#F15F23] text-white'
                            : useSolidHeader
                                ? 'border border-slate-200 bg-white text-[#0F60AC] shadow-sm hover:bg-[#F8FAFC] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                                : 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
                            }`}
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
