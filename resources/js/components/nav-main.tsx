import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useCallback, useMemo, useState } from 'react';

export const NavigationMain = ({ items }: any) => {
    const { auth } = usePage<any>().props;
    const { url } = usePage();

    const userRoles = auth.user.roles ?? [];
    const userPermissions = auth.user.permissions ?? [];

    const isSuperAdmin = userRoles.includes('Administrators');

    // 🔧 normalize path
    const normalizePath = (path: string) =>
        '/' + path.replace(/^\/+|\/+$/g, '');
    const currentPath = normalizePath(url);

    // 🔧 cache pathname
    const pathCache = useMemo(() => new Map<string, string>(), []);

    const getPathname = (href: string) => {
        if (!href) return '';

        if (pathCache.has(href)) return pathCache.get(href)!;

        let result = '';
        try {
            result = normalizePath(
                new URL(href, window.location.origin).pathname,
            );
        } catch {
            result = normalizePath(href);
        }

        pathCache.set(href, result);
        return result;
    };

    // 🔐 permission & role check
    const hasPermission = (permission: string) =>
        userPermissions.includes(permission);

    const hasRole = (requiredRoles: string[]) =>
        isSuperAdmin ||
        requiredRoles.length === 0 ||
        requiredRoles.some((role) => userRoles.includes(role));

    // 🔐 filter menu
    const filterMenu = useCallback(
        (menus: any[]): any[] => {
            return menus
                .map((item) => {
                    const requiredRoles: string[] = item.roles ?? [];

                    if (requiredRoles.length && !hasRole(requiredRoles))
                        return null;
                    if (item.permission && !hasPermission(item.permission))
                        return null;

                    const children = Array.isArray(item.children)
                        ? filterMenu(item.children)
                        : [];

                    if (!item.href && children.length === 0) return null;

                    return {
                        ...item,
                        children,
                    };
                })
                .filter(Boolean);
        },
        [userRoles, userPermissions],
    );

    const filteredItems = useMemo(() => filterMenu(items), [items, filterMenu]);

    // 🔧 helper
    const getMenuKey = (item: any, parents: string[] = []) => {
        return [...parents, item.title].join(' > ');
    };

    const isPathMatch = (target: string) =>
        currentPath === target || currentPath.startsWith(target + '/');

    // 🔍 check child match
    const hasMatchingChild = (children: any[]): boolean => {
        return children?.some((child) => {
            const childPath = getPathname(child.href || '');

            return (
                isPathMatch(childPath) ||
                (child.children?.length && hasMatchingChild(child.children))
            );
        });
    };

    // ⚡ auto open menu (NO useEffect)
    const autoOpenMenus = useMemo(() => {
        const map: Record<string, boolean> = {};

        const traverse = (menus: any[], parents: string[] = []) => {
            menus.forEach((item) => {
                const hasMatch = hasMatchingChild(item.children || []);

                if (hasMatch) {
                    [...parents, item.title].forEach((_, idx, arr) => {
                        const key = getMenuKey(
                            { title: arr[idx] },
                            arr.slice(0, idx),
                        );
                        map[key] = true;
                    });
                }

                if (item.children?.length) {
                    traverse(item.children, [...parents, item.title]);
                }
            });
        };

        traverse(filteredItems);
        return map;
    }, [filteredItems, currentPath]);

    // 🖱️ manual toggle
    const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

    const toggleMenu = (key: string) => {
        setManualOpen((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isOpen = (key: string) =>
        manualOpen[key] ?? autoOpenMenus[key] ?? false;

    // 🎯 render recursive
    const renderMenuItems = useCallback(
        (menuItems: any[], level = 0, parents: string[] = []) => {
            return menuItems.map((item) => {
                const itemPath = getPathname(item.href || '');
                const active = isPathMatch(itemPath);
                const hasChildren = !!item.children?.length;

                const key = getMenuKey(item, parents);
                const open = isOpen(key);

                return (
                    <SidebarMenuItem
                        key={key}
                        className={cn({
                            'pl-1': level === 1,
                            'pl-2': level === 2,
                            'pl-3': level >= 3,
                        })}
                    >
                        <div className="flex w-full items-center justify-between">
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                onClick={(e) => {
                                    if (hasChildren) {
                                        e.preventDefault();
                                        toggleMenu(key);
                                    }
                                }}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4" />
                                    )}
                                    <span className="flex-1 truncate text-left">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>

                            {hasChildren && (
                                <button
                                    onClick={() => toggleMenu(key)}
                                    className="focus:outline-none"
                                >
                                    {open ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {hasChildren && open && (
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
        },
        [currentPath, manualOpen, autoOpenMenus],
    );

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
