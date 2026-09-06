import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';
import loginStore from '@/routes/guru/login';

export default function GuruLogin() {
    return (
        <>
            <Head title="Login Guru" />

            <Form
                method="post"
                action={loginStore.store().url}
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

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password dari admin"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Gunakan password yang diberikan oleh tim
                                    OMATIQ. Setelah login pertama, Anda akan
                                    diminta mendaftarkan email dan membuat
                                    password baru.
                                </p>
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={3}
                                disabled={processing}
                                data-test="guru-login-button"
                            >
                                {processing && <Spinner />}
                                Masuk sebagai Guru
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Atau</span>
                                </div>
                            </div>

                            <Button type="button" variant="outline" className="w-full" asChild>
                                <a href="/auth/guru/google/redirect">
                                    <FcGoogle className="size-5" />
                                    Login dengan Google (setelah lengkapi profil)
                                </a>
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Peserta?{' '}
                            <TextLink href={login()} tabIndex={4}>
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
    description: 'Masuk dengan nomor HP dan password dari tim OMATIQ',
};
