import InputError from '@/components/input-error';
import AuthCallout from '@/components/auth/auth-callout';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

type Props = {
    phone?: string | null;
};

export default function GuruVerifyOtp({ phone }: Props) {
    const [code, setCode] = useState('');

    return (
        <>
            <Head title="Verifikasi OTP Guru" />

            <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="size-6" />
                </span>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {phone
                        ? `Kode OTP telah dikirim ke ${phone}. Berlaku 5 menit.`
                        : 'Masukkan kode OTP 6 digit. Berlaku 5 menit.'}
                </p>
            </div>

            <Form
                method="post"
                action="/teacher/verify-otp"
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <InputOTP
                                name="otp"
                                maxLength={OTP_MAX_LENGTH}
                                value={code}
                                onChange={setCode}
                                disabled={processing}
                                pattern={REGEXP_ONLY_DIGITS}
                            >
                                <InputOTPGroup>
                                    {Array.from(
                                        { length: OTP_MAX_LENGTH },
                                        (_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                            />
                                        ),
                                    )}
                                </InputOTPGroup>
                            </InputOTP>
                            <InputError message={errors.otp} />
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            disabled={processing || code.length !== 6}
                        >
                            {processing && <Spinner className="mr-2" />}
                            Verifikasi Kode
                        </Button>
                    </div>
                )}
            </Form>

            <div className="mt-4">
                <Form method="post" action="/teacher/resend-otp">
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-11 w-full border-slate-200 text-xs font-semibold shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                            disabled={processing}
                        >
                            {processing && <Spinner className="mr-2" />}
                            Kirim Ulang Kode OTP
                        </Button>
                    )}
                </Form>
            </div>

            <AuthCallout tone="info">
                Belum menerima kode? Periksa log server (integrasi WhatsApp
                belum aktif) lalu tekan kirim ulang setelah 60 detik.
            </AuthCallout>
        </>
    );
}

GuruVerifyOtp.layout = {
    title: 'Verifikasi Kode OTP',
    description: 'Masukkan 6 digit kode yang dikirim ke nomor HP Anda',
};
