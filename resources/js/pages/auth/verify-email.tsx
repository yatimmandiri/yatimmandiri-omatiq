// Components
import { Form, Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout as adminLogout } from '@/routes/admin';
import { logout as genericLogout } from '@/routes';
import { logout as studentLogout } from '@/routes/student';
import { logout as teacherLogout } from '@/routes/teacher';
import { send } from '@/routes/verification';
import { Link } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const page: any = (usePage as any)?.().props ?? {};
    const roles: string[] = page?.auth?.user?.roles ?? [];
    const logoutHref = roles.includes('Teacher')
        ? teacherLogout().url
        : roles.includes('Administrators')
          ? adminLogout().url
          : roles.includes('Participant')
            ? studentLogout().url
            : genericLogout().url;
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <Link href={logoutHref} method="post" as="button" className="mx-auto block text-sm underline">
                            Log out
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
