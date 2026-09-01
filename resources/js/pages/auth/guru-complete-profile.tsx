import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, Phone, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

type PageProps = {
    teacher?: {
        name?: string;
        phone?: string;
    };
};

export default function GuruCompleteProfile() {
    const { teacher } = usePage<PageProps>().props;
    const form = useForm({
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put('/guru/complete-profile', {
            preserveScroll: true,
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Lengkapi Akun Guru" />

            <div className="rounded-2xl border bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">
                            {teacher?.name ?? 'Guru OMATIQ'}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-4" />
                            {teacher?.phone ?? '-'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Aktif</Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="nama@email.com"
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Email ini akan dipakai untuk pendataan akun dan
                            persiapan login Google ke depannya.
                        </p>
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <PasswordInput
                            id="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            required
                            autoComplete="new-password"
                            placeholder="Buat password baru"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password Baru
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            required
                            autoComplete="new-password"
                            placeholder="Ulangi password baru"
                        />
                        <InputError message={form.errors.password_confirmation} />
                    </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <div className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <p>
                            Setelah akun dilengkapi, login berikutnya langsung
                            masuk ke dashboard guru.
                        </p>
                    </div>
                </div>

                <Button type="submit" disabled={form.processing}>
                    {form.processing && <Spinner />}
                    Simpan dan Masuk Dashboard
                </Button>
            </form>
        </>
    );
}

GuruCompleteProfile.layout = {
    title: 'Lengkapi Akun Guru',
    description:
        'Daftarkan email aktif dan buat password baru sebelum masuk dashboard.',
};
