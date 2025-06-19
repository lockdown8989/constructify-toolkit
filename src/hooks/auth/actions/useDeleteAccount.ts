
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
        
        // Immediate redirect to auth page
        navigate('/auth', { replace: true });
        
        // Additional cleanup - clear any remaining data
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message || 'Failed to delete account' };
    }
  };

  return { deleteAccount };
};
