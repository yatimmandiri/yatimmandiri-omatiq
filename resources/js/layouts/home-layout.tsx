import { MarketingShell } from '@/components/marketing/marketing-components';
import { Head, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

type MetaProps = {
    pageTitle?: string;
    meta?: {
        title?: string;
        description?: string;
    };
};

export const HomeLayout = ({ children }: { children: ReactNode }) => {
    const { pageTitle, meta } = usePage<MetaProps>().props;
    const title = meta?.title || pageTitle || 'OMATIQ';
    const description = meta?.description || 'OMATIQ is a modern education and community platform for creative learning, collaboration, and real impact.';

    return (
        <MarketingShell>
            <Head title={title}>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
            </Head>
            {children}
            <Toaster position="top-right" richColors />
        </MarketingShell>
    );
};
