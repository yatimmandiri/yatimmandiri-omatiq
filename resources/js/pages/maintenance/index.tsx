import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import { Clock, Wrench } from 'lucide-react';

export default function MaintenancePage() {
    const { site_name } = usePage<{ site_name?: string }>().props;

    return (
        <>
            <Head title="Sedang Pemeliharaan" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#134e45] via-[#17524A] to-[#258a7c] p-6 text-white">
                <div className="w-full max-w-lg rounded-[32px] border border-white/20 bg-white p-8 text-center shadow-2xl">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#FFE600] text-[#17524A]">
                        <Wrench className="size-8" />
                    </div>
                    <h1 className="mt-6 text-2xl font-bold text-[#17524A]">Sedang Pemeliharaan</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {site_name ?? 'OMATIQ'} sedang dalam pemeliharaan. Pendaftaran dan akses situs ditutup sementara.
                        Silakan kembali lagi nanti.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-4" /> Estimasi 60 menit
                    </div>
                    <Button className="mt-6 w-full bg-[#17524A] hover:bg-[#134e45]" onClick={() => window.location.reload()}>
                        Muat Ulang
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">Hubungi admin jika butuh bantuan segera.</p>
                </div>
            </div>
        </>
    );
}

MaintenancePage.layout = null;
