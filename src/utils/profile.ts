import { mkdir, readFile, writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PROFILE_DIR = 'profile';
const PROFILE_IMAGE = 'profile-image';

export class ProfileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfileError';
    }
}

export async function saveProfileImage(file: File): Promise<string> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new ProfileError('Image must be less than 20MB');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new ProfileError('Only JPEG, PNG, and WebP images are allowed');
    }

    try {
        // Create directory if it doesn't exist
        await mkdir(PROFILE_DIR, {
            baseDir: BaseDirectory.AppData,
            recursive: true
        });

        // Convert File to ArrayBuffer
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // Save file with extension
        const extension = file.type.split('/')[1];
        const filename = `${PROFILE_IMAGE}.${extension}`;
        const fullPath = `${PROFILE_DIR}/${filename}`;

        await writeFile(fullPath, uint8Array, {
            baseDir: BaseDirectory.AppData
        });

        // Return the full path for loading
        return fullPath;
    } catch (error) {
        console.error('Failed to save profile image:', error);
        throw new ProfileError('Failed to save profile image');
    }
}

export async function loadProfileImage(): Promise<string | null> {
    try {
        // Try each possible extension
        for (const type of ALLOWED_TYPES) {
            const extension = type.split('/')[1];
            const filename = `${PROFILE_IMAGE}.${extension}`;
            const fullPath = `${PROFILE_DIR}/${filename}`;

            try {
                const contents = await readFile(fullPath, {
                    baseDir: BaseDirectory.AppData
                });

                // Convert to base64 for display
                const base64 = btoa(
                    new Uint8Array(contents).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                return `data:${type};base64,${base64}`;
            } catch {
                continue; // Try next extension
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to load profile image:', error);
        return null;
    }
}