
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for handling account deletion functionality
 */
export const useDeleteAccount = () => {
  const { toast } = useToast();
  // Using optional chaining to handle cases where the hook might be used outside Router context
  const navigate = useNavigate?.() || null;

  const deleteAccount = async (): Promise<{success: boolean; error?: string}> => {
    try {
      // First call the edge function to delete user data from all tables
      const { error: functionError } = await supabase.functions.invoke("delete-user-account");
      
      if (functionError) {
        console.error('Error deleting user data:', functionError);
        
        toast({
          title: "Account deletion failed",
          description: functionError.message || "Could not delete your account data. Please try again later.",
          variant: "destructive",
        });
        
        return { success: false, error: functionError.message };
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted. You will be redirected shortly.",
      });
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      // Redirect to homepage if navigation is available
      if (navigate) {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
      
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
