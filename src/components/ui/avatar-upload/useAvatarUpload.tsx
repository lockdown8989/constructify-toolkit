
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, GIF, or WebP files only.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload files smaller than 5MB.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        // Clean up uploaded file if profile update fails
        await supabase.storage
          .from('avatars')
          .remove([uploadData.path]);
        throw updateError;
      }

      onAvatarChange(publicUrl);
      onUploadComplete?.();

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully!',
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectPredefinedAvatar = async (avatarGradient: string) => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile with gradient avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarGradient })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onAvatarChange(avatarGradient);
      onUploadComplete?.();

      toast({
        title: 'Success',
        description: 'Avatar updated successfully!',
      });

    } catch (error: any) {
      console.error('Avatar selection error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Remove avatar URL from profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // If current avatar is a file (not a gradient), try to delete it from storage
      if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
        const path = currentAvatarUrl.split('/').pop();
        if (path) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${path}`]);
        }
      }

      onAvatarChange(null);
      onUploadComplete?.();

      toast({
        title: 'Success',
        description: 'Avatar removed successfully!',
      });

    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: 'Remove Failed',
        description: error.message || 'Failed to remove avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadAvatar,
    selectPredefinedAvatar,
    removeAvatar
  };
};
