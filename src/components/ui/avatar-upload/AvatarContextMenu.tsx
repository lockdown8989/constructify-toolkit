
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Upload, Trash2, Camera } from 'lucide-react';

interface AvatarContextMenuProps {
  currentAvatarUrl?: string | null;
  disabled: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onRemoveClick: () => void;
  onAvatarSelectClick?: () => void;
  children: React.ReactNode;
}

export const AvatarContextMenu: React.FC<AvatarContextMenuProps> = ({
  currentAvatarUrl,
  disabled,
  isUploading,
  onUploadClick,
  onRemoveClick,
  onAvatarSelectClick,
  children
}) => {
  // On mobile, we'll use a different approach - the context menu might not work well
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // On mobile, just return the children without context menu
    // The click handler will be on the AvatarDisplay component
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={onAvatarSelectClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 cursor-pointer focus:bg-primary/10"
        >
          <Camera className="h-4 w-4" />
          Choose Avatar
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onUploadClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 cursor-pointer focus:bg-primary/10"
        >
          <Upload className="h-4 w-4" />
          Upload Custom Image
        </ContextMenuItem>
        
        {currentAvatarUrl && (
          <ContextMenuItem 
            onClick={onRemoveClick}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove Picture
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
