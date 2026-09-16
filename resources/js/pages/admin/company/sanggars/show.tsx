import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { usePage } from '@inertiajs/react';
import { Building2, InfoIcon, MapPin, Phone, UserCheck } from 'lucide-react';

export default function DetailPage() {
    const { sanggar } = usePage<{ sanggar: any }>().props;

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <Card className="min-h-full p-4 md:p-6">
                    <div className="flex items-center space-x-2">
                        <InfoIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">
                            Detail Sanggar
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Nama Sanggar
                            </span>
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-primary" />
                                <p className="text-base font-semibold">
                                    {sanggar?.name ?? '-'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Tipe Sanggar
                            </span>
                            <p className="text-sm font-medium">
                                {sanggar?.type ?? 'Sanggar Binaan'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Kantor Cabang
                            </span>
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-muted-foreground" />
                                <p className="text-sm">
                                    {sanggar?.kantor_name ?? '-'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Alamat
                            </span>
                            <p className="text-sm">
                                {sanggar?.address ?? '-'}
                            </p>
                        </div>

                        {sanggar?.phone && (
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Kontak / Telepon
                                </span>
                                <div className="flex items-center gap-2">
                                    <Phone className="size-4 text-muted-foreground" />
                                    <p className="text-sm">{sanggar.phone}</p>
                                </div>
                            </div>
                        )}

                        {sanggar?.total_students !== undefined && (
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Total Santri Binaan
                                </span>
                                <div className="flex items-center gap-2">
                                    <UserCheck className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">
                                        {sanggar.total_students} Santri
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

DetailPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Data Sanggar',
            href: '/admin/companies/sanggars',
        },
        {
            title: 'Detail Sanggar',
            href: '#',
        },
    ],
};
