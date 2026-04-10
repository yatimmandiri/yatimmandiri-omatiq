import { Head } from '@inertiajs/react';
import { Fragment, ReactNode } from 'react';
import { MainFooterLayout } from './app/welcome-footer-layout';
import { MainHeaderLayout } from './app/welcome-header-layout';

export const WelcomeLayout = ({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) => {
    return (
        <Fragment>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen antialiased">
                <MainHeaderLayout />
                <main>{children}</main>
                <MainFooterLayout />
            </div>
        </Fragment>
    );
};
