import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teachers from '@/routes/admin/companies/teachers';
import { formatDate } from '@/utils/formatDate';
import { router, usePage } from '@inertiajs/react';
import { InfoIcon, KeyRound } from 'lucide-react';

export default function DetailPage() {
    const { user } = usePage<any>().props;

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <Card className="min-h-full p-4 md:p-6">
                    <div className="flex items-center space-x-2">
                        <InfoIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            Detail Guru
                        </span>
                    </div>
                    <div className="mb-4 flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (confirm('Reset password guru ini ke default "password"?')) {
                                    router.put(teachers.resetPassword(user.id).url, {}, { preserveScroll: true });
                                }
                            }}
                        >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset ke password default
                        </Button>
                    </div>
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">Nama</span>
                            <span className="text-sm">{user.name}</span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">Email</span>
                            <span className="text-sm">{user.email}</span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">Role</span>
                            <span className="text-sm">
                                {user?.roles?.[0]?.name || '-'}
                            </span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">
                                Dibuat Pada
                            </span>
                            <span className="text-sm">
                                {formatDate(user.created_at)}
                            </span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">
                                Diupdate Pada
                            </span>
                            <span className="text-sm">
                                {formatDate(user.updated_at)}
                            </span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}

DetailPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Guru',
            href: teachers.index().url,
        },
        {
            title: 'Detail Guru',
            href: '#',
        },
    ],
};
