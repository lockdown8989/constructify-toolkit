
import { useAuthActions } from '../useAuthActions';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useDeleteAccount = () => {
  const { deleteAccount: deleteAccountAction } = useAuthActions();
  const navigate = useNavigate();
  const { toast } = useToast();

const deleteAccount = async () => {
    try {
      const result = await deleteAccountAction();
      
      if (result.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        });
        
        // Clear all local storage and session data
        try {
          localStorage.clear();
          sessionStorage.clear();
          // Clear any React Query cache
          if (window.location?.pathname) {
            // Force a complete page reload to clear all app state
            window.location.replace('/auth');
            return { success: true };
          }
        } catch (clearError) {
          console.warn('Error clearing storage:', clearError);
        }
        
        // Fallback navigation
        navigate('/auth', { replace: true });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      // Even on error, try to redirect to prevent broken state
      if (error.message?.includes('User not found') || error.message?.includes('session')) {
        navigate('/auth', { replace: true });
      }
      return { success: false, error: error.message || 'Failed to delete account' };
    }
  };

  return { deleteAccount };
};
