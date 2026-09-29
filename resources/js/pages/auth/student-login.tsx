import AuthCallout from '@/components/auth/auth-callout';
import AuthDivider from '@/components/auth/auth-divider';
import GoogleButton from '@/components/auth/google-button';
import PortalTabs from '@/components/auth/portal-tabs';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword?: boolean;
    canRegister?: boolean;
};

export default function StudentLogin({
    status,
    canResetPassword = true,
    canRegister = true,
}: Props) {
    return (
        <>
            <Head title="Masuk Peserta" />

            <PortalTabs active="peserta" />

            {status && <AuthCallout tone="success">{status}</AuthCallout>}

            <Form
                method="post"
                action="/student/login"
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Mail className="size-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-[#17524A] hover:underline dark:text-emerald-400"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-400">
                                        <Lock className="size-4" />
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="data-[state=checked]:border-[#17524A] data-[state=checked]:bg-[#17524A]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs font-normal text-slate-600 dark:text-slate-400"
                                >
                                    Ingat sesi masuk saya
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                tabIndex={4}
                                disabled={processing}
                                data-test="student-login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Masuk ke Portal Peserta
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-xs text-slate-600 dark:text-slate-400">
                                Belum memiliki akun?{' '}
                                <TextLink
                                    href={register()}
                                    className="font-semibold text-[#17524A] hover:underline dark:text-emerald-400"
                                    tabIndex={5}
                                >
                                    Daftar Sekarang
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            <AuthDivider />

            <GoogleButton
                href="/auth/google/redirect"
                label="Masuk dengan Akun Google"
            />
        </>
    );
}

StudentLogin.layout = {
    title: 'Masuk ke Akun Peserta',
    description: 'Masukkan email dan kata sandi untuk mengakses dashboard Anda',
};
