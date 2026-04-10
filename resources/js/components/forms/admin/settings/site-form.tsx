import { ButtonComponent } from '@/components/partials/button-component';
import {
    InputFileComponent,
    InputTextComponent,
} from '@/components/partials/input-component';
import { Card, CardContent } from '@/components/ui/card';
import { useForm, usePage } from '@inertiajs/react';

import { useState } from 'react';

export const SiteForm = () => {
    const { settings, ziggy } = usePage<any>().props;

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
        whatsapp: settings?.whatsapp || '',
        tiktok: settings?.tiktok || '',
        _method: 'PUT',
    });

    // PREVIEW
    const [logoPreview, setLogoPreview] = useState(
        (settings?.logo && `${ziggy.url}/storage/${settings?.logo}`) ||
            'https://picsum.photos/300/300',
    );
    const [faviconPreview, setFaviconPreview] = useState(
        (settings?.favicon && `${ziggy.url}/storage/${settings?.favicon}`) ||
            'https://picsum.photos/300/300',
    );

    /** FILE HANDLER WITH PREVIEW **/
    const handleLogoChange = (file: any) => {
        setData('logo', file);

        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (file: any) => {
        setData('favicon', file);

        if (file) {
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // post(SiteSettingsController.update, {
        //     forceFormData: true,
        // });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex w-full flex-row space-x-8">
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
                                errors={errors.site_name}
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
                            />
                            <InputTextComponent
                                type="text"
                                label="Whatsapp"
                                name="whatsapp"
                                value={data.whatsapp}
                                handleOnChange={(value: string) =>
                                    setData('whatsapp', value)
                                }
                                errors={errors.whatsapp}
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
                                handleOnChange={handleFaviconChange}
                                errors={errors.favicon}
                            />
                            <InputTextComponent
                                type="text"
                                label="Facebook"
                                name="facebook"
                                value={data.facebook}
                                handleOnChange={(value: string) =>
                                    setData('facebook', value)
                                }
                                errors={errors.facebook}
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
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <ButtonComponent
                    buttonText="Save"
                    buttonType="submit"
                    isProcessing={processing}
                />
            </div>
        </form>
    );
};
