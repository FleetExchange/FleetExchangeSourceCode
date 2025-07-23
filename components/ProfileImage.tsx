import React, { useRef, useState } from "react";

interface ProfileImageProps {
  fileUrl?: string;
  size?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ fileUrl, size = 96 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={fileUrl || "/default-profile.png"}
        alt="Profile"
        className="rounded-full object-cover border"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default ProfileImage;
