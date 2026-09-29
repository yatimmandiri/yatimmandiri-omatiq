import AuthCallout from '@/components/auth/auth-callout';
import AuthDivider from '@/components/auth/auth-divider';
import GoogleButton from '@/components/auth/google-button';
import PortalTabs from '@/components/auth/portal-tabs';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Form, Head } from '@inertiajs/react';
import { Lock, Phone } from 'lucide-react';

export default function GuruLogin() {
    return (
        <>
            <Head title="Login Guru Pembina" />

            <PortalTabs active="guru" />

            <AuthCallout tone="warning" title="Informasi Login Guru">
                <p className="leading-relaxed">
                    Gunakan nomor WhatsApp/HP aktif yang terdaftar di sistem
                    Penyaluran. Untuk login pertama kali, password default
                    adalah{' '}
                    <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono font-bold dark:bg-amber-900/50">
                        password
                    </code>
                    .
                </p>
            </AuthCallout>

            <Form
                method="post"
                action="/teacher/login"
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Phone Input */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="phone"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Nomor Handphone (Guru)
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Phone className="size-4" />
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="tel"
                                        placeholder="081234567890 / 628123456789"
                                        className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Kata Sandi
                                </Label>
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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                tabIndex={3}
                                disabled={processing}
                                data-test="guru-login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Masuk sebagai Guru
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <AuthDivider />

            <GoogleButton
                href="/auth/google/redirect"
                label="Masuk dengan Google (Guru)"
            />
            <p className="text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
                Login Google Guru berlaku bagi akun yang telah melengkapi email
                aktif di profil guru.
            </p>
        </>
    );
}

GuruLogin.layout = {
    title: 'Portal Masuk Guru',
    description:
        'Akses presensi santri, jurnal mengajar, dan data binaan Sanggar OMATIQ',
};
