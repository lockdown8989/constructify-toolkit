
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
      
      // First, try to call our safe sign-out function
      // This will always succeed regardless of session state
      const { data, error: functionError } = await supabase
        .rpc('safe_user_signout')
        .single();
      
      if (functionError) {
        console.log("Safe sign out function error:", functionError);
        // If our function fails, fall back to regular sign out
      } else {
        console.log("Safe sign out function success:", data);
      }
      
      // Always attempt the regular sign out as well to clean up client state
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log("Sign out error:", error);
        
        // If it's a missing session error, treat it as successful anyway
        // Our safe_user_signout function should have handled the server side
        if (error.message?.includes('missing') || error.message?.includes('session')) {
          console.log("Session already missing, considering user signed out");
          toast({
            title: "Signed out",
            description: "You have been successfully signed out."
          });
        } else {
          // Only show error for non-session related issues
          toast({
            title: "Sign out issue",
            description: "There was an issue during sign out. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log("Sign out successful");
        toast({
          title: "Signed out",
          description: "You have been successfully signed out."
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
        description: "Your session has been ended."
      });
      navigate('/auth');
    }
  };

  return { signOut };
};
