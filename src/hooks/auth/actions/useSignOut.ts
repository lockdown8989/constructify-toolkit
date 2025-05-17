
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for handling sign out functionality
 */
export const useSignOut = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      
      // Sign out without checking for session first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        
        // Show error but still redirect the user
        toast({
          title: "Sign out issue",
          description: "There was an issue during sign out: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Sign out successful");
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
      
      // Always navigate to auth page regardless of errors
      // This ensures the user can get back to a working state
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Always reset UI state and redirect on any error
      toast({
        title: "Session ended",
        description: "Your session has been ended.",
      });
      navigate('/auth');
    }
  };

  return { signOut };
};
