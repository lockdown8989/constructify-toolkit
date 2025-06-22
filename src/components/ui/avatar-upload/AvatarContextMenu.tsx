
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Upload, Trash2 } from 'lucide-react';

interface AvatarContextMenuProps {
  currentAvatarUrl?: string | null;
  disabled: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onRemoveClick: () => void;
  children: React.ReactNode;
}

export const AvatarContextMenu: React.FC<AvatarContextMenuProps> = ({
  currentAvatarUrl,
  disabled,
  isUploading,
  onUploadClick,
  onRemoveClick,
  children
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={onUploadClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          {currentAvatarUrl ? 'Change Picture' : 'Upload Picture'}
        </ContextMenuItem>
        
        {currentAvatarUrl && (
          <ContextMenuItem 
            onClick={onRemoveClick}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Remove Picture
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
