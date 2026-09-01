import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import verify from '@/routes/guru/verify';
import guru from '@/routes/guru';
import { Form, Head } from '@inertiajs/react';

type Props = {
    phone?: string | null;
};

export default function GuruVerifyOtp({ phone }: Props) {
    return (
        <>
            <Head title="Verifikasi OTP Guru" />

            <Form
                method="post"
                action={verify.store().url}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="otp">Kode OTP (6 digit)</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    name="otp"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    placeholder="123456"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {phone
                                        ? `Kode dikirim ke ${phone} (cek log, WA belum aktif). Berlaku 5 menit.`
                                        : 'Masukkan kode 6 digit. Berlaku 5 menit.'}
                                </p>
                                <InputError message={errors.otp} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <Spinner />}
                                Verifikasi
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <Form method="post" action={guru.resend().url}>
                {({ processing }) => (
                    <Button type="submit" variant="outline" className="w-full" disabled={processing}>
                        Kirim ulang OTP
                    </Button>
                )}
            </Form>
        </>
    );
}

GuruVerifyOtp.layout = {
    title: 'Verifikasi OTP Guru',
    description: 'Masukkan kode OTP 6 digit (scaffold, WA belum aktif)',
};
