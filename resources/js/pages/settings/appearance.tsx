import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/admin/appearance';
import { Head } from '@inertiajs/react';

export default function Appearance() {
    return (
        <>
            <Head title="Pengaturan Tampilan" />

            <h1 className="sr-only">Pengaturan tampilan</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan tampilan"
                    description="Perbarui tema terang, gelap, atau mengikuti sistem perangkat Anda"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tampilan',
            href: editAppearance(),
        },
    ],
};
