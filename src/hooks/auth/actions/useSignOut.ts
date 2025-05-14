
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
      console.log("Attempting to sign out user");
      
      // Check if we have an active session first
      const { data: sessionData } = await supabase.auth.getSession();
      
      // If no session exists, just redirect to auth page without error
      if (!sessionData?.session) {
        console.log("No active session found, redirecting to auth page");
        navigate('/auth');
        
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        
        return { success: true };
      }
      
      // Proceed with sign out if session exists
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase sign out error:", error);
        toast({
          title: "Sign out failed",
          description: "An error occurred while signing out: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Navigate to auth page after successful sign out
      console.log("Sign out successful, redirecting to auth page");
      navigate('/auth');
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return { signOut };
};
