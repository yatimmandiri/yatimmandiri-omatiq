import { SiteForm } from '@/components/forms/admin/settings/site-form';
import { Head } from '@inertiajs/react';
import { Fragment } from 'react';

export default function SiteSettingPage() {
    return (
        <Fragment>
            <Head title="Site Settings" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-screen flex-1 flex-col space-y-8 overflow-hidden rounded-xl border border-sidebar-border/70 py-4 md:min-h-min md:py-6 dark:border-sidebar-border">
                    <div className="px-4 md:px-6">
                        <SiteForm />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
