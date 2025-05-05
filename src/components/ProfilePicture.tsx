import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { User, Upload } from "lucide-react";
import { saveProfileImage, loadProfileImage } from "../utils/profile";

// Create a global event for profile image updates
export const PROFILE_IMAGE_UPDATED_EVENT = "profile-image-updated";

// Create a function to dispatch the event
export function notifyProfileImageUpdated() {
  window.dispatchEvent(new CustomEvent(PROFILE_IMAGE_UPDATED_EVENT));
}

interface ProfilePictureProps {
  size?: "sm" | "md" | "lg";
  onImageChange?: (imagePath: string) => void;
  editable?: boolean;
}

export function ProfilePicture({
  size = "md",
  onImageChange,
  editable = false,
}: ProfilePictureProps) {
  const { currentTheme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  // Function to load the profile image
  const loadProfileImageData = useCallback(async () => {
    const imageData = await loadProfileImage();
    setImage(imageData);
    return imageData;
  }, []);

  // Load the profile image when the component mounts
  useEffect(() => {
    loadProfileImageData();

    // Listen for profile image updates
    const handleProfileImageUpdated = () => {
      loadProfileImageData();
    };

    // Add event listener for profile image updates
    window.addEventListener(
      PROFILE_IMAGE_UPDATED_EVENT,
      handleProfileImageUpdated
    );

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener(
        PROFILE_IMAGE_UPDATED_EVENT,
        handleProfileImageUpdated
      );
    };
  }, [loadProfileImageData]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      // Save the image and clear the input to allow selecting the same file again
      const path = await saveProfileImage(file);
      event.target.value = "";

      // Force a fresh load of the image
      const newImage = await loadProfileImage();
      setImage(newImage);

      // Notify other components that the profile image has been updated
      notifyProfileImageUpdated();

      // Call the onImageChange callback if provided
      onImageChange?.(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    }
  };

  return (
    <div className="relative group">
      {error && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-sm whitespace-nowrap"
          style={{
            backgroundColor: currentTheme.colors.background.card,
            color: "#ef4444",
          }}
        >
          {error}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: currentTheme.colors.background.card }}
          />
        </div>
      )}

      <div
        className={`relative rounded-xl overflow-hidden ${
          sizeClasses[size]
        } transition-transform duration-200 ${
          editable ? "cursor-pointer" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: currentTheme.colors.accent.primary,
        }}
      >
        {image ? (
          <img
            src={image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User
              size={iconSizes[size]}
              style={{ color: currentTheme.colors.background.main }}
            />
          </div>
        )}

        {editable && isHovered && (
          <div
            className="absolute inset-0 overflow-hidden rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${currentTheme.colors.background.main}80`,
            }}
          >
            <Upload
              size={iconSizes[size] * 0.75}
              style={{ color: currentTheme.colors.text.primary }}
            />
          </div>
        )}

        {editable && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
}
