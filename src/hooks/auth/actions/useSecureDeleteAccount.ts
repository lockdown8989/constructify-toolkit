
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
      
      await secureDeleteAccount();
      
      // Clear all application state before showing success message
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (clearError) {
        console.warn('Storage clear error:', clearError);
      }
      
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      // Force complete page reload to clear all app state
      window.location.replace('/auth');
      
    } catch (error) {
      console.error('Delete account error:', error);
      
      // If error suggests user was already deleted, still redirect
      if (error instanceof Error && 
          (error.message.includes('User not found') || 
           error.message.includes('No authenticated user'))) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/auth');
        return;
      }
      
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
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
