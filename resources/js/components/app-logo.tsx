import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { settings } = usePage<any>().props;
    const year = new Date().getFullYear();

    const logoUrl = (() => {
        if (!settings?.logo) {
            return null;
        }

        if (settings.logo.startsWith('http') || settings.logo.startsWith('/')) {
            return settings.logo;
        }

        return `/storage/${settings.logo}`;
    })();

    return (
        <>
            <div
                className={cn(
                    !settings?.logo && 'bg-sidebar-primary',
                    'flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground',
                )}
            >
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Logo OMATIQ"
                        className="size-full rounded-md object-contain"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    OMATIQ {year}
                </span>
            </div>
        </>
    );
}
