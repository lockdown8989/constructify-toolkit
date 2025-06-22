
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (url: string | null) => void;
  onUploadComplete?: () => void;
}

export const useAvatarUpload = ({
  currentAvatarUrl,
  onAvatarChange,
  onUploadComplete
}: UseAvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return "Please select an image file (PNG, JPG, JPEG, GIF, WebP).";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Please select an image smaller than 5MB.";
    }

    return null;
  };

  const uploadAvatar = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
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
      onUploadComplete?.();

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully."
      });

      // Force a small delay to ensure the UI updates
      setTimeout(() => {
        window.location.reload();
      }, 1000);

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

  const removeAvatar = async () => {
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
      onUploadComplete?.();

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed."
      });

      // Force a small delay to ensure the UI updates
      setTimeout(() => {
        window.location.reload();
      }, 1000);

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

  return {
    isUploading,
    uploadAvatar,
    removeAvatar
  };
};
