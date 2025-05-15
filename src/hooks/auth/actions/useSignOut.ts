
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
      
      // First check if there's an active session to avoid the "Auth session missing!" error
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("No active session found, redirecting to auth page");
        toast({
          title: "Already signed out",
          description: "You were already signed out. Redirecting to sign in page.",
        });
        
        // Navigate to auth page even if there's no session
        navigate('/auth');
        return;
      }
      
      // Proceed with signout if there is a session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message || "An error occurred while signing out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Even if there's no session, we want to reset the UI state
      // and redirect the user to the authentication page
      console.log("Sign out successful");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Navigate to auth page after sign out
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
      
      // Still try to navigate to auth page even if there's an error
      navigate('/auth');
    }
  };

  return { signOut };
};
