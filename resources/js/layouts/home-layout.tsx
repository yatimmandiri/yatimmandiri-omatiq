import { Head, usePage } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import {
    FloatingButtonSection,
    HomeFooterComponent,
} from './app/home-footer-layout';
import { HomeHeaderComponent } from './app/home-header-layout';
import { SidebarProvider } from './app/home-sidebar-layout';

const Helmet = ({ children }: { children: ReactNode }) => {
    return <Head>{children}</Head>;
};

export const HomeLayout = ({ children }: { children: ReactNode }) => {
    const { props } = usePage<any>();
    const {
        pageTitle = 'OMATIQ',
        meta = {
            title: 'OMATIQ',
            description:
                'OMATIQ is a modern education and community platform for creative learning, collaboration, and real impact.',
            keywords: 'OMATIQ, education, community, learning, programs',
        },
        flash = {},
    } = props;
    const { success, error } = flash;

    useEffect(() => {
        if (success) {
            toast.success(success);
        }

        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    return (
        <div>
            <SidebarProvider>
                <div className="flex min-h-screen flex-col antialiased">
                    <Head title={meta.title ? meta.title : pageTitle} />
                    <Helmet>
                        <meta name="description" content={meta.description} />
                        <meta name="keywords" content={meta.keywords} />
                    </Helmet>
                    <HomeHeaderComponent />
                    <main className="flex flex-1 flex-col">{children}</main>
                    <HomeFooterComponent />
                    <FloatingButtonSection />
                </div>
            </SidebarProvider>
            <Toaster position="top-right" richColors />
        </div>
    );
};
