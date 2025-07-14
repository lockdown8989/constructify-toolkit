
import React, { useRef, useState } from 'react';
import { useAvatarUpload } from './avatar-upload/useAvatarUpload';
import { AvatarDisplay } from './avatar-upload/AvatarDisplay';
import { AvatarContextMenu } from './avatar-upload/AvatarContextMenu';
import { AvatarSelectionMenu } from './avatar-upload/AvatarSelectionMenu';

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
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const { isUploading, uploadAvatar, removeAvatar, selectPredefinedAvatar } = useAvatarUpload({
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
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleAvatarClick = () => {
    setIsSelectionMenuOpen(true);
  };

  const handleSelectPredefinedAvatar = (avatarUrl: string) => {
    selectPredefinedAvatar(avatarUrl);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <AvatarContextMenu
        currentAvatarUrl={currentAvatarUrl}
        disabled={disabled}
        isUploading={isUploading}
        onUploadClick={handleUploadClick}
        onRemoveClick={removeAvatar}
        onAvatarSelectClick={handleAvatarClick}
      >
        <AvatarDisplay
          currentAvatarUrl={currentAvatarUrl}
          userInitials={userInitials}
          size={size}
          disabled={disabled}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
          onUploadClick={handleUploadClick}
          onAvatarClick={handleAvatarClick}
        >
          <div />
        </AvatarDisplay>
      </AvatarContextMenu>

      <AvatarSelectionMenu
        isOpen={isSelectionMenuOpen}
        onClose={() => setIsSelectionMenuOpen(false)}
        onSelectAvatar={handleSelectPredefinedAvatar}
        onUploadClick={handleUploadClick}
        currentAvatarUrl={currentAvatarUrl}
        userInitials={userInitials}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        <span className="hidden md:inline">Right-click or </span>
        <span className="md:hidden">Tap </span>
        <span className="hidden md:inline">tap </span>
        on the avatar to choose from predefined avatars or upload your own picture.<br />
        Supported formats: PNG, JPG, JPEG, GIF, WebP. Max size: 5MB.
      </p>
    </div>
  );
};
