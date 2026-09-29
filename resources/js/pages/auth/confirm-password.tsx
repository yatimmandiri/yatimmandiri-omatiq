import { Form, Head } from '@inertiajs/react';
import AuthCallout from '@/components/auth/auth-callout';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { Lock } from 'lucide-react';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi Kata Sandi" />

            <AuthCallout tone="info" title="Area Keamanan">
                <p>
                    Ini adalah area sensitif. Konfirmasikan kata sandi Anda
                    untuk melanjutkan.
                </p>
            </AuthCallout>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                            >
                                Kata Sandi Saat Ini
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-400">
                                    <Lock className="size-4" />
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    placeholder="Masukkan kata sandi Anda"
                                    autoComplete="current-password"
                                    autoFocus
                                    className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            className="mt-1 h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Konfirmasi & Lanjutkan
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi Kata Sandi',
    description:
        'Verifikasi identitas Anda sebelum mengakses area keamanan ini.',
};
