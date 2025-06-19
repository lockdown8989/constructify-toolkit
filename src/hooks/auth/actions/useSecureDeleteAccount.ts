
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
      
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      // Redirect to landing page after successful deletion
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Delete account error:', error);
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
