import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { House } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList className="flex-nowrap overflow-hidden">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const isFirst = index === 0;
                    // Di layar kecil hanya tampilkan 2 terakhir agar tidak overflow
                    const hideOnMobile =
                        breadcrumbs.length > 2 &&
                        index < breadcrumbs.length - 2;

                    return (
                        <Fragment key={`${item.title}-${index}`}>
                            <BreadcrumbItem
                                className={cn(
                                    'min-w-0',
                                    hideOnMobile && 'hidden sm:list-item',
                                )}
                            >
                                {isLast ? (
                                    <BreadcrumbPage className="max-w-40 truncate sm:max-w-64">
                                        {item.title}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={item.href}
                                            className="flex max-w-32 items-center gap-1.5 truncate sm:max-w-48"
                                        >
                                            {isFirst && (
                                                <House className="size-3.5 shrink-0" />
                                            )}
                                            <span className="truncate">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator
                                    className={cn(
                                        hideOnMobile && 'hidden sm:list-item',
                                    )}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
