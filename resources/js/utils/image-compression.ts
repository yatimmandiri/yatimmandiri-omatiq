/**
 * Utility for client-side image compression before upload.
 * Reduces raw mobile photos (3MB - 12MB) down to ~150KB - 350KB
 * without perceptible quality loss for document/proof inspection.
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxFileSizeKB?: number;
}

export async function compressImageFile(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 0.8,
        maxFileSizeKB = 350,
    } = options;

    // Only process images (skip PDF, docx, etc.)
    if (!file || !file.type || !file.type.startsWith('image/')) {
        return file;
    }

    // If file is already smaller than maxFileSizeKB, no need to compress
    if (file.size <= maxFileSizeKB * 1024) {
        return file;
    }

    // Check if running in browser with canvas support
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                let { width, height } = img;

                // Scale down while preserving aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }

                // High quality image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                const outputType = 'image/jpeg';
                canvas.toBlob(
                    (blob) => {
                        if (!blob || blob.size >= file.size) {
                            // If compression didn't reduce size, fallback to original
                            resolve(file);
                            return;
                        }

                        const originalName = file.name;
                        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
                        const newFileName = `${nameWithoutExt}.jpg`;

                        const compressedFile = new File([blob], newFileName, {
                            type: outputType,
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    outputType,
                    quality
                );
            };

            img.onerror = () => resolve(file);

            if (typeof e.target?.result === 'string') {
                img.src = e.target.result;
            } else {
                resolve(file);
            }
        };

        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}
