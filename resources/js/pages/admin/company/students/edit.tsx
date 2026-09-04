import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { dashboard } from '@/routes/admin';
import students from '@/routes/admin/companies/students';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

export default function EditPage() {
    const { student } = usePage<{ student: any }>().props;

    const form = useForm({
        full_name: student.full_name ?? '',
        nickname: student.nickname ?? '',
        nik: student.nik ?? '',
        nis: student.nis ?? '',
        gender: student.gender ?? 'male',
        birth_place: student.birth_place ?? '',
        birth_date: student.birth_date ? String(student.birth_date).slice(0, 10) : '',
        school_name: student.school_name ?? '',
        school_level: student.school_level ?? '',
        grade: student.grade ?? '',
        address: student.address ?? '',
        parent_phone: student.parent_phone ?? '',
        is_binaan: !!student.is_binaan,
        is_active: !!student.is_active,
        _method: 'put',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(students.update(student.id).url);
    };

    return (
        <form onSubmit={submit} className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Data Students</h1>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft /> Kembali
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save /> Simpan
                    </Button>
                </div>
            </div>

            <Card className="space-y-4 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>NIK</Label>
                        <Input value={form.data.nik} onChange={(e) => form.setData('nik', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Sekolah</Label>
                        <Input value={form.data.school_name} onChange={(e) => form.setData('school_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Jenjang</Label>
                        <Input value={form.data.school_level} onChange={(e) => form.setData('school_level', e.target.value)} placeholder="SD/SMP/SMA" />
                    </div>
                    <div className="space-y-2">
                        <Label>Kelas</Label>
                        <Input value={form.data.grade} onChange={(e) => form.setData('grade', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Jenis</Label>
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm">{form.data.is_binaan ? 'Binaan' : 'Umum'}</span>
                            <Switch checked={form.data.is_binaan} onCheckedChange={(v) => form.setData('is_binaan', v)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Status Aktif</Label>
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm">{form.data.is_active ? 'Aktif' : 'Non-aktif'}</span>
                            <Switch checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', v)} />
                        </div>
                    </div>
                </div>
            </Card>
        </form>
    );
}

EditPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Students', href: students.index().url },
        { title: 'Edit', href: '#' },
    ],
};
