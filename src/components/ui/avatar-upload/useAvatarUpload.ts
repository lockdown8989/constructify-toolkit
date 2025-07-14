
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

      // Update profile in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update employee record if it exists - this ensures synchronization with manager views
      const { error: employeeUpdateError } = await supabase
        .from('employees')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (employeeUpdateError) {
        console.warn('Employee record update failed:', employeeUpdateError);
        // Don't throw error as profile update succeeded
      }

      // Update the UI immediately
      onAvatarChange(newAvatarUrl);
      onUploadComplete?.();

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated and synchronized across all team views."
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
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update employee record - ensures synchronization with manager views
      const { error: employeeUpdateError } = await supabase
        .from('employees')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (employeeUpdateError) {
        console.warn('Employee record update failed:', employeeUpdateError);
        // Don't throw error as profile update succeeded
      }

      // Update the UI immediately
      onAvatarChange(null);
      onUploadComplete?.();

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed and synchronized across all team views."
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

  const selectPredefinedAvatar = async (avatarUrl: string) => {
    setIsUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Update profile in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update employee record if it exists - this ensures synchronization with manager views
      const { error: employeeUpdateError } = await supabase
        .from('employees')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (employeeUpdateError) {
        console.warn('Employee record update failed:', employeeUpdateError);
        // Don't throw error as profile update succeeded
      }

      // Update the UI immediately
      onAvatarChange(avatarUrl);
      onUploadComplete?.();

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated and synchronized across all team views."
      });

    } catch (error) {
      console.error('Error selecting avatar:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile picture.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadAvatar,
    removeAvatar,
    selectPredefinedAvatar
  };
};
