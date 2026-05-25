import { deletefiles, uploadfiles } from '@/routes/admin';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface UseImageUploadProps {
    onUpload?: (url: string) => void;
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
    const previewRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    // Dummy upload function that simulates a delay and returns the local preview URL
    const uploadImage = async (file: File): Promise<string> => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(uploadfiles.post().url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('UPLOAD ERROR:', errorText);
                throw new Error('Upload failed');
            }

            const contentType = response.headers.get('content-type');

            if (!contentType?.includes('application/json')) {
                const text = await response.text();
                console.error('NOT JSON RESPONSE:', text);
                throw new Error('Invalid server response');
            }

            const data = await response.json();
            setError(null);
            return data.url; // pastikan ini adalah URL gambar di storage
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                setFileName(file.name);
                const localUrl = URL.createObjectURL(file);
                setPreviewUrl(localUrl);
                previewRef.current = localUrl;

                try {
                    const uploadedUrl = await uploadImage(file);
                    setUploadedUrl(uploadedUrl); // ← ini penting agar handleRemove tahu URL-nya
                    onUpload?.(uploadedUrl);
                } catch (err) {
                    URL.revokeObjectURL(localUrl);
                    setPreviewUrl(null);
                    setFileName(null);
                    console.error(err);
                }
            }
        },
        [onUpload],
    );

    const handleRemove = useCallback(async () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        // Opsional: kirim ke backend untuk hapus file
        if (uploadedUrl) {
            try {
                await fetch(deletefiles.post().url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ url: uploadedUrl }),
                });
            } catch (err) {
                console.warn('Gagal menghapus file dari server', err);
            }
        }

        setUploadedUrl(null);
        setPreviewUrl(null);
        setFileName(null);
        previewRef.current = null;
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
    }, [previewUrl, uploadedUrl]);

    useEffect(() => {
        return () => {
            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current);
            }
        };
    }, []);

    return {
        previewUrl,
        fileName,
        fileInputRef,
        handleThumbnailClick,
        handleFileChange,
        handleRemove,
        uploading,
        error,
    };
}
