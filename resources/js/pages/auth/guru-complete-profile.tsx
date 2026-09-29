import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import AuthCallout from '@/components/auth/auth-callout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
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

        form.put('/teacher/complete-profile', {
            preserveScroll: true,
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Lengkapi Akun Guru" />

            <div className="mb-5 flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A] dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {teacher?.name ?? 'Guru OMATIQ'}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="size-3.5 shrink-0" />
                        <span className="truncate">
                            {teacher?.phone ?? '-'}
                        </span>
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label
                            htmlFor="email"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            Email Aktif
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Mail className="size-4" />
                            </div>
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
                                className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                            />
                        </div>
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Email ini akan dipakai untuk pendataan akun dan
                            persiapan login Google ke depannya.
                        </p>
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label
                            htmlFor="password"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-400">
                                <Lock className="size-4" />
                            </div>
                            <PasswordInput
                                id="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                required
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                                className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                            />
                        </div>
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            Konfirmasi Kata Sandi Baru
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-400">
                                <Lock className="size-4" />
                            </div>
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
                                placeholder="Ulangi kata sandi baru"
                                className="h-11 pl-10 text-sm focus-visible:border-[#17524A] focus-visible:ring-[#17524A]/20"
                            />
                        </div>
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>
                </div>

                <AuthCallout tone="success">
                    <span className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <span>
                            Setelah akun dilengkapi, Anda dapat masuk
                            menggunakan nomor HP & kata sandi baru, atau
                            langsung dengan <strong>Masuk dengan Google</strong>
                            .
                        </span>
                    </span>
                </AuthCallout>

                <Button
                    type="submit"
                    disabled={form.processing}
                    className="h-11 w-full bg-[#17524A] text-sm font-semibold text-white shadow-md shadow-[#17524A]/20 transition-all hover:bg-[#11423B] hover:shadow-lg hover:shadow-[#17524A]/30 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                    {form.processing && <Spinner className="mr-2" />}
                    Simpan dan Masuk Dashboard
                </Button>
            </form>
        </>
    );
}

GuruCompleteProfile.layout = {
    title: 'Lengkapi Akun Guru',
    description:
        'Daftarkan email aktif dan buat kata sandi baru sebelum masuk dashboard.',
};
