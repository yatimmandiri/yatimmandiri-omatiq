import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown, X } from 'lucide-react';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { BsFacebook, BsInstagram, BsTiktok, BsYoutube } from 'react-icons/bs';

export const SidebarContext = createContext({});

export const UseSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const menus = [
        { label: 'Home', href: '/' },
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Program', href: '/programs' },
        { label: 'Artikel', href: '/berita' },
        { label: 'Kontak', href: '/kontak' },
    ];

    const socials = useMemo(
        () => [
            { id: 1, name: 'Facebook', url: '#', icon: BsFacebook },
            { id: 2, name: 'Instagram', url: '#', icon: BsInstagram },
            { id: 3, name: 'Tiktok', url: '#', icon: BsTiktok },
            { id: 4, name: 'Youtube', url: '#', icon: BsYoutube },
        ],
        [],
    );

    return (
        <SidebarContext.Provider value={{ menus, socials }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const NavigationComponent = () => {
    const { menus }: any = UseSidebar();

    return (
        <nav className="hidden items-center gap-1 lg:flex">
            {menus.map((menu: any) => (
                <div key={menu.href} className="group relative">
                    <a
                        href={menu.href}
                        className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/10 hover:text-white"
                    >
                        {menu.label}
                        {menu.children && <ChevronDown size={16} />}
                    </a>

                    {menu.children && (
                        <div className="pointer-events-none absolute top-full left-0 mt-3 min-w-56 translate-y-3 rounded-2xl border border-white/10 bg-slate-950/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                            {menu.children.map((child: any) => (
                                <a
                                    key={child.href}
                                    href={child.href}
                                    className="block rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                                >
                                    {child.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
};

type NavigationSidebarComponentProps = {
    open: boolean;
    onClose: () => void;
};

export const NavigationSidebarComponent = ({
    open,
    onClose,
}: NavigationSidebarComponentProps) => {
    const { menus, socials }: any = UseSidebar();

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999]">
            <button
                type="button"
                aria-label="Close navigation menu"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="absolute inset-y-0 right-0 w-full max-w-sm shadow-2xl">
                <div className="flex h-full flex-col overflow-y-auto bg-slate-950">
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <div>
                            <h2 className="text-xl font-black text-white">
                                OMATIQ.
                            </h2>
                            <p className="text-sm text-white/60">
                                Learn. Create. Grow.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Close navigation menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 p-6">
                        {menus.map((menu: any) => (
                            <div
                                key={menu.href}
                                className="overflow-hidden rounded-2xl border border-white/5 bg-white/3"
                            >
                                {menu.children ? (
                                    <Disclosure>
                                        {({ open: isOpen }) => (
                                            <>
                                                <DisclosureButton className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-white transition hover:bg-white/5">
                                                    <span>{menu.label}</span>
                                                    <ChevronDown
                                                        size={18}
                                                        className={`transition ${isOpen ? 'rotate-180' : ''}`}
                                                    />
                                                </DisclosureButton>
                                                <DisclosurePanel className="border-t border-white/5">
                                                    {menu.children.map((child: any) => (
                                                        <a
                                                            key={child.href}
                                                            href={child.href}
                                                            className="block px-6 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                                                            onClick={onClose}
                                                        >
                                                            {child.label}
                                                        </a>
                                                    ))}
                                                </DisclosurePanel>
                                            </>
                                        )}
                                    </Disclosure>
                                ) : (
                                    <a
                                        href={menu.href}
                                        className="block px-4 py-4 text-sm font-medium text-white transition hover:bg-white/5"
                                        onClick={onClose}
                                    >
                                        {menu.label}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 bg-white px-5 py-6">
                        <p className="text-center text-sm font-semibold text-slate-700">
                            Temukan & Ikuti Kami
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            {socials.map((social: any) => (
                                <a
                                    key={social.id}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F15F23] text-white transition hover:scale-105"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                            Copyright {new Date().getFullYear()} OMATIQ
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
};
