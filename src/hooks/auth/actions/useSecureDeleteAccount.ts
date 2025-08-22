
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSecureOperations } from '@/hooks/security/useSecureOperations';

export const useSecureDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { secureDeleteAccount } = useSecureOperations();
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      console.log('🗑️ Starting secure account deletion process...');
      
      // Show initial feedback to user
      toast({
        title: "Deleting Account",
        description: "Please wait while we securely delete your account and data...",
      });
      
      await secureDeleteAccount();
      
      // Clear all application state before showing success message
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cached data
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
      } catch (clearError) {
        console.warn('Storage/cache clear error:', clearError);
      }
      
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted. You will now be redirected to the login page.",
        duration: 5000,
      });
      
      // Add a small delay to ensure toast is visible before redirect
      setTimeout(() => {
        // Force complete page reload to clear all app state
        window.location.replace('/auth?deleted=true');
      }, 2000);
      
    } catch (error) {
      console.error('Delete account error:', error);
      
      // If error suggests user was already deleted, still redirect
      if (error instanceof Error && 
          (error.message.includes('User not found') || 
           error.message.includes('No authenticated user'))) {
        console.log('🔄 User already deleted, clearing local data and redirecting...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/auth?deleted=true');
        return;
      }
      
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting
  };
};
