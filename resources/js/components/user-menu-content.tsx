import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout as adminLogout } from '@/routes/admin';
import { edit } from '@/routes/admin/profile';
import { logout as studentLogout } from '@/routes/student';
import { logout as teacherLogout } from '@/routes/teacher';
import { logout as genericLogout } from '@/routes';
import type { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

type Props = {
    user: User;
};

function getLogoutHref(user: User | null | undefined): string {
    const roles = (user as any)?.roles ?? [];
    if (Array.isArray(roles)) {
        if (roles.includes('Teacher')) return teacherLogout().url;
        if (roles.includes('Administrators')) return adminLogout().url;
        if (roles.includes('Participant') || roles.includes('Student')) return studentLogout().url;
    }
    return genericLogout().url;
}

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    // also read from page props as fallback if user.roles empty
    const pageProps = (usePage as any)?.().props ?? {};
    const authUser = (pageProps as any)?.auth?.user ?? user;
    const logoutHref = getLogoutHref(authUser ?? user);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logoutHref}
                    method="post"
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
