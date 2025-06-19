
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling password reset functionality
 */
export const usePasswordReset = () => {
  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        return {
          error: {
            message: "Email is required"
          } as AuthError,
          data: undefined
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        return { error, data: undefined };
      }

      return { error: null, data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Password reset failed"
        } as AuthError,
        data: undefined
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      if (!password) {
        return {
          error: {
            message: "Password is required"
          } as AuthError,
          data: undefined
        };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return { error, data: undefined };
      }

      return { error: null, data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Password update failed"
        } as AuthError,
        data: undefined
      };
    }
  };

  return { resetPassword, updatePassword };
};
