
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling account deletion functionality
 */
export const useDeleteAccount = () => {
  const { toast } = useToast();

  const deleteAccount = async (): Promise<{success: boolean; error?: string}> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id as string
      );

      if (error) {
        console.error('Error deleting user account:', error);
        
        toast({
          title: "Account deletion failed",
          description: error.message || "An error occurred while deleting your account. Please try again.",
          variant: "destructive",
        });
        
        return { success: false, error: error.message };
      }

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted. You will be redirected shortly.",
      });
      
      return { success: true };
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
