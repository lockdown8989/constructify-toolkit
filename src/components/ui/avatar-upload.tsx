
import React, { useRef } from 'react';
import { useAvatarUpload } from './avatar-upload/useAvatarUpload';
import { AvatarDisplay } from './avatar-upload/AvatarDisplay';
import { AvatarContextMenu } from './avatar-upload/AvatarContextMenu';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  userInitials?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onUploadComplete?: () => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userInitials = 'U',
  size = 'md',
  disabled = false,
  onUploadComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, uploadAvatar, removeAvatar } = useAvatarUpload({
    currentAvatarUrl,
    onAvatarChange,
    onUploadComplete
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (file: File) => {
    uploadAvatar(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <AvatarContextMenu
        currentAvatarUrl={currentAvatarUrl}
        disabled={disabled}
        isUploading={isUploading}
        onUploadClick={handleUploadClick}
        onRemoveClick={removeAvatar}
      >
        <AvatarDisplay
          currentAvatarUrl={currentAvatarUrl}
          userInitials={userInitials}
          size={size}
          disabled={disabled}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
        >
          <div />
        </AvatarDisplay>
      </AvatarContextMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Right-click or tap on the avatar to upload or remove your profile picture.<br />
        Supported formats: PNG, JPG, JPEG, GIF, WebP. Max size: 5MB.
      </p>
    </div>
  );
};
