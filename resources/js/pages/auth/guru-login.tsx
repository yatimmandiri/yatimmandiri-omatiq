import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';

export default function GuruLogin() {
    return (
        <>
            <Head title="Login Guru" />

            <Form
                method="post"
                action="/guru/login"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor HP (Guru)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="tel"
                                    placeholder="6285727344157"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Masukkan nomor HP yang terdaftar di Penyaluran.
                                </p>
                                <InputError message={errors.phone} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={2}
                                disabled={processing}
                                data-test="guru-login-button"
                            >
                                {processing && <Spinner />}
                                Masuk sebagai Guru
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Peserta?{' '}
                            <TextLink href={login()} tabIndex={3}>
                                Login Peserta / Admin
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

GuruLogin.layout = {
    title: 'Login Guru',
    description: 'Masuk dengan nomor HP terdaftar di Penyaluran',
};
