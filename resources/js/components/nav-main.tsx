import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export const NavigationMain = ({ items = [] }: { items: any[] }) => {
    const { auth } = usePage<any>().props;

    const userRoles = auth.user?.roles ?? [];
    const userPermissions = auth.user?.permissions ?? [];

    console.log(userRoles);
    console.log(userPermissions);

    const filterMenu = (menus: any[]): any[] => {
        return menus
            .map((item) => {
                // 🔐 role check
                if (item.roles?.length) {
                    const hasRole = item.roles.some((role: string) =>
                        userRoles.includes(role),
                    );

                    if (!hasRole) return null;
                }

                // 🔐 permission check
                if (item.permission) {
                    if (!userPermissions.includes(item.permission)) {
                        return null;
                    }
                }

                // 🔁 recursive children
                const children = item.children ? filterMenu(item.children) : [];

                // ❌ kalau tidak punya link & children kosong → buang
                if (!item.href && children.length === 0) {
                    return null;
                }

                return {
                    ...item,
                    children,
                };
            })
            .filter(Boolean);
    };

    const filteredMenu = filterMenu(items);

    const renderMenuItems = (
        menuItems: any[],
        level = 0,
        parents: string[] = [],
    ) => {
        console.log(menuItems);

        return <div></div>;
    };

    return (
        <div className="flex flex-col">
            {filteredMenu.map((item, i) => (
                <SidebarGroup key={i}>
                    <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenu>
                            {renderMenuItems(item.children || [], 0, [
                                item.title,
                            ])}
                        </SidebarMenu>
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
};
