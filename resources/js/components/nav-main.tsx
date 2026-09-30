import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

const filterMenuByPermissions = (
    menus: any[],
    hasRole: (requiredRoles: string[]) => boolean,
    hasPermission: (permission: string) => boolean,
): any[] => {
    return menus
        .map((item) => {
            const requiredRoles: string[] = item.roles ?? [];

            if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
                return null;
            }

            if (item.permission && !hasPermission(item.permission)) {
                return null;
            }

            const filteredChildren = Array.isArray(item.children)
                ? filterMenuByPermissions(item.children, hasRole, hasPermission)
                : [];

            if (!item.href && filteredChildren.length === 0) {
                return null;
            }

            return {
                ...item,
                children: filteredChildren,
            };
        })
        .filter(Boolean);
};

export const MainNav = ({ items }: any) => {
    const { auth } = usePage<any>().props;
    const { currentUrl } = useCurrentUrl();

    const roles = useMemo(() => auth.user.roles || [], [auth.user.roles]);
    const permissions = useMemo(
        () => auth.user.permissions || [],
        [auth.user.permissions],
    );

    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    const normalizePath = (path: string) =>
        '/' + path.replace(/^\/+|\/+$/g, '');

    const currentPath = normalizePath(currentUrl);

    const getPathname = (href: string) => {
        if (!href) {
            return '';
        }

        try {
            const origin =
                typeof window !== 'undefined'
                    ? window.location.origin
                    : 'http://localhost';

            return normalizePath(new URL(href, origin).pathname);
        } catch {
            return normalizePath(href);
        }
    };

    const hasPermission = useCallback(
        (permission: string) => permissions.includes(permission),
        [permissions],
    );

    const hasRole = useCallback(
        (requiredRoles: string[]) =>
            requiredRoles.length === 0 ||
            requiredRoles.some((role) => roles.includes(role)),
        [roles],
    );

    const filteredItems = useMemo(() => {
        return filterMenuByPermissions(items, hasRole, hasPermission);
    }, [items, hasRole, hasPermission]);

    const getMenuKey = (item: any, parents: string[] = []) => {
        return [...parents, item.title].join(' > ');
    };

    const hasExactMatchingChild = (children: any[]): boolean => {
        return children?.some((child) => {
            const childPath = getPathname(child.href || '');

            // cocokkan exact atau prefix match
            const isMatch =
                currentPath === childPath ||
                currentPath.startsWith(childPath + '/');

            return (
                isMatch ||
                (child.children?.length &&
                    hasExactMatchingChild(child.children))
            );
        });
    };

    const isDashboard =
        currentPath === '/admin' ||
        currentPath === '/admin/dashboard' ||
        currentPath === '/teacher/dashboard' ||
        currentPath === '/student/dashboard';

    const [prevPath, setPrevPath] = useState(currentPath);

    useEffect(() => {
        if (prevPath === currentPath) {
            return;
        }

        setPrevPath(currentPath);

        if (isDashboard) {
            setOpenMenus({});
        } else {
            const newOpenMenus: { [key: string]: boolean } = {};

            const traverse = (menus: any[], parents: string[] = []) => {
                menus.forEach((item) => {
                    const hasMatchChild = hasExactMatchingChild(
                        item.children || [],
                    );

                    if (hasMatchChild) {
                        [...parents, item.title].forEach((_, idx, arr) => {
                            const key = getMenuKey(
                                { title: arr[idx] },
                                arr.slice(0, idx),
                            );
                            newOpenMenus[key] = true;
                        });
                    }

                    if (item.children?.length) {
                        traverse(item.children, [...parents, item.title]);
                    }
                });
            };

            traverse(filteredItems);
            setOpenMenus(newOpenMenus);
        }
    }, [currentPath, prevPath, isDashboard, filteredItems]);

    const toggleMenu = (key: string) => {
        setOpenMenus((prev: any) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isPathActive = (itemPath: string): boolean => {
        if (!itemPath || itemPath === '/') {
            return currentPath === itemPath;
        }

        return (
            currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
        );
    };

    const renderMenuItems = (
        menuItems: any[],
        level = 0,
        parents: string[] = [],
    ) => {
        return menuItems.map((item) => {
            const itemPath = getPathname(item.href || '');
            const hasChildren = !!item.children?.length;
            const menuKey = getMenuKey(item, parents);
            const isOpen = openMenus[menuKey] || false;
            const activeDescendant =
                hasChildren && hasExactMatchingChild(item.children || []);
            const isActive = !hasChildren && isPathActive(itemPath);

            return (
                <SidebarMenuItem
                    key={menuKey}
                    className={cn({
                        'pl-1': level === 1,
                        'pl-2': level === 2,
                        'pl-3': level >= 3,
                    })}
                >
                    <SidebarMenuButton
                        asChild={!hasChildren}
                        isActive={isActive || activeDescendant}
                        tooltip={{ children: item.title }}
                        aria-expanded={hasChildren ? isOpen : undefined}
                        onClick={(e) => {
                            if (hasChildren) {
                                e.preventDefault();
                                toggleMenu(menuKey);
                            }
                        }}
                        className={cn(
                            hasChildren && 'cursor-pointer',
                            hasChildren &&
                                activeDescendant &&
                                !isOpen &&
                                'text-[#17524A] dark:text-emerald-400',
                        )}
                    >
                        {hasChildren ? (
                            <span className="flex w-full items-center gap-2">
                                {item.icon && (
                                    <item.icon className="size-4 shrink-0" />
                                )}
                                <span className="flex-1 truncate text-left">
                                    {item.title}
                                </span>
                                {isOpen ? (
                                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                )}
                            </span>
                        ) : (
                            <Link href={item.href || '#'} prefetch>
                                {item.icon && (
                                    <item.icon className="size-4 shrink-0" />
                                )}
                                <span className="flex-1 truncate text-left">
                                    {item.title}
                                </span>
                            </Link>
                        )}
                    </SidebarMenuButton>

                    {hasChildren && isOpen && (
                        <SidebarMenu className="mt-1">
                            {renderMenuItems(item.children, level + 1, [
                                ...parents,
                                item.title,
                            ])}
                        </SidebarMenu>
                    )}
                </SidebarMenuItem>
            );
        });
    };

    return (
        <Fragment>
            {filteredItems.map((group) => (
                <SidebarGroup key={group.title} className="px-2">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {renderMenuItems(group.children || [], 0, [
                            group.title,
                        ])}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </Fragment>
    );
};
