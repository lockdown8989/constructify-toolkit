
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  userInitials?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userInitials = 'U',
  size = 'md',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type - support common image formats
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, JPEG, GIF, WebP).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create unique filename with proper extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete existing avatar if it exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      const newAvatarUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update employee record if it exists
      await supabase
        .from('employees')
        .update({ avatar_url: newAvatarUrl })
        .eq('user_id', user.id);

      onAvatarChange(newAvatarUrl);

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully."
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Delete from storage
      const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update employee record
      await supabase
        .from('employees')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      onAvatarChange(null);

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed."
      });

    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove profile picture.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`relative ${sizeClasses[size]} rounded-full border-2 border-dashed ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            } transition-colors cursor-pointer`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Avatar className={`${sizeClasses[size]} cursor-pointer`}>
              <AvatarImage src={currentAvatarUrl || undefined} alt="Profile" />
              <AvatarFallback className="text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            
            {!disabled && !isUploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors group">
                <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="w-48">
          <ContextMenuItem 
            onClick={handleUploadClick}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            {currentAvatarUrl ? 'Change Picture' : 'Upload Picture'}
          </ContextMenuItem>
          
          {currentAvatarUrl && (
            <ContextMenuItem 
              onClick={handleRemoveAvatar}
              disabled={disabled || isUploading}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remove Picture
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
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
