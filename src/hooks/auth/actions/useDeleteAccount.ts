
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling account deletion functionality
 */
export const useDeleteAccount = () => {
  const { toast } = useToast();

  const deleteAccount = async (): Promise<{success: boolean; error?: string}> => {
    try {
      // Use the standard user deletion method which works with client permissions
      // instead of the admin method which doesn't work from the client
      const { error } = await supabase.auth.updateUser({
        data: { requesting_deletion: true }
      });
      
      // Delete the user's own account
      if (!error) {
        const { error: deleteError } = await supabase.rpc('delete_user');
        
        if (deleteError) {
          console.error('Error deleting user account:', deleteError);
          
          toast({
            title: "Account deletion failed",
            description: deleteError.message || "An error occurred while deleting your account. Please try again.",
            variant: "destructive",
          });
          
          return { success: false, error: deleteError.message };
        }

        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted. You will be redirected shortly.",
        });
        
        // Sign out after successful deletion
        await supabase.auth.signOut();
        return { success: true };
      } else {
        console.error('Error marking account for deletion:', error);
        
        toast({
          title: "Account deletion failed",
          description: error.message || "An error occurred while deleting your account. Please try again.",
          variant: "destructive",
        });
        
        return { success: false, error: error.message };
      }
    } catch (error: any) {
      console.error('Exception in deleteAccount:', error);
      
      toast({
        title: "Account deletion failed",
        description: "An unexpected error occurred. Please try again or contact support.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    }
  };

  return { deleteAccount };
};
