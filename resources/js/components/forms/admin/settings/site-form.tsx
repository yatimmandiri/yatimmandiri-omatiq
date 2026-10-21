import { ButtonComponent } from '@/components/partials/button-component';
import {
    InputFileComponent,
    InputTextComponent,
} from '@/components/partials/input-component';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { parseWhatsappContacts, WhatsappContact } from '@/utils/whatsapp';
import { router, useForm, usePage } from '@inertiajs/react';

import { useState } from 'react';

export const SiteForm = () => {
    const { settings } = usePage<any>().props;

    const initialContacts = parseWhatsappContacts(settings?.whatsapp);
    const [whatsappContacts, setWhatsappContacts] = useState<WhatsappContact[]>(
        initialContacts.length > 0
            ? initialContacts
            : [{ name: 'Admin OMATIQ', number: '' }],
    );

    const { data, setData, post, processing, errors } = useForm({
        saveBack: 'false',
        site_name: settings?.site_name || '',
        site_description: settings?.site_description || '',
        email: settings?.email || '',
        phone: settings?.phone || '',
        address: settings?.address || '',
        logo: null, // file
        favicon: null, // file
        facebook: settings?.facebook || '',
        instagram: settings?.instagram || '',
        twitter: settings?.twitter || '',
        youtube: settings?.youtube || '',
        linkedin: settings?.linkedin || '',
        whatsapp: JSON.stringify(
            initialContacts.length > 0
                ? initialContacts
                : [{ name: 'Admin OMATIQ', number: '' }],
        ),
        tiktok: settings?.tiktok || '',
        registration_public_open: settings?.registration_public_open ?? true,
        registration_binaan_open: settings?.registration_binaan_open ?? true,
        maintenance_mode: settings?.maintenance_mode ?? false,
        sheets_sync_enabled: settings?.sheets_sync_enabled ?? false,
        sheets_spreadsheet_id: settings?.sheets_spreadsheet_id ?? '',
        sheets_sheet_name: settings?.sheets_sheet_name ?? 'Data Peserta',
        _method: 'PUT',
    });

    const updateWhatsappList = (updated: WhatsappContact[]) => {
        setWhatsappContacts(updated);
        setData('whatsapp', JSON.stringify(updated));
    };

    const handleAddContact = () => {
        const nextIdx = whatsappContacts.length + 1;
        updateWhatsappList([
            ...whatsappContacts,
            { name: `Admin ${nextIdx}`, number: '' },
        ]);
    };

    const handleRemoveContact = (index: number) => {
        const updated = whatsappContacts.filter((_, i) => i !== index);
        updateWhatsappList(
            updated.length > 0 ? updated : [{ name: 'Admin 1', number: '' }],
        );
    };

    const handleContactChange = (
        index: number,
        field: keyof WhatsappContact,
        value: string,
    ) => {
        const updated = [...whatsappContacts];
        updated[index] = { ...updated[index], [field]: value };
        updateWhatsappList(updated);
    };

    // PREVIEW
    const [logoPreview, setLogoPreview] = useState(
        (settings?.logo && `/storage/${settings?.logo}`) ||
            'https://picsum.photos/300/300',
    );
    const [faviconPreview, setFaviconPreview] = useState(
        (settings?.favicon && `/storage/${settings?.favicon}`) ||
            'https://picsum.photos/300/300',
    );

    /** FILE HANDLER WITH PREVIEW **/
    const handleLogoChange = (file: any) => {
        setData('logo', file);

        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFavichandleOnChange = (file: any) => {
        setData('favicon', file);

        if (file) {
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        post('/admin/settings/site', {
            forceFormData: true,
        });

        router.reload({ only: ['flash'] });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 space-x-0 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex w-56 flex-col space-y-4">
                    <Card className="p-1">
                        <CardContent className="flex flex-col space-y-2 p-1 text-center text-xs">
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="rounded-lg border object-contain"
                                />
                            )}
                            <span className="font-normal">Logo</span>
                        </CardContent>
                    </Card>
                    <Card className="p-1">
                        <CardContent className="flex flex-col space-y-2 p-1 text-center text-xs">
                            {faviconPreview && (
                                <img
                                    src={faviconPreview}
                                    alt="Favicon Preview"
                                    className="rounded-lg border object-contain"
                                />
                            )}
                            <span className="font-normal">Favicon</span>
                        </CardContent>
                    </Card>
                </div>
                <Card className="w-full">
                    <CardContent>
                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                            <InputTextComponent
                                type="text"
                                label="Name"
                                name="site_name"
                                value={data.site_name}
                                handleOnChange={(value: string) =>
                                    setData('site_name', value)
                                }
                                color={errors.site_name ? 'danger' : 'default'}
                                errors={errors.site_name}
                                helperText={
                                    errors.site_name && errors.site_name
                                }
                            />
                            <InputTextComponent
                                type="text"
                                label="Description"
                                name="site_description"
                                value={data.site_description}
                                handleOnChange={(value: string) =>
                                    setData('site_description', value)
                                }
                                errors={errors.site_description}
                                color={
                                    errors.site_description
                                        ? 'danger'
                                        : 'default'
                                }
                            />
                            <InputTextComponent
                                type="text"
                                label="Email"
                                name="email"
                                value={data.email}
                                handleOnChange={(value: string) =>
                                    setData('email', value)
                                }
                                errors={errors.email}
                                color={errors.email ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Phone"
                                name="phone"
                                value={data.phone}
                                handleOnChange={(value: string) =>
                                    setData('phone', value)
                                }
                                errors={errors.phone}
                                color={errors.phone ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Address"
                                name="address"
                                value={data.address}
                                handleOnChange={(value: string) =>
                                    setData('address', value)
                                }
                                errors={errors.address}
                                color={errors.address ? 'danger' : 'default'}
                            />
                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                Kontak WhatsApp Admin (Multi-Admin)
                                            </Label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Daftar admin WhatsApp yang tampil di floating chat dan footer.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddContact}
                                        className="h-8 gap-1.5 rounded-lg border-emerald-600/30 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Tambah Admin
                                    </Button>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                    {whatsappContacts.map((contact, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
                                        >
                                            <div className="flex-1">
                                                <Label className="mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                    Nama / Jabatan Admin
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={contact.name}
                                                    onChange={(e) =>
                                                        handleContactChange(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: CS Pendaftaran / Admin 1"
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                    Nomor WhatsApp
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={contact.number}
                                                    onChange={(e) =>
                                                        handleContactChange(
                                                            index,
                                                            'number',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: 081234567890"
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            {whatsappContacts.length > 1 && (
                                                <div className="flex sm:self-end">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleRemoveContact(
                                                                index,
                                                            )
                                                        }
                                                        className="h-9 w-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                                        title="Hapus Kontak Ini"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.whatsapp && (
                                    <p className="text-xs font-medium text-rose-500">
                                        {errors.whatsapp}
                                    </p>
                                )}
                            </div>
                            <InputTextComponent
                                type="text"
                                label="Facebook"
                                name="facebook"
                                value={data.facebook}
                                handleOnChange={(value: string) =>
                                    setData('facebook', value)
                                }
                                errors={errors.facebook}
                                color={errors.facebook ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Instagram"
                                name="instagram"
                                value={data.instagram}
                                handleOnChange={(value: string) =>
                                    setData('instagram', value)
                                }
                                errors={errors.instagram}
                                color={errors.instagram ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Twitter"
                                name="twitter"
                                value={data.twitter}
                                handleOnChange={(value: string) =>
                                    setData('twitter', value)
                                }
                                errors={errors.twitter}
                                color={errors.twitter ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Youtube"
                                name="youtube"
                                value={data.youtube}
                                handleOnChange={(value: string) =>
                                    setData('youtube', value)
                                }
                                errors={errors.youtube}
                                color={errors.youtube ? 'danger' : 'default'}
                            />
                            <InputTextComponent
                                type="text"
                                label="Tiktok"
                                name="tiktok"
                                value={data.tiktok}
                                handleOnChange={(value: string) =>
                                    setData('tiktok', value)
                                }
                                errors={errors.tiktok}
                                color={errors.tiktok ? 'danger' : 'default'}
                            />
                            <InputFileComponent
                                type="file"
                                label="Logo"
                                name="logo"
                                handleOnChange={handleLogoChange}
                                errors={errors.logo}
                            />
                            <InputFileComponent
                                type="file"
                                label="Favicon"
                                name="favicon"
                                handleOnChange={handleFavichandleOnChange}
                                errors={errors.favicon}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardContent className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">Pendaftaran</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <Label>Buka Pendaftaran Umum</Label>
                            <Switch
                                checked={data.registration_public_open}
                                onCheckedChange={(checked) =>
                                    setData('registration_public_open', checked)
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <Label>Buka Pendaftaran Binaan (Guru)</Label>
                            <Switch
                                checked={data.registration_binaan_open}
                                onCheckedChange={(checked) =>
                                    setData('registration_binaan_open', checked)
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">Maintenance Mode</h3>
                    <p className="mb-4 text-xs text-muted-foreground">Aktifkan untuk menampilkan halaman pemeliharaan di omatiq.com (home, pendaftaran, olimpiade). Dashboard admin dan akses lokal 127.0.0.1 tetap bisa untuk pengujian.</p>
                    <div className="flex items-center justify-between rounded-md border p-4">
                        <Label>Aktifkan Maintenance</Label>
                        <Switch checked={data.maintenance_mode} onCheckedChange={(checked) => setData('maintenance_mode', checked)} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                        Google Sheets Realtime
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Hubungkan Data Peserta ke 1 sheet realtime. Upload file
                        JSON Service Account ke{' '}
                        <code>storage/app/google/credentials.json</code> dan set
                        Spreadsheet ID. Sheet akan public Viewer (NIK full).
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <Label>Aktifkan Sync GSheet</Label>
                            <Switch
                                checked={data.sheets_sync_enabled}
                                onCheckedChange={(checked) =>
                                    setData('sheets_sync_enabled', checked)
                                }
                            />
                        </div>
                        <InputTextComponent
                            type="text"
                            label="Spreadsheet ID"
                            name="sheets_spreadsheet_id"
                            value={data.sheets_spreadsheet_id}
                            handleOnChange={(value: string) =>
                                setData('sheets_spreadsheet_id', value)
                            }
                            color={
                                errors.sheets_spreadsheet_id
                                    ? 'danger'
                                    : 'default'
                            }
                            errors={errors.sheets_spreadsheet_id}
                            helperText="ID dari URL https://docs.google.com/spreadsheets/d/{ID}/edit"
                        />
                        <InputTextComponent
                            type="text"
                            label="Sheet Name"
                            name="sheets_sheet_name"
                            value={data.sheets_sheet_name}
                            handleOnChange={(value: string) =>
                                setData('sheets_sheet_name', value)
                            }
                            color={
                                errors.sheets_sheet_name ? 'danger' : 'default'
                            }
                            errors={errors.sheets_sheet_name}
                            helperText="Default: Data Peserta"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <ButtonComponent
                    buttonText={processing ? 'Saving...' : 'Save'}
                    buttonType="submit"
                    isProcessing={processing}
                />
            </div>
        </form>
    );
};
