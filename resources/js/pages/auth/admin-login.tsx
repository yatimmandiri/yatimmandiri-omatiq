import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Form, Head } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';

export default function AdminLogin() {
    return (
        <>
            <Head title="Login Admin" />
            <Form
                method="post"
                action="/admin/login"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Admin</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@yatimmandiri.org"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="admin-login-button"
                            >
                                {processing && <Spinner />} Masuk sebagai Admin
                            </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Guru?{' '}
                            <TextLink href="/teacher/login" tabIndex={5}>
                                Login Guru
                            </TextLink>{' '}
                            · Student?{' '}
                            <TextLink href="/student/login" tabIndex={5}>
                                Login Student
                            </TextLink>
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
                <a href="/auth/google/redirect?intent=admin" className="w-full">
                    <FcGoogle /> Login dengan Google (Admin)
                </a>
            </Button>
        </>
    );
}

AdminLogin.layout = {
    title: 'Login Admin',
    description: 'Masuk ke dashboard admin OMATIQ',
};
