import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import teacherStudents from '@/routes/admin/teacher/students';

type OlimpiadeOption = {
    id: number | string;
    name: string;
    category?: string;
    slug?: string;
};

type ParticipantRow = {
    id: number;
    full_name: string;
    olimpiade?: { id: number; name: string } | null;
};

export default function JoinOlimpiadeModal({
    participant,
    olimpiades,
    setRefreshData,
}: {
    participant: ParticipantRow;
    olimpiades: OlimpiadeOption[];
    setRefreshData: (value: boolean) => void;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<{ olimpiade_id: string }>({ olimpiade_id: '' });

    const closeModal = () => {
        setOpen(false);
        form.reset();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(teacherStudents.joinOlimpiade({ participant: participant.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                setRefreshData(true);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeModal())}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Trophy />
                    Keikutsertaan Lomba
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Keikutsertaan Lomba</DialogTitle>
                    <DialogDescription>
                        Daftarkan {participant.full_name} ke lomba lain.
                        {participant.olimpiade?.name ? (
                            <>
                                {' '}
                                Saat ini terdaftar di: <span className="font-medium">{participant.olimpiade.name}</span>.
                            </>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Pilih Lomba</Label>
                        <select
                            value={form.data.olimpiade_id}
                            onChange={(event) => form.setData('olimpiade_id', event.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Pilih lomba</option>
                            {olimpiades.map((olimpiade) => (
                                <option key={olimpiade.id} value={olimpiade.id}>
                                    {olimpiade.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.olimpiade_id && (
                            <p className="text-sm font-medium text-destructive">
                                {form.errors.olimpiade_id}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Daftarkan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
