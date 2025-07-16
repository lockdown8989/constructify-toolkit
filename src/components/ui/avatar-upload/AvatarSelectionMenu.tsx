
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { predefinedAvatars } from '@/data/predefined-avatars';

interface AvatarSelectionMenuProps {
  currentAvatar?: string;
  onSelect: (avatar: string) => void;
  onUpload: () => void;
  onRemove: () => void;
}

const AvatarSelectionMenu: React.FC<AvatarSelectionMenuProps> = ({
  currentAvatar,
  onSelect,
  onUpload,
  onRemove
}) => {
  return (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Choose Avatar</h3>
      
      {/* Predefined Avatars Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {predefinedAvatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.gradientClass)}
            className={cn(
              "relative w-16 h-16 rounded-full border-2 transition-all hover:scale-105",
              currentAvatar === avatar.gradientClass 
                ? "border-primary ring-2 ring-primary/50" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn("w-full h-full rounded-full", avatar.gradientClass)} />
            {currentAvatar === avatar.gradientClass && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onUpload}
          variant="outline"
          className="w-full"
        >
          Upload Custom Image
        </Button>
        
        {currentAvatar && (
          <Button
            onClick={onRemove}
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
          >
            Remove Avatar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarSelectionMenu;
