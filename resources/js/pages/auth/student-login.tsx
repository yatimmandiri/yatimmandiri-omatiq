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

export default function StudentLogin() {
    return (
        <>
            <Head title="Login Student" />
            <Form method="post" action="/student/login" className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Student</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="student@example.com"
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
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <Button type="submit" className="mt-2 w-full" tabIndex={4} disabled={processing} data-test="student-login-button">
                                {processing && <Spinner />} Masuk sebagai Student
                            </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Admin? <TextLink href="/admin/login" tabIndex={5}>Login Admin</TextLink> · Guru?{' '}
                            <TextLink href="/guru/login" tabIndex={5}>Login Guru</TextLink>
                        </div>
                    </>
                )}
            </Form>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Atau lanjutkan dengan</span>
            </div>
            <Button asChild type="button" variant="outline" className="w-full">
                <a href="/auth/google/redirect?intent=student" className="w-full">
                    <FcGoogle /> Login dengan Google (Student)
                </a>
            </Button>
        </>
    );
}

StudentLogin.layout = {
    title: 'Login Student',
    description: 'Masuk ke dashboard student OMATIQ',
};
