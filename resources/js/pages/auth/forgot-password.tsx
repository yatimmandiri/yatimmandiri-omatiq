import AuthCallout from '@/components/auth/auth-callout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi" />

            {status && <AuthCallout tone="success">{status}</AuthCallout>}

            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Alamat Email Terdaftar
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Mail className="size-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="nama@email.com"
                                        className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                className="mt-2 h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Kirim Tautan Reset Sandi
                            </Button>
                        </>
                    )}
                </Form>

                <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                    <TextLink
                        href={login()}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#17524A] hover:underline dark:text-emerald-400"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali ke Halaman Masuk</span>
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi?',
    description:
        'Masukkan email akun Anda untuk menerima tautan pemulihan kata sandi',
};
