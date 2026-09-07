import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Form, Head } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';

export default function GuruLogin() {
    return (
        <>
            <Head title="Login Guru" />

            <Form
                method="post"
                action="/teacher/login"
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
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Admin? <TextLink href="/admin/login" tabIndex={4}>Login Admin</TextLink> · Student?{' '}
                            <TextLink href="/student/login" tabIndex={4}>Login Student</TextLink>
                        </div>
                    </>
                )}
            </Form>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Atau lanjutkan dengan
                </span>
            </div>

            <Button asChild type="button" variant="outline" className="w-full">
                {/* Wayfinder akan generate teacher.google.redirect setelah `php artisan wayfinder:generate`; fallback href hardcode agar tetap jalan */}
                <a href="/teacher/google/redirect" className="w-full">
                    <FcGoogle />
                    Login dengan Google (Guru)
                </a>
            </Button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
                Google hanya untuk guru yang sudah melengkapi profil (email
                real). Guru baru wajib login dengan nomor HP terlebih dahulu.
            </p>
        </>
    );
}

GuruLogin.layout = {
    title: 'Login Guru',
    description: 'Masuk dengan nomor HP dan password dari tim OMATIQ',
};
