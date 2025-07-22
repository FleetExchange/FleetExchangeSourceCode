import React, { useRef, useState } from "react";

interface ProfileImageProps {
  fileUrl?: string;
  size?: number;
  onUpload: (file: File) => Promise<void>;
  editable?: boolean;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  fileUrl,
  size = 96,
  onUpload,
  editable = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(fileUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    await onUpload(file);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={preview || "/default-profile.png"}
        alt="Profile"
        className="rounded-full object-cover border"
        style={{ width: size, height: size }}
      />
      {editable && (
        <>
          <button
            type="button"
            className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow"
            onClick={() => inputRef.current?.click()}
            aria-label="Change profile image"
          >
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth={2} />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default ProfileImage;
