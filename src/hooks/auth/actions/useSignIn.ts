
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling sign in functionality with enhanced security and manager account support
 */
export const useSignIn = () => {
  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return {
          error: {
            message: "Email and password are required"
          } as AuthError,
          data: undefined
        };
      }
      
      // Ensure email has no whitespace and is properly formatted
      const trimmedEmail = email.trim().toLowerCase();
      
      if (trimmedEmail.length > 254) {
        return {
          error: {
            message: "Email address is too long"
          } as AuthError,
          data: undefined
        };
      }
      
      console.log("🔐 Attempting sign in for:", trimmedEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      if (error) {
        console.error("❌ Sign in error:", error);
        
        // Enhanced error handling for common issues
        if (error.message?.includes("Invalid login credentials")) {
          // For manager accounts, provide additional context
          if (trimmedEmail === 'd0bl3@abv.bg') {
            return {
              error: {
                message: "Login failed. If you recently updated your account, please check your email for a password reset link or contact support."
              } as AuthError,
              data: undefined
            };
          }
          return {
            error: {
              message: "Invalid email or password. Please check your credentials and try again."
            } as AuthError,
            data: undefined
          };
        } else if (error.message?.includes("Email not confirmed")) {
          return {
            error: {
              message: "Please verify your email address before signing in. Check your inbox for a confirmation email."
            } as AuthError,
            data: undefined
          };
        } else if (error.message?.includes("Too many requests")) {
          return {
            error: {
              message: "Too many sign in attempts. Please wait a moment and try again."
            } as AuthError,
            data: undefined
          };
        }
        
        return { error, data: undefined };
      } else {
        console.log("✅ Sign in successful for:", trimmedEmail, "User ID:", data.user?.id);
        
        // For manager accounts, log additional info
        if (trimmedEmail === 'd0bl3@abv.bg') {
          console.log("🎯 Manager account signed in successfully");
        }
        
        return { error: null, data };
      }
    } catch (error) {
      console.error("💥 Sign in exception:", error);
      return { 
        error: {
          message: error instanceof Error ? "Sign in failed. Please try again." : "An unexpected error occurred"
        } as AuthError, 
        data: undefined 
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log("🔄 Sending password reset for:", trimmedEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth?mode=recovery`
      });
      
      if (error) {
        console.error("❌ Password reset error:", error);
        return { error };
      }
      
      console.log("✅ Password reset email sent to:", trimmedEmail);
      return { error: null };
    } catch (error) {
      console.error("💥 Password reset exception:", error);
      return {
        error: {
          message: "Failed to send password reset email. Please try again."
        } as AuthError
      };
    }
  };

  return { signIn, resetPassword };
};
