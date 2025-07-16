
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { predefinedAvatars, getAvatarVariant } from '@/data/predefined-avatars';
import { Upload } from 'lucide-react';

interface AvatarSelectionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
  onUploadClick: () => void;
  currentAvatarUrl?: string | null;
  userInitials: string;
}

export const AvatarSelectionMenu: React.FC<AvatarSelectionMenuProps> = ({
  isOpen,
  onClose,
  onSelectAvatar,
  onUploadClick,
  currentAvatarUrl,
  userInitials
}) => {
  const handleAvatarSelect = (avatarUrl: string) => {
    onSelectAvatar(avatarUrl);
    onClose();
  };

  const handleUpload = () => {
    onUploadClick();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload option */}
          <Button
            onClick={handleUpload}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Custom Image
          </Button>
          
          {/* Current avatar display */}
          {currentAvatarUrl && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentAvatarUrl} alt="Current" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Current avatar</span>
            </div>
          )}
          
          {/* Predefined avatars grid */}
          <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {predefinedAvatars.slice(0, 48).map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarSelect(avatar)}
                className="relative group focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              >
                <div 
                  className={`w-12 h-12 rounded-full ${getAvatarVariant(index, predefinedAvatars.length)} p-1 transition-transform group-hover:scale-110 group-active:scale-95`}
                  style={{ background: avatar }}
                >
                  <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {userInitials}
                    </span>
                  </div>
                </div>
                {currentAvatarUrl === avatar && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
