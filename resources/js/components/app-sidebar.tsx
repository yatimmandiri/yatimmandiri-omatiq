import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavigationList } from '@/data/menus';
import { Link, usePage } from '@inertiajs/react';
import { MainNav } from './nav-main';

function useDashboardHref(role?: string): string {
    if (role === 'Teacher') {
        return '/teacher/dashboard';
    }

    if (role === 'Participant') {
        return '/student/dashboard';
    }

    return '/admin/dashboard';
}

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const role = auth?.user?.roles?.[0] ?? auth?.roles?.[0];
    const href = useDashboardHref(role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={href} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <MainNav items={NavigationList} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
