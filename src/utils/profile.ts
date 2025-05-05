import {
  mkdir,
  readFile,
  writeFile,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_DIR = "profile";
const PROFILE_IMAGE = "profile-image";
const PROFILE_METADATA = "profile-metadata.json";

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileError";
  }
}

interface ProfileMetadata {
  imageType: string;
  lastUpdated: number;
}

/**
 * Saves profile image metadata
 */
async function saveProfileMetadata(metadata: ProfileMetadata): Promise<void> {
  try {
    const fullPath = `${PROFILE_DIR}/${PROFILE_METADATA}`;
    // Convert string to Uint8Array
    const jsonString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);

    await writeFile(fullPath, data, {
      baseDir: BaseDirectory.AppData,
    });
    console.log("Saved profile metadata:", metadata);
  } catch (error) {
    console.error("Failed to save profile metadata:", error);
    throw new ProfileError("Failed to save profile metadata");
  }
}

/**
 * Loads profile image metadata
 */
async function loadProfileMetadata(): Promise<ProfileMetadata | null> {
  try {
    const fullPath = `${PROFILE_DIR}/${PROFILE_METADATA}`;
    const contents = await readFile(fullPath, {
      baseDir: BaseDirectory.AppData,
    });

    // Convert Uint8Array to string and parse JSON
    const jsonString = new TextDecoder().decode(contents);
    return JSON.parse(jsonString);
  } catch (error) {
    console.log("No profile metadata found or error reading it");
    return null;
  }
}

export async function saveProfileImage(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ProfileError("Image must be less than 20MB");
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ProfileError("Only JPEG, PNG, and WebP images are allowed");
  }

  try {
    // Create directory if it doesn't exist
    await mkdir(PROFILE_DIR, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    // Delete existing profile image
    await deleteProfileImage();

    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Save file without extension
    const fullPath = `${PROFILE_DIR}/${PROFILE_IMAGE}`;
    await writeFile(fullPath, uint8Array, {
      baseDir: BaseDirectory.AppData,
    });

    // Save metadata with file type information
    const imageType = file.type;
    await saveProfileMetadata({
      imageType,
      lastUpdated: Date.now(),
    });

    console.log(`Saved profile image with type: ${imageType}`);

    // Return the full path for loading
    return fullPath;
  } catch (error) {
    console.error("Failed to save profile image:", error);
    throw new ProfileError("Failed to save profile image");
  }
}

/**
 * Deletes the profile image
 */
async function deleteProfileImage(): Promise<void> {
  try {
    const fullPath = `${PROFILE_DIR}/${PROFILE_IMAGE}`;
    await remove(fullPath, {
      baseDir: BaseDirectory.AppData,
    });
    console.log("Deleted profile image");
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.log("No profile image found to delete");
  }

  // Also try to delete any legacy profile images with extensions
  await deleteLegacyProfileImages();
}

/**
 * Deletes legacy profile images that might still have extensions
 */
async function deleteLegacyProfileImages(): Promise<void> {
  // Delete files for all allowed extensions
  for (const type of ALLOWED_TYPES) {
    const extension = type.split("/")[1];
    const filename = `${PROFILE_IMAGE}.${extension}`;
    const fullPath = `${PROFILE_DIR}/${filename}`;

    try {
      await remove(fullPath, {
        baseDir: BaseDirectory.AppData,
      });
      console.log(`Deleted legacy profile image: ${fullPath}`);
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.log(`No legacy profile image found with extension: ${extension}`);
    }
  }
}

export async function loadProfileImage(): Promise<string | null> {
  try {
    // First try to load metadata to get the image type
    const metadata = await loadProfileMetadata();

    if (metadata && metadata.imageType) {
      // Load the image without extension
      const fullPath = `${PROFILE_DIR}/${PROFILE_IMAGE}`;

      try {
        const contents = await readFile(fullPath, {
          baseDir: BaseDirectory.AppData,
        });

        // Convert to base64 for display
        const base64 = btoa(
          new Uint8Array(contents).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        console.log(`Loaded profile image with type: ${metadata.imageType}`);
        return `data:${metadata.imageType};base64,${base64}`;
      } catch (error) {
        console.error("Failed to load profile image file:", error);
        return null;
      }
    }

    // Fallback: try to load legacy profile images with extensions
    return loadLegacyProfileImage();
  } catch (error) {
    console.error("Failed to load profile image:", error);
    return null;
  }
}

/**
 * Loads legacy profile images that might still have extensions
 */
async function loadLegacyProfileImage(): Promise<string | null> {
  // Try each possible extension
  for (const type of ALLOWED_TYPES) {
    const extension = type.split("/")[1];
    const filename = `${PROFILE_IMAGE}.${extension}`;
    const fullPath = `${PROFILE_DIR}/${filename}`;

    try {
      const contents = await readFile(fullPath, {
        baseDir: BaseDirectory.AppData,
      });

      // Convert to base64 for display
      const base64 = btoa(
        new Uint8Array(contents).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      console.log(`Found legacy profile image with extension: ${extension}`);

      // Migrate to new format
      console.log("Migrating legacy profile image to new format...");
      const uint8Array = new Uint8Array(contents);

      // Save without extension
      const newPath = `${PROFILE_DIR}/${PROFILE_IMAGE}`;
      await writeFile(newPath, uint8Array, {
        baseDir: BaseDirectory.AppData,
      });

      // Save metadata
      await saveProfileMetadata({
        imageType: type,
        lastUpdated: Date.now(),
      });

      // Delete the legacy file
      await remove(fullPath, {
        baseDir: BaseDirectory.AppData,
      });

      return `data:${type};base64,${base64}`;
    } catch (error) {
      // File doesn't exist with this extension, try the next one
      console.log(`No legacy profile image found with extension: ${extension}`);
      continue;
    }
  }

  console.log("No profile image found");
  return null;
}
