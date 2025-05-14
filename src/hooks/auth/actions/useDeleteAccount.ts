
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for handling account deletion functionality
 */
export const useDeleteAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteAccount = async (): Promise<{success: boolean; error?: string}> => {
    try {
      // First call the database function to delete user data from all tables
      const { data, error: rpcError } = await supabase.rpc('delete_user');
      
      if (rpcError) {
        console.error('Error deleting user data:', rpcError);
        
        toast({
          title: "Account deletion failed",
          description: rpcError.message || "Could not delete your account data. Please try again later.",
          variant: "destructive",
        });
        
        return { success: false, error: rpcError.message };
      }
      
      // Now delete the user from auth.users by calling our edge function
      const { error: functionError } = await supabase.functions.invoke('delete-user-account');
      
      if (functionError) {
        console.error('Error calling deletion function:', functionError);
        
        toast({
          title: "Account deletion failed",
          description: functionError.message || "An error occurred while deleting your account. Please try again.",
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
      
      // Redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
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
