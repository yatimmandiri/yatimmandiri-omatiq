import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { settings } = usePage<any>().props;

    const logoUrl = (() => {
        if (settings.logo?.startsWith('http')) {
            return settings.logo;
        }

        return `/storage/${settings.logo}`;
    })();

    return (
        <>
            <div
                className={cn(
                    !settings.logo && 'bg-sidebar-primary',
                    'flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground',
                )}
            >
                {settings.logo ? (
                    <img src={logoUrl} alt="Logo" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Laravel Starter Kit
                </span>
            </div>
        </>
    );
}
