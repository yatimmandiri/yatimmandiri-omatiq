import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import binaan from '@/routes/admin/guru/data-binaan';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

export default function EditPage() {
    const { binaan, provinces = [], regencies = [], districts = [], villages = [] } = usePage<any>().props;
    const form = useForm<any>({
        full_name: binaan.full_name ?? '',
        gender: binaan.gender ?? 'male',
        birth_date: binaan.birth_date?.slice(0, 10) ?? '',
        school_name: binaan.school_name ?? '',
        grade: binaan.grade ?? '',
        address: binaan.address ?? '',
        province_id: binaan.province_id ?? '',
        regency_id: binaan.regency_id ?? '',
        district_id: binaan.district_id ?? '',
        village_id: binaan.village_id ?? '',
        _method: 'put',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(binaan.update(binaan.id).url, { forceFormData: true });
    };
    const error = (n: string) => form.errors[n] ? <p className="text-sm text-destructive">{form.errors[n]}</p> : null;
    return (
        <form onSubmit={submit} className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Edit Binaan</h1>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}><ArrowLeft />Kembali</Button>
                    <Button type="submit" disabled={form.processing}><Save />Update</Button>
                </div>
            </div>
            <Card className="space-y-5 p-5">
                <Field label="Nama Lengkap" error={error('full_name')}><Input value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} required /></Field>
                <Field label="Tanggal Lahir" error={error('birth_date')}><Input type="date" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} required /></Field>
                <Field label="Sekolah" error={error('school_name')}><Input value={form.data.school_name} onChange={(e) => form.setData('school_name', e.target.value)} required /></Field>
                <Field label="Alamat" error={error('address')}><textarea value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" required /></Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Provinsi" error={error('province_id')}><select value={form.data.province_id} onChange={(e) => { form.setData('province_id', e.target.value); form.setData('regency_id', ''); }} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">Pilih</option>{provinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
                    <Field label="Kabupaten" error={error('regency_id')}><select value={form.data.regency_id} onChange={(e) => form.setData('regency_id', e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">Pilih</option>{regencies.filter((r: any) => String(r.province_id) === String(form.data.province_id)).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
                </div>
            </Card>
        </form>
    );
}
const Field = ({ label, children, error }: { label: string; children: ReactNode; error?: ReactNode }) => <div className="space-y-2"><Label>{label}</Label>{children}{error}</div>;
EditPage.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }, { title: 'Data Binaan', href: binaan.index().url }, { title: 'Edit', href: '#' }] };
