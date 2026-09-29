// Components
import { Form, Head, usePage } from '@inertiajs/react';
import AuthCallout from '@/components/auth/auth-callout';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout as adminLogout } from '@/routes/admin';
import { logout as genericLogout } from '@/routes';
import { logout as studentLogout } from '@/routes/student';
import { logout as teacherLogout } from '@/routes/teacher';
import { send } from '@/routes/verification';
import { Link } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const page: any = (usePage as any)?.().props ?? {};
    const roles: string[] = page?.auth?.user?.roles ?? [];
    const logoutHref = roles.includes('Teacher')
        ? teacherLogout().url
        : roles.includes('Administrators') || roles.includes('Cabang')
          ? adminLogout().url
          : roles.includes('Participant')
            ? studentLogout().url
            : genericLogout().url;

    return (
        <>
            <Head title="Verifikasi Email" />

            <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] dark:bg-emerald-500/10 dark:text-emerald-400">
                    <MailCheck className="size-6" />
                </span>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Kami telah mengirim tautan verifikasi ke email Anda. Klik
                    tautan tersebut untuk mengaktifkan akun.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <AuthCallout tone="success">
                    Tautan verifikasi baru telah dikirim ke alamat email yang
                    Anda daftarkan.
                </AuthCallout>
            )}

            <Form {...send.form()} className="flex flex-col gap-4">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Kirim Ulang Email Verifikasi
                        </Button>

                        <Link
                            href={logoutHref}
                            method="post"
                            as="button"
                            className="mx-auto block text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Keluar dari akun
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi Email Anda',
    description: 'Satu langkah lagi untuk mengaktifkan akun OMATIQ Anda.',
};
